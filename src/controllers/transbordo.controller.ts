import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { transbordoAuthSchema, transbordoSchema } from "../schemas/transbordo.schema";
import { 
  attendantsDeletion, 
  attendantsMigration,
  getMissingTags,
  prioritiesDeletion,
  repliesDeletion,
  repliesMigration,
  rulesDeletion,
  transbordoDeletion,
  transbordoMigration
} from "../services/transbordo.service";
import { getAttendanceQueues, getTags } from "../clients/blip/transbordo.requests";

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

export const deleteAttendants = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoAuthSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, httpKey } = zodResult.data;

  try {
    const results = await attendantsDeletion(tenantId, httpKey);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const deleteQueuePriorities = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoAuthSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, httpKey } = zodResult.data;

  try {
    const results = await prioritiesDeletion(tenantId, httpKey);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const deleteQueueRules = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoAuthSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, httpKey } = zodResult.data;

  try {
    const results = await rulesDeletion(tenantId, httpKey);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const deleteReplies = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoAuthSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, httpKey } = zodResult.data;

  try {
    const results = await repliesDeletion(tenantId, httpKey);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const getQueues = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoAuthSchema.safeParse(req.query);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, httpKey } = zodResult.data;

  try {
    const results = await getAttendanceQueues(tenantId, httpKey);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};

export const getTransbordoTags = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = transbordoAuthSchema.safeParse(req.query);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { tenantId, httpKey } = zodResult.data;

  try {
    // const results = await getTags(tenantId, httpKey);
    // return reply.status(200).send(results);
    
    const { status, items } = await getTags(tenantId, httpKey);

    const filteredItems = items.filter(tag => !tag.toLowerCase().includes("transf"));

    // const filteredArray = originTags.items.filter(tag => !tag.toLowerCase().includes("transf"));
    
    return reply.status(200).send({ status, tags: filteredItems.join(", "), filteredItems, items });

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};