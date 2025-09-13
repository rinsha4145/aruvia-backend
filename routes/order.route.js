import express from "express";
import { createOrder, getAllOrders, verifyPayment } from "../controllers/order.controller.js";

const router = express.Router();

router
.get("/", getAllOrders)
.post("/createorder", createOrder)
.post('/verifyPayment', verifyPayment)

export default router;