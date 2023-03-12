const { v4: uuidv4 } = require("uuid");

import { AddAccountDTO } from "./types";
import RabbitMQClient from "./rabbitmq-client";
import { database } from "./models";

// Define the create user command
interface ICreateUserCommand {
  type: "create-account";
  payload: {
    name: string;
    balance: number;
  };
}

// Define the user created event
interface IUserCreatedEvent {
  type: "account-created";
  payload: {
    id: string;
    name: string;
    balance: number;
  };
}

const queue = "kiba";

class CommandHandlers {
  async createAccount(command: ICreateUserCommand) {
    const { name, balance } = command.payload;

    // TODO: validate command
    const student = await database.getAccountByName(name);
    if (student) throw new Error(`Account with name ${name} already exists`);

    const id = uuidv4();
    // TODO: write data to write model
    await database.createAccount({ ...command.payload, id });

    // Create the user created event
    const event: IUserCreatedEvent = {
      type: "account-created",
      payload: {
        id,
        name,
        balance,
      },
    };

    // TODO: move this to rabbit module
    const channel = await RabbitMQClient.getChannel();
    const message = JSON.stringify(event);
    channel.sendToQueue(queue, Buffer.from(message));
    return event;
  }
}

export default new CommandHandlers();
