import amqp, { Channel, Connection } from 'amqplib';
import { Event } from './commands';

const rabbitMQUrl = 'amqp://username:password@localhost:5672';
const queue = 'kiba';

class RabbitMQClient {
  private static instance: RabbitMQClient;
  private connection: Connection | null = null;
  private channel: Channel | null = null;


  public static getInstance(): RabbitMQClient {
    if (!RabbitMQClient.instance) {
      RabbitMQClient.instance = new RabbitMQClient();
    }
    return RabbitMQClient.instance;
  }

  public async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await amqp.connect(rabbitMQUrl);
      this.channel = await this.connection.createChannel();
      await this.channel.assertQueue(queue);
    }
  }

  private async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect();
    }
    return this.channel!;
  }

  public async publish(event: Event): Promise<void> {
    const channel = await this.getChannel();
    const message = JSON.stringify(event);
    channel.sendToQueue(queue, Buffer.from(message));
  }
}

export default RabbitMQClient.getInstance();