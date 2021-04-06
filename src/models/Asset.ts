var mongoose = require('mongoose');


const bodySchema = mongoose.Schema({
    modelNo : String,
    companyName: String,
    employeeId: Number,
    address: String
})



const assetSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    desc : {
        type: String,
        required: true
    },
    type : {
        type: String,
        required: true
    },
    image_url : {
        type: String,
        required: true
    },
    body: {
        type: bodySchema
    },
    lat: Number,
    lon: Number,
    timestamp: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model('Asset', assetSchema)
