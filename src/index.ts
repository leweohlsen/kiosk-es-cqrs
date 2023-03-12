import Fastify from "fastify";

import { AddAccountDTO } from "./types";
import { validateAddAccount } from "./validators";
import commandHandlers from "./commands";

const fastify = Fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
});

fastify.get("/", async (request, reply) => {
  return { message: "Hello, world!" };
});

fastify.post("/account", async (request, reply) => {
  const payload = request.body as AddAccountDTO;
  validateAddAccount(payload);
  const publishedEvent = await commandHandlers.createAccount({
    type: "create-account",
    payload: {
      name: payload.name,
      balance: payload.balance,
    },
  });
  return { accountId: publishedEvent.payload.id };
});

/**
 * Run the server!
 */
const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
