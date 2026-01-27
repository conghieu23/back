import { Router, Request, Response } from "express";
import {db} from "../db";
import {filter} from "../config/midware";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        filter(req, res, payload => {
            const user = payload?.sub;
            const promise = db.query(`
                select
                    json_build_object(
                            'id', p.id,
                            'name', p.name,
                            'photo', p.photo
                    ) as reference,
                    array_agg(s.data order by s.id) as data,
                    b.price,
                    b.purchasedtime
                from bag b
                         join products p
                              on b.product = p.id
                         left join stack s
                                   on b.id = s.bag
                where b."user" = $1
                group by
                    b.id,
                    p.id,
                    b.price,
                    b.purchasedtime
                order by b.purchasedtime desc;
            `, [user]);
            promise.then(data => {
                res.status(200).json(data.rows ?? []);
            })
        })

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
});

export default router;