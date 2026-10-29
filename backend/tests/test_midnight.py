import importlib
import os
from pathlib import Path
import tempfile
import unittest


class MidnightIntegrationTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        os.environ['DATABASE_URL'] = 'sqlite:///' + str(Path(cls.temp.name) / 'test.db')
        from fastapi.testclient import TestClient
        cls.module = importlib.import_module('app.dashboard_main')
        cls.client_context = TestClient(cls.module.app)
        cls.client = cls.client_context.__enter__()

    @classmethod
    def tearDownClass(cls):
        cls.client_context.__exit__(None, None, None)
        from app.database import engine
        engine.dispose()
        cls.temp.cleanup()

    def test_costs_use_inclusive_start_exclusive_end(self):
        from app.database import engine
        from sqlalchemy import text
        with engine.begin() as connection:
            connection.execute(text('DELETE FROM cloud_costs'))
            connection.execute(text("INSERT INTO cloud_costs (provider,service,region,cost,billing_date) VALUES ('AWS','EC2','us-east-1',12.5,'2026-10-01'),('AZURE','SQL','eastus',7,'2026-10-02'),('AWS','EC2','us-east-1',99,'2026-10-03')"))
        response = self.client.get('/api/dashboard/costs?start=2026-10-01&end=2026-10-03')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(sum(row['cost'] for row in response.json()), 19.5)
        self.assertEqual(self.client.get('/api/dashboard/costs?start=bad&end=2026-10-03').status_code, 422)
        self.assertEqual(self.client.get('/api/dashboard/costs?start=2026-10-03&end=2026-10-01').status_code, 422)

    def test_empty_sections_and_api_error_are_not_sample_values(self):
        for path in ('resources', 'alerts', 'recommendations'):
            response = self.client.get('/api/' + path)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json(), [])

    def test_health_does_not_claim_cloud_connectivity(self):
        self.assertEqual(self.client.get('/api/health').json(), {'status': 'ok', 'source': 'database'})

    def test_populated_existing_router_contracts(self):
        from app.database import engine
        from sqlalchemy import text
        with engine.begin() as connection:
            connection.execute(text("INSERT INTO resources (provider,resource_name,resource_type,region,status,monthly_cost) VALUES ('AWS','test-instance','EC2','us-east-1','running',42.5)"))
            connection.execute(text("INSERT INTO alerts (provider,severity,message,created_at) VALUES ('AWS','warning','Fixture alert','2026-10-01 10:00:00')"))
            connection.execute(text("INSERT INTO recommendations (provider,recommendation,estimated_savings) VALUES ('AWS','Fixture recommendation',5.25)"))
        try:
            self.assertEqual(self.client.get('/api/resources').json()[0]['monthly_cost'],42.5)
            self.assertEqual(self.client.get('/api/alerts').json()[0]['message'],'Fixture alert')
            self.assertEqual(self.client.get('/api/recommendations').json()[0]['estimated_savings'],5.25)
        finally:
            with engine.begin() as connection:
                for table in ('resources','alerts','recommendations'):
                    connection.execute(text('DELETE FROM ' + table))

    def test_serves_built_frontend_if_available(self):
        dist = Path(__file__).resolve().parents[2] / 'frontend' / 'dist'
        if not dist.exists():
            self.skipTest('Frontend not built yet')
        self.assertEqual(self.client.get('/').status_code, 200)


if __name__ == '__main__':
    unittest.main()
