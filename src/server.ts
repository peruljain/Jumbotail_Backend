const app = require("./app");
// import {http} from "./app";
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
    console.log("DB CONNECTED");
  })
  .catch((e) => {
    console.log(e);
  });



//Host Server
app.listen(process.env.PORT, () => {
  console.log();
  console.log("Server is running");
});
