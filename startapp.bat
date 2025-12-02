@echo off
echo Starting Q&A App Server...
echo Opening browser...
start http://localhost:8000
echo Server is running at http://localhost:8000
echo Press Ctrl+C to stop the server.
python -m http.server 8000
pause