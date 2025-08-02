import express from "express";
import { userRegister, userLogin, userLogout } from "../controllers/auth.controller.js";

const router = express.Router();

router
.post("/register", userRegister)
.post("/login", userLogin)
.post("/logout", userLogout);
export default router;