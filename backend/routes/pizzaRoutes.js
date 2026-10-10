import express from "express";
import { getPizzas } from "../controllers/pizzaController.js";

const router = express.Router();

router.get("/", getPizzas);

export default router;
