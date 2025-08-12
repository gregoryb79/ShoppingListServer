import { Schema, model } from "mongoose";

const ItemSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},		
        price: {
            type: Number,
            default: 0
        },		
	},
	{ timestamps: true }
);

export const Item = model('Item', ItemSchema);
