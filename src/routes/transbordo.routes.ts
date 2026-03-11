import { FastifyInstance } from "fastify";
import { migrateTransbordo } from "../controllers/transbordo.controller";

export default async function transbordoRoutes (app: FastifyInstance) {
  app.post("/migrate", migrateTransbordo);
};