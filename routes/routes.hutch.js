const express = require("express");
const axios = require("axios");

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

  // router.get("/detect-user", async (req, res) => {
  //   try {
  //     const msisdn =
  //       req.headers["msisdn"] ||
  //       req.headers["x-msisdn"] ||
  //       req.headers["subscriberid"] ||
  //       req.headers["x-subscriber-id"];

  //     if (msisdn) {
  //       req.session.msisdn = msisdn;

  //       console.log("Before save:", req.session);

  //       req.session.save((err) => {
  //         if (err) {
  //           console.error("Session save error:", err);
  //         }

  //         console.log("After save:", req.session);

  //         return res.json({
  //           success: true,
  //           detected: true,
  //           msisdn,
  //         });
  //       });

  //       return;
  //     }

  //     return res.json({
  //       success: true,
  //       detected: false,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //   }
  // });

  router.get("/detect-user", async (req, res) => {
  try {
    const msisdn =
      req.headers["msisdn"] ||
      req.headers["x-msisdn"] ||
      req.headers["subscriberid"] ||
      req.headers["x-subscriber-id"];

    const clientIp =
      req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
      req.headers["x-real-ip"] ||
      req.ip;

    const userAgent = req.headers["user-agent"];

    // Read sub_id from query string
    const subid = req.query.sub_id || req.query.subid || null;

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

module.exports = router;