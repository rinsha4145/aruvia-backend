import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.route.js';
import cartRoutes from './routes/cart.route.js';
import authRoutes from './routes/auth.route.js';


dotenv.config(); // load .env first

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
// console.log("MONGO_URI:", process.env.MONGO_URI);

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);


app.listen(PORT, async () => {
  await connectDB(); // make sure to await it
  console.log(`Server started at http://localhost:${PORT}`);
});
