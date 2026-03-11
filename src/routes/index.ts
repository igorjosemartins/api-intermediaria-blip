import { FastifyInstance } from "fastify";
import contactsRoutes from "./contacts.routes";
import transbordoRoutes from "./transbordo.routes";

export default async function apiRoutes(app: FastifyInstance) {
  app.register(contactsRoutes, { prefix: "/contacts" });
  app.register(transbordoRoutes, { prefix: "/transbordo" });
}