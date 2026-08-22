import { validationResult } from "express-validator";

/**
 * Runs express-validator chains and returns a 400 with collected messages
 * if any validation failed.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    const message = errors
      .array()
      .map((e) => e.msg)
      .join(", ");
    throw new Error(message);
  }
  next();
};
