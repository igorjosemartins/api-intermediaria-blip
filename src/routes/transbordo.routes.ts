import { FastifyInstance } from "fastify";
import { migrateAttendants, migrateTransbordo } from "../controllers/transbordo.controller";

export default async function transbordoRoutes (app: FastifyInstance) {
  app.post("/migrate", migrateTransbordo);
  app.post("/migrate/attendants", migrateAttendants);
};