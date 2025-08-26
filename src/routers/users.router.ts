import express from 'express';
import { User } from '../models/user';
import { ShoppingList } from '../models/list';
import jwt from "jsonwebtoken";
import { createHash, hash } from "crypto";
import { auth } from '../middleware/auth';
import { FamilyAccount } from '../models/familyAccount';
import { randomBytes } from "crypto";
import { Request } from "express";
export const router = express.Router();

const TOKEN_EXPIRATION = process.env.TOKEN_EXPIRATION || "30d";

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
        const user = await User.findById(userId).populate('lists').select('-__v');
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/register",auth(), async (req, res) => {
    const { username, email, password, currentUserId} = req.body;
    console.log("registering user", username, email, currentUserId);
    if (!username || !email || !password || !currentUserId) {
        res.status(400).json({ message: "Username, email, password, and currentUserId are required" });
        return;
    }
    try {
        const existingUser = await User.findById(currentUserId).populate('lists').select('-__v');
        if (!existingUser) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        existingUser.name = username;
        existingUser.email = email;
        existingUser.password = hashPasswordWithSalt(password, existingUser._id.toString());
        await existingUser.save();
        const token = createToken(existingUser._id.toString(), existingUser.email ?? "", TOKEN_EXPIRATION);
        res.status(201).json({ user: existingUser, token });
        console.log("User registered successfully", existingUser.name);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: "Email and password are required" });
        return;
    }
    try {
        const user = await User.findOne({ email }).populate('lists').select('-__v');
        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }
        const isMatch = user.password === hashPasswordWithSalt(password, user._id.toString());
        if (!isMatch) {
            res.status(401).json({ message: "Invalid password" });
            return;
        }
        const token = createToken(user._id.toString(), user.email ?? "", TOKEN_EXPIRATION);
        res.status(200).json({ user, token });
        console.log("User logged in successfully", user.name);
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
});

router.post("/", async (req, res) => {
    console.log("creating default user");
    const newUser = req.body;
    console.log("newUser", newUser);
    if (!newUser) {
        res.status(400).json({ message: "New user data is required" });
        return;
    }
    if (newUser.name !== "DefaultUser"){
        res.status(400).json({ message: "You can only create DefaultUser" });
        return;
    }

    const createdUser = await User.create(newUser);
    if (!createdUser) {
        console.error("Error creating user");
        res.status(400).json({ message: "Error creating default user" });
        return;
    }
    const token = createToken(createdUser._id.toString(), createdUser.email ?? "", "100y");
    res.status(200).json({user: createdUser, token});
    
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
    console.log("Updating user with:", user.name, user._id, user.lists.length);
    const updatedUser = await User.findByIdAndUpdate(user._id, user, { new: true });

    if (!updatedUser) {
        console.error("Error updating user");
        res.status(400).json({ message: "Error updating user" });
        return;
    }

    console.log("User updated successfully", updatedUser.name);
    res.sendStatus(200);    
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
