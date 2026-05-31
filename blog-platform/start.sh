#!/bin/bash
echo "========================================"
echo "  Inkwell Blog Platform"
echo "========================================"
echo ""

echo "[1/2] Starting Backend API on port 5000..."
cd backend && node server.js &
BACKEND_PID=$!
cd ..

sleep 2

echo "[2/2] Starting Frontend on port 3000..."
cd frontend && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Servers running:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   Admin:    admin@blog.com / admin123"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
