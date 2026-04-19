// Helper to talk to the db

import { db } from "./index.js";
import * as schema from "./schema.js";
import { eq } from "drizzle-orm";
import { PgColumn, PgTable } from "drizzle-orm/pg-core";

interface BaseTable extends PgTable {
  id: PgColumn<{
    name: any;
    tableName: any;
    dataType: any;
    columnType: any;
    data: string;
    driverParam: any;
    notNull: true;
    hasDefault: any;
    enumValues: any;
    baseColumn: any;
    isAutoincrement: boolean;
    isPrimaryKey: boolean;
    hasRuntimeDefault: boolean;
  }>;
}

const createBaseRepo = <T extends BaseTable>(table: T) => ({
  async list() {
    // @ts-ignore
    return await db.select().from(table);
  },
  async getById(id: string) {
    // Assumption here is tables use 'id' as the primary key
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
