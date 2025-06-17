import { body } from "express-validator";

export const leedValidationRules = [
  body("name").notEmpty().withMessage("Name is required"),
  body("mobile").isNumeric().withMessage("Mobile must be a number"),
  body("email").isEmail().withMessage("Invalid email"),
  body("requirement").notEmpty().withMessage("Requirement is required"),
  body("message").notEmpty().withMessage("Message is required"),
];
