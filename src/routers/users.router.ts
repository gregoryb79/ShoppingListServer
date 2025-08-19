import express from 'express';
import { User } from '../models/user';
import { ShoppingList } from '../models/list';
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

router.get("/:userID", auth(), async (req, res) => {
    const auth = (req as Request & { auth?: { sub?: string } }).auth;
    const tokenUserId = auth?.sub;
    const userId = req.params.userID;
    if (tokenUserId !== userId) {
        console.log("Unauthorized access attempt to user data, tokenUserId != userId");
        res.status(403).json({ message: "Forbidden" });
        return;
    }
    try {
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/:name", async (req, res) => {
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

router.put("/", auth(), async (req, res) => {    
    const user = req.body;    
    console.log("updating user", user.name, user._id);

    const lists = user.lists || [];

    if (lists.length > 0){
        await (lists.map(async (list: any) => {
            const updatedList = await ShoppingList.findByIdAndUpdate(list._id, list, {new : true});
            if (!updatedList) {
                console.log("List not found, creating new list", list.name, list._id);
                const newList = await ShoppingList.create(list);
                console.log("New list created successfully", newList.name);
            }else {
                console.log("List updated successfully", updatedList.name);
            }
        }));
    }
    user.lists = user.lists.map((list: any) => list._id);
    console.log("Updating user with:", user);
    const updatedUser = await User.findByIdAndUpdate(user._id, user, { new: true });

    if (!updatedUser) {
        console.error("Error updating user");
        res.status(400).json({ message: "Error updating user" });
        return;
    }

    console.log("User updated successfully", updatedUser.name);
    res.status(200);    
});

// router.post("/FA/:name",auth(), async (req, res) => {
//     console.log("creating default family account");    
//     const { name } = req.params; 
//     const auth = (req as Request & { auth?: { sub?: string } }).auth;
//     const userId = auth?.sub;
//     if (!name) {
//         res.status(400).json({ message: "Name is required" });
//         return;
//     }
//     if (name !== "DefaultAccount"){
//         res.status(400).json({ message: "You can only create DefaultAccount" });
//         return;
//     }

//     try{
//         const newFamilyAccount = await FamilyAccount.create({
//             name: "DefaultAccount",  
//             token: randomBytes(12).toString("base64").replace(/[^a-zA-Z0-9]/g, '').slice(0, 16),
//             users: [userId],
//         });
//         if (!newFamilyAccount) {
//             console.error("Error creating family account");
//             res.status(400).json({ message: "Error creating default family account" });
//             return;
//         }
//         console.log("Default family account created successfully", newFamilyAccount);
//         res.status(200).json({ familyAccount: newFamilyAccount });
//         return;
//     } catch (error) {
//         res.status(500).json({ message: "Internal server error" });
//     }     
 
// });
