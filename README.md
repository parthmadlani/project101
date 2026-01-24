# 🌱 Root2Rise - AI-Powered Learning Platform

<div align="center">

![Root2Rise Logo](frontend/src/assets/logo.png)

**Bridging the gap between traditional education and modern industry demands.**

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js_18-339933?logo=node.js)](https://nodejs.org/)
[![Status](https://img.shields.io/badge/Status-Production_Ready-success)]()
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[Live Demo](#) • [Features](#features) • [Installation](#installation) • [Documentation](docs/)

</div>

---

## 📖 Overview

**Root2Rise** is a next-generation Learning Management System (LMS) designed to empower learners in specialized sectors like **Healthcare**, **Agriculture**, and **Urban Planning**.

Unlike generic video platforms, Root2Rise offers a focused, gamified, and persistent learning experience. It features AI-driven recommendations, interactive quizzes, verified certification, and analytical dashboards to track student progress.

## ✨ Key Features

### 🎓 **Smart Learning Engine**
- **Sector-Specific Curricula**: Tailored tracks for Healthcare AI, Smart Agriculture, and Urban Tech.
- **Dynamic Content**: Integrated with YouTube API for high-quality, curated educational videos.
- **Persistent Progress**: Resume exactly where you left off, across devices.

### 🏆 **Gamification & Certificates**
- **Interactive Quizzes**: Test knowledge after every module.
- **Instant Certification**: Automatically generate and download PDF certificates upon course completion.
- **LinkedIn Integration**: One-click sharing of credentials to professional profiles.

### 📊 **Student Analytics**
- **Live Dashboard**: Track study streaks, active learning hours, and completion rates.
- **Visual Charts**: Monthly and weekly activity graphs.
- **Self-Healing Data**: Intelligent syncing ensures offline progress is never lost.

---

## 🛠 Tech Stack

### **Frontend**
- **Framework**: React.js (v18)
- **Styling**: TailwindCSS & Framer Motion (Animations)
- **Charts**: Chart.js
- **PDF Generation**: html2canvas + jsPDF

### **Backend**
- **Runtime**: Node.js & Express.js
- **Database**: SQLite (Production-grade persistent storage)
- **Auth**: Custom JWT Authentication & Google OAuth Support
- **API Standard**: RESTful Architecture

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/parthmadlani/Root-Sniffers.git
    cd Root-Sniffers
    ```

2.  **Install Dependencies**
    ```bash
    # Install Backend
    cd backend
    npm install

    # Install Frontend
    cd ../frontend
    npm install
    ```

3.  **Start the Application**
    You can run the full stack using the provided script:
    ```bash
    # From the root directory
    ./start_project.sh
    ```
    
    *Or run them individually:*
    *   Backend: `npm start` (Port 8080)
    *   Frontend: `npm start` (Port 3000)

4.  **Visit the App**
    Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

---

## 📂 Project Structure

```
root2rise/
├── backend/                 # Node.js API Server
│   ├── src/
│   │   ├── algorithms.js    # AI Recommendation Logic
│   │   ├── index.js         # Main Server Entry
│   │   └── ...
│   └── database.sqlite      # Persistent Data Store
│
├── frontend/                # React Client
│   ├── src/
│   │   ├── components/      # Reusable UI Components
│   │   ├── pages/           # Main Views
│   │   └── utils/           # API & Logic Helpers
│   └── ...
│
└── docs/                    # Development Documentation & Logs
```

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](docs/CONTRIBUTING.md) inside the `docs/` folder for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <sub>Built with ❤️ by the Root2Rise Team.</sub>
</div>
