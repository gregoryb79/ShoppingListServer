import { Schema, model } from "mongoose";

const UserSchema = new Schema(
    {
        _id: { type: String, required: true },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            unique: true
        },
        password: {
            type: String
        },
        avatar: {
            type: String
        },
        lists: [
            {
                type: String,
                ref: 'ShoppingList'
            }
        ]
    },
    { timestamps: true }
);

export const User = model('User', UserSchema);