const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("../aws/sesClient");

/**
 * Function to create a SendEmailCommand for AWS SES.
 * 
 * @param {string} toAddress - The recipient's email address.
 * @param {string} fromAddress - The sender's verified email address in AWS SES.
 * @param {string} otp - The OTP to send.
 * @returns {SendEmailCommand} - A command to send an email.
 */
const createSendEmailCommand = (toAddress, fromAddress, otp) => {
  return new SendEmailCommand({
    Destination: {
      ToAddresses: [toAddress],
    },
    Message: {
      Subject: {
        Charset: "UTF-8",
        Data: "Your OTP Code",
      },
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: `
            <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; border: 1px solid #ddd; border-radius: 10px; max-width: 400px; margin: auto;">
              <h2 style="color: #333;">Your OTP Code</h2>
              <p style="font-size: 18px; color: #555;">Use the following OTP to complete your verification:</p>
              <h1 style="font-size: 32px; color: #007BFF; margin: 10px 0;">${otp}</h1>
              <p style="font-size: 14px; color: #888;">This OTP is valid for 5 minutes.</p>
            </div>
          `,
        },
        Text: {
          Charset: "UTF-8",
          Data: `Your OTP code is: ${otp}. This OTP is valid for 5 minutes.`,
        },
      },
    },
    Source: fromAddress,
  });
};

// Function to execute the email send operation using AWS SES.
const run = async (toAddress, fromAddress, otp) => {
  const sendEmailCommand = createSendEmailCommand(toAddress, fromAddress, otp);

  try {
    const response = await sesClient.send(sendEmailCommand);
    console.log("Email sent successfully:", response);
    return response;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

module.exports = { run, createSendEmailCommand }; 