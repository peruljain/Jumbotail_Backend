import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { authRoute } from "./routes/auth";
import { assetRoute } from "./routes/asset";
import { userRoute } from "./routes/user";

const app = express();
const swaggerUi = require("swagger-ui-express");
let swaggerDocument = require("../swagger.json");

//change swagger host dynamically for development
//note: use 'npm run localhost' command for this to work
if(process.env.NODE_ENV && process.env.NODE_ENV.trim() === "development"){
  swaggerDocument.host ="localhost:8003";
  swaggerDocument.schemes = ["http"];
  console.log(swaggerDocument.host ,swaggerDocument.schemes)
}
    
app.use(express.json());

//Required for making calls from localhost -- dev only
var cors = require("cors");
app.use(cors());

app.use("/api", assetRoute);
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("hello world");
});

module.exports = app;
