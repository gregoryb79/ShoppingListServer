import express from 'express';
import { ShoppingList } from '../models/list';
// import jwt from "jsonwebtoken";
// import { createHash } from "crypto";
import { auth } from '../middleware/auth';
export const router = express.Router();

router.put("/", auth(), async (req, res) => {
    const { name, items } = req.body;

    if (!name || !Array.isArray(items)) {
        res.status(400).json({ message: "Invalid request data" });
        return;
    }

    try {
        const list = await ShoppingList.create({ name, items });
        console.log("Shopping list created successfully", list.name);
        res.status(201).json(list);
    } catch (error) {
        console.error("Error creating list:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
