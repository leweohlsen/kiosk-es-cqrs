import mongoose from "mongoose";

interface Account {
  id: string;
  name: string;
  balance: number;
}

interface IDatabase {
  getAccount(id: string): Promise<Account>;
  createAccount(account: Account): Promise<void>;
}

class DatabaseImpl implements IDatabase {
  private static instance: DatabaseImpl;

  private writeModel: mongoose.Model<mongoose.Document<Account>>;

  private constructor() {
    this.connectToDatabase();

    // Define the account schema
    const accountSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
      balance: {
        type: Number,
        required: true,
        default: 0,
      },
    });

    this.writeModel = mongoose.model<mongoose.Document<Account>>(
      "Account",
      accountSchema
    );
  }

  private connectToDatabase() {
    mongoose
      .connect("mongodb://root:password@localhost:27017/kiba?authSource=admin")
      .then(() => console.log("Connected to database"))
      .catch((err) => console.error(`Failed to connect to database: ${err}`));
  }

  static getInstance(): DatabaseImpl {
    if (!DatabaseImpl.instance) {
      DatabaseImpl.instance = new DatabaseImpl();
    }
    return DatabaseImpl.instance;
  }

  async getAccount(id: string): Promise<Account> {
    const account = await this.writeModel.findOne({ id });
    if (!account) {
      throw new Error(`Account with id ${id} not found`);
    }
    return account.toObject() as Account;
  }

  async createAccount(account: Account): Promise<void> {
    await new this.writeModel(account).save();
  }
}

export const database = DatabaseImpl.getInstance();
