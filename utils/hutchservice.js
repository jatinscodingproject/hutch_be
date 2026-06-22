const axios = require("axios");

let accessToken = null;
let expiresAt = null;

async function getToken() {

    if (
        accessToken &&
        expiresAt &&
        Date.now() < expiresAt
    ) {
        return accessToken;
    }

    const response = await axios.post(
        `${process.env.HUTCH_BASE_URL}/oauth/token`,
        {
            grant_type: "password",
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            username: "support@boldmediadigital.com",
            password: process.env.PASSWORD,
            scope: ""
        },
        {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            }
        }
    );

    accessToken = response.data.access_token;
    expiresAt =
        Date.now() +
        (response.data.expires_in - 60) * 1000;

    return accessToken;
}

module.exports = {
    getToken
};