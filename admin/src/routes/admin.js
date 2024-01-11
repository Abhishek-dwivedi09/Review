import { Router } from "express";
import { AdminController} from "../controllers";
import { ValidateToken } from "../middleware/token";

const AdminRouter = Router();

AdminRouter.post(
  "/login",
  AdminController.login
); 

AdminRouter.post("/forgot-password", AdminController.forgotPassword);








export default AdminRouter;
