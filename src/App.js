import React from "react";
import FetchCowrieData from "./components/CowrieFetch";

function App() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetch("https://threat-intelligence-214n.onrender.com/api/test-data")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h1>Threat Intelligence Dashboard</h1>
      <h2>Fetch Cowrie Data from MongoDB</h2>
      <p>Click the button to fetch data from the database.</p>
      <button onClick={FetchCowrieData}>Fetch Cowrie Data</button>
    </div>
  );
}

export default App;
