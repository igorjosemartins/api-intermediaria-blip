import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { upsertContactsSchema } from "../schemas/contacts.schema";
import { upsertMultipleContacts } from "../services/contacts.service";

export const upsertContacts = async (req: FastifyRequest, reply: FastifyReply) => {
  const zodResult = upsertContactsSchema.safeParse(req.body);

  if (!zodResult.success) {
    return reply.status(400).send({ error: z.prettifyError(zodResult.error) });
  }

  const { contacts } = zodResult.data;

  try {
    const results = await upsertMultipleContacts(contacts);
    
    return reply.status(200).send(results);

  } catch (e) {
    return reply.status(500).send({ error: (e as Error).message });
  }
};