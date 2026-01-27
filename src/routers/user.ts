import { Router, Request, Response } from "express";
import {db} from "../db";
import {sign} from "../utils/jwt";
import verify from "../utils/google";
import {randomUUID} from "node:crypto";
import {filter} from "../config/midware";

interface User {
    id: string;
    name: string;
}

const router = Router();

router.get('/me', async (req: Request, res: Response) => {
    try {
        filter(req, res, payload => {
            const id = payload?.sub;
            const promise = db.query("SELECT * FROM users" +
                " WHERE id = $1", [id]);
            promise.then(data => {
                res.status(200).json(data.rows[0]);
            })
        });
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.post('/oauth/google', async (req: Request, res: Response) => {
    try {
        const {idToken} = req.body;
        if (!idToken) {
            res.status(400).json({
                error: "Id token is required"
            })
        }
        const payload = await verify(idToken);
        const email = payload?.email;
        const promise = db.query(
            "SELECT * FROM users where email = $1", [email]);
        promise.then(data => {
            const rows = data.rows;
            let id;
            if (rows.length > 0) {
                id = rows[0].id;
            } else {
                id = register(email!);
            }

            res.status(200).json({
                token: sign(id)
            });
        })
    } catch (err: any) {
        console.error(err);
        res.status(400).json({
            error: err.message,
        });
    }
})

async function register(email: string) {
    try {
        const promise = db.query(
            "INSERT INTO users" +
            "VALUES($1, $2)" +
            "RETURN id",
            [randomUUID(), email]);
        promise.then(data => {
            const rows = data.rows;
            if (rows.length > 0) {
                return rows[0].id;
            }
        })
    } catch (err: any) {
        console.error(err);
    }
}
export default router;
