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
        familyId: {
            type: Schema.Types.ObjectId,
            ref: 'FamilyAccount',
            required: true
        }
    },
    { timestamps: true }
);

export const User = model('User', UserSchema);