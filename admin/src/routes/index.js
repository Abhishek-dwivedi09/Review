import { Router } from "express";
import AdminRouter from "./admin";
import ReviewRouter from "./review"
import VisitorRouter from "./visitor";

const router = Router();

router.use("/admin", AdminRouter)

router.use("/customer", ReviewRouter)

router.use("/visitor", VisitorRouter)


export default router;
