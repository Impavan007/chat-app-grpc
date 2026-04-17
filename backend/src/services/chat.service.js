const client = require("../../grpcClient");

// Store active streams
const userStreams = new Map();

/**
 * Create or get stream for user
 */
function createUserStream(userId, onMessage) {
    // If a stream exists, remove old listeners to avoid memory leaks and stale responses
    if (userStreams.has(userId)) {
        const oldStream = userStreams.get(userId);
        oldStream.removeAllListeners("data");
        oldStream.on("data", onMessage);
        return oldStream;
    }

    const stream = client.ChatStream();

    stream.on("data", (msg) => {
        onMessage(msg);
    });

    stream.on("error", (err) => {
        console.error("gRPC stream error:", err);
        userStreams.delete(userId);
    });

    stream.on("end", () => {
        console.log("Stream ended");
        userStreams.delete(userId);
    });

    userStreams.set(userId, stream);

    return stream;
}

/**
 * Send message
 */
function sendMessage(userId, message) {
    const stream = userStreams.get(userId);

    if (!stream) {
        throw new Error("Stream not initialized");
    }

    stream.write({
        user: userId,
        message,
        timestamp: Date.now(),
    });
}

module.exports = {
    createUserStream,
    sendMessage,
};