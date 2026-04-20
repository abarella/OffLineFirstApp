const { Router } = require("express");
const { registerToken } = require("../controllers/fcm.controller");

const router = Router();

router.post("/tokens", registerToken);

module.exports = router;
