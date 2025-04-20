import React, { useEffect, useState } from "react";

function Apintel() {
  const [heading, setHeading] = useState("");
  const [abuseData, setAbuseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch OTX data
    fetch("http://localhost:3001/api/heading")
      .then((res) => res.json())
      .then((data) => setHeading(data.heading))
      .catch((err) => console.error("Error fetching heading", err));

    // Fetch AbuseIPDB data
    fetch("http://localhost:3001/api/abuseipdb")
      .then((res) => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setAbuseData(data.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching AbuseIPDB data:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ 
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '10px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{ 
        textAlign: 'center',
        color: '#333',
        marginBottom: '30px'
      }}>Threat Intelligence Dashboard</h1>

      {/* OTX Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          color: '#444',
          marginBottom: '15px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>Phishing Domains from OTX</h2>
        <p style={{ color: '#666' }}>{heading}</p>
      </div>

      {/* AbuseIPDB Section */}
      <div>
        <h2 style={{ 
          color: '#444',
          marginBottom: '15px',
          borderBottom: '2px solid #eee',
          paddingBottom: '10px'
        }}>Blacklisted IPs from AbuseIPDB</h2>
        
        {loading ? (
          <p>Loading AbuseIPDB data...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : (
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
                  }}>IP Address</th>
                  <th style={{ 
                    padding: '12px 15px',
                    textAlign: 'left',
                    color: '#495057',
                    fontWeight: 'bold'
                  }}>Abuse Confidence Score</th>
                  <th style={{ 
                    padding: '12px 15px',
                    textAlign: 'left',
                    color: '#495057',
                    fontWeight: 'bold'
                  }}>Country</th>
                  <th style={{ 
                    padding: '12px 15px',
                    textAlign: 'left',
                    color: '#495057',
                    fontWeight: 'bold'
                  }}>Last Reported</th>
                </tr>
              </thead>
              <tbody>
                {abuseData.map((ip, index) => (
                  <tr key={index} style={{ 
                    borderBottom: '1px solid #dee2e6',
                    '&:hover': {
                      backgroundColor: '#f8f9fa'
                    }
                  }}>
                    <td style={{ 
                      padding: '12px 15px',
                      color: '#212529'
                    }}>{ip.ipAddress}</td>
                    <td style={{ 
                      padding: '12px 15px',
                      color: '#212529',
                      fontWeight: 'bold',
                      color: ip.abuseConfidenceScore > 80 ? '#dc3545' : 
                             ip.abuseConfidenceScore > 50 ? '#ffc107' : '#28a745'
                    }}>{ip.abuseConfidenceScore}%</td>
                    <td style={{ 
                      padding: '12px 15px',
                      color: '#212529'
                    }}>{ip.countryCode}</td>
                    <td style={{ 
                      padding: '12px 15px',
                      color: '#212529'
                    }}>{new Date(ip.lastReportedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Apintel; 