#!/bin/bash
cd ~/Desktop/mission-control
nohup npx next dev -p 3001 --hostname 0.0.0.0 > /tmp/mc.log 2>&1 &
echo "Mission Control started (PID $!) at http://localhost:3001"
