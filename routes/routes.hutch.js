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
    console.log(req.headers);

    const msisdn =
      req.headers["msisdn"] ||
      req.headers["x-msisdn"] ||
      req.headers["subscriberid"] ||
      req.headers["x-subscriber-id"];

    console.log("msisdn:", msisdn);

    const origin = req.query.origin || req.headers.origin;

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
          const apiUrl =
            origin === "sl.radiofyy.com" ||
            origin === "https://sl.radiofyy.com" || origin === "http://sl.radiofyy.com"
              ? "https://arenaxpro.com/bm/radiofyy/servies"
              : "https://arenaxpro.com/api/new/bmd/services/customer/store-customer";

          const response = await axios.post(apiUrl, {
            phone_number: msisdn,
            real_ip: clientIp,
            subid: subid,
            user_agent: userAgent,
            origin: origin,
          });

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
          origin,
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

// router.get("/hutch-token", getHutchToken); Hello hello hwaio, I'm good ya man, I am also good let's join the everybody so that we can start hello start in the period by so on the Whatsapp as well, so it has click and the instructions to set up the data on this on this or right to you know at the company here supports in competition from just these two games or there are other games as well. Supporting these tour games and going forward to say something we have to pay for these games before we go live, then we'll be paying and all that's what we start on this member to talk about so if you see somebody waiting please accept this name sure you very well see all to I'm not sure it's clearly all lady's game for centers by the way so don't worry a century you have to go ahead and create to provide you will have to go ahead and create your sales in the analysis we don't make any payment for you to have the game before you do a new age to create a player tag for yourself so I guess Raman has just uploaded you know a document can well step by step instruction how to go ahead and clear a player tag for yourself so can you just follow a document as well is you know you have to click from your profile you're sharing unable to see your screen I'm just into as if there is a road and guy down with your penser I think I need time to sit a relaxing graphic to everything on where you would do can you open the game you are supposed to your game a third right there's a hamburger icon on the right hand side this is no account so after eat so now what we have dismated any challenge in the e sports right now you require sexual next one is a pair tag and one is the now you have both this information with you so from you already participating any challenge to get into any challenge or access any sports you have to disperse initiate your subscription flow so this is where you know start you know by logging on to this so you have a valid subscription now and you can you know play any casual games that are there on the stage on any instead porter so you know this is the e sports portal every day you will have daily and vk challenges that are there for the news to you know join and you know get on the leader is already there's already a slight challenges you click on one of those click on any of those we actually registered for flash planner flash the group so you can you know view challenge yeah so here you have to you know populate the player tag at the item this is you know populate that information can also put tenth of data yes so you know the setup is ready so you know your clear tag in API key is accepted now what you have to do is logger log back to the game and as a gamer so every thirty minutes whatever score or you know targets that you achieve you know after thirty minutes the same would be populated onto the leader world in the schools quarter so there are various types of challenges that we have set you know some urban set up but what was this challenge can you check the challenge pin points you will then you will be putting so you should recommend the airport you can see more joint value only three members joint so now you are acting in last right so now you have to finance to play the game up to play the game and say how you win the game you will you know would be possible to have a fishing where like two people competing on digital like in the cash show for example that is a tournowing format is in it is open to everyone so you can have join the same challenge you know the target is to make it as possible it's not what we were not to do or three states your tag is there information is there that we have disc captured in the photo you go ahead with the game and you know the API that you have provided you would be able to you know fetch discourse from the publisher and accordingly based on the normal of things that you have or the type of charges you your position is dispare of the law so like this channel right you you actually suppose I join a share so whoever is part of you know our community to the users a change this is all we highlighted this is pretty much you know from you know creating your player that you serve to immediate token and you know going through your substruction flow and after thirty minutes so this is the east more challenges that you've done so if you go back to the platform itself you go to the menu go up where the motor just go to

module.exports = router;