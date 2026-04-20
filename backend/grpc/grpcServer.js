const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const path = require("path");

const PROTO_PATH = path.join(__dirname, "./proto/chat.proto");

const packageDef = protoLoader.loadSync(PROTO_PATH);
const grpcObject = grpc.loadPackageDefinition(packageDef);
const chatPackage = grpcObject.chat;

const activeStreams = new Set();

function chatStream(call) {
    console.log("New gRPC stream connection established");
    activeStreams.add(call);

    call.on("data", (message) => {
        console.log(`gRPC: Received message from ${message.user}: ${message.message}`);
        // Broadcast to all active streams
        activeStreams.forEach((stream) => {
            if (stream.writable) {
                stream.write(message);
            }
        });
    });

    call.on("end", () => {
        console.log("gRPC: Stream connection ended");
        activeStreams.delete(call);
        call.end();
    });

    call.on("error", (err) => {
        console.error("gRPC Server Error:", err);
        activeStreams.delete(call);
    });
}

function startGrpcServer() {
    const server = new grpc.Server();
    server.addService(chatPackage.ChatService.service, {
        ChatStream: chatStream,
    });

    const url = process.env.GRPC_URL || "0.0.0.0:50051";
    server.bindAsync(url, grpc.ServerCredentials.createInsecure(), (error, port) => {
        if (error) {
            console.error(`Failed to bind gRPC server: ${error.message}`);
            return;
        }
        console.log(`gRPC Server running on port ${port}`);
    });
}

module.exports = startGrpcServer;

if (require.main === module) {
    startGrpcServer();
}
