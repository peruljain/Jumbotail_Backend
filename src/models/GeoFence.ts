var mongoose = require("mongoose");

const geoSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  type: {
    type: String
  },
  properties: Object,
  geometry: {
    type: {
      type: String
    },
    coordinates: [[[Number]]]
  },
});

geoSchema.index({geometry: "2dsphere"})

const GeoFence = mongoose.model("GeoFence", geoSchema);
module.exports = GeoFence
