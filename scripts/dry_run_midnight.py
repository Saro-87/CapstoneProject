"""Run Midnight against a new, isolated synthetic database. Never imports cloud SDKs."""
import argparse
from collections import defaultdict
from datetime import datetime, timedelta, timezone
import json
import os
from pathlib import Path
import random
import sys
import tempfile


def create_demo():
    root = Path(__file__).resolve().parents[1]
    demo_root = root / 'backend' / '.demo'
    demo_root.mkdir(exist_ok=True)
    run = Path(tempfile.mkdtemp(prefix='midnight-', dir=demo_root))
    os.environ['DATABASE_URL'] = 'sqlite:///' + (run / 'demo.db').as_posix()
    os.environ['DASHBOARD_DEMO'] = '1'
    sys.path.insert(0, str(root / 'backend'))
    from app.dashboard_main import app
    from app.database import Base, engine
    from sqlalchemy import text

    if engine.dialect.name != 'sqlite' or Path(engine.url.database).resolve() != (run / 'demo.db').resolve():
        raise RuntimeError('Refusing to seed anything except this run\'s new demo database.')
    Base.metadata.create_all(engine)
    rng = random.Random(20261029)
    today = datetime.now(timezone(timedelta(hours=5, minutes=30))).date()
    catalog = [
        ('AWS', 'Amazon EC2', 'EC2', 'us-east-1', 280),
        ('AWS', 'Amazon RDS', 'RDS', 'eu-west-1', 100),
        ('AWS', 'Amazon S3', 'S3', 'ap-south-1', 33),
        ('AWS', 'AWS Lambda', 'Lambda', 'us-east-1', 8),
        ('Azure', 'Virtual Machines', 'VM', 'eastus', 160),
        ('Azure', 'Azure SQL Database', 'SQL DB', 'westeurope', 80),
        ('Azure', 'Blob Storage', 'Storage', 'centralindia', 15),
        ('GCP', 'Compute Engine', 'Compute', 'us-central1', 100),
        ('GCP', 'Cloud Storage', 'Storage', 'asia-south1', 12),
        ('GCP', 'BigQuery', 'Analytics', 'europe-west1', 45),
    ]
    costs, resources, alerts, recommendations = [], [], [], []
    monthly = defaultdict(float)
    for offset in range(89, -1, -1):
        day = today - timedelta(days=offset)
        for provider, service, kind, region, baseline in catalog:
            cost = round(baseline * rng.uniform(.72, 1.25) * (.82 if day.weekday() >= 5 else 1), 2)
            if kind == 'EC2' and offset == 2:
                cost *= 1.55
            if kind == 'Lambda' and offset == 12:
                cost = -18.25  # Billing credit exercises signed cost handling.
            cost = round(cost, 2)
            costs.append(dict(provider=provider, service=service, region=region,
                              cost=cost, usage=round(rng.uniform(10, 500), 2), billing_date=day))
            if offset < 30:
                monthly[(provider, service)] += cost
    for provider, service, kind, region, baseline in catalog:
        count = rng.randint(5, 10)
        weights = [rng.uniform(.5, 2) for _ in range(count)]
        total = round(monthly[(provider, service)], 2)
        allocated = 0
        for index, weight in enumerate(weights):
            amount = round(total * weight / sum(weights), 2) if index < count - 1 else round(total - allocated, 2)
            allocated += amount
            resources.append(dict(provider=provider, resource_name=f'{rng.choice(["prod", "staging", "dev"])}-{kind.lower().replace(" ", "-")}-{index+1:02d}',
                                  resource_type=kind, region=region, status=rng.choice(['running', 'running', 'available', 'stopped']), monthly_cost=amount))
        assert abs(allocated - total) < .01
    for index, provider in enumerate(['AWS', 'Azure', 'GCP']):
        for severity, message in [('critical', 'Monthly service spend exceeded the configured demo threshold.'),
                                  ('warning', 'Development workload is running outside business hours.'),
                                  ('info', 'Resource quota usage reached 85% in the demo region.')]:
            alerts.append(dict(provider=provider, severity=severity, message=message,
                               created_at=datetime.combine(today, datetime.min.time()) + timedelta(hours=9+index)))
        for recommendation, saving in [('Right-size underused compute instances', rng.uniform(300, 1400)),
                                       ('Remove unattached development storage', rng.uniform(80, 450))]:
            recommendations.append(dict(provider=provider, recommendation=recommendation, estimated_savings=round(saving, 2)))

    with engine.begin() as conn:
        for table, records in [('cloud_costs', costs), ('resources', resources), ('alerts', alerts), ('recommendations', recommendations)]:
            conn.execute(Base.metadata.tables[table].insert(), records)
            assert conn.execute(text('SELECT COUNT(*) FROM ' + table)).scalar_one() == len(records)
    totals = {provider: round(sum(v for (p, _), v in monthly.items() if p == provider), 2) for provider in ['AWS', 'Azure', 'GCP']}
    manifest = dict(mode='synthetic', seed=20261029, start=str(today-timedelta(days=29)), end_exclusive=str(today+timedelta(days=1)),
                    costs=len(costs), resources=len(resources), alerts=len(alerts), recommendations=len(recommendations),
                    provider_totals=totals, total_cost=round(sum(totals.values()), 2))
    assert len(costs) == 900 and len(alerts) == 9 and len(recommendations) == 6
    (run / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    return app, run, manifest


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--port', type=int, default=8001)
    parser.add_argument('--check-only', action='store_true')
    args = parser.parse_args()
    app, directory, manifest = create_demo()
    print(json.dumps({'directory': str(directory), 'url': f'http://127.0.0.1:{args.port}', **manifest}), flush=True)
    if not args.check_only:
        import uvicorn
        uvicorn.run(app, host='127.0.0.1', port=args.port)
