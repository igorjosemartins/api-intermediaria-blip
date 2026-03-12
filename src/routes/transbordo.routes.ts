import { FastifyInstance } from "fastify";
import { migrateAttendants, migrateReplies, migrateTags, migrateTransbordo } from "../controllers/transbordo.controller";

export default async function transbordoRoutes(app: FastifyInstance) {
  app.register(migrationRoutes, { prefix: "/migrate" });
};

async function migrationRoutes(app: FastifyInstance) {
  app.post("/transbordo", migrateTransbordo);
  app.post("/attendants", migrateAttendants);
  app.post("/tags", migrateTags);
  app.post("/replies", migrateReplies);
}

async function deleteRoutes(app: FastifyInstance) {
  // app.delete("/transbordo");
}