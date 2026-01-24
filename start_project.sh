#!/bin/bash
echo "Starting Backend on port 8080..."
cd backend && node src/index.js &
BACKEND_PID=$!

echo "Starting Frontend on port 3000..."
cd frontend && npm start &
FRONTEND_PID=$!

echo "Both services started. Press Ctrl+C to stop."
trap "kill $BACKEND_PID $FRONTEND_PID" EXIT

wait
