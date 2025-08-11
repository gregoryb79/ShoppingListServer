import { Schema, model } from "mongoose";

const ItemSchema = new Schema(
	{
		name: {
			type: String,
			required: true
		},
		quantity: {
			type: Number,
			default: 1
		},
        price: {
            type: Number,
            default: 0
        },
		checked: {
			type: Boolean,
			default: false
		}
	},
	{ timestamps: true }
);

export const Item = model('Item', ItemSchema);
