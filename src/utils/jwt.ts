import jwt from "jsonwebtoken";
import {env} from "../config/env";

export function sign(data: string) {
    return jwt.sign(
        {},
        env.jwt_secret,
        {
            subject: data,
            expiresIn: Number(env.jwt_expires_in),
        });
}

export function decode(token: string) {
    return jwt.decode(token);
}