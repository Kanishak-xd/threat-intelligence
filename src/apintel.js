import React, { useEffect, useState } from "react";
import "./Apintel.css";

function Apintel() {
  const [heading, setHeading] = useState("");
  const [abuseData, setAbuseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIP, setSearchIP] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3001/api/heading")
      .then((res) => res.json())
      .then((data) => setHeading(data.heading))
      .catch((err) => console.error("Error fetching heading", err));

    fetch("http://localhost:3001/api/abuseipdb")
      .then((res) => res.json())
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

  const handleIPSearch = async () => {
    if (!searchIP) return;

    try {
      const res = await fetch(
        `http://localhost:3001/api/abuseipdb/search?ip=${searchIP}`
      );
      const data = await res.json();
      setSearchResult(data.data || null);
    } catch (err) {
      console.error("IP Search error:", err);
      setSearchResult(null);
    }
  };

  const getRiskClass = (score) => {
    if (score > 80) return "high-risk";
    if (score > 50) return "medium-risk";
    return "low-risk";
  };

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Threat Intelligence Dashboard</h1>

      <div>
        <h2 className="section-title">Phishing Domains from OTX</h2>
        <p className="section-content">{heading}</p>
      </div>

      <div>
        <h2 className="section-title">Blacklisted IPs from AbuseIPDB</h2>

        {loading ? (
          <p>Loading AbuseIPDB data...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr className="table-header">
                  <th className="table-header-cell">IP Address</th>
                  <th className="table-header-cell">Abuse Confidence Score</th>
                  <th className="table-header-cell">Country</th>
                  <th className="table-header-cell">Last Reported</th>
                </tr>
              </thead>
              <tbody>
                {abuseData.map((ip, index) => (
                  <tr key={index} className="table-row">
                    <td className="table-cell">{ip.ipAddress}</td>
                    <td className={`table-cell ${getRiskClass(ip.abuseConfidenceScore)}`}>
                      {ip.abuseConfidenceScore}%
                    </td>
                    <td className="table-cell">{ip.countryCode}</td>
                    <td className="table-cell">
                      {new Date(ip.lastReportedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="search-section">
        <h2 className="search-title">Search Specific IP in AbuseIPDB</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Enter IP address"
            value={searchIP}
            onChange={(e) => setSearchIP(e.target.value)}
            className="search-input"
          />
          <button onClick={handleIPSearch} className="search-button">
            Search
          </button>
        </div>

        {searchResult && (
          <div className="search-result">
            <p><strong>IP:</strong> {searchResult.ipAddress}</p>
            <p><strong>Abuse Score:</strong> {searchResult.abuseConfidenceScore}%</p>
            <p><strong>Country:</strong> {searchResult.countryCode}</p>
            <p><strong>Domain:</strong> {searchResult.domain}</p>
            <p><strong>Total Reports:</strong> {searchResult.totalReports}</p>
            <p><strong>Last Reported At:</strong> {new Date(searchResult.lastReportedAt).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Apintel;
