import { Schema, model } from "mongoose";

const ShoppingListSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true
      }
    ],
    familyId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyAccount',
      required: true
    }
  },
  { timestamps: true }
);

export const ShoppingList = model('ShoppingList', ShoppingListSchema);