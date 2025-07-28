import express, { response } from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import productRoutes from "./routes/product.route.js"


dotenv.config();

const app = express();

app.use(express.json()) // allows json data

app.use("/api/products",productRoutes)

// Hrzdp8Nfv32zodm7

// mongodb+srv://falahmkba:<db_password>@cluster0.tgbzjmp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

app.listen(3000, () => {
    connectDB();
    console.log("server started at http://localhost:3000");    
})