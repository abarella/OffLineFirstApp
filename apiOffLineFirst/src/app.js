const express = require("express");
const cors = require("cors");
const equipmentRoutes = require("./routes/equipment.routes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "api-offline-first" });
});

app.use("/api/equipment", equipmentRoutes);

module.exports = app;
