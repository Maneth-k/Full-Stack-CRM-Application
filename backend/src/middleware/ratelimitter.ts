import { Request, Response, NextFunction } from "express";
import { ratelimit } from "../config/upstash";

const rateLimitter = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
    try {
        const ip = req.ip ;
        if(!ip){
            return res.status(400).json({message:"IP address not found"})
        }
        const {success} = await ratelimit.limit(ip);
        if(!success){
            return res.status(429).json({message:"Too many requests.Please try again later"})
        }
        next();
    } catch (error) {
        console.log(error);
        next(error)
    }
  
  
};
export default rateLimitter
