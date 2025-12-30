import express from "express";
import {ApiError} from "@/utils/ApiError";
import {z} from "zod";

export type ValidateSource = 'body' | 'query' | 'params' | 'all';

export class RequestValidator {
    static validate = (schema: z.ZodSchema, source: ValidateSource = 'body') => {
        return (req: express.Request, res: express.Response, next: express.NextFunction) => {
            try {
                let dataToValidate: any;

                switch (source) {
                    case 'body':
                        dataToValidate = req.body;
                        break;
                    case 'query':
                        dataToValidate = {
                            ...req.query,
                            limit: req.query.limit ? Number(req.query.limit) : undefined
                        };
                        break;
                    case 'params':
                        dataToValidate = req.params;
                        break;
                    case 'all':
                        dataToValidate = {
                            ...req.body,
                            ...req.query,
                            ...req.params
                        };
                        break;
                }

                req.body = schema.parse(dataToValidate);
                next();
            } catch (error) {
                if (error instanceof z.ZodError) {
                    const validationError = new ApiError(error.issues.map(issue => ({
                        field: issue.path.join('.'),
                        message: issue.message,
                        code: issue.code
                    })), 400, "Validation failed");

                    return res.status(400).json(validationError);
                }
                next(error);
            }
        };
    };
}
