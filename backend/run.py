import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",   # Bind only to localhost — change to 0.0.0.0 only in containerized production
        port=8000,
        reload=True,         # Disable reload=True in production; use a process manager (gunicorn, systemd)
        log_level="info"
    )
