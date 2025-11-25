import type { Request, Response, NextFunction } from "express";

interface AsyncHandler {
    (req: Request, res: Response, next: NextFunction) : Promise<void>
}

export default (fn: AsyncHandler) => (req: Request, res: Response, next: NextFunction) => { 
    Promise.resolve(fn(req, res, next))
    .catch((error) => next(error));
};