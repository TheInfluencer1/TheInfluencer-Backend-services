// Import the required AWS SES modules
import { SendEmailCommand } from "@aws-sdk/client-ses";
import { sesClient } from "./aws/sesClient";

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
          // Replace "HTML_FORMAT_BODY" with your actual HTML content
        },
        Text: {
          Charset: "UTF-8",
          Data: "Hello, this is a plain text email! Custom text body goes here.",
          // Replace "TEXT_FORMAT_BODY" with your actual text content
        },
      },
      /* The subject of the email */
      Subject: {
        Charset: "UTF-8",
        Data: "Your Email Subject Here",
        // Replace "EMAIL_SUBJECT" with your actual subject
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
        const messageRejectedError = caught;
        return messageRejectedError;
      }
      // Re-throw any other errors
      throw caught;
    }
  };
  
export { run, createSendEmailCommand };


// Run the function (uncomment this if you want to execute it)
// run().then(console.log).catch(console.error);
