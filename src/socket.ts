const app = require("./app");
import { markSeen } from "./controllers/notification";
//setup socket
var http = require("http").Server(app);
var io = require("socket.io")(http, {
  cors: {
    origin: "*",
  },
});
//omit for unit testingl
if (process.env.NODE_ENV !== "test") {
  http.listen(8002, function () {
    console.log("Socket: listening on port 8002");
  });
}

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
      // console.log(assetId, id, email)
      //add email in notification's sendBy in Db
      markSeen(assetId, id, email);
    }
  );
});

export { io };

module.exports = app;
