import { Request, Response, Router } from "express";

export const router = Router()

router.get('/', async (_: Request, res: Response) => {
    res.end();
});
