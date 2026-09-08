import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";

export const payment_methods = mysqlTable("payment_methods", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
});
