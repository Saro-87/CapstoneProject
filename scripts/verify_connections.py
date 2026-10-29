"""
scripts/verify_connections.py

Run this at the end of Sprint 1 to confirm all three cloud providers
are reachable and credentials are valid.

Usage:
    python scripts/verify_connections.py
"""

import sys
import os

# Allow imports from project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from connectors import aws, azure, gcp


def main():
    print("=" * 50)
    print("  DevOps Dashboard — Sprint 1 Connection Check")
    print("=" * 50)

    results = {
        "AWS":   aws.verify_connection(),
        "Azure": azure.verify_connection(),
        "GCP":   gcp.verify_connection(),
    }

    print()
    print("─" * 50)
    passed = sum(results.values())
    total = len(results)

    for provider, ok in results.items():
        status = "✓ PASS" if ok else "✗ FAIL"
        print(f"  {status}  {provider}")

    print("─" * 50)
    print(f"  {passed}/{total} providers connected")

    if passed == total:
        print("\n  Sprint 1 goal met — ready for Sprint 2!")
    else:
        failed = [p for p, ok in results.items() if not ok]
        print(f"\n  Fix credentials for: {', '.join(failed)}")
        print("  Check your .env file against .env.example")

    print("=" * 50)
    return 0 if passed == total else 1


if __name__ == "__main__":
    sys.exit(main())
