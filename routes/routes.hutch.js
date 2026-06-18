const express = require("express");

const {
    sendOtp,
    verifyOtp,
    status,
    unsubscribe,
    redirectToReactYumzzy,
    redirectToReactLearn
} = require("../controllers/hutchControllers");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/status", status);
router.post("/unsubscribe", unsubscribe);
router.post("/redirect-yumzzy", redirectToReactYumzzy);
router.post("/redirect-eduwav", redirectToReactLearn);

router.get("/detect-user", async (req, res) => {
  try {
    const msisdn =
      req.headers["msisdn"] ||
      req.headers["x-msisdn"] ||
      req.headers["subscriberid"] ||
      req.headers["x-subscriber-id"];

    const forwardedFor = req.headers["x-forwarded-for"];
    const userAgent = req.headers["user-agent"];
    

    if (msisdn) {
      req.session.msisdn = msisdn;

      return res.json({
        success: true,
        detected: true,
        msisdn,
        userAgent,
        forwardedFor,
      });
    }

    return res.json({
      success: true,
      detected: false,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Detection failed",
    });
  }
});


module.exports = router;