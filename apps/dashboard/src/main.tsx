import React from 'react';
import { createRoot } from 'react-dom/client';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwcm9qZWN0S2V5IjoiZGVtbyIsImlhdCI6MTc2MDg5MzQxM30.qgePCcCB5vMAypzBckbaa75QvsgKpvY3T_L0EY3WJAo';
const socket = io('http://localhost:4500', { auth: { token } });

type Metric = {
  name: string;
  value: number;
  ts: number;
  page: string;
};

function App() {
  const [status, setStatus] = React.useState('connecting');
  const [metrics, setMetrics] = React.useState<Metric[]>([]);
  const [liveCount, setLiveCount] = React.useState(0);

  React.useEffect(() => {
    socket.on('connect', () => setStatus('connected'));
    socket.on('connected', () => setStatus('authorized'));
    socket.on('metric', (metric: Metric) => {
      setMetrics(prev => [...prev.slice(-50), metric]);
      setLiveCount(c => c + 1);
    });
    
    // Simulate some metrics for demo
    const interval = setInterval(() => {
      const demoMetric: Metric = {
        name: ['LCP', 'FID', 'CLS', 'TTFB', 'INP'][Math.floor(Math.random() * 5)],
        value: Math.random() * 3000,
        ts: Date.now(),
        page: '/'
      };
      setMetrics(prev => [...prev.slice(-50), demoMetric]);
      setLiveCount(c => c + 1);
    }, 3000);
    
    return () => {
      socket.off('connect');
      socket.off('connected');
      socket.off('metric');
      clearInterval(interval);
    };
  }, []);

  const lcpMetrics = metrics.filter(m => m.name === 'LCP').slice(-10).map((m, i) => ({ 
    time: i, 
    value: m.value,
    label: new Date(m.ts).toLocaleTimeString()
  }));
  
  const metricSummary = ['LCP', 'FID', 'CLS', 'TTFB', 'INP'].map(name => {
    const values = metrics.filter(m => m.name === name).map(m => m.value);
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    return { name, avg: Math.round(avg), count: values.length };
  });

  const getStatusColor = () => {
    if (status === 'authorized') return '#10b981';
    if (status === 'connected') return '#f59e0b';
    return '#6b7280';
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ background: '#1e293b', borderBottom: '1px solid #334155', padding: '1rem 2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>Performance Monitor</h1>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: '#94a3b8' }}>Real-time Web Vitals Dashboard</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: getStatusColor(),
              animation: status === 'authorized' ? 'pulse 2s infinite' : 'none'
            }}></div>
            <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
              {status === 'authorized' ? 'Live' : status}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {metricSummary.map(m => (
          <div key={m.name} style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>{m.name}</div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#f1f5f9' }}>{m.avg}<span style={{ fontSize: '1rem', color: '#64748b' }}>ms</span></div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{m.count} samples</div>
          </div>
        ))}
        <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #334155' }}>
          <div style={{ fontSize: '0.875rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Live Events</div>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981' }}>{liveCount}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>total received</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ padding: '0 2rem 2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '1rem' }}>
        {/* LCP Trend */}
        <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>LCP Trend (Last 10)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={lcpMetrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Metrics Summary Bar */}
        <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Average Metrics</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={metricSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '0.75rem' }} />
              <Tooltip 
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '0.25rem' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend />
              <Bar dataKey="avg" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Metrics Table */}
      <div style={{ padding: '0 2rem 2rem' }}>
        <div style={{ background: '#1e293b', borderRadius: '0.5rem', padding: '1.5rem', border: '1px solid #334155' }}>
          <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>Recent Metrics</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>Metric</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>Value</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>Page</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', fontSize: '0.875rem', color: '#94a3b8', fontWeight: 500 }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {metrics.slice(-10).reverse().map((m, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem' }}>
                      <span style={{ 
                        background: '#334155', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.25rem',
                        fontWeight: 600 
                      }}>{m.name}</span>
                    </td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#10b981', fontWeight: 600 }}>{Math.round(m.value)}ms</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#94a3b8' }}>{m.page}</td>
                    <td style={{ padding: '0.75rem', fontSize: '0.875rem', color: '#64748b' }}>{new Date(m.ts).toLocaleTimeString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);


