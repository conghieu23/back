import {Request, Response, Router} from "express";
import {filter} from "../config/midware";
import {db} from "../db";
import {BaseResponse} from "../model";

const router = Router();
router.get('/', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            await db.query(`
                select photo from banner b where b.hidden = false
            `).then(data => {
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

router.get('/secured', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            await db.query(`
                select * from banner b
            `).then(data => {
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

router.post('/secured', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const {photo} = req.body;
            await db.query(`
                insert into banner(photo)
                values ($1)
                returning *
            `, [photo]).then(data => {
                res.status(200).json(BaseResponse.build(data.rows[0]));
            })
        })

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
});


router.put('/secured', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const {id, photo} = req.body;
            await db.query(`
                update banner
                set photo = $1
                where id = $2
            `, [photo, id]).then(data => {
                res.status(200).json(BaseResponse.success("Updated"));
            })
        })

    } catch (err: any) {
        console.error(err);
        res.status(500).json({
            error: err.message,
        })
    }
});

router.put('/secured/hide', async (req: Request, res: Response) => {
    try {
        filter(req, res, async payload => {
            const { id } = req.body;
            await db.query(`
               update banner
                set hidden = NOT hidden
               where id = $1
            `, [id]).then(data => {
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


export default router;