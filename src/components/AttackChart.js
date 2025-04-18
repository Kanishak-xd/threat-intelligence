import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend as RechartsLegend 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const AttackChart = () => {
  const [attackData, setAttackData] = useState([]);
  const [ipData, setIpData] = useState([]);
  const [credentialsData, setCredentialsData] = useState([]);
  const [rawLogs, setRawLogs] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/logs')
      .then(response => response.json())
      .then(data => {
        setRawLogs(data); // Store raw logs for download
        // Process data for bar chart (attacks over time)
        const hourlyAttacks = {};
        const ipCounts = {}; // For pie chart
        const credentialsCounts = {}; // For credentials table
        
        data.forEach(log => {
          // Process for bar chart
          const timestamp = new Date(log.timestamp);
          const hour = timestamp.getHours();
          const date = timestamp.toLocaleDateString();
          const key = `${date} ${hour}:00`;
          hourlyAttacks[key] = (hourlyAttacks[key] || 0) + 1;

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
        });

        // Convert to array format for bar chart
        const chartData = Object.entries(hourlyAttacks).map(([time, count]) => ({
          time,
          attacks: count
        }));

        // Convert to array format for pie chart (top 8 IPs)
        const pieData = Object.entries(ipCounts)
          .map(([ip, count]) => ({ name: ip, value: count }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 8);

        // Convert to array format for credentials table (top 10)
        const credentialsArray = Object.values(credentialsCounts)
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        setAttackData(chartData);
        setIpData(pieData);
        setCredentialsData(credentialsArray);
      })
      .catch(error => console.error('Error fetching logs:', error));
  }, []);

  // Function to handle download
  const handleDownload = () => {
    const jsonString = JSON.stringify(rawLogs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'logs.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Custom tooltip component for bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, color: '#666' }}>{label}</p>
          <p style={{ margin: '5px 0', color: '#8884d8', fontWeight: 'bold' }}>
            Attacks: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: '#fff',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, color: '#666' }}>IP: {payload[0].name}</p>
          <p style={{ margin: '5px 0', color: payload[0].color, fontWeight: 'bold' }}>
            Attacks: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      width: '100%', 
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h2 style={{
        textAlign: 'center',
        color: '#333',
        marginBottom: '20px',
        fontSize: '1.5em'
      }}>Attack Analysis Dashboard</h2>

      {/* Bar Chart */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ textAlign: 'center', color: '#444', marginBottom: '15px' }}>
          Number of Attacks Over Time
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={attackData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
            <XAxis 
              dataKey="time" 
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis 
              label={{ 
                value: 'Number of Attacks', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: '#666' }
              }}
              tick={{ fill: '#666' }}
              axisLine={{ stroke: '#ccc' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="attacks" 
              fill="#8884d8"
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ textAlign: 'center', color: '#444', marginBottom: '15px' }}>
          Top Attacking IPs
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={ipData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            >
              {ipData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomPieTooltip />} />
            <RechartsLegend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Credentials Table */}
      <div>
        <h3 style={{ textAlign: 'center', color: '#444', marginBottom: '15px' }}>
          Common Username/Password Combinations
        </h3>
        <div style={{ 
          overflowX: 'auto',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <table style={{ 
            width: '100%',
            borderCollapse: 'collapse',
            backgroundColor: '#fff'
          }}>
            <thead>
              <tr style={{ 
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6'
              }}>
                <th style={{ 
                  padding: '12px 15px',
                  textAlign: 'left',
                  color: '#495057',
                  fontWeight: 'bold'
                }}>Username</th>
                <th style={{ 
                  padding: '12px 15px',
                  textAlign: 'left',
                  color: '#495057',
                  fontWeight: 'bold'
                }}>Password</th>
                <th style={{ 
                  padding: '12px 15px',
                  textAlign: 'left',
                  color: '#495057',
                  fontWeight: 'bold'
                }}>Attempts</th>
              </tr>
            </thead>
            <tbody>
              {credentialsData.map((cred, index) => (
                <tr key={index} style={{ 
                  borderBottom: '1px solid #dee2e6',
                  '&:hover': {
                    backgroundColor: '#f8f9fa'
                  }
                }}>
                  <td style={{ 
                    padding: '12px 15px',
                    color: '#212529'
                  }}>{cred.username}</td>
                  <td style={{ 
                    padding: '12px 15px',
                    color: '#212529'
                  }}>{cred.password}</td>
                  <td style={{ 
                    padding: '12px 15px',
                    color: '#212529',
                    fontWeight: 'bold'
                  }}>{cred.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Download Button */}
      <div style={{ 
        marginTop: '40px',
        textAlign: 'center'
      }}>
        <button
          onClick={handleDownload}
          style={{
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: '#45a049',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
            },
            '&:active': {
              transform: 'translateY(0)',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }
          }}
        >
          Download Logs
        </button>
      </div>
    </div>
  );
};

export default AttackChart; 