import Jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';

// protected route
export const requireSignin = (req, res, next) => {
    try {
        const decoded = Jwt.verify(req.headers.authorization, process.env.JWT_SECRET);
        req.user = decoded;
        // console.log("Request passed the requireSignin middleWare", decoded);
        next();
    } catch (error) {
        /*
        1. token not provided
        2. token expired
        3. token modified
            => tampered token
        */
        // console.log(error);

        return res.status(500).json({
            success: false,
            message: 'Error in token verification',
            error
        })
    }
};

// admin access
export const isAdmin = async (req, res, next) => {
    try {
        const user = await userModel.findById(req.user._id);

        if (user.role !== 1) {
            return res.status(401).json({
                success: false,
                message: 'UnAuthorized Access'
            });
        } else {
            next();
        }
    } catch (error) {
        /*
            1. User not found
            2. User found but not admin
        */
        // console.log(error);

        return res.status(500).json({
            success: false,
            message: 'Authorization failed for admin access',
            error
        })
    }
};