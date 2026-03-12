import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { migrateTransbordoSchema } from "../schemas/transbordo.schema";
import { attendantsMigration, getMissingTags, repliesMigration, transbordoMigration } from "../services/transbordo.service";

export const migrateTransbordo = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = migrateTransbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, origin, destiny } = zodResult.data;

  try {
    const results = await transbordoMigration(tenantId, origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const migrateAttendants = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = migrateTransbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, origin, destiny } = zodResult.data;

  try {
    const results = await attendantsMigration(tenantId, origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const migrateTags = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = migrateTransbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, origin, destiny } = zodResult.data;

  try {
    const results = await getMissingTags(tenantId, origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const migrateReplies = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = migrateTransbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, origin, destiny } = zodResult.data;

  try {
    const results = await repliesMigration(tenantId, origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};