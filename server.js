const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

require('dotenv').config();
const { sequelize } = require("./models");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const attendanceRoutes = require("./routes/attendance.routes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/attendance", attendanceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Server running on port http://localhost:${PORT}`);

    try {
        await sequelize.authenticate();
        console.log("Database connected");
    } catch (error) {
        console.error("Database connection failed:", error);
    }
});
