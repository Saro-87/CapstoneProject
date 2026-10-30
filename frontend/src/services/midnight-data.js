export const providers = ['AWS', 'Azure', 'GCP'];
export const providerName = value => providers.find(p => p.toUpperCase() === String(value).toUpperCase()) || String(value);

export function costReportCsv(services) {
  const cell = input => {
    const value = typeof input === 'string' && (/^\s*[=+@-]/.test(input) || /^[\t\r\n]/.test(input)) ? "'" + input : String(input);
    return '"' + value.replaceAll('"','""') + '"';
  };
  return ['Provider,Service,Cost USD',...services.map(row=>[row.provider,row.service,row.cost].map(cell).join(','))].join('\r\n');
}

export function summarizeCosts(rows, provider = 'All') {
  const daily = new Map();
  const services = new Map();
  const totals = {AWS: 0, Azure: 0, GCP: 0};
  for (const row of rows) {
    if (!row || typeof row.service !== 'string' || typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date)) throw new Error('Invalid cost record');
    const name = providerName(row.provider);
    if (!providers.includes(name)) throw new Error('Unknown cost provider');
    if (row.cost == null || !Number.isFinite(Number(row.cost))) throw new Error('Invalid cost value');
    if (provider !== 'All' && name !== provider) continue;
    const cost = Number(row.cost);
    totals[name] += cost;
    if (!daily.has(row.date)) daily.set(row.date, {date: row.date, AWS: 0, Azure: 0, GCP: 0});
    daily.get(row.date)[name] += cost;
    const key = JSON.stringify([name, row.service]);
    if (!services.has(key)) services.set(key, {provider: name, service: row.service, cost: 0});
    services.get(key).cost += cost;
  }
  return {total: Object.values(totals).reduce((a,b)=>a+b,0), totals,
    daily: [...daily.values()].sort((a,b)=>a.date.localeCompare(b.date)),
    services: [...services.values()].sort((a,b)=>b.cost-a.cost)};
}

export async function loadDashboard(start, end, fetcher = fetch, signal) {
  const requestSignal = signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000);
  const fields = {
    costs: ['provider','service','date'], resources: ['provider','resource_name','resource_type','region','status'],
    alerts: ['provider','severity','message'], recommendations: ['provider','recommendation']
  };
  const amounts = {costs:'cost',resources:'monthly_cost',recommendations:'estimated_savings'};
  const paths = {costs: `/api/dashboard/costs?start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`,
    resources: '/api/resources', alerts: '/api/alerts', recommendations: '/api/recommendations', health: '/api/health'};
  const results = await Promise.allSettled(Object.entries(paths).map(async ([key,path]) => {
    const response = await fetcher(path, {signal: requestSignal});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (key === 'health') {
      if (data?.status !== 'ok' || !['database','demo'].includes(data.source)) throw new Error('Invalid data source');
      return data;
    }
    if (!Array.isArray(data)) throw new Error('Unexpected response');
    if (data.some(row => !row || fields[key].some(field=>typeof row[field] !== 'string') ||
        (amounts[key] && !(key === 'resources' && row[amounts[key]] == null) && (row[amounts[key]] == null || !Number.isFinite(Number(row[amounts[key]])))) ||
        (['alerts','recommendations'].includes(key) && row.id == null))) throw new Error('Invalid backend record');
    return data;
  }));
  const data = {errors: []};
  Object.keys(paths).forEach((key, i) => {
    data[key] = results[i].status === 'fulfilled' ? results[i].value : null;
    if (results[i].status === 'rejected') data.errors.push(`${key}: unavailable (${results[i].reason.message})`);
  });
  if (data.costs) {
    try { summarizeCosts(data.costs); }
    catch { data.costs = null; data.errors.push('costs: invalid backend data'); }
  }
  return data;
}
