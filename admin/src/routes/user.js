import { Router } from "express";
import { UserController} from "../controllers";
import { ValidateToken } from "../middleware/token";
import { uploads, imageUpload } from "../common/file";

const UserRouter = Router();

UserRouter.post(
  "/",
  uploads.single("userImage"),
  UserController.user
);  

UserRouter.get(
    "/user-data",
    ValidateToken,
    UserController.userDetails
  ); 

  UserRouter.put(
    "/update-user/:_id",
    ValidateToken,
    uploads.single("userImage"),
    UserController.editUser
  )

  UserRouter.put(
    "/update-status/:_id",
    ValidateToken,
    UserController.updateStatus
  ) 

  UserRouter.get(
    "/support",
    ValidateToken,
    UserController.support
  ) 

  UserRouter.put(
    "/support/update/:_id",
    ValidateToken,
    UserController.updateSupport
  ) 

  UserRouter.get(
    "/support-details/:_id",
    ValidateToken,
    UserController.supportDetails
  ) 

  UserRouter.post(
    "/send-reply/:supportId",
    ValidateToken,
    UserController.reply
  ) 


  


export default UserRouter;