import { Request, Response } from "express";
const User = require("../models/User");

exports.getUser = async (req: Request, res: Response) => {
  let data = (req as any).email;
   User.findOne({ email: data.email }, (err: any, user: any) => {
    if (err || !user) {
      console.log(err)
      console.log(user)
      return res.status(401).json({
        error: {
          message: "No user with this email exists",
        },
        data: {},
      });
    }
    return res.status(200).json({
      data: user,
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
