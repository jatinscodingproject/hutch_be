const CallbackLog = require("../models/model.callback");
const axios = require("axios");

exports.storeCallback = async (req, res) => {
  try {
    console.log(req);
    const payload = req.body || {};
    console.log(payload);
    const eventDetails = payload.event_details || {};
    const msisdn = payload.number ? String(payload.number) : null;
    const chargeResult =
      typeof eventDetails.chargeResult === "boolean"
        ? eventDetails.chargeResult ? 1 : 0
        : null;

    await CallbackLog.create({
      msisdn: msisdn,
      event_id: payload.event_id ?? null,
      bundle_id: payload.bundle_id ?? null,
      charge_result: chargeResult,

      server_tx_id: eventDetails.server_tx_id ?? null,
      amount: eventDetails.amount ?? null,
      period: eventDetails.period ?? null,
      event_time: eventDetails.time ?? null,

      headers: req.headers,
      raw_input: JSON.stringify(payload),
      client_ip: req.headers["x-real-ip"] || req.ip,
    });

    if (String(payload.bundle_id) === "1305") {
      try {
        const postbackUrl = "http://lk-api.mycellx.com/postback";

        const postbackData = {
          msisdn: msisdn,
          bundle_id: payload.bundle_id,
          event_id: payload.event_id ?? null,
          server_tx_id: eventDetails.server_tx_id ?? null,
          amount: eventDetails.amount ?? null,
          period: eventDetails.period ?? null,
          charge_result: chargeResult,
          event_time: eventDetails.time ?? null,
        };

        console.log("Sending postback:", postbackData);

        const postbackResponse = await axios.post(
          postbackUrl,
          postbackData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log(
          "Postback response:",
          postbackResponse.status,
          postbackResponse.data
        );
      } catch (postbackError) {
        console.error(
          "Postback failed:",
          postbackError.response?.data || postbackError.message
        );
      }
    }

    return res.status(200).json({
      success: true,
      message: "Callback received",
    });
  } catch (error) {
    console.error("Callback store error:", error);

    return res.status(500).json({
      success: false,
      message: "Callback processing failed",
    });
  }
};
