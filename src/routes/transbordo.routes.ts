import { FastifyInstance } from "fastify";
import { deleteAttendants, deleteQueuePriorities, deleteQueueRules, deleteReplies, deleteTransbordo, getQueues, migrateAttendants, migrateReplies, migrateTags, migrateTransbordo } from "../controllers/transbordo.controller";

export default async function transbordoRoutes(app: FastifyInstance) {
  app.register(migrationRoutes, { prefix: "/migrate" });
  app.register(deleteRoutes);
  app.register(getRoutes);
}

async function migrationRoutes(app: FastifyInstance) {
  app.post("/all", migrateTransbordo);
  app.post("/attendants", migrateAttendants);
  app.post("/tags", migrateTags);
  app.post("/replies", migrateReplies);
}

async function deleteRoutes(app: FastifyInstance) {
  app.delete("/all", deleteTransbordo);
  app.delete("/attendants", deleteAttendants);
  app.delete("/queue-priorities", deleteQueuePriorities);
  app.delete("/queue-rules", deleteQueueRules);
  app.delete("/replies", deleteReplies);
}

async function getRoutes(app: FastifyInstance) {
  app.get("/queues", getQueues);
}