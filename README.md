# Threat Intelligence Dashboard

A comprehensive threat intelligence platform that monitors and analyzes security threats. This project provides a user-friendly interface for visualizing attack patterns, analyzing IP threats, and monitoring security events.

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

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- Docker (optional)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Kanishak-xd/threat-intelligence.git
   cd threat-intelligence
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

4. Set up MongoDB Atlas connection

5. Start the backend server:
   ```bash
   cd backend
   node server.js
   ```

6. Start the frontend development server:
   ```bash
   npm start
   ```

7. Access the application at `http://localhost:3000`

### Docker Deployment

1. Build and run using Docker Compose:
   ```bash
   docker-compose up --build
   ```

2. Access the application at `http://localhost:3000`

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

## API Endpoints

- `GET /api/logs` - Fetch security logs
- `GET /api/attack-data/aggregated` - Get aggregated attack data
- `GET /api/ip-intel` - Get IP intelligence data


MIT License
