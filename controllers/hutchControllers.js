const axios = require("axios");
const jwt = require("jsonwebtoken");
const { getToken } = require("../utils/hutchservice");

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

    // console.log('otp response' , response)

    const jwtToken = jwt.sign(
      {
        msisdn: number,
        bundle_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.json({
      success: true,
      token: jwtToken,
      subscription: response.data,
    });
  } catch (e) {
    console.log(e.response?.data || e);

    return res.status(500).json(
      e.response?.data || {
        message: "OTP verification failed",
      }
    );
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

exports.redirectToReactYumzzy = async (req, res) => {
  try {
     console.log("Session:", req.session);

    const bundle_id = req.query.bundle_id || "";

    const jwtToken = jwt.sign(
      {
        bundle_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.redirect(
      `http://sl.yumzyy.com/auth/callback?token=${encodeURIComponent(jwtToken)}`
    );
  } catch (error) {
    console.error("Redirect Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to redirect user",
    });
  }
};

exports.redirectToReactLearn = async (req, res) => {
  try {
    console.log("Session:", req.session);

    const bundle_id = req.query.bundle_id || "";

    const jwtToken = jwt.sign(
      {
        bundle_id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    return res.redirect(
      `http://sl.eduwav.com/auth/callback?token=${encodeURIComponent(jwtToken)}`
    );
  } catch (error) {
    console.error("Redirect Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to redirect user",
    });
  }
};