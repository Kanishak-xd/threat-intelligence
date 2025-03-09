export default function FetchCowrieData() {
  fetch("http://localhost:5000/api/cowrie-data")
    .then((res) => res.json())
    .then((data) => {
      console.log("Fetched cowrie data:", data);
      alert("Cowrie data fetched! Check console.");
    })
    .catch((err) => console.error(err));
}
