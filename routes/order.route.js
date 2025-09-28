import express from "express";
import { createOrder, getAllOrders, razorpayWebhook, verifyPayment } from "../controllers/order.controller.js";

const router = express.Router();

router
.get("/", getAllOrders)
.post("/createorder", createOrder)
.post('/verifyPayment', verifyPayment)
// .post("/webhook", express.raw({ type: "application/json" }), razorpayWebhook);


export default router;