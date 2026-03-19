require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/StaffRoutes");
const packageRoutes = require("./routes/Packageroutes");
const subscriptionRoutes = require("./routes/Subscriptionroutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());

/* ---- Routes ---- */
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/staff", staffRoutes);
app.use("/packages", packageRoutes);
app.use("/subscriptions", subscriptionRoutes);

/* ---- Health check ---- */
app.get("/health", (req, res) => {
  res.json({ status: "HallFlow backend is running", timestamp: new Date() });
});

/* ---- Global error handler ---- */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Unexpected server error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`HallFlow server running on port ${PORT}`);
});