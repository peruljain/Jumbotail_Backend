import { NextFunction, Request, Response } from "express";
import { decode } from "../utils/jwt";


export async function authByToken(req: Request, res: Response, next: NextFunction) {

  // check if 'Authorization' header exists
  const authHeader = req.header('Authorization')?.split(' ')
  if (!authHeader) return res.status(401).json({
    error: { message: 'Not Authorization header'}
  })

  // Check if Authorization type is Token
  if (authHeader[0] != 'Token') return res.status(401).json({
    error: { message: 'Token missing'}
  })

  // Check if token is valid
  const token = authHeader[1];
  try {
    const email = await decode(token);
    if (!email) throw new Error('No user found in token');
    (req as any).email = email
    return next()
  } catch (e) {
    return res.status(401).json({
      error: { message: 'Authorization failed' }
    })
  }



}