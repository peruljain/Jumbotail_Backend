import { Request, Response } from "express";
const GeoFence = require("../models/GeoFence");
const GeoRoute = require("../models/GeoRoute");
const Notification = require("../models/Notification");
const [convert, parses] = require("../utils/parsing");
var geojson = require('geojson-tools')
var mongoose = require("mongoose");
import { io } from "../socket";

exports.getGeofence = async (req: Request, res: Response) => {
  const data = await GeoFence.findOne({ _id: req.params.id }).exec();

  if (!data) {
    return res.status(422).json({
      error: { message: "Geofence Id does not exist" },
    });
  }
  return res.status(200).json({
    data: data,
    error: {message:"Geo Fence Does not Exist"},
  });
};

exports.getGeoroute = async (req: Request, res: Response) => {
  

  let data = await GeoRoute.findOne({ _id: req.params.id }).exec();

  if (!data) {
    return res.status(422).json({
      error: { message: "Georoute Id does not exist" },
    });
  }

  return res.status(200).json({
    data: parses(data),
    error: {message:"Geo Route Does not Exist"},
  });
};

exports.updateGeoFence = async (req: Request, res: Response) => {


  if(req.body.geometry===undefined) {
    return res.status(422).json({
      data: {
      },
      error: {
        message: "body is required"
      },
    });
  }

  let array = req.body.geometry.coordinates[0];

  array = geojson.complexify(array, 0.5);

  const data = await GeoFence.updateOne(
    { _id: req.params.id },
    {
      $set: {
        properties: req.body.properties,
        geometry: req.body.geometry,
      },
    }
  );

  await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        withinGeoFence: true,
      },
    }
  );

  if(data.n==0) {
    return res.status(422).json({
      error: {
        message: "Asset does not exist"
      },
      data: {}
    });
  }

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
  });
};

exports.updateGeoRoute = async (req: Request, res: Response) => {

  if(req.body.geometry===undefined) {
    return res.status(422).json({
      data: {
      },
      error: {
        message: "body is required"
      },
    });
  }


  const data = await GeoRoute.updateOne(
    { _id: req.params.id },
    {
      $set: {
        properties: req.body.properties,
        coordinates: req.body.geometry.coordinates,
        geometry: convert(req.body.geometry.coordinates),
      },
    }
  );

  await Notification.updateOne(
    { _id: req.params.id },
    {
      $set: {
        onGeoRoute: true,
      },
    }
  );

  if(data.n==0) {
    return res.status(422).json({
      error: {
        message: "Asset does not exist"
      },
      data: {}
    });
  }

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
  });
};


exports.deleteGeoFence = async (req: Request, res: Response) => {

  await GeoFence.deleteOne(
    { _id: req.params.id }
  );

  return res.status(200).json({
    data: {
      success: true,
    },
    error: {},
  });
};

exports.deleteGeoRoute = async (req: Request, res: Response) => {

  await GeoRoute.deleteOne(
    { _id: req.params.id }
  );

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
}

export const handleGeoRoute = async (req: Request, res: Response) => {
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
  const notificationData = await Notification.findOne({ _id: req.params.id });
  let newWithinGeoBound = georoute_data.length !== 0;
  let status = generateNotification(notificationData.onGeoRoute, newWithinGeoBound);
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


}