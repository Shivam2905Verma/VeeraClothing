import { mysqlTable, varchar } from "drizzle-orm/mysql-core";

export const admin = mysqlTable("admin", {
  admin_id: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
});
