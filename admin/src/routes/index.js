import { Router } from "express";
import AdminRouter from "./admin";
import ReviewRouter from "./review"

const router = Router();

router.use("/admin", AdminRouter)

router.use("/customer", ReviewRouter)


export default router;
