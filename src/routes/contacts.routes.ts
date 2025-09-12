import { FastifyInstance } from "fastify";
import { upsertContacts } from "../controllers/contacts.controller";

export default async function contactsRoutes (app: FastifyInstance) {
  app.post("/upsert", upsertContacts);
};