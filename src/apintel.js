import React, { useEffect, useState, useRef, useCallback } from "react";
import { getApiUrl } from "./config";
import OTXTable from "./components/OTXTable";
import "./Apintel.css";

function Apintel() {
  const [abuseData, setAbuseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchIP, setSearchIP] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observer = useRef();

  const lastElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        console.log(`[Frontend] Fetching AbuseIPDB data - Page: ${page}`);
        const res = await fetch(getApiUrl(`/api/abuseipdb?page=${page}&limit=10`));
        
        console.log(`[Frontend] Response status: ${res.status}`);
        const data = await res.json();
        
        if (data.error) {
          console.error('[Frontend] API Error:', data.error);
          if (data.details) {
            console.error('[Frontend] Error details:', data.details);
          }
          setError(data.error);
        } else {
          console.log(`[Frontend] Successfully received ${data.data.length} records`);
          setAbuseData(prevData => {
            if (page === 1) return data.data;
            return [...prevData, ...data.data];
          });
          setHasMore(data.data.length === 10);
        }
      } catch (err) {
        console.error("[Frontend] Error fetching AbuseIPDB data:", err);
        setError("Failed to fetch AbuseIPDB data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page]);

  const handleIPSearch = async () => {
    if (!searchIP) return;

    try {
      console.log(`[Frontend] Searching for IP: ${searchIP}`);
      const res = await fetch(
        getApiUrl(`/api/abuseipdb/search?ip=${searchIP}`)
      );
      
      console.log(`[Frontend] Search response status: ${res.status}`);
      const data = await res.json();
      
      if (data.error) {
        console.error('[Frontend] Search Error:', data.error);
        setSearchResult(null);
        setError(data.error);
      } else {
        console.log('[Frontend] Search successful');
        setSearchResult(data.data || null);
        setError(null);
      }
    } catch (err) {
      console.error("[Frontend] IP Search error:", err);
      setSearchResult(null);
      setError("Failed to fetch IP report. Please try again later.");
    }
  };

  const getRiskClass = (score) => {
    if (score > 80) return "high-risk";
    if (score > 50) return "medium-risk";
    return "low-risk";
  };

  return (
    <>
      <h1 className="page-title">API Intelligence Dashboard</h1>
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Sinking Yachts Phishing Domains */}
          <div className="table-section">
            <OTXTable />
          </div>

          {/* Blacklisted IPs */}
          <div className="table-section">
            <h2 className="section-title">Blacklisted IPs from AbuseIPDB</h2>
            {error ? (
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
                      <tr 
                        key={index} 
                        className="table-row"
                        ref={index === abuseData.length - 1 ? lastElementRef : null}
                      >
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
                {loading && <p className="loading">Loading more data...</p>}
              </div>
            )}
          </div>

          {/* IP Search Section */}
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
      </div>
    </>
  );
}

export default Apintel;
