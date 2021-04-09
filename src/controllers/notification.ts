import { Request, Response } from "express";
const Notification = require("../models/Notification");
const [
  convert,
  parses,
  parseGeo,
  parseNotifications,
  parseNotification,
] = require("../utils/parsing");
var mongoose = require("mongoose");

exports.getNotificationById = async (req: Request, res: Response) => {


  const data = await Notification.findOne({ _id: req.params.id });
  const result = parseNotification((req as any).email.email, data);
  return res.status(200).json({
    data: result,
    error: {},
  });
};

exports.getAllNotification = async (req: Request, res: Response) => {
  const data = await Notification.find({});
  const result = parseNotifications((req as any).email.email, data);
  return res.status(200).json({
    data: result,
    error: {},
  });
};

export const markSeen = async (assetId: string, id: string, email: string) => {
  await Notification.updateOne(
    { _id: assetId, "track._id": id },
    { $addToSet: { "track.$.seenBy": email } }
  );
};
