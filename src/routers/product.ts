import { Router, Request, Response } from "express";
import {db} from "../db";
import {BaseResponse} from "../model";

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const {category} = req.query;
        await db.query(`
            SELECT
                p.id,
                p.name,
                p.photo,
                p.price,
                COUNT(CASE WHEN s.bag IS NOT NULL THEN 1 END) AS sold,
                COUNT(CASE WHEN s.bag IS NULL THEN 1 END) = 0 AS sold_out
            FROM products p
            LEFT JOIN stack s
            ON p.id = s.product
            where $1 = 0 or p.category = $1
            GROUP BY p.id;
        `, [category])
            .then(data => {
            res.status(200).json(BaseResponse.build(data.rows));
        }).catch(err => {
            res.status(200).json(BaseResponse.error(err.message));
        })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.get('/categories', async (req: Request, res: Response) => {
    try {
        await db.query(`
            select * from categories`)
            .then(data => {
                res.status(200).json(BaseResponse.build(data.rows));
            }).catch(err => {
                console.log(err);
                res.status(200).json(BaseResponse.error(err.message));
            })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.post('/category/create', async (req: Request, res: Response) => {
    try {
        const {category} = req.body;
        await db.query(`
            insert into categories(name)
            values($1) returning *`, [category])
            .then(data => {
                res.status(200).json(BaseResponse.build(data.rows[0]));
            }).catch(err => {
                console.log(err);
                res.status(200).json(BaseResponse.error(err.message));
            })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})

router.get('/get/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params['id'];
        await db.query(`
            select p.id, p.name,
                   p.description,
                   p.photo, p.price,
                   coalesce(count(s.id), 0) as stock
            from products p
                     left join stack s
                               on p.id = s.product and s.bag is null
            where p.id = $1
            group by p.id
            limit 1`, [id])
            .then(data => {
                res.status(200).json(BaseResponse.build(data.rows[0]));
            }).catch(err => {
                console.error(err);
                res.status(200).json(BaseResponse.error(err.message));
            })
    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})

router.post('/secured', async (req: Request, res: Response) => {
    try {
        const {name, photo, description, price, category} = req.body;
        await  db.query(`
            insert into products(name, photo, description, price, category)
            values ($1, $2, $3, $4, $5)`, [name, photo, description, price, category])
        .then(data => {
            res.status(200).json(BaseResponse.build(data));
        }).catch(err => {
            res.status(200).json(BaseResponse.error(err.message));
        });
    } catch (err: any) {
        console.error(err);
        res.status(200).json({});
    }
})

router.put('/secured', async (req: Request, res: Response) => {
    try {
        const {id, name, photo, description, price, category} = req.body;
        await db.query(`
            update products
            set name = $1, photo = $2
            ,description = $3, price = $4, category = $5
            where id = $6`,
            [name, photo, description, price, category, id]).then(data => {
                res.status(200).json(BaseResponse.build(data));
        });
    } catch (err: any) {
        console.error(err);
        res.status(500);
    }
})

router.get('/secured', async (req: Request, res: Response) => {
    try {
        const {category} = req.query;
        await db.query(`
            select json_build_object(
                           'id', p.id,
                           'name', p.name,
                            'description', p.description,
                           'photo', p.photo,
                           'price', p.price,
                            'category', p.category
                   ) as product, coalesce(count(s.id), 0) as stock,
                   coalesce(sum(case when s.bag is not null then 1 else 0 end), 0) as sold
            from products p
                     left join stack s
                               on p.id = s.product
            where $1 = 0 or p.category = $1
            group by p.id`, [category ?? null]).then(data => {
                res.status(200).json(BaseResponse.build(data.rows));
        }).catch(err => {
            res.status(200).json(BaseResponse.error(err.message));
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

        await db.query(`
            insert into stack (product, data)
            select $1::int, unnest($2::text[])
            returning *
        `, [product, set]).then(data => {
            res.status(200).json(BaseResponse.success(`Inserted ${data.rowCount}.`));
        }).catch(err => {
            res.status(200).json(BaseResponse.error(err.message));
        })
    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
})
export default router;
