import { Schema, model } from "mongoose";

const UserSchema = new Schema(
    {
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
        privateLists: [
            {
                type: Schema.Types.ObjectId,
                ref: 'ShoppingList'
            }
        ]
    },
    { timestamps: true }
);

export const User = model('User', UserSchema);