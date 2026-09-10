import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const user = mysqlTable("user", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  mobile_no: varchar({ length: 15 }).notNull(),
  is_verified: boolean().default(false).notNull(),
  is_deleted: boolean().default(false).notNull(),
  deleted_at: timestamp(),
  createdAt: timestamp().defaultNow().notNull(),
});
