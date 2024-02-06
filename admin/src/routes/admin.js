import { Router } from "express";
import { AdminController} from "../controllers";
import { ValidateToken } from "../middleware/token";
import {ValidateTokenAndRetrieveAdminDetails} from "../middleware/token";

const AdminRouter = Router();

AdminRouter.post(
  "/login",
  AdminController.login
); 

AdminRouter.post("/forgot-password", AdminController.forgotPassword);

AdminRouter.put(
  "/profile-update",
  ValidateToken,
  AdminController.profileUpdate
) 

AdminRouter.put(
  "/change-password",
  ValidateToken,
  AdminController.changePass
) 

AdminRouter.get(
  "/token-details",
  ValidateTokenAndRetrieveAdminDetails,
  AdminController.adminDetails
)








export default AdminRouter;
