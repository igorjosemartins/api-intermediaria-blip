import { FastifyInstance } from "fastify";
import { deleteResources, migrateResources } from "../controllers/resource.controller";

export default async function resourceRoutes (app: FastifyInstance) {
  app.post("/migrate", migrateResources);
  app.delete("/all", deleteResources);
};