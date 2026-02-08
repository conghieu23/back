import { Router, Request, Response } from "express";
import {db} from "../db";
import {sign} from "../utils/jwt";
import verify from "../utils/google";
import {randomUUID} from "node:crypto";
import {filter} from "../config/midware";
import {BaseResponse} from "../model";
import {send} from "../utils/mailer";

interface User {
    id: string;
    name: string;
}

const router = Router();

router.get('/me', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const id = payload?.sub;
            await db.query("SELECT * FROM users" +
                " WHERE id = $1", [id])
                .then(data => {
                    res.status(200).json(BaseResponse.build(data.rows[0]));
            })
        });
    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})

router.post('/register', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        await db.query(`
            insert into users(id, email, password)
            values($1, $2, $3)
        `, [randomUUID(), email, password])
            .then(data => {
                sendOtp(email);
                res.status(200)
                    .json(BaseResponse.success("Otp is sent," +
                    " please exam your email."));
            }).catch(err => {
                res.status(200).json(BaseResponse.error(err.message));
            });
    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})

router.post('/login', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body;
        await db.query(`
            select id, verified from users where email = $1 and password = $2
        `, [email, password])
            .then(data => {
                if (data.rowCount && data.rowCount > 0) {
                    const row = data.rows[0];
                    if (row.verified) {
                        sendOtp(email);
                        res.status(200)
                            .json(BaseResponse.build({
                                token: sign(row.id)
                            },  "Authenticated!"));
                    } else {
                        res.status(200)
                            .json(BaseResponse.build({
                                needVerify: true,},
                                "Your account needs " +
                                "email verification!"));
                    }

                } else {
                    res.status(200).json(BaseResponse
                        .error("Incorrect email or password."));
                }
            }).catch(err => {
                res.status(200).json(BaseResponse.error(err.message));
            });
    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})


router.post('/verify-otp', async (req: Request, res: Response) => {
    try {
        const {email, otp} = req.body;
        await db.query(`
            select verifyotp($1, $2) as id
        `, [email, otp])
            .then(data => {
                const rows = data.rows;
                let id = rows[0].id;
                res.status(200).json(BaseResponse.build({
                    token: sign(id),
                }, "Authenticated!"));
            }).catch(err => {
                console.error(err);
                res.status(200).json(BaseResponse.error(err.message));
            });
    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})

router.get('/send-otp', async (req: Request, res: Response) => {
    try {
        const email = req.query.email as string | undefined;
        if (email) {
            sendOtp(email).then(() =>
                res.status(200).json(BaseResponse.success("Otp is sent.")))
                .catch(err => {
                    res.status(200).json(BaseResponse.error(err.message));
                })
        } else {
            res.status(500)
        }

    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})

async function sendOtp(email: string) {
    const otp = random();
    await db.query(`
            update users
            set code = $1, requestedTime = $2
            where email = $3
        `, [otp, new Date(), email])
        .then(data => {
            send(email, 'Otp for email verification',
                `Your otp is ${otp}`,)
        })
}

function random(length: number = 6): string {
    return Math.random().toString(36)
        .slice(2, 2 + length);
}

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
        await db.query(
            "SELECT * FROM users where email = $1", [email])
            .then(data => {
            const rows = data.rows;
            let id;
            if (rows.length > 0) {
                id = rows[0].id;
            } else {
                id = register(email!);
            }
            res.status(200).json(sign(id));
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
        await db.query(
            "INSERT INTO users" +
            "VALUES($1, $2)" +
            "returning id",
            [randomUUID(), email])
            .then(data => {
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
