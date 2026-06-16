const express = require("express");
const { storeCallback } = require("../controllers/Callback");

const router = express.Router();

router.post("/hutch/notify", storeCallback);

module.exports = router;