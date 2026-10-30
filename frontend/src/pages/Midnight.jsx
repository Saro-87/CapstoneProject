import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { loadDashboard, providerName, providers, summarizeCosts, costReportCsv } from '../services/midnight-data';
import '../../../designs/style.css';
import '../../../designs/variants.css';
import '../../../designs/midnight.css';
import './Midnight.css';

const colors = { AWS: '#ffb454', Azure: '#6f9ff2', GCP: '#9a78ee' };
const money = value => new Intl.NumberFormat('en-US', {style:'currency',currency:'USD',maximumFractionDigits:2}).format(value);
const localDate = date => new Date(date.getTime()-date.getTimezoneOffset()*60000).toISOString().slice(0,10);
const menu = [['overview','◫','Overview'],['spend','◷','Cost analytics'],['resource-list','▦','Cloud resources'],['insights','✧','Optimization'],['alerts','♧','Alerts'],['settings','⚙','Settings']];
const tooltipStyle = { background:'#17243a',border:'1px solid #506580',borderRadius:10,color:'#e6efff' };

function CostChart({rows, provider, bars = false}) {
  if (!rows.length) return <p className="empty-state">No cost records in this period.</p>;
  const Chart = bars ? BarChart : LineChart;
  return <div className="live-chart"><ResponsiveContainer width="100%" height="100%"><Chart data={rows} margin={{top:20,right:12,left:0,bottom:5}}>
    <CartesianGrid stroke="#2b3951" vertical={false}/><XAxis dataKey="date" tick={{fill:'#a3b3ce',fontSize:10}} tickFormatter={date=>date.slice(5)}/><YAxis tick={{fill:'#a3b3ce',fontSize:10}} width={60} tickFormatter={n=>`$${n}`}/>
    <Tooltip contentStyle={tooltipStyle} formatter={value=>money(value)}/>
    {providers.filter(p=>provider==='All'||p===provider).map(p=>bars ? <Bar key={p} dataKey={p} fill={colors[p]} radius={[4,4,0,0]}/> : <Line key={p} dataKey={p} stroke={colors[p]} strokeWidth={2.5} dot={false}/>)}
  </Chart></ResponsiveContainer></div>;
}

