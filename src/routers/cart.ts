import { Router, Request, Response } from "express";
import {db} from "../db";
import {filter} from "../config/midware";
import {BaseResponse} from "../model";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const user = payload?.sub;
            await db.query(`
                select json_build_object(
                               'id', p.id,
                               'name', p.name,
                               'photo', p.photo,
                               'price', p.price
                       ) as product, c.quantity, c.id,
                       count(s.id) as stock
                from cart c
                         left join products p
                                   on c.product = p.id
                         left join stack s
                                   on p.id = s.product
                where "user" = $1 and  c.quantity > 0 and s.bag is null
                group  by c.id, p.id
            `, [user]).then(data => {
                res.status(200).json(BaseResponse.build(data.rows));
            })
        })

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
});

router.post('/add', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const user = payload?.sub;
            const {product, quantity, replace} = req.body;
            await db.query(`
                        INSERT INTO cart ("user", product, quantity)
                        VALUES ($1, $2, $3)
                            ON CONFLICT ON CONSTRAINT "unique"
                            DO UPDATE
                                   SET quantity = CASE
                                   WHEN $4 THEN EXCLUDED.quantity
                                   ELSE cart.quantity + EXCLUDED.quantity
                        END`,
                [user, product, quantity , replace ?? false])
                .then(() => {
                res.status(200)
                    .json(BaseResponse.success("Item has been added."));
            }).catch(err => {
                res.status(200).json(BaseResponse.error(err.message));
            })
        })

    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})


router.post('/check-out', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const user = payload?.sub;
            const body = req.body;
            const {items} = body;
            await db.query(`
                    call checkout($1, $2);
                       `,
                [user, items]).then(() => {
                res.status(200).json(BaseResponse
                    .success("Checked out!"));
            }).catch(err => {
                console.error(err);
                res.status(200).json(BaseResponse.error(err.message));
            });
        })
    } catch (err: any) {
        console.error(err);
    }
})

export default router;