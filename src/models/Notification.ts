var mongoose = require("mongoose");

const trackSchema =  mongoose.Schema({
    lat: {
        type: Number,
    },
    lon: {
        type: Number,
    },
    timestamp: {
        type: Date,
        default: Date.now()
    },
    type: {
        type: String
    },
    status: {
        type: String
    },
    seenBy: {
        type: [String]
    }
})


const notificationSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String
  },
  withinGeoFence: {
    type: Boolean,
    default:true
  },
  onGeoRoute: {
    type: Boolean,
    default:true
  },
  track: {
      type: [trackSchema]
  }
});

module.exports = mongoose.model("Notification", notificationSchema);
