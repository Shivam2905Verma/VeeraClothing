import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const categories = mysqlTable("categories", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
