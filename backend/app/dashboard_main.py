"""Database-backed Midnight dashboard; cloud collectors run separately."""
from contextlib import asynccontextmanager
from datetime import date
import os
from pathlib import Path

from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from sqlalchemy import Column, DateTime, Float, Integer, String, Table, text

from app.database import Base, engine
from app.models.cloud_cost import CloudCost
from app.routers import alerts, recommendations, resources, cost_sync


# Match existing router contracts without introducing sample records.
Table('resources', Base.metadata,
      Column('id', Integer, primary_key=True), Column('provider', String),
      Column('resource_name', String), Column('resource_type', String),
      Column('region', String), Column('status', String), Column('monthly_cost', Float))
Table('alerts', Base.metadata,
      Column('id', Integer, primary_key=True), Column('provider', String),
      Column('severity', String), Column('message', String), Column('created_at', DateTime))
Table('recommendations', Base.metadata,
      Column('id', Integer, primary_key=True), Column('provider', String),
      Column('recommendation', String), Column('estimated_savings', Float))


@asynccontextmanager
async def lifespan(app):
    # Local SQLite starts empty; PostgreSQL schemas are managed externally.
    if engine.dialect.name == 'sqlite':
        Base.metadata.create_all(engine)
    yield


app = FastAPI(title='Midnight Cloud Dashboard', lifespan=lifespan)
app.include_router(resources.router, prefix='/api')
app.include_router(alerts.router, prefix='/api')
app.include_router(recommendations.router, prefix='/api')
app.include_router(cost_sync.router)


@app.get('/api/health')
def health():
    with engine.connect() as connection:
        connection.execute(text('SELECT 1'))
    return {'status': 'ok', 'source': 'demo' if os.getenv('DASHBOARD_DEMO') == '1' else 'database'}


@app.get('/api/dashboard/costs')
def costs(start: date, end: date):
    if end <= start:
        raise HTTPException(422, 'End date must be after start date (exclusive).')
    with engine.connect() as connection:
        result = connection.execute(text('''
            SELECT provider, service, billing_date, SUM(cost) AS cost
            FROM cloud_costs
            WHERE billing_date >= :start AND billing_date < :end
            GROUP BY provider, service, billing_date
            ORDER BY billing_date
        '''), {'start': start.isoformat(), 'end': end.isoformat()}).mappings()
        return [{'provider': row['provider'], 'service': row['service'],
                 'date': str(row['billing_date']), 'cost': float(row['cost'])}
                for row in result]


dist = Path(__file__).resolve().parents[2] / 'frontend' / 'dist'
if dist.is_dir():
    app.mount('/', StaticFiles(directory=dist, html=True), name='frontend')
