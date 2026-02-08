import { Router, Request, Response } from "express";
import {db} from "../db";
import {filter} from "../config/midware";
import {randomUUID} from "node:crypto";
import {callback, createInvoice} from "../utils/fpayment";
import {BaseResponse} from "../model";

const router = Router();

router.post('/create', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const user = payload?.sub;
            const {amount} = req.body;
            await db.query(`
                insert into invoices(reference, "user", amount)
                values ($1, $2, $3)
                returning reference;
            `, [randomUUID(), user, amount]).then(data => {
                const row = data.rows[0];
                createInvoice(row.reference, amount)
                    .then(resp => {
                        console.log(resp);
                        if (resp.status === "success") {
                            res.status(200).json(
                                BaseResponse.build({
                                    redirect: resp.data.url_payment,
                                })
                            )
                        } else {
                            res.status(200).json(BaseResponse.error(resp.msg))
                        }
                    })
            })
        })

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
});

router.get('/callback', async (req: Request, res: Response) => {
    try {
        await callback(req.query)
            .then(async data => {
            if (data.success) {
                await db.query(`
                    call addcredit($1)
                `, [data.reference])
                    .then(data => {
                        res.status(200);
                    })
                    .catch(err => console.log(err));
            }
        });
    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})

export default router;