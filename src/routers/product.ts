import { Router, Request, Response } from "express";
import {db} from "../db";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const promise = db.query("select p.id, p.name" +
            ", p.photo, p.description, p.price" +
            " from products p");
        promise.then(data => {
            res.status(200).json(data.rows);
        })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.post('/secured', async (req: Request, res: Response) => {
    try {
        const {name, photo, description, price} = req.body;
        const promise = db.query(`
            insert into products(name, photo, description, price)
            values ($1, $2, $3, $4)`, [name, photo, description, price]);
        promise.then(data => {
            res.status(200).json(data.rows);
        })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.put('/secured', async (req: Request, res: Response) => {
    try {
        const {id, name, photo, description, price} = req.body;
        const promise = db.query(`
            update products
            set name = $1, photo = $2
            ,description = $3, price = $4
            where id = $5`,
            [name, photo, description, price, id]);
        promise.then(data => {
            res.status(200).json(data.rows);
        })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.get('/secured', async (req: Request, res: Response) => {
    try {
        const promise = db.query(`
            select json_build_object(
                           'id', p.id,
                           'name', p.name,
                            'description', p.description,
                           'photo', p.photo,
                           'price', p.price
                   ) as product, coalesce(count(s.id), 0) as stock,
                   coalesce(sum(case when s.bag is not null then 1 else 0 end), 0) as sold
            from products p
                     left join stack s
                               on p.id = s.product
            group by p.id`);
        promise.then(data => {
            res.status(200).json(data.rows);
        })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.post('/secured/stack', async (req: Request, res: Response) => {
    try {
        const { product, set } = req.body;

        const promise = db.query(`
            insert into stack (product, data)
            select $1::int, unnest($2::text[])
            returning *
        `, [product, set]);

        promise.then(data => {
            res.status(200).json({
                inserted: data.rows[0]
            });
        })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})
export default router;
