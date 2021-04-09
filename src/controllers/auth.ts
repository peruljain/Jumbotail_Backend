import { Request, Response } from "express";
import { sign } from "../utils/jwt";
import { hashPassword, matchPassword } from "../utils/password";
const User = require("../models/User");
const { validationResult } = require("express-validator");

exports.signup = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error: errors.array()[0].msg,
      data: {}
    });
  }

  let name = req.body.name;
  let password = req.body.password;
  let email = req.body.email;
  let hash_password = await hashPassword(password);
  const user = new User({
    name,
    email,
    password: hash_password,
  });
  await user.save(async (err: any) => {
    if (err) {
      return res.status(422).json({
        error: err.message,
        data: {}
      });
    }
    return res.status(201).json({
      data: {
        name: user.name,
        email: user.email,
        token: await sign(email),
      },
      error: {},
    });
  });
};

exports.login = async (req: Request, res: Response) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({
      error:  errors.array()[0].msg,
      data: {}
    });
  }

  let email = req.body.email;
  let password = req.body.password;

  User.findOne({ email: email }, async (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({
        error:  { message: "User not found"},
        data: {}
      });
    }

    

    const passwordMatch = await matchPassword(user.password!, password);

    if (passwordMatch == false) {
      return res.status(401).json({
        error:{ message: "Wrong Password"},
        data: {}
      });
    }

    return res.status(200).json({
      data: {
        name: user.name,
        email: user.email,
        token: await sign(email),
      },
      error: {},
    });
  });
};

exports.updatePassword = async(req: Request, res: Response) => {
  
  let oldPassword = req.body.oldPassword
  let newPassword = req.body.newPassword
  let data = (req as any).email
  let hash_password = await hashPassword(newPassword)

  User.findOne({ email: data.email }, async (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({
        error:  { message: "User not found" + "and"+ String(err.message)},
        data: {}
      });
    }
    const passwordMatch = await matchPassword(user.password!, oldPassword);

    if (passwordMatch == false) {
      return res.status(401).json({
        error:{ message: "Wrong Current password"},
        data: {}
      });
    }

    User.updateOne({email: data.email}, {password: hash_password}, (error: any, result: any)=> {

      if(error) {
        return res.status(401).json({
          error:  { message: "Password Not Updated"},
          data: {}
        });
      }

      return res.status(200).json({
        data: {
          success: true
        },
        error: {},
      })
    })
  });


};