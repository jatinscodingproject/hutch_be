const axios = require("axios");
const jwt = require("jsonwebtoken");
const { getToken } = require("../utils/hutchservice");
const { Op } = require("sequelize");
const CallbackLog = require("../models/model.callback");

const baseUrl = process.env.HUTCH_BASE_URL;

exports.sendOtp = async (req, res) => {
  try {
    const { number, bundle_id } = req.body;

    const token = await getToken();

    const response = await axios.post(
      `${baseUrl}/api/send-otp`,
      {
        number,
        bundle_id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );
    // console.log('send otp response' , response)
    return res.json(response.data);
  } catch (e) {
    console.log(e.response?.data || e);
    return res.status(500).json(e.response?.data || e.message);
  }
};

// exports.verifyOtp = async (req, res) => {
//   try {
//     const { number, bundle_id, otp } = req.body;

//     const token = await getToken();

//     const response = await axios.post(
//       `${baseUrl}/api/register-with-otp`,
//       {
//         number,
//         bundle_id,
//         otp,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           Accept: "application/json",
//         },
//       }
//     );

//     // console.log('otp response' , response)

//     const jwtToken = jwt.sign(
//       {
//         msisdn: number,
//         bundle_id,
//       },
//       process.env.JWT_SECRET,
//       {
//         expiresIn: "24h",
//       }
//     );

//     return res.json({
//       success: true,
//       token: jwtToken,
//       subscription: response.data,
//     });
//   } catch (e) {
//     console.log(e.response?.data || e);

//     return res.status(500).json(
//       e.response?.data || {
//         message: "OTP verification failed",
//       }
//     );
//   }
// };



exports.verifyOtp = async (req, res) => {
  try {
    const { number, bundle_id, otp } = req.body;

    const token = await getToken();

    const response = await axios.post(
      `${baseUrl}/api/register-with-otp`,
      {
        number,
        bundle_id,
        otp,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      }
    );

    // Save MSISDN in session
    req.session.msisdn = number;

    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Wait for Hutch callback (up to 10 seconds)
    let callback = null;

    for (let i = 0; i < 5; i++) {
      callback = await CallbackLog.findOne({
        where: {
          msisdn: number,
          bundle_id: Number(bundle_id),
          event_id: {
            [Op.in]: [1, 3],
          },
          createdAt: {
            [Op.between]: [startOfDay, endOfDay],
          },
        },
        order: [["createdAt", "DESC"]],
      });

      if (callback) break;

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    let portalUrl = "http://sl.eduwav.com";

    if (Number(bundle_id) === 1235) {
      portalUrl = "http://sl.yumzyy.com";
    }

    if (!callback) {
      return res.json({
        success: false,
        redirectUrl: `${portalUrl}/auth/callback?status=failed&message=${encodeURIComponent(
          "Insufficient balance. Subscription could not be activated."
        )}`,
      });
    }

    const jwtToken = jwt.sign(
      {
        msisdn: number,
        bundle_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.json({
      success: true,
      redirectUrl: `${portalUrl}/auth/callback?status=success&token=${encodeURIComponent(
        jwtToken
      )}`,
      token: jwtToken,
      msisdn: number,
      subscription: response.data,
    });
  } catch (e) {
    console.error(e.response?.data || e);

    const bundleId = Number(req.body.bundle_id);

    let portalUrl = "http://sl.eduwav.com";

    if (bundleId === 1235) {
      portalUrl = "http://sl.yumzyy.com";
    }

    return res.status(500).json({
      success: false,
      redirectUrl: `${portalUrl}/auth/callback?status=failed&message=${encodeURIComponent(
        e.response?.data?.message || "OTP verification failed."
      )}`,
      message: e.response?.data?.message || "OTP verification failed.",
    });
  }
};

exports.status = async (req, res) => {

    try {
        
        const {
            number,
            bundle_id
        } = req.body;

        const token = await getToken();

        const response = await axios.post(
            `${baseUrl}/api/subscriptions/status`,
            {
                number,
                bundle_id
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                    "Content-Type":
                        "application/json"
                }
            }
        );

        // console.log('status resposne' , response)

        res.json(response.data);

    } catch (e) {
        res.status(500).json(e.response?.data || e.message);
    }
};

exports.unsubscribe = async (req, res) => {
  try {
    const number =
      req.headers["msisdn"] ||
      req.headers["x-msisdn"] ||
      req.headers["subscriberid"] ||
      req.headers["x-subscriber-id"] ||
      req.body.number;

    const { bundle_id } = req.body;

    if (!number) {
      return res.status(400).json({
        success: false,
        message: "MSISDN not found",
      });
    }

    if (!bundle_id) {
      return res.status(400).json({
        success: false,
        message: "bundle_id is required",
      });
    }

    const token = await getToken();

    const response = await axios.post(
      `${baseUrl}/api/deregister`,
      {
        number,
        bundle_id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    );

    return res.json(response.data);
  } catch (e) {
    console.error("Unsubscribe Error:", e.response?.data || e.message);

    return res.status(500).json(
      e.response?.data || {
        success: false,
        message: e.message,
      }
    );
  }
};



const redirectToPortal = async (req, res, portalUrl, expectedBundleId) => {
  try {
    const bundle_id = req.query.bundle_id || expectedBundleId;
    const msisdn =
      req.headers["msisdn"] ||
      req.headers["x-msisdn"] ||
      req.headers["subscriberid"] ||
      req.headers["x-subscriber-id"] ||
      req.session?.msisdn;

    if (!msisdn) {
      return res.redirect(
        `${portalUrl}/auth/callback?status=failed&message=${encodeURIComponent(
          "MSISDN not found."
        )}`
      );
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const callback = await CallbackLog.findOne({
      where: {
        msisdn,
        bundle_id: expectedBundleId,
        event_id: {
          [Op.in]: [1, 3],
        },
        createdAt: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
      order: [["createdAt", "DESC"]],
    });

    // No successful callback today -> redirect with error
    if (!callback) {
      return res.redirect(
        `${portalUrl}/auth/callback?status=failed&message=${encodeURIComponent(
          "Insufficient balance. Subscription could not be activated."
        )}`
      );
    }

    // Successful callback -> generate JWT
    const jwtToken = jwt.sign(
      {
        msisdn,
        bundle_id: expectedBundleId,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    return res.redirect(
      `${portalUrl}/auth/callback?status=success&token=${encodeURIComponent(
        jwtToken
      )}`
    );
  } catch (error) {
    console.error("Redirect Error:", error);

    return res.redirect(
      `${portalUrl}/auth/callback?status=failed&message=${encodeURIComponent(
        "Something went wrong. Please try again."
      )}`
    );
  }
};

// EduWav
exports.redirectToReactLearn = async (req, res) => {
  console.log(req)
  return redirectToPortal(
    req,
    res,
    "http://sl.eduwav.com",
    1237
  );
};

// Yumzzy
exports.redirectToReactYumzzy = async (req, res) => {
  console.log(">>>>>>>>>>>>>>>>>>.", req)
  return redirectToPortal(
    req,
    res,
    "http://sl.yumzyy.com",
    1235
  );
};