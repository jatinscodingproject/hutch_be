const express = require("express");
const axios = require("axios");

const {
    sendOtp,
    verifyOtp,
    status,
    unsubscribe,
    redirectToReactYumzzy,
    redirectToReactLearn,
    redirectToReactRadio,
    getHutchToken
} = require("../controllers/hutchControllers");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/status", status);
router.post("/unsubscribe", unsubscribe);
router.post("/redirect-yumzzy", redirectToReactYumzzy);
router.post("/redirect-eduwav", redirectToReactLearn);
router.post("/redirect-radiofyy", redirectToReactRadio);

router.get("/detect-user", async (req, res) => {
  try {
    const msisdn =
      req.headers["msisdn"] ||
      req.headers["x-msisdn"] ||
      req.headers["subscriberid"] ||
      req.headers["x-subscriber-id"];

    const origin = req.query.origin;

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.ip;

    const userAgent = req.headers["user-agent"];

    const subid = req.query.ext_ref;

    if (msisdn) {
      req.session.msisdn = msisdn;

      req.session.save(async (err) => {
        if (err) {
          console.error("Session save error:", err);
        }

        try {
          const response = await axios.post(
            "https://arenaxpro.com/api/new/bmd/services/customer/store-customer",
            {
              phone_number: msisdn,
              real_ip: clientIp,
              subid: subid,
              user_agent: userAgent,
              origin: origin
            }
          );

          console.log("Customer API Response:", response.data);
        } catch (error) {
          console.error(
            "Customer API Error:",
            error.response?.data || error.message
          );
        }

        return res.json({
          success: true,
          detected: true,
          msisdn,
          clientIp,
          subid,
          userAgent,
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
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get("/hutch-token", getHutchToken);

module.exports = router;