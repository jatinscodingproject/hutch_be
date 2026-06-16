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

        res.json(response.data);

    } catch (e) {
        res.status(500).json(e.response?.data || e.message);
    }
};

exports.unsubscribe = async (req, res) => {

    try {

        const {
            number,
            bundle_id
        } = req.body;

        const token = await getToken();

        const response = await axios.post(
            `${baseUrl}/api/deregister`,
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

        res.json(response.data);

    } catch (e) {
        res.status(500).json(e.response?.data || e.message);
    }
};