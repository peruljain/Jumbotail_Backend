import { Request, Response } from "express";
const Notification = require("../models/Notification");
const [
  convert,
  parses,
  parseNotifications,
  parseNotification,
] = require("../utils/parsing");
var mongoose = require("mongoose");

exports.getNotificationById = async (req: Request, res: Response) => {
  // const data = await Notification.aggregate([
  //   {
  //     $match: { _id: mongoose.Types.ObjectId(req.params.id) },
  //   },
  //   { //add fields in each element of track
  //     $addFields: {
  //       "track.name": "$name",
  //       "track.assetId": "$_id",
  //     },
  //   },
  //   {
  //     $project: {
  //       track: "$track",
  //     },
  //   },//sort track based on timestamp
  //   { $unwind: "$track" },
  //   { $sort: { "track.timestamp": -1 } },
  //   { $group: { _id: "$_id", track: { $push: "$track" } } },
  // ]);

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
  const track_data = await Notification.updateOne(
    { _id: assetId, "track._id": id },
    { $addToSet: { "track.$.seenBy": email } }
  );
};
