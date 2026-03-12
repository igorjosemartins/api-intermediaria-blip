import { FastifyInstance } from "fastify";
import { deleteTransbordo, migrateAttendants, migrateReplies, migrateTags, migrateTransbordo } from "../controllers/transbordo.controller";

export default async function transbordoRoutes(app: FastifyInstance) {
  app.register(migrationRoutes, { prefix: "/migrate" });
  app.register(deleteRoutes);
};

async function migrationRoutes(app: FastifyInstance) {
  app.post("/all", migrateTransbordo);
  app.post("/attendants", migrateAttendants);
  app.post("/tags", migrateTags);
  app.post("/replies", migrateReplies);
}

async function deleteRoutes(app: FastifyInstance) {
  app.delete("/all", deleteTransbordo);
}