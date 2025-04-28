import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { getApiUrl } from '../config';
import './AttackChart.css';

const COLORS = [
  '#FFCCEA', // Coral Red
  '#CDC1FF', // Turquoise
  '#BFECFF', // Sky Blue
  '#FFF6E3', // Sage Green
  '#FFEEAD', // Light Yellow
  '#D4A5A5', // Dusty Rose
  '#9B59B6', // Purple
  '#3498DB'  // Blue
];
const ITEMS_PER_PAGE = 20;

const AttackChart = () => {
  const [attackData, setAttackData] = useState([]);
  const [ipData, setIpData] = useState([]);
  const [credentialsData, setCredentialsData] = useState([]);
  const [displayedCredentials, setDisplayedCredentials] = useState([]);
  const [rawLogs, setRawLogs] = useState([]);
  const [stats, setStats] = useState({
    totalAttacks: 0,
    maxAttacksInDay: 0,
    totalRunTime: 0
  });
  const observer = useRef();
  const lastCredentialElementRef = useCallback(node => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && displayedCredentials.length < credentialsData.length) {
        setDisplayedCredentials(prev => [
          ...prev,
          ...credentialsData.slice(prev.length, prev.length + ITEMS_PER_PAGE)
        ]);
      }
    });
    if (node) observer.current.observe(node);
  }, [credentialsData, displayedCredentials.length]);

  useEffect(() => {
    fetch(getApiUrl('/api/logs'))
      .then(response => response.json())
      .then(data => {
        setRawLogs(data);
        
        // Process data for line chart (attacks over time)
        const dailyAttacks = {};
        const ipCounts = {};
        const credentialsCounts = {};
        let maxAttacksInDay = 0;
        let firstTimestamp = Infinity;
        let lastTimestamp = -Infinity;
        
        data.forEach(log => {
          // Process for line chart
          const timestamp = new Date(log.timestamp);
          const date = timestamp.toLocaleDateString();
          dailyAttacks[date] = (dailyAttacks[date] || 0) + 1;

          // Track timestamps for runtime calculation
          firstTimestamp = Math.min(firstTimestamp, timestamp.getTime());
          lastTimestamp = Math.max(lastTimestamp, timestamp.getTime());

          // Process for pie chart
          if (log.src_ip) {
            ipCounts[log.src_ip] = (ipCounts[log.src_ip] || 0) + 1;
          }

          // Process for credentials table
          if (log.username && log.password) {
            const key = `${log.username}:${log.password}`;
            credentialsCounts[key] = {
              username: log.username,
              password: log.password,
              count: (credentialsCounts[key]?.count || 0) + 1
            };
          }

          // Calculate max attacks in a day
          maxAttacksInDay = Math.max(maxAttacksInDay, dailyAttacks[date]);
        });

        console.log('Total attacks:', data.length);
        console.log('Max attacks in a day:', maxAttacksInDay);
        console.log('Daily attacks:', dailyAttacks);

        // Calculate total runtime in hours
        const totalRunTime = Math.round((lastTimestamp - firstTimestamp) / (1000 * 60 * 60));

        // Update stats
        setStats({
          totalAttacks: data.length,
          maxAttacksInDay,
          totalRunTime
        });

        // Convert to array format for line chart
        const chartData = Object.entries(dailyAttacks)
          .map(([date, count]) => ({
            time: date,
            attacks: count
          }))
          .sort((a, b) => new Date(a.time) - new Date(b.time));

        // Convert to array format for pie chart (top 8 IPs)
        const pieData = Object.entries(ipCounts)
          .map(([ip, count]) => ({ name: ip, value: count }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);

        // Convert to array format for credentials table (all entries)
        const credentialsArray = Object.values(credentialsCounts)
          .sort((a, b) => b.count - a.count);

        setAttackData(chartData);
        setIpData(pieData);
        setCredentialsData(credentialsArray);
        setDisplayedCredentials(credentialsArray.slice(0, ITEMS_PER_PAGE));
      })
      .catch(error => console.error('Error fetching logs:', error));
  }, []);

  const handleDownload = () => {
    const jsonString = JSON.stringify(rawLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'processed_logs.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <div className="chart-section">
        <h3 className="chart-title">Attacks Over Time</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            width={800}
            height={300}
            data={attackData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="time" 
              stroke="#fff"
              tick={{ fill: '#fff' }}
            />
            <YAxis 
              stroke="#fff"
              tick={{ fill: '#fff' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#fff',
                color: '#000',
                border: '1px solid #333'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="attacks" 
              stroke="#E9F5BE" 
              dot={false}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-title">Total Attacks</div>
          <div className="stat-value">{stats.totalAttacks.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Most Attacks in a Day</div>
          <div className="stat-value">{stats.maxAttacksInDay.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">Total Run Time</div>
          <div className="stat-value">{stats.totalRunTime}h</div>
        </div>
        <button onClick={handleDownload} className="download-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L7 11H17L12 16Z" fill="currentColor"/>
            <path d="M12 2V11M12 16L7 11H17L12 16Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M3 20H21" stroke="currentColor" strokeWidth="2"/>
          </svg>
          Download Logs
        </button>
      </div>

      <div className="charts-container">
        <div className="pie-chart-section">
          <h3 className="chart-title">Top Attacking IPs</h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={ipData}
                cx="50%"
                cy="40%"
                outerRadius={130}
                dataKey="value"
              >
                {ipData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="credentials-section">
          <div className="credentials-table-wrapper">
            <table className="credentials-table">
              <thead>
                <tr className="table-header">
                  <th className="table-header-cell">Username</th>
                  <th className="table-header-cell">Password</th>
                  <th className="table-header-cell">Attempts</th>
                </tr>
              </thead>
              <tbody>
                {displayedCredentials.map((cred, index) => (
                  <tr 
                    key={index} 
                    className="table-row"
                    ref={index === displayedCredentials.length - 1 ? lastCredentialElementRef : null}
                  >
                    <td className="table-cell">{cred.username}</td>
                    <td className="table-cell">{cred.password}</td>
                    <td className="table-cell">{cred.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttackChart; 