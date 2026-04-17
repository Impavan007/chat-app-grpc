const express = require("express");
const router = express.Router();

const {
    connect,
    send,
} = require("../controller/chat.controller");

router.get("/connect", connect);
router.post("/send", send);

module.exports = router;