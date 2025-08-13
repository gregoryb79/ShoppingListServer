
import { expressjwt } from "express-jwt";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

export function auth() {
    return(expressjwt({
        algorithms: ["HS256"],
        secret: process.env.SESSION_SECRET!,
    }));
}