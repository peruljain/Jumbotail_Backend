import mongoose from 'mongoose'


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        default: 9999999999
    },
    address: {
        type: String,
        default: "Earth"
    },
    about: {
        type: String,
        default: "I love trasset"
    },
    role: {
        type: String,
        default: "Site admin"
    },
    isMale: {
        type: Boolean,
        default: true
    }
})

module.exports = mongoose.model('User', userSchema)