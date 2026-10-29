import { test } from 'node:test';
import assert from 'node:assert/strict';
import { summarizeCosts, loadDashboard, costReportCsv } from './midnight-data.js';

test('provider filter consistently drives total, daily and service costs', () => {
  const rows = [{provider:'AWS',service:'EC2',date:'2026-10-01',cost:12.5},{provider:'AZURE',service:'SQL',date:'2026-10-01',cost:7}];
  const result = summarizeCosts(rows, 'AWS');
  assert.equal(result.total,12.5);
  assert.deepEqual(result.daily,[{date:'2026-10-01',AWS:12.5,Azure:0,GCP:0}]);
  assert.equal(result.services.length,1);
  assert.equal(summarizeCosts(rows,'All').total,19.5);
  assert.equal(summarizeCosts([],'All').total,0);
});
test('invalid numeric costs are rejected rather than displayed as zero', () => {
  assert.throws(()=>summarizeCosts([{provider:'AWS',service:'EC2',date:'2026-10-01',cost:'bad'}],'All'));
});
test('one failed endpoint does not hide successful sections or invent data', async () => {
  const fetcher = async path => ({ok:!path.includes('alerts'),status:503,json:async()=>path.includes('health')?{status:'ok',source:'database'}:[]});
  const result=await loadDashboard('2026-10-01','2026-10-29',fetcher);
  assert.deepEqual(result.resources,[]);
  assert.equal(result.alerts,null);
  assert.match(result.errors.join(' '),/alerts/);
});
test('synthetic data source is explicitly exposed for the preview label', async () => {
  const result=await loadDashboard('2026-10-01','2026-10-29',async path=>({ok:true,json:async()=>path.includes('health')?{status:'ok',source:'demo'}:[]}));
  assert.equal(result.health.source,'demo');
});
test('malformed inventory is treated as unavailable', async () => {
  const result=await loadDashboard('2026-10-01','2026-10-29',async()=>({ok:true,json:async()=>[{}]}));
  assert.equal(result.resources,null);
  assert.equal(result.costs,null);
  assert.equal(result.alerts,null);
  assert.equal(result.recommendations,null);
});
test('CSV escapes formulas and quotes but keeps refunds numeric', () => {
  const csv=costReportCsv([{provider:'AWS',service:'  =SUM(1,2)',cost:-18.25},{provider:'GCP',service:'Storage "archive"',cost:0}]);
  assert.ok(csv.includes('"\'  =SUM(1,2)"'));
  assert.ok(csv.includes('"-18.25"'));
  assert.ok(!csv.includes("'-18.25"));
  assert.ok(csv.includes('"Storage ""archive"""'));
});
