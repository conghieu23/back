import jwt, {JwtPayload} from "jsonwebtoken";
import { Request, Response } from "express";

export function filter(req: Request, res: Response,
                       callback: (payload: (JwtPayload | string | null)) => void) {
    const header = req.headers;
    const auth = header.authorization;

    if (auth) {
        const token = auth.split(" ")[1];
        if (token) {
            const payload = jwt.decode(token);
            callback(payload);
        } else {
            throw catchIssue(res);
        }
    } else {
        throw catchIssue(res);
    }
}

function catchIssue(res: Response) {
    res.status(401).json({
        message: "Authentication failed",
    })
}