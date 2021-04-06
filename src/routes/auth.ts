import { Router } from "express";
import { authByToken } from "../middleware/auth";
const { check } = require("express-validator");
const { signup, login, updatePassword } = require("../controllers/auth");

const route = Router();

route.post(
  "/signup",
  [
    check("email").isEmail().withMessage("Email is Invalid"),
    check("password")
      .isLength({ min: 3 })
      .withMessage("Password should be atleast 3 characters"),
  ],
  signup
);

route.post(
  "/signin",
  [
    check("email").isEmail().withMessage("Email is Invalid"),
    check("password")
      .isLength({ min: 3 })
      .withMessage("Password should be atleast 3 characters"),
  ],
  login
);

route.get("/signout", async (req, res) => {
  res.send("signout");
});

route.put("/updatePassword", authByToken, updatePassword)

export const authRoute = route;