export default function Midnight() {
  const [provider,setProvider] = useState('All');
  const [days,setDays] = useState(30);
  const [reload,setReload] = useState(0);
  const [data,setData] = useState(null);
  const [loading,setLoading] = useState(true);
  const [syncing,setSyncing] = useState(false);
  const [syncMessage,setSyncMessage] = useState('');
  const [syncError,setSyncError] = useState(false);
  const [query,setQuery] = useState('');
  const [status,setStatus] = useState('All');
  const [budget,setBudget] = useState('');
  const [expanded,setExpanded] = useState(false);
  const [acknowledged,setAcknowledged] = useState(new Set());
  const [showAcknowledged,setShowAcknowledged] = useState(true);
  const [resource,setResource] = useState(null);
  const [active,setActive] = useState('overview');
  const [barDays,setBarDays] = useState(7);
  const dialog = useRef(null);
  const today = new Date();
  const end = new Date(today); end.setDate(end.getDate()+1);
  const start = new Date(end); start.setDate(start.getDate()-days);
  const startDate = localDate(start), endDate = localDate(end);

  useLayoutEffect(()=>{
    document.body.classList.add('midnight');
    return ()=>document.body.classList.remove('midnight');
  },[]);
  useEffect(()=>{
    const controller = new AbortController();
    setLoading(true);
    loadDashboard(startDate,endDate,fetch,controller.signal).then(result=>{
      if (!controller.signal.aborted) {setData(result);setLoading(false);}
    });
    return ()=>controller.abort();
  },[startDate,endDate,reload]);

  const summary = summarizeCosts(data?.costs || [],provider);
  const forProvider = rows => (rows || []).filter(row=>provider==='All'||providerName(row.provider)===provider);
  const resources = forProvider(data?.resources).filter(r=>status==='All'||r.status===status).sort((a,b)=>b.monthly_cost-a.monthly_cost);
  const recommendations = forProvider(data?.recommendations);
  const alerts = forProvider(data?.alerts);
  const savings = recommendations.reduce((n,r)=>n+Number(r.estimated_savings),0);
  const activeAlerts = alerts.filter(a=>!acknowledged.has(a.id)).length;
  const available = key => !loading && data?.[key] !== null && data?.[key] !== undefined;
  const value = (key,number) => loading?'…':available(key)?number:'Unavailable';
  const budgetAmount = Number(budget);
  const validBudget = budget!=='' && Number.isFinite(budgetAmount) && budgetAmount>0 && budgetAmount<=1e9;
  const remaining = budgetAmount-summary.total;

  async function syncCosts() {
    setSyncing(true);
    setSyncMessage('Syncing provider billing for the selected period…');
    setSyncError(false);
    try {
      const response = await fetch(`/api/sync/all?start_date=${encodeURIComponent(startDate)}&end_date=${encodeURIComponent(localDate(today))}`, {
        method: 'POST',
        signal: AbortSignal.timeout(120000)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || `HTTP ${response.status}`);
      const entries = Object.entries(result.providers || {});
      const succeeded = entries.filter(([,item]) => item.status === 'success').map(([name,item]) => `${name.toUpperCase()}: ${item.rows_written ?? 0} rows`);
      const failed = entries.filter(([,item]) => item.status !== 'success').map(([name,item]) => `${name.toUpperCase()}: ${item.message || 'sync failed'}`);
      setSyncError(failed.length > 0);
      setSyncMessage([...succeeded, ...failed].join(' · ') || 'Sync finished with no provider results.');
      setReload(n => n + 1);
    } catch (error) {
      setSyncError(true);
      setSyncMessage(`Billing sync failed: ${error.message}`);
    } finally {
      setSyncing(false);
    }
  }
  function exportReport() {
    const csv = costReportCsv(summary.services);
    const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=`midnight-${startDate}-${provider}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function acknowledge(id) {
    setAcknowledged(previous=>{const next=new Set(previous);next.has(id)?next.delete(id):next.add(id);return next;});
  }
  return <>
    <aside><a className="brand" href="#overview">◈ <span>midnight<span className="brand-dot">.</span></span></a><p className="nav-label">WORKSPACE</p><nav aria-label="Section menu">{menu.map(([id,icon,label])=><a key={id} href={`#${id}`} className={active===id?'active':''} aria-current={active===id?'location':undefined} onClick={()=>setActive(id)}>{icon} &nbsp; {label}{id==='alerts'&&available('alerts')&&<b>{activeAlerts}</b>}</a>)}</nav></aside>
    <main id="overview" aria-busy={loading}>
      <header><span>Workspace / <strong>Overview</strong></span><div className="live-header"><span className="demo">{data?.health?.source==='demo'?'DEMO · RANDOM DATA':data?.health?.source==='database'?'DATABASE DATA':'SOURCE UNVERIFIED'}</span><button onClick={syncCosts} disabled={loading||syncing}>{syncing?'↻ Syncing…':'⇅ Sync billing'}</button><button onClick={()=>setReload(n=>n+1)} disabled={loading}>↻ Refresh</button></div></header>
      {syncMessage&&<p className={syncError?'api-error':'sync-message'} role="status">{syncMessage}</p>}
      <section className="heading"><div><div className="eyebrow">THE MULTI-CLOUD COMMAND CENTER</div><h1>Cloud operations. In focus.</h1><p>Your cloud costs, resources, and opportunities in one place.</p></div><button className="export" onClick={exportReport} disabled={!available('costs')}>↓ Export report</button></section>
      <div className="provider-health">{providers.map(p=><span key={p}><i style={{background:colors[p]}}/>{p} · {loading?'Loading':data?.costs===null?'Unavailable':data?.costs?.some(row=>providerName(row.provider)===p)?'Stored costs available':'No stored costs'}</span>)}</div>
      <p className="source-note">{data?.health?.source === 'demo' && 'Synthetic dry run: all values on this page are generated test data. '}Provider connectivity is checked during billing sync. Costs are stored records in USD; resources, alerts and recommendations show the latest available database records.</p>
      <div className="toolbar"><div className="tabs">{['All',...providers].map(p=><button key={p} className={provider===p?'selected':''} aria-pressed={provider===p} onClick={()=>setProvider(p)}>{p==='All'?'All clouds':p}</button>)}</div><label className="control-label">Period <select value={days} onChange={e=>setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></label></div>
      <p className="source-note">{startDate} – {localDate(today)} · end date inclusive on screen</p>
      {!!data?.errors.length&&<div className="api-error" role="alert">Some sections could not load: {data.errors.join('; ')}. Check the backend and database, then refresh.</div>}
      <section className="metrics"><article><span>Cloud spend · selected period</span><h2>{value('costs',money(summary.total))}</h2><p>{summary.services.length} services with cost records</p></article><article><span>Resources in view</span><h2>{value('resources',resources.length)}</h2><p>Stored inventory · status filter applies</p></article><article><span>Budget remaining</span><h2>{validBudget?value('costs',money(remaining)):'Not set'}</h2><p>Local period budget · {provider==='All'?'all clouds':provider} spend</p></article><article className="saving"><span>Potential savings</span><h2>{value('recommendations',money(savings))}</h2><p>Across {recommendations.length} stored recommendations</p><a href="#insights">Explore opportunities →</a></article></section>
      <section className="metrics extra-metrics"><article><span>Average utilization</span><h2>Unavailable</h2><p>The resource API does not supply utilization metrics.</p></article><article><span>Forecast</span><h2>Unavailable</h2><p>No forecast endpoint is connected.</p></article></section>
      <section className="charts" id="spend"><article className="panel trend"><h3>Spend over time</h3><p>Daily stored costs for the selected period</p>{available('costs')?<CostChart rows={summary.daily} provider={provider}/>:<p className="empty-state">{loading?'Loading costs…':'Cost data unavailable.'}</p>}<div className="legend">{providers.map(p=><span key={p}><i style={{background:colors[p]}}/>{p}</span>)}</div></article><article className="panel distribution"><h3>Spend by provider</h3><p>Selected period · USD</p><div className="donut" style={{background:summary.total>0?`conic-gradient(${(()=>{let offset=0;return providers.map(p=>{const begin=offset;offset+=Math.max(0,summary.totals[p])/Object.values(summary.totals).reduce((n,v)=>n+Math.max(0,v),0)*100;return `${colors[p]} ${begin}% ${offset}%`;}).join(',');})()})`:'#2a3850'}}><div><small>Total spend</small><strong>{value('costs',money(summary.total))}</strong><small>Stored costs</small></div></div>{providers.map(p=><div className="provider" key={p}><span><i style={{background:colors[p]}}/>{p}</span><b>{value('costs',money(summary.totals[p]))}</b></div>)}</article></section>
      <section className="panel extension-panel"><div className="panel-title"><div><h3>Daily cost trend</h3><p>Actual stored daily values; no records are interpolated</p></div><label className="control-label">Window <select value={barDays} onChange={e=>setBarDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={14}>Last 14 days</option></select></label></div>{available('costs')?<CostChart rows={summary.daily.filter(row=>{const cutoff=new Date(endDate+'T00:00:00');cutoff.setDate(cutoff.getDate()-barDays);return row.date>=localDate(cutoff);})} provider={provider} bars/>:<p className="empty-state">{loading?'Loading…':'Cost data unavailable.'}</p>}</section>
      <section className="bottom"><article className="panel" id="services"><div className="panel-title"><div><h3>Top services by spend</h3><p>Grouped from stored billing records</p></div><input aria-label="Search services" placeholder="Search services" value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="table-wrap"><table><thead><tr><th>Service</th><th>Provider</th><th>Spend</th></tr></thead><tbody>{summary.services.filter(row=>row.service.toLowerCase().includes(query.toLowerCase())).map(row=><tr key={`${row.provider}-${row.service}`}><td>{row.service}</td><td><span className={`badge ${row.provider}`}>{row.provider}</span></td><td>{money(row.cost)}</td></tr>)}</tbody></table>{!summary.services.some(row=>row.service.toLowerCase().includes(query.toLowerCase()))&&<p className="empty-state">{loading?'Loading…':query && summary.services.length?'No services match your search.':available('costs')?'No stored costs for this period.':'Service costs unavailable.'}</p>}</div></article><article className="panel insights" id="insights"><h3>✧ Smart opportunities</h3><p>Recommendations from the backend</p>{recommendations.map(row=><div className="opportunity" key={row.id}><span className="op-icon">↘</span><div><h4>{providerName(row.provider)}</h4><p>{row.recommendation}</p><b>{money(row.estimated_savings)} <small>estimated savings</small></b></div></div>)}{!recommendations.length&&<p className="empty-state">{loading?'Loading…':available('recommendations')?'No recommendations recorded.':'Recommendations unavailable.'}</p>}</article></section>
      <section className="bottom extension-panel"><article className="panel" id="resource-list"><div className="panel-title"><div><h3>Top cost resources</h3><p>Latest stored inventory</p></div><button onClick={()=>setExpanded(!expanded)} aria-expanded={expanded}>{expanded?'Show top 5':'View all →'}</button></div><div className="table-wrap"><table><thead><tr><th>Resource</th><th>Provider</th><th>Type</th><th>Region</th><th>Status</th><th>Cost / month</th></tr></thead><tbody>{resources.slice(0,expanded?resources.length:5).map((row,i)=><tr key={`${row.provider}-${row.resource_name}-${i}`}><td><button className="resource-link" onClick={()=>{setResource(row);dialog.current.showModal();}}>{row.resource_name}</button></td><td><span className={`badge ${providerName(row.provider)}`}>{providerName(row.provider)}</span></td><td>{row.resource_type}</td><td>{row.region}</td><td>{row.status}</td><td>{money(row.monthly_cost)}</td></tr>)}</tbody></table>{!resources.length&&<p className="empty-state">{loading?'Loading…':available('resources')?'No resources match this view.':'Resource inventory unavailable.'}</p>}</div></article><article className="panel" id="alerts"><div className="panel-title"><h3>Recent alerts</h3><span className="pill">{value('alerts',`${activeAlerts} active`)}</span></div><p>Acknowledgements apply to this browser session only.</p>{alerts.filter(row=>showAcknowledged||!acknowledged.has(row.id)).map(row=><div key={row.id} className={`alert-option ${row.severity} ${acknowledged.has(row.id)?'acknowledged':''}`}><span className="severity">!</span><div><h4>{providerName(row.provider)} · {row.severity}</h4><p>{row.message}</p><small>{row.created_at?new Date(row.created_at).toLocaleString():'Time unavailable'}</small><button onClick={()=>acknowledge(row.id)}>{acknowledged.has(row.id)?'Reopen':'Acknowledge'}</button></div></div>)}{!alerts.length&&<p className="empty-state">{loading?'Loading…':available('alerts')?'No alerts recorded.':'Alerts unavailable.'}</p>}</article></section>
      <section className="panel extension-panel" id="settings"><h3>Workspace settings</h3><p>Local planning preferences; no cloud settings are changed.</p><div className="settings-grid"><label>Selected-period budget (USD)<input type="number" min="1" max="1000000000" step="0.01" placeholder="Set a planning budget" value={budget} onChange={e=>setBudget(e.target.value)}/></label><label>Resource status<select value={status} onChange={e=>setStatus(e.target.value)}>{['All',...new Set((data?.resources||[]).map(r=>r.status).filter(Boolean))].map(s=><option key={s}>{s}</option>)}</select></label><label className="check-label"><input type="checkbox" checked={showAcknowledged} onChange={e=>setShowAcknowledged(e.target.checked)}/>Show acknowledged alerts</label></div>{budget!==''&&!validBudget&&<p role="alert">Enter a positive budget of at most $1 billion.</p>}<p>Environment and utilization filters require additional backend fields.</p></section>
      <footer><span>◈ midnight · Multi-cloud intelligence</span><span>Manual billing sync · scheduled sync via Windows Task Scheduler</span></footer>
    </main>
    <dialog ref={dialog}><form method="dialog"><button className="dialog-close" aria-label="Close resource details">×</button></form><h3>{resource?.resource_name}</h3><p>{resource?.provider} · {resource?.resource_type} · {resource?.region}</p><p>Status: {resource?.status}</p><p>Monthly cost: {money(resource?.monthly_cost||0)}</p></dialog>
  </>;
}
