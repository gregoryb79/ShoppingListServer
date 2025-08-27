import "dotenv/config";
import dotenv from "dotenv";

import { createServer } from "http";
import mongoose from "mongoose";
import { app } from "./app";
import { deleteIdleDefaultUsers } from "./dbhandling";

dotenv.config({ path: "../.env" });
const server = createServer(app);
const port = process.env.PORT || 5000;

async function init() {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.CONNECTION_STRING!, {
        dbName: process.env.DB_NAME,
    });
    console.log("Connected to MongoDB!");

    await deleteIdleDefaultUsers();

    server.listen(port, () => console.log(`Server listening on port ${port}`));
}

init();