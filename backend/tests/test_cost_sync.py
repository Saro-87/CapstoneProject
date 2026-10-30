import unittest
from datetime import date
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException
from sqlalchemy import create_engine, text

from app.services import cost_sync


class CostSyncTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite:///:memory:")
        with self.engine.begin() as connection:
            connection.execute(text("""
                CREATE TABLE cloud_costs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT, provider TEXT, service TEXT,
                    region TEXT, cost FLOAT, usage FLOAT, billing_date DATE
                )
            """))
        self.engine_patch = patch.object(cost_sync, "engine", self.engine)
        self.engine_patch.start()
        self.addCleanup(self.engine_patch.stop)
        self.addCleanup(self.engine.dispose)

    def _rows(self):
        with self.engine.connect() as connection:
            return connection.execute(
                text("SELECT provider, service, cost, billing_date FROM cloud_costs")
            ).mappings().all()

    def test_persists_valid_usd_rows(self):
        connector = SimpleNamespace(fetch_cost_and_usage=lambda **kwargs: {
            "rows": [{
                "date": "2026-10-29", "service": "Amazon EC2", "cost_usd": 12.5,
                "currency": "USD", "usage_quantity": 2,
            }]
        })
        with patch.object(cost_sync, "import_module", return_value=connector):
            result = cost_sync.sync_provider("aws", date(2026, 10, 1), date(2026, 10, 30))
        self.assertEqual(result["rows_written"], 1)
        self.assertEqual(float(self._rows()[0]["cost"]), 12.5)

    def test_rejects_non_usd_without_deleting_existing_data(self):
        with self.engine.begin() as connection:
            connection.execute(text("""
                INSERT INTO cloud_costs
                (provider, service, region, cost, usage, billing_date)
                VALUES ('AWS', 'Existing', 'Unknown', 7, 0, '2026-10-05')
            """))
        connector = SimpleNamespace(fetch_cost_and_usage=lambda **kwargs: {
            "rows": [{
                "date": "2026-10-05", "service": "Service",
                "cost_usd": 10, "currency": "EUR",
            }]
        })
        with patch.object(cost_sync, "import_module", return_value=connector):
            with self.assertRaises(HTTPException) as caught:
                cost_sync.sync_provider("aws", date(2026, 10, 1), date(2026, 10, 30))
        self.assertEqual(caught.exception.status_code, 422)
        self.assertEqual(len(self._rows()), 1)
        self.assertEqual(self._rows()[0]["service"], "Existing")

    def test_empty_provider_response_preserves_existing_data(self):
        with self.engine.begin() as connection:
            connection.execute(text("""
                INSERT INTO cloud_costs
                (provider, service, region, cost, usage, billing_date)
                VALUES ('AWS', 'Existing', 'Unknown', 7, 0, '2026-10-05')
            """))
        connector = SimpleNamespace(fetch_cost_and_usage=lambda **kwargs: {"rows": []})
        with patch.object(cost_sync, "import_module", return_value=connector):
            result = cost_sync.sync_provider("aws", date(2026, 10, 1), date(2026, 10, 30))
        self.assertEqual(result["rows_written"], 0)
        self.assertEqual(len(self._rows()), 1)

    def test_rejects_unknown_provider(self):
        with self.assertRaises(HTTPException) as caught:
            cost_sync.sync_provider("oracle", date(2026, 10, 1), date(2026, 10, 30))
        self.assertEqual(caught.exception.status_code, 422)


if __name__ == "__main__":
    unittest.main()
