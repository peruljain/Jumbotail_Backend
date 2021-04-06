import { Router } from "express";
import { authByToken } from "../middleware/auth";
const {getUser, updateProfile } = require("../controllers/user");

const route = Router();

route.get('/getuser', authByToken, getUser)

route.put('/updateprofile', authByToken, updateProfile)

export const userRoute = route;