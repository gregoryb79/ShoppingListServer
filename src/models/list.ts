import { Schema, model } from "mongoose";

const ShoppingListSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: {
      type: String,
      required: true
    },
    items: [
      {
        item: {
          _id: { type: String, required: true },
          name: { type: String, required: true },
          price: { type: Number }
        },
        quantity: {
          type: Number,
          default: 1,
          required: true
        },
        bought: {
          type: Boolean,
          default: false
        }
      }
    ]
  },
  { timestamps: true }
);

export const ShoppingList = model('ShoppingList', ShoppingListSchema, 'lists');