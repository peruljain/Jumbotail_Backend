const app = require("./app");
require("dotenv").config();
import mongoose from "mongoose";
const socketIO = require("socket.io");
import { markSeen } from "./controllers/notification";

//DATABASE
export const databaseUrl = process.env.DATABASE_NAME || "";
let io = socketIO();

if (process.env.NODE_ENV !== "test") {
  //Connect Database
  mongoose
    .connect(databaseUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    })
    .then(() => {
      console.log("Database Connected");
    })
    .catch((e) => {
      console.log(e);
    });

  //Host Server
  const server = app.listen(process.env.PORT, () => {
    console.log("Server: running on port 8003");
  });

  //Initialize Socket
  io = socketIO(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", function (socket: any) {
    socket.on(
      "notification",
      (notifications:[{
        assetId: string;
        id: string;
        email: string;
      }]) => {
        // console.log(notifications);
        notifications.forEach( ({
          assetId,
          id,
          email
        } : {
          assetId: string;
          id: string;
          email: string;
        })=>{
          //add email in notification's sendBy in Database

          markSeen(assetId, id, email);
        })
        
      }
    );
  });
}

export { io };
