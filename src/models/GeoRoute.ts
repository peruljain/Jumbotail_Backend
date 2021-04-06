var mongoose = require("mongoose");

const geoRouteSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  type: {
    type: String
  },
  coordinates: [[[Number]]],
  properties: Object,
  geometry: {
    type: {
      type: String
    },
    coordinates: [[Number]]
  },
});

geoRouteSchema.index({geometry: "2dsphere"})
const GeoRoute = mongoose.model("GeoRoute", geoRouteSchema);
module.exports = GeoRoute
