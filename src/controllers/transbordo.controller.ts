import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { transbordoAuthSchema, transbordoSchema } from "../schemas/transbordo.schema";
import { attendantsMigration, getMissingTags, repliesMigration, transbordoDeletion, transbordoMigration } from "../services/transbordo.service";

export const migrateTransbordo = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { origin, destiny } = zodResult.data;

  try {
    const results = await transbordoMigration(origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const migrateAttendants = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { origin, destiny } = zodResult.data;

  try {
    const results = await attendantsMigration(origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const migrateTags = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { origin, destiny } = zodResult.data;

  try {
    const results = await getMissingTags(origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const migrateReplies = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { origin, destiny } = zodResult.data;

  try {
    const results = await repliesMigration(origin, destiny);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const deleteTransbordo = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoAuthSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, httpKey } = zodResult.data;

  try {
    const results = await transbordoDeletion(tenantId, httpKey);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};