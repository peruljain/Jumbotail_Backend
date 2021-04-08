const app = require("./socket");
require("dotenv").config();
import mongoose from "mongoose";

//DATABASE
export const databaseUrl = process.env.DATABASE_NAME || "";

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
app.listen(process.env.PORT, () => {
  console.log("Server: running on port 8003");
});

