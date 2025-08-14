import express from 'express';
import { User } from '../models/user';
import jwt from "jsonwebtoken";
import { createHash } from "crypto";
import { auth } from '../middleware/auth';
import { FamilyAccount } from '../models/familyAccount';
import { randomBytes } from "crypto";
import { Request } from "express";
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

router.post("/FA/:name",auth(), async (req, res) => {
    console.log("creating default family account");    
    const { name } = req.params; 
    const auth = (req as Request & { auth?: { sub?: string } }).auth;
    const userId = auth?.sub;
    if (!name) {
        res.status(400).json({ message: "Name is required" });
        return;
    }
    if (name !== "DefaultAccount"){
        res.status(400).json({ message: "You can only create DefaultAccount" });
        return;
    }

    try{
        const newFamilyAccount = await FamilyAccount.create({
            name: "DefaultAccount",  
            token: randomBytes(12).toString("base64").replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
            users: [userId],
        });
        if (!newFamilyAccount) {
            console.error("Error creating family account");
            res.status(400).json({ message: "Error creating default family account" });
            return;
        }
        console.log("Default family account created successfully", newFamilyAccount);
        res.status(200).json({ familyAccount: newFamilyAccount });
        return;
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }     
 
});
