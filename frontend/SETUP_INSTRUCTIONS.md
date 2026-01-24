# Setup Instructions - Root2Rise Landing Page

## Prerequisites

You need to install **Node.js** (which includes npm) to run this React application.

### Install Node.js

1. **Download Node.js:**
   - Visit: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version for Windows
   - Choose the `.msi` installer

2. **Install Node.js:**
   - Run the installer
   - Follow the installation wizard
   - Make sure to check "Add to PATH" option during installation
   - Restart your terminal/command prompt after installation

3. **Verify Installation:**
   ```bash
   node --version
   npm --version
   ```

## Running the Project

Once Node.js is installed, follow these steps:

1. **Navigate to the project directory:**
   ```bash
   cd C:\Users\Vivobook\Desktop\Root2Rise
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open in browser:**
   - The app will automatically open at: **http://localhost:3000**
   - If it doesn't open automatically, navigate to that URL in your browser

## Troubleshooting

- **If `npm` is not recognized:** Restart your terminal after installing Node.js
- **If port 3000 is in use:** React will automatically use the next available port (3001, 3002, etc.)
- **Installation issues:** Make sure you have administrator privileges

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
