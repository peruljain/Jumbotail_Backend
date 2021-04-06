import { Router } from "express";
import { authByToken } from "../middleware/auth";

const {createAsset, updateLocation, getAssets, getAsset, getAssetByTime} = require('../controllers/asset')
const {updateGeoFence, updateGeoRoute, getGeofence, getGeoroute} = require('../controllers/geo')
const {getNotificationById,getAllNotification} = require('../controllers/notification')

const route = Router()

route.post('/asset', createAsset)

route.patch('/asset/:id', updateLocation)

route.get('/asset/list', authByToken, getAssets)

route.get('/asset/track/:_id', authByToken, getAsset)

route.get('/asset/trackbytime/:_id', authByToken, getAssetByTime)

route.put('/asset/geofence/:id', authByToken, updateGeoFence)

route.put('/asset/georoute/:id', authByToken, updateGeoRoute)

route.get('/asset/getgeofence/:id', authByToken, getGeofence)

route.get('/asset/getgeoroute/:id', authByToken, getGeoroute)

route.get('/asset/notification/:id', authByToken, getNotificationById)

route.get('/asset/notification/', authByToken, getAllNotification)


export const assetRoute = route
