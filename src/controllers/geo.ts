import { Request, Response } from "express";
const GeoFence = require("../models/GeoFence");
const GeoRoute = require("../models/GeoRoute");
const [convert, parses] = require("../utils/parsing");
var geojson = require('geojson-tools')

exports.getGeofence = async (req: Request, res: Response) => {
  const data = await GeoFence.findOne({ _id: req.params.id }).exec();

  if (!data) {
    return res.status(422).json({
      error: { message: "Geofence Id does not exist" },
    });
  }
  return res.status(200).json({
    data: data,
    error: {},
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
    error: {},
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
