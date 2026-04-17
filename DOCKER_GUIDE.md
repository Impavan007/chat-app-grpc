# Docker Architecture & Reverse Proxy Guide

This document explains how the **Nexus Chat App** is containerized and how the Nginx reverse proxy manages traffic between the frontend and backend.

## 1. System Architecture

The project is composed of 5 main services running in isolated Docker containers:

1.  **Nginx (Gateway)**: The entry point for all users.
2.  **Frontend**: Next.js application.
3.  **Backend**: Express.js API.
4.  **gRPC**: Real-time message handler.
5.  **MongoDB**: Database.

---

## 2. Port Configuration

To maintain a clean and single-port experience, the ports are mapped as follows:

| Service | Internal Port (Inside Docker) | External Port (Your Machine) | Role |
| :--- | :--- | :--- | :--- |
| **Nginx** | `80` | **`8080`** | **Primary Entry Point** |
| **Frontend** | `3000` | *Private* | Serves the UI |
| **Backend** | `5000` | *Private* | Serves the REST API |
| **gRPC** | `50051` | *Private* | Internal messaging |
| **MongoDB** | `27017` | *Private* | Data storage |

> [!IMPORTANT]
> Always access the application via **http://localhost:8080**. Port 80 is avoided because it is frequently occupied by other system services (like WSL Nginx or IIS).

---

## 3. How the Reverse Proxy Works

Nginx acts as a **Traffic Controller**. It listens on port `8080` and routes requests based on the URL path:

### Routing Rules (Defined in `nginx/nginx.conf`):

1.  **Frontend Traffic (`/`)**
    *   Any request starting with `/` (e.g., `http://localhost:8080/chat`) is passed to the **Frontend** container at `http://frontend:3000`.
2.  **API Traffic (`/api/`)**
    *   Any request starting with `/api/` (e.g., `http://localhost:8080/api/auth/login`) is passed to the **Backend** container at `http://backend:5000/api/`.
3.  **Real-time Traffic (SSE)**
    *   Connections to `/api/chat/connect` are passed to the backend with `proxy_buffering off` to allow for stable Server-Sent Events (SSE).

---

## 4. Request Lifecycle Examples

### Accessing the Website:
1.  Browser requests `http://localhost:8080`.
2.  Nginx receives the request on port `80` (mapped from `8080`).
3.  Nginx sees the path `/` and proxies it to `frontend:3000`.
4.  The Next.js app responds with the HTML.

### Logging In:
1.  Frontend uses a relative URL: `fetch("/api/auth/login")`.
2.  The browser automatically expands this to `http://localhost:8080/api/auth/login`.
3.  Nginx receives the request, sees the `/api/` prefix, and proxies it to `backend:5000`.
4.  Backend processes the request and returns the user data.

---

## 5. Development & Troubleshooting

### To start the application:
```bash
docker compose up -d --build
```

### To view logs:
```bash
docker compose logs -f
```

### Common Issue: Port 80
If you see a "502 Bad Gateway" or an unfamiliar page when visiting `localhost` (without :8080), it is because your host machine already has another server running on Port 80. Always use **Port 8080** to ensure you are talking to your Docker containers.

---

## 6. Service Dependencies
Docker Compose manages the startup order to ensure stability:
*   **Backend** waits for **MongoDB** and **gRPC**.
*   **Frontend** waits for **Backend**.
*   **Nginx** waits for **Frontend** and **Backend**.
