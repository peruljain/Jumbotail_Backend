import * as dotenv from "dotenv";
dotenv.config();

import express from "express";

import { authRoute } from "./routes/auth";
import { assetRoute } from "./routes/asset";
import {userRoute} from "./routes/user"


const app = express();
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("../swagger.json");
import { markSeen } from "./controllers/notification";

var http = require("http").Server(app);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});



app.use(express.json());

//Required for making calls from localhost -- dev only
var cors = require('cors')
app.use(cors()) 

app.use("/api", assetRoute);
app.use("/auth", authRoute);
app.use("/user", userRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get("/", (req, res) => {
  res.send("hello");
});

http.listen(8002, function () {
  console.log("listening on port 8002");
});

io.on("connection", function (socket: any) {
  socket.on(
    "notification",
    ({
      assetId,
      id,
      email,
    }: {
      assetId: string;
      id: string;
      email: string;
    }) => {
      //add email in notification's sendBy in Db
      markSeen(assetId, id, email);
    }
  );
});


module.exports = app;


export {http};
export {io};
