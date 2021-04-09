import { Request, Response } from "express";
const GeoFence = require("../models/GeoFence");
const GeoRoute = require("../models/GeoRoute");
const Notification = require("../models/Notification");
const [convert, parses, parseGeo] = require("../utils/parsing");
var geojson = require("geojson-tools");
var mongoose = require("mongoose");
import { io } from "../server";

exports.getGeofence = async (req: Request, res: Response) => {
  let geofence_exists = await GeoFence.exists({ _id: req.params.id });
  let geofence_data = null;
  if (geofence_exists)
    geofence_data = await GeoFence.findOne({
      _id: req.params.id,
    }).exec();
  else {
    return res.status(404).json({
      error: { message: "Geo Fence Does not Exist" },
    });
  }
  return res.status(200).json({
    data: geofence_data ? parseGeo(geofence_data) : geofence_data,
    error: {},
  });
};

exports.getGeoroute = async (req: Request, res: Response) => {
  let georoute_exists = await GeoRoute.exists({ _id: req.params.id });
  let georoute_data = null;
  if (georoute_exists)
    georoute_data = await GeoRoute.findOne({
      _id: req.params.id,
    }).exec();
  else {
    return res.status(404).json({
      error: { message: "Geo Route Does not Exist" },
    });
  }
  return res.status(200).json({
    data: georoute_data ? parses(georoute_data) : georoute_data,
    error: {},
  });
};

exports.updateGeoFence = async (req: Request, res: Response) => {
  if (req.body.geometry === undefined) {
    return res.status(422).json({
      data: {},
      error: {
        message: "body is required",
      },
    });
  }

  const data = await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        withinGeoFence: true,
      },
    }
  );

  if (data.n == 0) {
    return res.status(422).json({
      error: {
        message: "Asset does not exist",
      },
      data: {},
    });
  }

  let array = req.body.geometry.coordinates[0];

  array = geojson.complexify(array, 0.5);

  const geofence = req.body;

  if (await GeoFence.exists({ _id: req.params.id })) {
    await GeoFence.updateOne(
      { _id: req.params.id },
      {
        $set: geofence,
      }
    );
  } else {
    await new GeoFence({
      ...geofence,
      _id: req.params.id,
    }).save();
  }

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
  });
};

exports.updateGeoRoute = async (req: Request, res: Response) => {
  if (req.body.geometry === undefined) {
    return res.status(422).json({
      data: {},
      error: {
        message: "Body is Required",
      },
    });
  }

  const data = await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        onGeoRoute: true,
      },
    }
  );

  if (data.n == 0) {
    return res.status(422).json({
      error: {
        message: "Asset does not exist",
      },
      data: {},
    });
  }

  const georoute = req.body;
  georoute.coordinates = georoute.geometry.coordinates;
  georoute.geometry = convert(georoute.geometry.coordinates);
  if (await GeoRoute.exists({ _id: req.params.id })) {
    await GeoRoute.updateOne(
      { _id: req.params.id },
      {
        $set: georoute,
      }
    );
  } else {
    await new GeoRoute({
      ...georoute,
      _id: req.params.id,
    }).save();
  }

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
  });
};

exports.deleteGeoFence = async (req: Request, res: Response) => {
  await GeoFence.deleteOne({ _id: req.params.id });

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
  });
};

exports.deleteGeoRoute = async (req: Request, res: Response) => {
  await GeoRoute.deleteOne({ _id: req.params.id });

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
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

export const handleGeoFence = async (req: Request, res: Response) => {
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
  const query = await Notification.findOne({ _id: req.params.id }, { name: 1 });
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
    if (io)
      io.emit("notification", {
        ...notification,
        assetId: req.params.id,
        name: query.name,
      });
  }
  await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        withinGeoFence: newWithinGeoBound,
      },
    }
  );
};

export const handleGeoRoute = async (req: Request, res: Response) => {
  let georoute_data = await GeoRoute.find({
    $and: [
      { _id: req.params.id },
      {
        geometry: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [req.body.lat, req.body.lon],
            },
            $maxDistance: 1000,
          },
        },
      },
    ],
  });
  const notificationData = await Notification.findOne({ _id: req.params.id });
  let newWithinGeoBound = georoute_data.length !== 0;
  let status = generateNotification(
    notificationData.onGeoRoute,
    newWithinGeoBound
  );
  const query = await Notification.findOne({ _id: req.params.id }, { name: 1 });
  if (status !== "none") {
    //notification exists for geo route
    const notification = {
      _id: mongoose.Types.ObjectId(),
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
    //emit io notification
    if (io)
      io.emit("notification", {
        ...notification,
        assetId: req.params.id,
        name: query.name,
      });
  }
  await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        onGeoRoute: newWithinGeoBound,
      },
    }
  );
};
