# Technical Specification: gRPC Chat System Architecture

## 1. Overview
The application uses a microservices architecture where real-time chat functionality is handled by a dedicated **gRPC Server**. The system facilitates bidirectional streaming communication between a Node.js Express backend and a standalone Node.js gRPC service.

## 2. Project Structure
```text
chat-app/
├── backend/                # Express Backend
│   ├── proto/
│   │   └── chat.proto      # Protocol Buffers definition
│   ├── src/
│   │   ├── services/
│   │   │   └── chat.service.js # Business logic for gRPC streams
│   │   └── app.js
│   ├── grpcClient.js       # gRPC client initialization
│   ├── server.js           # Entry point
│   └── Dockerfile
├── grpc/                   # Dedicated gRPC Service
│   ├── proto/
│   │   └── chat.proto      # Shared proto definition
│   ├── grpcServer.js       # gRPC server implementation
│   ├── package.json
│   └── Dockerfile
├── chat-frontend/          # Next.js Frontend
├── nginx/                  # Reverse Proxy
└── docker-compose.yml       # Service Orchestration
```

## 3. Protobuf Definition (`chat.proto`)
The communication contract is defined using Protocol Buffers.
- **Service**: `ChatService`
- **Method**: `ChatStream` (Bidirectional Stream)
- **Message**: `ChatMessage` containing `user` (string), `message` (string), and `timestamp` (int64).
```proto
syntax = "proto3";

package chat;

message ChatMessage {
  string user = 1;
  string message = 2;
  int64 timestamp = 3;
}

service ChatService {
  rpc ChatStream(stream ChatMessage) returns (stream ChatMessage);
}
```

## 4. gRPC Server Implementation (`grpcServer.js`)
The gRPC server acts as a message broker/broadcaster:
- **State Management**: It maintains an `activeStreams` Set to track all connected clients.
- **Broadcast Logic**: When any connected stream sends a `ChatMessage`, the server catches the `data` event and iterates through all `activeStreams` to broadcast the message to every connected client.
- **Cleanup**: It handles `end` and `error` events to remove disconnected streams from the set.
- **Binding**: It binds to `0.0.0.0:50051`.

## 5. Backend Integration (Client-side)
The Express backend acts as a gRPC client to interface with the frontend.
- **`grpcClient.js`**: Initializes a persistent `ChatService` client pointing to the gRPC service URL (provided via environment variables).
- **`chat.service.js`**:
    - **Stream Management**: Maps local users to their respective gRPC stream instances using a `Map`.
    - **Inbound Data**: Listens for the `data` event from the gRPC stream and executes a callback to notify the frontend.
    - **Outbound Data**: Provides a `sendMessage` function that writes directly to the user's gRPC stream, which is then broadcast by the gRPC server to all other users.

## 6. Deployment and Orchestration
The services are containerized and orchestrated via **Docker Compose**:
- **Service Name**: The gRPC server is defined as the `grpc` service.
- **Networking**: The backend connects to the gRPC server using the internal Docker DNS name `grpc:50051`.
- **Environment Variables**: The `GRPC_URL` is configured in the backend container to point to the `grpc` service.

## 7. Message Flow Diagram
1. **User Action**: User A sends a message from the Frontend to the Backend (via REST/SSE).
2. **Backend Action**: `chat.service.js` calls `sendMessage`, writing the message to User A's **gRPC Stream Instance**.
3. **gRPC Server Action**: The server receives the message on User A's stream and immediately writes it to **all** streams in its `activeStreams` pool.
4. **Broadcast Action**: User B's stream (and User A's) receives the `data` event. The backend triggers the callback for User B, delivering the message to their browser.
