const express = require("express");
const { storeCallback } = require("../controllers/Callback");

const router = express.Router();

router.post("/notify-callback", storeCallback);

module.exports = router;