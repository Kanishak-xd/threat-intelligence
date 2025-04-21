import React, { useEffect, useState } from "react";

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

  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center", color: "#333", marginBottom: "30px" }}>
        Threat Intelligence Dashboard
      </h1>

      {/* OTX Section */}
      <div style={{ marginBottom: "40px" }}>
        <h2
          style={{
            color: "#444",
            marginBottom: "15px",
            borderBottom: "2px solid #eee",
            paddingBottom: "10px",
          }}
        >
          Phishing Domains from OTX
        </h2>
        <p style={{ color: "#666" }}>{heading}</p>
      </div>

      {/* AbuseIPDB Section */}
      <div>
        <h2
          style={{
            color: "#444",
            marginBottom: "15px",
            borderBottom: "2px solid #eee",
            paddingBottom: "10px",
          }}
        >
          Blacklisted IPs from AbuseIPDB
        </h2>

        {loading ? (
          <p>Loading AbuseIPDB data...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Error: {error}</p>
        ) : (
          <div
            style={{
              maxHeight: "300px", // adjust height as needed
              overflowY: "auto",
              overflowX: "auto",
              borderRadius: "8px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginBottom: "20px",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                backgroundColor: "#fff",
              }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    IP Address
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Abuse Confidence Score
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Country
                  </th>
                  <th
                    style={{
                      padding: "12px 15px",
                      textAlign: "left",
                      fontWeight: "bold",
                    }}
                  >
                    Last Reported
                  </th>
                </tr>
              </thead>
              <tbody>
                {abuseData.map((ip, index) => (
                  <tr key={index} style={{ borderBottom: "1px solid #dee2e6" }}>
                    <td style={{ padding: "12px 15px" }}>{ip.ipAddress}</td>
                    <td
                      style={{
                        padding: "12px 15px",
                        fontWeight: "bold",
                        color:
                          ip.abuseConfidenceScore > 80
                            ? "#dc3545"
                            : ip.abuseConfidenceScore > 50
                            ? "#ffc107"
                            : "#28a745",
                      }}
                    >
                      {ip.abuseConfidenceScore}%
                    </td>
                    <td style={{ padding: "12px 15px" }}>{ip.countryCode}</td>
                    <td style={{ padding: "12px 15px" }}>
                      {new Date(ip.lastReportedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* IP Search Section */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ marginBottom: "10px" }}>
          Search Specific IP in AbuseIPDB
        </h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="Enter IP address"
            value={searchIP}
            onChange={(e) => setSearchIP(e.target.value)}
            style={{
              padding: "10px",
              flex: 1,
              border: "1px solid #ccc",
              borderRadius: "5px",
            }}
          />
          <button
            onClick={handleIPSearch}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
            }}
          >
            Search
          </button>
        </div>

        {searchResult && (
          <div
            style={{
              backgroundColor: "#f1f1f1",
              padding: "15px",
              borderRadius: "8px",
            }}
          >
            <p>
              <strong>IP:</strong> {searchResult.ipAddress}
            </p>
            <p>
              <strong>Abuse Score:</strong> {searchResult.abuseConfidenceScore}%
            </p>
            <p>
              <strong>Country:</strong> {searchResult.countryCode}
            </p>
            <p>
              <strong>Domain:</strong> {searchResult.domain}
            </p>
            <p>
              <strong>Total Reports:</strong> {searchResult.totalReports}
            </p>
            <p>
              <strong>Last Reported At:</strong>{" "}
              {new Date(searchResult.lastReportedAt).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Apintel;
