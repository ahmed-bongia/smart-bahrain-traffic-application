const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN,
);

/**
 * Send an SMS message via Twilio.
 * @param {string} to   – Recipient phone number (E.164 format, e.g. +97312345678)
 * @param {string} body – Message body
 * @returns {Promise}   – Twilio message response
 */
const sendSMS = async (to, body) => {
  try {
    const message = await client.messages.create({
      body,
      from: process.env.TWILIO_PHONE_NUMBER,
      to,
    });
    console.log(`SMS sent to ${to} | SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`Twilio SMS error: ${error.message}`);
    throw error;
  }
};

module.exports = { client, sendSMS };
