import { Admin } from "../models";
import { User } from "../models";
import mongoose from "mongoose";
import { verify as VerifyJWT } from "jsonwebtoken";

// export const ValidateToken = async (req, res, next) => {
//   const token = req.headers["authorization"]
//     ? req.headers["authorization"].replace("Bearer ", "").trim()
//     : "";
//   if (!token) {
//     return res.status(401).json({
//       code: "NOT_AUTHORISED",
//       message: "Unauthorized, Please provide authentication token!",
//     });
//   }
//   try {
//     const tokenData = VerifyJWT(token, process.env.JWT_SECRET);
//     const currentUser = await Admin.findOne({
//       _id: Mongoose.Types.ObjectId(tokenData.id),
//       // fcmToken: tokenData.fcmToken
//     });
//     if (!currentUser) {
//       return res.status(401).json({
//         code: "NOT_AUTHORISED",
//         message: "Unauthorized",
//       });
//     }
//     req.currentUser = currentUser;
//     next();
//   } catch (error) {
//     console.log("error", error);
//     return res.status(401).json({
//       code: "NOT_AUTHORISED",
//       message: "Your login session has been expired, Please login again.",
//     });
//   }
// }; 

export const ValidateToken = async (req, res, next) => {
  const token = req.headers["authorization"]
    ? req.headers["authorization"].replace("Bearer ", "").trim()
    : "";
  if (!token) {
    return res.status(401).json({
      code: "NOT_AUTHORISED",
      message: "Unauthorized, Please provide authentication token!",
    });
  }
  try {
    const tokenData = VerifyJWT(token, process.env.JWT_SECRET);



    const currentUser = await Admin.findOne({
      _id: tokenData.id,
    }); 

    const userId = tokenData.id;
    console.log("User ID from Token:", userId);



    console.log("Current User:", currentUser);

    if (!currentUser) {
      return res.status(401).json({
        code: "NOT_AUTHORISED",
        message: "Unauthorized",
      });
    }
    req.currentUser = currentUser;
    next();
  } catch (error) {
  //  console.log("Error:", error);
    return res.status(401).json({
      code: "NOT_AUTHORISED",
      message: "Your login session has been expired, Please login again.",
    });
  }
}; 

// Middleware to validate token and retrieve admin details
export const ValidateTokenAndRetrieveAdminDetails = async (req, res, next) => {
  const token = req.headers["authorization"]
    ? req.headers["authorization"].replace("Bearer ", "").trim()
    : "";

  if (!token) {
    return res.status(401).json({
      code: "NOT_AUTHORISED",
      message: "Unauthorized, Please provide authentication token!",
    });
  }

  try {
    const tokenData = VerifyJWT(token, process.env.JWT_SECRET);

    const adminDetails = await Admin.findOne({ _id: tokenData.id });

    if (!adminDetails) {
      return res.status(401).json({
        code: "NOT_AUTHORISED",
        message: "Unauthorized, Admin details not found!",
      });
    }

    req.adminDetails = adminDetails;
    next();
  } catch (error) {
    return res.status(401).json({
      code: "NOT_AUTHORISED",
      message: "Your login session has expired, Please login again.",
    });
  }
};

