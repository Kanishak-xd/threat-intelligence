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

## Design Planning

We designed our UI/UX using Figma to visualize the user flow and application layout before development. Emphasis was placed on clarity, dark theme readability, and responsive structure.

![Figma Wireframe](https://i.ibb.co/S4W1W1F/figma.png)

## Project Management

We used Jira for issue tracking, sprint planning, and overall project management. Each task was broken into epics and assigned with deadlines for effective team collaboration.

![Jira Project Timeline](https://i.ibb.co/nMfChq6S/jira.png)

## DevOps & CI/CD

- Docker was used to containerize the frontend and backend services for local development and testing.
- Jenkins pipeline was configured to automatically build and deploy the application on changes pushed to GitHub.

### Docker Containers Running (Frontend & Backend)

![Docker Containers](https://i.ibb.co/r2Yp0hGp/docker.png)

### Jenkins Pipeline

![Jenkins Pipeline Stage View](https://i.ibb.co/tThV0R7P/jenkins.png)

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

### Docker Deployment

```bash
# Build and run using Docker Compose
docker-compose up --build

# Access the application
http://localhost:3000
```

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

## License

MIT License
