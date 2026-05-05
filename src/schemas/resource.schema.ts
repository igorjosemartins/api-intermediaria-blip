import { z } from "zod";

export const resourceMigrationSchema = z.object({
    tenantId: z.string(),
    originKey: z.string(),
    destinyKey: z.string()
});

export const resourceDeletionSchema = z.object({
    tenantId: z.string(),
    httpKey: z.string()
});