import { Request, Response } from "express";
const Asset = require("../models/Asset");
const GeoFence = require("../models/GeoFence");
const AssetTrack = require("../models/AssetTrack");
const Notification = require("../models/Notification");
const GeoRoute = require("../models/GeoRoute");
const [convert, parses, parseNotifications,parseNotification] = require("../utils/parsing");
var mongoose = require("mongoose");
import { io } from "../app";

exports.createAsset = async (req: Request, res: Response) => {
  const data_asset = {
    name: req.body.name,
    desc: req.body.desc,
    type: req.body.type,
    image_url: req.body.image_url,
    body: req.body.body,
    lat: req.body.lat,
    lon: req.body.lon,
    timestamp: req.body.timestamp,
  };

  const track_data_asset = {
    lat: req.body.lat,
    lon: req.body.lon,
    timestamp: req.body.timestamp,
  };

  const asset = new Asset(data_asset);

  await asset.save(async (err: any, result: any) => {
    if (err) {
      console.log(err);
      return res.status(422).json({
        data: {},
        error: err.message,
      });
    }

    // const geofence = new GeoFence({
    //   _id: result._id,
    //   type: "Feature",
    // });

    const geofence = new GeoFence({
      _id: result._id,
      type: "Feature",
      properties: {},
      geometry: {
        type: "Polygon",
        coordinates:  [
          [
            [
              66.26953125,
              16.214674588248542
            ],
            [
              93.42773437499999,
              16.214674588248542
            ],
            [
              93.42773437499999,
              28.38173504322308
            ],
            [
              66.26953125,
              28.38173504322308
            ],
            [
              66.26953125,
              16.214674588248542
            ]
          ]
        ],
      },
    });

    await geofence.save((error: any, results: any) => {
      console.log(error, results);
      if (err) {
        return res.status(422).json({
          data: {},
          error: error.message,
        });
      }
    });

    const georoute = new GeoRoute({
      _id: result._id,
      type: "Feature",
      coordinates: [],
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [
            77.255859375,
            16.130262012034756
          ],
          [
            77.255859375,
            28.304380682962783
          ]
        ]
      },
    });

    await georoute.save((error: any, results: any) => {
      if (err) {
        return res.status(422).json({
          data: {},
          error: error.message,
        });
      }
    });

    const notification = new Notification({
      _id: result._id,
      name: req.body.name,
    });

    notification.save((error: any, results: any) => {
      if (err) {
        return res.status(422).json({
          data: {},
          error: error.message,
        });
      }
    });

    const asset_track = new AssetTrack({
      _id: result._id,
      track: [track_data_asset],
    });

    await asset_track.save((error: any, results: any) => {
      if (err) {
        return res.status(422).json({
          data: {},
          error: error.message,
        });
      }
      return res.status(201).json({
        data: result,
        error: {},
      });
    });
  });
};

const generateNotification = (
  oldWithinGeoBound: Boolean,
  newWithinGeoBound: Boolean
) => {
  let status;
  if (!newWithinGeoBound) {
    // Asset outside geofence
    if (oldWithinGeoBound) {
      // Asset went outside geofence for first time
      status = "warning";
    } else {
      // Asset is still outside geofence
      status = "danger";
    }
  } else if (!oldWithinGeoBound) {
    // Asset come inside geofence
    status = "success";
  } else {
    // No notification
    status = "none";
  }
  return status;
};

