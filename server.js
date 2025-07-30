import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from './routes/product.route.js';

dotenv.config(); // load .env first

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
console.log("MONGO_URI:", process.env.MONGO_URI);

app.use('/api/products', productRoutes);

app.listen(PORT, async () => {
  await connectDB(); // make sure to await it
  console.log(`Server started at http://localhost:${PORT}`);
});
