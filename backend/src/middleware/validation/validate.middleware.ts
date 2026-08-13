import type { RequestHandler } from "express";
import { z, type ZodType } from "zod";

type ValidateOptions = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(options: ValidateOptions): RequestHandler {
  return (req, _res, next) => {
    try {
      if (options.body) {
        req.body = options.body.parse(req.body);
      }

      if (options.params) {
        req.params = options.params.parse(req.params) as typeof req.params;
      }

      if (options.query) {
        req.validatedQuery = options.query.parse(req.query);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        next(error);
        return;
      }

      next(error);
    }
  };
}
