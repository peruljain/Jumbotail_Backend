import { Request, Response } from "express";
const User = require("../models/User");

exports.getUser = async (req: Request, res: Response) => {
  let data = (req as any).email;
  
  User.findOne({ email: data.email }, (err: any, user: any) => {
    if (err || !user) {
      return res.status(401).json({
        error: {
          message: "No user with this email exists",
        },
        data: {},
      });
    }
    let userData = {...user._doc}
    delete userData.password;
    return res.status(200).json({
      data: userData,
      error: {},
    });
  });
};

exports.updateProfile = async (req: Request, res: Response) => {
  let data = (req as any).email;
  User.updateOne(
    { email: data.email },
    {
      $set: req.body,
    },
    (err: any, result: any) => {
      if (err) {
        return res.status(401).json({
          error: {
            message: err.message,
          },
          data: {},
        });
      }
      return res.status(200).json({
        data: {
          success: true,
        },
        error: {},
      });
    }
  );
};
