import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { user } from "./user.model.js";

export const address = mysqlTable("address", {
  id: int().autoincrement().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => user.id),
  firstname: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  country: varchar({ length: 255 }).notNull(),
  address_line_1: varchar({ length: 255 }).notNull(),
  landmark: varchar({ length: 255 }),
  city: varchar({ length: 255 }).notNull(),
  state: varchar({ length: 255 }).notNull(),
  zip_code: varchar({ length: 6 }).notNull(),
  phone: varchar({ length: 10 }).notNull(),
});
