import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { resourceDeletion, resourceMigration } from "../services/resource.service";
import { resourceDeletionSchema, resourceMigrationSchema } from "../schemas/resource.schema";

export const migrateResources = async (req: FastifyRequest, reply: FastifyReply) => {
    const zodResult = resourceMigrationSchema.safeParse(req.body);

    if (!zodResult.success) {
        return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
    }

    const { tenantId, originKey, destinyKey } = zodResult.data;

    try {
        const results = await resourceMigration(tenantId, originKey, destinyKey);

        return reply.status(200).send(results);

    } catch (e) {
        return reply.status(500).send({ error: (e as Error).message });
    }
};

export const deleteResources = async (req: FastifyRequest, reply: FastifyReply) => {
    const zodResult = resourceDeletionSchema.safeParse(req.body);

    if (!zodResult.success) {
        return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
    }

    const { tenantId, httpKey } = zodResult.data;

    try {
        const results = await resourceDeletion(tenantId, httpKey);

        return reply.status(200).send(results);

    } catch (e) {
        return reply.status(500).send({ error: (e as Error).message });
    }
};