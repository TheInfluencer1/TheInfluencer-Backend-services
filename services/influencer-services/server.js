const {connectDB} = require("./src/utils/db");
const express = require("express");
const dotenv = require("dotenv");

dotenv.config();
connectDB(process.env.DB_URI_INFLUENCER);
const app = express();

