import Fastify from "fastify";
import apiRoutes from "./routes";
import { getEnv } from "./utils/env.util";

const PORT = getEnv("PORT") || 3000;
const fastify = Fastify();

fastify.register(apiRoutes, { prefix: "/api" });

fastify.listen({ port: Number(PORT) }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }

  console.log(`server listening on ${address}`);
});