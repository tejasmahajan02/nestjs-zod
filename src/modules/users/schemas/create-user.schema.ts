import z from "zod";

export const createUserSchema = z.object({
    name: z.string(),
    age: z.number(),
}).required();

export type CreateUserDto = z.infer<typeof createUserSchema>;