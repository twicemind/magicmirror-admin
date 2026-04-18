#!/bin/bash
#
# Development helper script
# Starts backend and frontend in development mode
#

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}Starting MagicMirror Admin (Development Mode)${NC}"

# Start backend
echo -e "${BLUE}Starting backend...${NC}"
cd backend
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt > /dev/null
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a bit for backend to start
sleep 2

# Start frontend
echo -e "${BLUE}Starting frontend...${NC}"
cd frontend
npm install > /dev/null
npm start &
FRONTEND_PID=$!
cd ..

echo
echo -e "${GREEN}Development servers started!${NC}"
echo
echo "Backend:  http://localhost:8000/api/admin/docs"
echo "Frontend: http://localhost:3000/admin"
echo
echo "Press Ctrl+C to stop all servers"
echo

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo; echo 'Stopped'; exit" INT
wait
