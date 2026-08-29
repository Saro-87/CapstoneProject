from sqlalchemy import create_engine
from sqlalchemy.engine import URL

connection_url = URL.create(
    drivername="postgresql+psycopg2",
    username="postgres",
    password="Image@2025",
    host="localhost",
    port=5432,
    database="cloud_cost_dashboard",
)

engine = create_engine(connection_url)