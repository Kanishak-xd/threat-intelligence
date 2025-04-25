# Threat Intelligence Dashboard website

## Team members

- Kanishak
- Karma
- Suhana
- Devansh

made in MERN Stack

- Frontend - React
- Backend - ExpressJS
- Database - MongoDB Atlas
- Honeypot - AWS EC2 Cowrie

## Run in your Environment

After cloning and npm install,
In a terminal, go to Backend Directory:
```
cd backend
```
Fetch logs file from the Database:
```
node mongoFetch.js
```
Filter logs from monLogs.json into processed_logs.json:
```
node processLogs.js
```
Run Backend:
```
node server.js
```
Open another terminal and Go to Frontend directory:
```
cd src
```
Run Frontend:
```
npm start
```
Go to http://localhost:3000/home
