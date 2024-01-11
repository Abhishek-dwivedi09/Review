import { Router } from "express";
import { VisitorController} from "../controllers";
import { ValidateToken } from "../middleware/token";

const VisitorRouter = Router();

VisitorRouter.get("/", VisitorController.visitors);



export default VisitorRouter;