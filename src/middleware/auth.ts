import { expressjwt } from "express-jwt";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
dotenv.config({ path: "./.env" });

export function auth() {
    return (expressjwt({
        algorithms: ["HS256"],
        secret: process.env.SESSION_SECRET!,
    }));
}


