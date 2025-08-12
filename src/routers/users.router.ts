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

router.put("/:name", async (req, res) => {
    console.log("creating default user");
    const { name } = req.params; 
    if (!name) {
        res.status(400).json({ message: "Name is required" });
        return;
    }
    if (name !== "DefaultUser"){
        res.status(400).json({ message: "You can only create DefaultUser" });
        return;
    }

    const newUser = await User.create({
        name: "DefaultUser",  
        email: new Date().toISOString()+"@example.com"
    });

    try {
        const user = await User.findById(newUser._id).select('-__v');
        if (!user) {
            console.error("Error creating user");
            res.status(404).json({ message: "error creating user" });
            return;
        }
        console.log("Default user created successfully",user);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
