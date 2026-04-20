const express = require("express");
const cors = require("cors");
const equipmentRoutes = require("./routes/equipment.routes");
const fcmRoutes = require("./routes/fcm.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-offline-first" });
});

app.use("/api/equipment", equipmentRoutes);
app.use("/api/fcm", fcmRoutes);

module.exports = app;
