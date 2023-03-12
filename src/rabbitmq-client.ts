import amqp, { Channel, Connection } from 'amqplib';

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

  public async getChannel(): Promise<Channel> {
    if (!this.channel) {
      await this.connect();
    }
    return this.channel!;
  }
}

export default RabbitMQClient.getInstance();