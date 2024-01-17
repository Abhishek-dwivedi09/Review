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
    UserController.userDetails
  ); 

  UserRouter.post(
    "/update-user/:_id",
    uploads.single("userImage"),
    UserController.editUser
  )

  UserRouter.post(
    "/update-status/:_id",
    UserController.updateStatus
  )
  


export default UserRouter;