import { z } from "zod";

const migrationSchema = z.object({
    httpKey: z.string(),
    transbordoId: z.string()
});

export const migrateTransbordoSchema = z.object({
    tenantId: z.string(),
    origin: migrationSchema,
    destiny: migrationSchema
});

export type MigrationSchema = z.infer<typeof migrationSchema>;