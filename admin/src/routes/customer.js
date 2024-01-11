import { Router } from "express";
import { CustomerController} from "../controllers";
import { ValidateToken } from "../middleware/token";

const CustomerRouter = Router();

CustomerRouter.get("/review", CustomerController.review);

CustomerRouter.get("/analytics", CustomerController.customerAnalytics)

CustomerRouter.get("/free_trail", CustomerController.freeTrails)










export default CustomerRouter;