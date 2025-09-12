import { FastifyInstance } from "fastify";
import contactsRoutes from "./contacts.routes";

export default async function apiRoutes(app: FastifyInstance) {
  app.register(contactsRoutes, { prefix: "/contacts" });
}