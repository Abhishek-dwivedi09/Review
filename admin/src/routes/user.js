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
  


export default UserRouter;