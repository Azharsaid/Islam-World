import { db } from "./db";
import {
  feedback,
  type InsertFeedback,
  type Feedback
} from "@shared/schema";

export interface IStorage {
  createFeedback(entry: InsertFeedback): Promise<Feedback>;
}

export class DatabaseStorage implements IStorage {
  async createFeedback(entry: InsertFeedback): Promise<Feedback> {
    const [created] = await db.insert(feedback).values(entry).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
