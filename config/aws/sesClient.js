import { SESClient } from "@aws-sdk/client-ses";
import { config } from "dotenv";

config(); 

const sesClient = new SESClient({
  region: process.env.AWS_REGION, 
  credentials: {
    // AWS Access Key Id
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
    // AWS Secret Key
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
  },
});

export { sesClient };
