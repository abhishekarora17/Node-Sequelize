const {user} = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

require("dotenv").config();

exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        const existingUser = await user.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = await user.create({ name, email, password });

        const token = await createToken(newUser);
        if (!token) {
            return res.status(500).json({ message: "Failed to create token" });
        }

        return res.status(201).json({ message: "User registered successfully", user: newUser, token: token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await user.findOne({ where: { email } });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ id: existingUser.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

exports.logout = async (req, res) => {
    try {
        let { id } = req.body;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        const userRecord = await user.findOne({ where: { id } });
        if (!userRecord) {
            return res.status(404).json({ message: "User not found" });
        }
        // Clear the access and refresh tokens in the database
        await user.update({ accessToken: null, refreshToken: null }, { where: { id } });
        return res.status(200).json({ message: "Logout successful" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}

const createToken = async ( req ) => {
    const { id } = req.body;
    const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRATION });
    const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRATION });
    const token = await user.update({ accessToken, refreshToken }, { where: { id } });
    if (!token) {
        return null;
    }
    return { accessToken, refreshToken };
}