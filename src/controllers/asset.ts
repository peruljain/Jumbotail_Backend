import { Request, Response } from "express";
const Asset = require("../models/Asset");
const GeoFence = require("../models/GeoFence");
const AssetTrack = require("../models/AssetTrack");
const Notification = require("../models/Notification");
const GeoRoute = require("../models/GeoRoute");
const [
  convert,
  parses,
  parseNotifications,
  parseNotification,
] = require("../utils/parsing");
var mongoose = require("mongoose");
import { handleGeoFence, handleGeoRoute } from "./geo";

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
        coordinates: [
          [
            [66.26953125, 16.214674588248542],
            [93.42773437499999, 16.214674588248542],
            [93.42773437499999, 28.38173504322308],
            [66.26953125, 28.38173504322308],
            [66.26953125, 16.214674588248542],
          ],
        ],
      },
    });

    await geofence.save((error: any, results: any) => {
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
          [77.255859375, 16.130262012034756],
          [77.255859375, 28.304380682962783],
        ],
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

  if (asset_data.n == 0) {
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
  let geofence_exists = await GeoFence.exists({ _id: req.params.id });
  if (geofence_exists) {
    handleGeoFence(req, res);
  }
  let georoute_exists = await GeoRoute.exists({ _id: req.params.id });
  if (georoute_exists) {
    handleGeoRoute(req, res);
  }

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

      let geofence_exists = await GeoFence.exists({ _id: req.params.id });
      let georoute_exists = await GeoRoute.exists({ _id: req.params.id });

      let geofence_data = null;
      let georoute_data = null;
      if (geofence_exists)
        geofence_data = await GeoFence.findOne({
          _id: req.params._id,
        }).exec();
      if (georoute_exists)
        georoute_data = await GeoRoute.findOne({
          _id: req.params._id,
        }).exec();

      return res.status(200).json({
        data: {
          asset_data,
          track: track_data.track,
          geofence: geofence_data,
          georoute: georoute_data ? parses(georoute_data) : georoute_data,
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
      data: {},
    });
  }

  if (!req.query.start || !req.query.end) {
    return res.status(422).json({
      error: { message: "start and end time required" },
      data: {},
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
