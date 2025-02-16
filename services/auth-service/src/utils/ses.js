// Import the required AWS SES modules
const { SendEmailCommand } = require("@aws-sdk/client-ses");
const { sesClient } = require("../aws/sesClient");

/**
 * Function to create a SendEmailCommand for AWS SES.
 * 
 * @param {string} toAddress - The recipient's email address.
 * @param {string} fromAddress - The sender's verified email address in AWS SES.
 * @returns {SendEmailCommand} - A command to send an email.
 */
const createSendEmailCommand = (toAddress, fromAddress) => {
  return new SendEmailCommand({
    Destination: {
      /* Add CC email addresses here if needed */
      CcAddresses: [
        // "cc-recipient@example.com",
      ],
      /* Add one or more To email addresses */
      ToAddresses: [
        toAddress, // The primary recipient
        // "another-recipient@example.com", // Add more recipients if needed
      ],
    },
    Message: {
      /* The body of the email */
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: "<h1>Hello, this is an HTML email!</h1><p>Custom HTML body goes here.</p>",
        },
        Text: {
          Charset: "UTF-8",
          Data: "Hello, this is a plain text email! Custom text body goes here.",
        },
      },
      /* The subject of the email */
      Subject: {
        Charset: "UTF-8",
        Data: "Your Email Subject Here",
      },
    },
    /* The sender's email address (must be verified in AWS SES) */
    Source: fromAddress,

    /* Add optional Reply-To email addresses if needed */
    ReplyToAddresses: [
      // "reply-to@example.com",
    ],
  });
};

/**
 * Function to execute the email send operation using AWS SES.
 */
const run = async (toAddress, fromAddress) => {
  const sendEmailCommand = createSendEmailCommand(toAddress, fromAddress);

  try {
    // Send the email using the AWS SES client
    return await sesClient.send(sendEmailCommand);
  } catch (caught) {
    // Handle SES-specific errors
    if (caught instanceof Error && caught.name === "MessageRejected") {
      /** @type { import('@aws-sdk/client-ses').MessageRejected} */
      return caught;
    }
    // Re-throw any other errors
    throw caught;
  }
};


module.exports = { run, createSendEmailCommand };
