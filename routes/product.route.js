import express from "express";

import { createProduct, deleteProduct, getProducts, updateProduct } from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts)

router.put("/:id", updateProduct)

router.post("/", createProduct);
console.log(process.env.MONGO_URI);

router.delete("/:id", deleteProduct)

export default router;