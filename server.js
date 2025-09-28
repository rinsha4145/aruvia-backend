import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import  orderRoutes from './routes/order.route.js';

import authRoutes from './routes/auth.route.js';
 import cors from "cors";
import { razorpayWebhook } from './controllers/order.controller.js';

dotenv.config(); // load .env first
connectDB(); 
const app = express();
const PORT = process.env.PORT || 5000;

app.post(
  "/api/order/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook
);

app.use(express.json());
// console.log("MONGO_URI:", process.env.MONGO_URI);
app.use(cors(
  {origin:"*"
  }
))
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);



app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`);
});
