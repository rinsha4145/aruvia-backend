import express from "express";
import { getCart, addToCart, removeFromCart, updateCartItemQuantity, clearCart } from "../controllers/cart.controller.js";
const router = express.Router();

router
.get("/:id", getCart)
.post("/:id", addToCart)
.put("/update-quantity/:id", updateCartItemQuantity)
.delete("/:id", removeFromCart)
.delete("/clear/:id", clearCart);



export default router;