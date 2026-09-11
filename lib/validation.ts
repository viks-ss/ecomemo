import { z } from "zod";

export const emailSchema = z
  .string()
  .min(1, "Inserisci la tua email.")
  .email("Inserisci un indirizzo email valido.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Inserisci la password."),
});

export const registerSchema = z
  .object({
    email: emailSchema,
    password: z
      .string()
      .min(1, "Inserisci una password.")
      .min(8, "La password deve avere almeno 8 caratteri."),
    confirmPassword: z.string().min(1, "Conferma la password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono.",
    path: ["confirmPassword"],
  });

export const registerApiSchema = z.object({
  email: emailSchema,
  password: z.string().min(8, "La password deve avere almeno 8 caratteri."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
