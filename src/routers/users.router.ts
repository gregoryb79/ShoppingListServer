import express from 'express';
import { User } from '../models/user';
export const router = express.Router();

router.get("/", async (_, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
