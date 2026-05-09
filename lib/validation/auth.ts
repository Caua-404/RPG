import { z } from "zod"

export const loginSchema = z.object({
  user: z.string().min(3).max(40).transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1),
})

export const userLookupSchema = z.object({
  user: z.string().min(3).max(40).transform((v) => v.trim().toLowerCase()),
})

export const setPasswordSchema = z.object({
  user: z.string().min(3).max(40).transform((v) => v.trim().toLowerCase()),
  password: z
    .string()
    .min(12, "A senha precisa ter no mínimo 12 caracteres.")
    .regex(/[a-z]/, "A senha precisa ter pelo menos 1 letra minúscula.")
    .regex(/[A-Z]/, "A senha precisa ter pelo menos 1 letra maiúscula.")
    .regex(/[0-9]/, "A senha precisa ter pelo menos 1 número.")
    .regex(/[^A-Za-z0-9]/, "A senha precisa ter pelo menos 1 símbolo."),
})

