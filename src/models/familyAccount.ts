import { Schema, model } from "mongoose";

const FamilyAccountSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true,
      unique: true
    },
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    lists: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ShoppingList'
      }
    ]
  },
  { timestamps: true }
);

export const FamilyAccount = model('FamilyAccount', FamilyAccountSchema);