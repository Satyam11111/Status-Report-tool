const { z } = require("zod");

//creating object schema
const registerSchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .trim()
    .min(3, { message: "Name at least of 3 characters" })
    .max(255, { message: "Name must not be more than 255 characters" }),

  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email({ message: "Invalid Email" })
    .max(255, { message: "email must not be more than 255 characters" }),

  password: z
    .string({ required_error: "password is required" })
    .trim()
    .min(5, { message: "password at least of 5 characters" })
    .max(25, { message: "password must not be more than 25 characters" }),

  role: z.string({ required_error: "role is required" }).trim(),
  scrumTeam: z
    .array(z.string({ required_error: "Scrum team must be a string" }))
    .nonempty({ message: "At least one scrum team is required" }), // Array of strings validation
});

//login schema for validation
const loginSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .trim()
    .email({ message: "Invalid Email" })
    .max(255, { message: "email must not be more than 255 characters" }),

  password: z
    .string({ required_error: "password is required" })
    .trim()
    .min(5, { message: "password at least of 5 characters" })
    .max(25, { message: "password must not be more than 25 characters" }),
});

module.exports = { registerSchema, loginSchema };
