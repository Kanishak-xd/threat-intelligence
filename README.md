# Threat Intelligence Dashboard

A comprehensive threat intelligence platform that monitors and analyzes security threats. This project provides a user-friendly interface for visualizing attack patterns, analyzing IP threats, and monitoring security events.

---

## Project Snapshots

### Hero Section
![Hero Section](https://i.postimg.cc/cLrfRgW5/web1.png)

### Dashboard
![Dashboard](https://i.postimg.cc/BQZTv7V3/web2.png)

### API Intelligence Page
![API Intelligence](https://i.postimg.cc/65Hd4Vkv/web3.png)

### About Page
![About Page](https://i.postimg.cc/fRpmBzTW/web4.png)

---

## Features

- **Real-time Attack Monitoring**
  - Line chart showing attack frequency over time
  - Interactive visualization of attack patterns
  - Detailed statistics and metrics

- **IP Intelligence**
  - Top attacking IPs visualization
  - Detailed IP threat analysis
  - Blacklisted IP tracking

- **Credentials Monitoring**
  - Real-time tracking of credential attempts
  - Username/password attempt statistics
  - Attack pattern analysis

- **User-Friendly Interface**
  - Responsive design
  - Intuitive navigation
  - Dark theme for better visibility

---

## Tech Stack

- **Frontend**
  - React.js
  - Chart.js & React-Chartjs-2 for visualizations
  - React Router for navigation
  - Fetch API for data requests
  - Hosted on Netlify

- **Backend**
  - Node.js with Express.js
  - MongoDB Atlas for cloud database
  - RESTful API architecture
  - Hosted on Render

- **Infrastructure**
  - Docker for containerization
  - Jenkins for CI/CD
  - AWS EC2 for Honeypot deployment
  - Cowrie Honeypot for threat data collection

---

## Design Planning

We designed our UI/UX using Figma to visualize the user flow and layout. Focus was placed on dark theme & usability.

![Figma Wireframe](https://i.postimg.cc/Dw3VqFQL/figma.png)

---

## Project Management

We used Jira for agile task management, sprint planning, and milestone tracking.

![Jira Timeline](https://i.postimg.cc/QtpQF2D8/jira.png)

---

## Database View

MongoDB Atlas was used as the primary cloud database solution.

![MongoDB Screenshot](https://i.postimg.cc/gcHymb44/mongo.png)

---

## DevOps & CI/CD

We implemented DevOps practices to streamline development and deployment.

- **Docker** was used to containerize frontend and backend for local development.
- **Jenkins** handled CI/CD automation, auto-deploying on GitHub pushes.
- **.env** configuration supported local, Netlify, Render, and Jenkins builds.

### Docker Containers (Frontend & Backend)

![Docker Containers](https://i.postimg.cc/kg4vTYQs/docker.png)

### Jenkins Pipeline

![Jenkins Pipeline](https://i.postimg.cc/hvc9T249/jenkins.png)

---

## Honeypot Deployment (AWS)

We deployed a Cowrie honeypot on AWS EC2 to collect real-world attack data.

![Honeypot on AWS](https://i.postimg.cc/KjftNt4C/honeypot.png)

---

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Docker (optional)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Kanishak-xd/threat-intelligence.git
cd threat-intelligence

# 2. Install frontend dependencies
npm install

# 3. Install backend dependencies
cd backend
npm install

# 4. Set up MongoDB Atlas connection

# 5. Start the backend server
cd backend
node server.js

# 6. Start the frontend development server
cd ..
npm start

# 7. Access the application
http://localhost:3000
```

---

### Docker Deployment

```bash
# Build and run using Docker Compose
docker-compose up --build

# Access the application
http://localhost:3000
```

---

## Project Structure

```
threat-intelligence/
├── src/
│   ├── components/
│   │   ├── AttackChart.js
│   │   └── AttackChart.css
│   ├── App.js
│   ├── App.css
│   └── apintel.js
├── backend/
│   ├── server.js
│   ├── mongoFetch.js
│   ├── processLogs.js
│   └── package.json
├── public/
├── package.json
└── README.md
```

---

## API Endpoints

- `GET /api/logs` - Fetch security logs
- `GET /api/attack-data/aggregated` - Get aggregated attack data
- `GET /api/ip-intel` - Get IP intelligence data

---

## License

MIT License
