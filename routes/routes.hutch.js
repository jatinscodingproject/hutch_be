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

      if (msisdn) {
        req.session.msisdn = msisdn;

        console.log("Before save:", req.session);

        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
          }

          console.log("After save:", req.session);

          return res.json({
            success: true,
            detected: true,
            msisdn,
          });
        });

        return;
      }

      return res.json({
        success: true,
        detected: false,
      });
    } catch (error) {
      console.error(error);
    }
  });


module.exports = router;