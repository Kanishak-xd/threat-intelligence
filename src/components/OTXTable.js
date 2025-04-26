import React, { useEffect, useState } from 'react';
import { getApiUrl } from '../config';
import './OTXTable.css';

const OTXTable = () => {
  const [phishingData, setPhishingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(getApiUrl('/api/heading'))
      .then(response => response.json())
      .then(data => {
        setPhishingData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching phishing data:', error);
        setError('Failed to fetch phishing domains');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="loading">Loading phishing domains...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!phishingData) return null;

  return (
    <div className="otx-section">
      <h2 className="section-title">Phishing Domains from Sinking Yachts</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr className="table-header">
              <th className="table-header-cell">Domain</th>
              <th className="table-header-cell">Type</th>
              <th className="table-header-cell">Created</th>
            </tr>
          </thead>
          <tbody>
            {phishingData.indicators.map((indicator, index) => (
              <tr key={index} className="table-row">
                <td className="table-cell">{indicator.domain}</td>
                <td className="table-cell">{indicator.type}</td>
                <td className="table-cell">
                  {new Date(indicator.created).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OTXTable; 