import { Router } from "express";
import AdminRouter from "./admin";
import CustomerRouter from "./customer"
import VisitorRouter from "./visitor";

const router = Router();

router.use("/admin", AdminRouter)

router.use("/customer", CustomerRouter)

router.use("/visitor", VisitorRouter)


export default router;
