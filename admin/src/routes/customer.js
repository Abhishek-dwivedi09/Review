import { Router } from "express";
import { CustomerController} from "../controllers";
import { ValidateToken } from "../middleware/token";

const CustomerRouter = Router();

CustomerRouter.get("/review", ValidateToken, CustomerController.review);

CustomerRouter.get("/analytics", ValidateToken, CustomerController.customerAnalytics)

CustomerRouter.get("/free_trail",ValidateToken, CustomerController.freeTrails)

CustomerRouter.get("/subscription",ValidateToken, CustomerController.subscription)












export default CustomerRouter;