# 🩸 Blood4Life

A full-stack blood bank management system built with **React**, **Node.js/Express**, and **MySQL**.

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Lucide Icons, Recharts, Three.js |
| Backend | Node.js + Express REST API |
| Database | MySQL (XAMPP) |

## 📁 Project Structure

```
blood4life/
├── database/     ← MySQL schema & seed data
├── backend/      ← Express API server (port 5000)
└── frontend/     ← React + Vite app (port 5173)
```

## 🚀 Getting Started

### Prerequisites
- [XAMPP](https://www.apachefriends.org/) with MySQL
- [Node.js](https://nodejs.org/) v18+

### 1. Set up the database
```bash
# Start XAMPP MySQL, then import the schema
mysql -u root < database/schema.sql
```

### 2. Configure & start the backend
```bash
cd backend
cp .env.example .env    # Edit .env with your DB credentials
npm install
node server.js          # Runs on http://localhost:5000
```

### 3. Start the frontend
```bash
cd frontend
npm install
npm run dev             # Opens at http://localhost:5173
```

## ✨ Features

- 📊 Live blood inventory dashboard with charts
- 🏥 Hospital blood request management
- 👥 Donor registry with eligibility tracking
- 🚨 Emergency crisis mode
- 🚁 AI drone dispatch simulation
- 🔔 Real-time donor notifications
- 🌍 3D globe animation

## 🔐 Demo Credentials

| Email | Password |
|-------|----------|
| rafiq@example.com | password |
| nusrat@example.com | password |
