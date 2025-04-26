#!/bin/bash
cd backend && source activate && python app.py > flask.log 2>&1 &
cd frontend && npm start > node.log 2>&1 &
wait
