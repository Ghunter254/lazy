import { db } from "./index.js";
import * as schema from "./schema.js";
import { eq, sql } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

interface BaseTable extends PgTable {
  id: PgColumn<any>;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const createBaseRepo = <T extends BaseTable>(table: T) => ({
  async list(options: PaginationOptions = {}): Promise<PaginationResult<any>> {
    const page = Math.max(1, options.page ?? 1);
    const limit = Math.min(100, Math.max(1, options.limit ?? 20));
    const offset = (page - 1) * limit;

    const [data, countResult] = await Promise.all([
      // @ts-ignore
      db.select().from(table).limit(limit).offset(offset),
      db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(table as any),
    ]);

    const total = countResult[0] ? countResult[0].count : 0;
    const totalPages = Math.ceil(total / limit);

    return { data, total, page, limit, totalPages };
  },

  async getById(id: string) {
    // @ts-ignore
    const result = await db.select().from(table).where(eq(table.id, id));
    return result[0];
  },

  async create(data: any) {
    const result = await db.insert(table).values(data).returning();
    return result[0];
  },

  async update(id: string, data: any) {
    // @ts-ignore
    const result = await db
      .update(table)
      .set(data)
      .where(eq(table.id, id))
      .returning();

    return result[0];
  },

  async delete(id: string) {
    // @ts-ignore
    const result = await db.delete(table).where(eq(table.id, id)).returning();
    return result[0];
  },
});

export const repo = {
  students: {
    ...createBaseRepo(schema.students as any),

    async getByUserId(userId: string) {
      const result = await db
        .select()
        .from(schema.students)
        .where(eq(schema.students.userId, userId));

      return result[0];
    },
  },

  users: createBaseRepo(schema.user as any),
};
