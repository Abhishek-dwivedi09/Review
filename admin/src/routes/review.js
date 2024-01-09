import { Router } from "express";
import { ReviewController} from "../controllers";
import { ValidateToken } from "../middleware/token";

const ReviewRouter = Router();

ReviewRouter.get("/review", ReviewController.review);






export default ReviewRouter;