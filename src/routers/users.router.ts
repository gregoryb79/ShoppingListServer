import express from 'express';
import { User } from '../models/user';
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { auth } from '../middleware/auth';
export const router = express.Router();

function createToken(userId: string, email: string, expiration: string ) {
    return jwt.sign({ sub: userId, email }, process.env.SESSION_SECRET!, { expiresIn: expiration } as jwt.SignOptions);    
}

function hashPasswordWithSalt(password: string, salt: string) {
    const hash = createHash("sha512");

    hash.update(password);
    hash.update(salt);

    return hash.digest("base64");
}

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
    if (!newUser) {
        console.error("Error creating user");
        res.status(400).json({ message: "Error creating default user" });
        return;
    }
    const token = createToken(newUser._id.toString(), newUser.email ?? "", "100y");

    try {
        const user = await User.findById(newUser._id).select('-__v');
        if (!user) {
            console.error("Error creating user");
            res.status(404).json({ message: "error creating user" });
            return;
        }
        console.log("Default user created successfully",user);
        res.status(200).json({user,token});
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});
