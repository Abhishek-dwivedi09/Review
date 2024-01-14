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
  


export default UserRouter;