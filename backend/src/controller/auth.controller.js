const User = require("../models/user.model");
const { hashPassword, comparePassword } = require("../utils/hash");

exports.register = async (req, res) => {
    try {
        const { username, password } = req.body;

        const existing = await User.findOne({ username });
        if (existing) {
            return res.status(400).json({ error: "User already exists" });
        }

        const hashed = await hashPassword(password);

        const user = await User.create({
            username,
            password: hashed,
        });

        res.json({ message: "User registered", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const valid = await comparePassword(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        res.json({ message: "Login successful", user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};