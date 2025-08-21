import express from 'express';
import { ShoppingList } from '../models/list';
// import jwt from "jsonwebtoken";
// import { createHash } from "crypto";
import { auth } from '../middleware/auth';
export const router = express.Router();

router.get("/:listId", auth(), async (req, res) => {
    const listId = req.params.listId;
    console.log("Fetching shopping list with ID:", listId);

    try {
        const list = await ShoppingList.findById(listId);
        if (!list) {
            res.status(404).json({ message: "List not found" });
            return;
        }
        res.status(200).json(list);        
    } catch (error) {
        console.error("Error fetching shopping lists:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/", auth(), async (req, res) => {
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

router.put("/:listId", auth(), async (req, res) => {
    const listId = req.params.listId;
    const list = req.body;
    console.log("Updating shopping list with ID:", listId);
    console.log("Data:", list.name, list.items.length);

    if (!list) {
        console.log("Invalid request data");
        res.status(400).json({ message: "Invalid request data" });
        return;
    }

    try {
        const updatedList = await ShoppingList.findByIdAndUpdate(listId, list, { new: true });
        if (!updatedList) {
            console.log("List not found");
            res.status(404).json({ message: "List not found" });
            return;
        }
        console.log("Shopping list updated successfully", updatedList.name);
        res.sendStatus(200);
    } catch (error) {
        console.error("Error updating list:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
