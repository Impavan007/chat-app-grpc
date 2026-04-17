const {
    createUserStream,
    sendMessage,
} = require("../services/chat.service");

/**
 * Connect user to stream
 */
exports.connect = (req, res) => {
    const userId = req.query.user;

    if (!userId) {
        return res.status(400).json({ error: "User required" });
    }

    // Use Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const stream = createUserStream(userId, (msg) => {
        res.write(`data: ${JSON.stringify(msg)}\n\n`);
    });

    // Send heartbeat every 15 seconds to keep connection alive
    const heartbeat = setInterval(() => {
        res.write(": heartbeat\n\n");
    }, 15000);

    req.on("close", () => {
        console.log("Client disconnected:", userId);
        clearInterval(heartbeat);
        if (stream) {
            stream.end();
        }
    });
};

/**
 * Send message
 */
exports.send = (req, res) => {
    const { user, message } = req.body;

    try {
        sendMessage(user, message);
        res.json({ status: "sent" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};