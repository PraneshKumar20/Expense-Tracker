const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();

const mongoose = require("mongoose");
const connectDB = require("./config/db.js");
const expenseRoutes = require("./routes/expenseRoutes.js");
const authRoutes = require("./routes/authRoutes.js");

const app = express();

connectDB();

app.use(cors());
app.use(express.json());

// If MongoDB is not connected, respond promptly rather than letting Mongoose queries buffer and time out
app.use("/api", (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: "Database connection not available. Operating in offline fallback mode.",
            offline: true
        });
    }
    next();
});

app.use("/api/expenses", expenseRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
