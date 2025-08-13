import { Schema, model } from "mongoose";

const ShoppingListSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    items: [
      {
        item: {
          type: Schema.Types.ObjectId,
          ref: 'Item',
          required: true
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