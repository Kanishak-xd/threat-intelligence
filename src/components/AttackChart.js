import React, { useEffect, useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend as RechartsLegend 
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const AttackChart = () => {
  const [attackData, setAttackData] = useState([]);
  const [ipData, setIpData] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/logs')
      .then(response => response.json())
      .then(data => {
        // Process data for bar chart (attacks over time)
        const hourlyAttacks = {};
        const ipCounts = {}; // For pie chart
        
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

        setAttackData(chartData);
        setIpData(pieData);
      })
      .catch(error => console.error('Error fetching logs:', error));
  }, []);

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
      <div>
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
    </div>
  );
};

export default AttackChart; 