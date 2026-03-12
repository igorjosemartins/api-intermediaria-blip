import { z } from "zod";

const transbordoAuthSchema = z.object({
    tenantId: z.string(),
    httpKey: z.string(),
    transbordoId: z.string()
});

export const transbordoSchema = z.object({
    origin: transbordoAuthSchema,
    destiny: transbordoAuthSchema
});

export type TransbordoAuthSchema = z.infer<typeof transbordoAuthSchema>;