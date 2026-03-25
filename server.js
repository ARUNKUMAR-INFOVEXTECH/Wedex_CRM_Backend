require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// ---- Phase 1–4 Routes ----
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const staffRoutes = require("./routes/StaffRoutes");
const packageRoutes = require("./routes/Packageroutes");
const subscriptionRoutes = require("./routes/Subscriptionroutes");

// ---- Phase 5 Routes (CRM) ----
const customerRoutes = require("./routes/customerRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const calendarRoutes = require("./routes/CalendarRoutes");
const dashboardRoutes = require("./routes/dashboardRotues");

const app = express();



app.use(cors({

  origin: [

    "http://localhost:3000",

    "https://wedexmarriagehallcrm.netlify.app"  // your netlify URL

  ],

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  allowedHeaders: ["Content-Type", "Authorization"],

}));
app.use(express.json());
app.use(helmet());
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/* ---- Phase 1–4 ---- */
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/staff", staffRoutes);
app.use("/packages", packageRoutes);
app.use("/subscriptions", subscriptionRoutes);

/* ---- Phase 5: CRM ---- */
app.use("/dashboard", dashboardRoutes);
app.use("/customers", customerRoutes);
app.use("/bookings", bookingRoutes);
app.use("/payments", paymentRoutes);
app.use("/vendors", vendorRoutes);
app.use("/calendar", calendarRoutes);

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