exports.updateLocation = async (req: Request, res: Response) => {
  if (!req.body.lat || !req.body.lon || !req.body.timestamp) {
    return res.status(422).json({
      data: {},
      error: { message: "Lat, lon and timestamp are required" },
    });
  }
  //update in Asset Colletion
  const asset_data = await Asset.updateOne(
    { _id: req.params.id },
    {
      $set: {
        lat: req.body.lat,
        lon: req.body.lon,
        timestamp: req.body.timestamp,
      },
    }
  );


  if(asset_data.n==0) {
    return res.status(422).json({
      data: {},
      error: { message: "Asset not exist" },
    });
  }

  const track_data = await AssetTrack.updateOne(
    { _id: req.params.id },
    {
      $push: {
        track: {
          lat: req.body.lat,
          lon: req.body.lon,
          timestamp: req.body.timestamp,
        },
      },
    }
  );

  //Within Geo Fence Check
  let geofence_data = await GeoFence.find({
    $and: [
      { _id: req.params.id },
      {
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [req.body.lon, req.body.lat],
            },
            $maxDistance: 50000,
          },
        },
      },
    ],
  });
  const notificationData = await Notification.findOne({ _id: req.params.id });
  let newWithinGeoBound = geofence_data.length !== 0;
  let status = generateNotification(
    notificationData.withinGeoFence,
    newWithinGeoBound
  );
    const query = await Notification.findOne(
      { _id: req.params.id },
      { name: 1 }
  )
  if (status !== "none") {
    //notification exists for geo fence
    const notification = {
      lat: req.body.lat,
      lon: req.body.lon,
      timestamp: req.body.timestamp,
      type: "geofence",
      status: status,
      seenBy: [],
    };
    let updateNotification = await Notification.updateOne(
      { _id: req.params.id },
      {
        $push: {
          track: notification,
        },
      }
    );
    //emit io notification
    io.emit("notification", {...notification,assetId:req.params.id,name:query.name});
  }
  await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        withinGeoFence: newWithinGeoBound,
      },
    }
  );
  let georoute_data = await GeoRoute.find({
    $and: [
      { _id: req.params.id },
      {
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [req.body.lon, req.body.lat],
            },
            $maxDistance: 1000,
          },
        },
      },
    ],
  });

  newWithinGeoBound = georoute_data.length !== 0;
  status = generateNotification(notificationData.onGeoRoute, newWithinGeoBound);

  if (status !== "none") {
    //notification exists for geo route
    const notification = {
      _id:mongoose.Types.ObjectId(),
      lat: req.body.lat,
      lon: req.body.lon,
      timestamp: req.body.timestamp,
      type: "georoute",
      status: status,
      seenBy: [],
    };
    let updateNotification = await Notification.updateOne(
      { _id: req.params.id },
      {
        $push: {
          track: notification,
        },
      }
    );
    console.log(updateNotification);
    //emit io notification
    io.emit("notification", {...notification,assetId:req.params.id,name:query.name});
  }
  await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        onGeoRoute: newWithinGeoBound,
      },
    }
  );

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
  });
};

exports.getAssets = async (req: Request, res: Response) => {
  let data = null;

  if (req.query.type) {
    data = await Asset.find({ type: req.query.type }).limit(100);
  } else {
    data = await Asset.find({});
  }

  if (data.length !== 0) {
    return res.status(200).json({
      data,
      error: {},
    });
  } else {
    return res.status(200).json({
      data,
      error: {
        message: "Type is wrong",
      },
    });
  }
};

exports.getAsset = async (req: Request, res: Response) => {
  await Asset.findOne(
    { _id: req.params._id },
    async (err: any, asset_data: any) => {
      if (err || !asset_data) {
        return res.status(401).json({
          error: { message: "Asset does not exist" },
          data: {},
        });
      }

      const track_data = await AssetTrack.findOne({
        _id: req.params._id,
      }).exec();

      const geofence_data = await GeoFence.findOne({
        _id: req.params._id,
      }).exec();

      const georoute_data = await GeoRoute.findOne({
        _id: req.params._id,
      }).exec();

      return res.status(200).json({
        data: {
          asset_data,
          track: track_data.track,
          geofence: geofence_data,
          georoute: parses(georoute_data),
        },
        error: {},
      });
    }
  );
};

exports.getAssetByTime = async (req: Request, res: Response) => {
  const asset_data = await Asset.findOne({ _id: req.params._id }).exec();
  if (!asset_data) {
    return res.status(422).json({
      error: { message: "Asset does not exist" },
      data: {}
    });
  }

  if(!req.query.start || !req.query.end) {
    return res.status(422).json({
      error: { message: "start and end time required" },
      data: {}
    });
  }

  const track_data = await AssetTrack.find(
    { _id: req.params._id },
    {
      track: {
        $filter: {
          input: "$track",
          as: "item",
          cond: {
            $and: [
              { $gte: ["$$item.timestamp", new Date(String(req.query.start))] },
              { $lte: ["$$item.timestamp", new Date(String(req.query.end))] },
            ],
          },
        },
      },
    }
  );

  return res.status(200).json({
    data: {
      asset_data,
      track: track_data[0].track,
    },
    error: {},
  });
};
