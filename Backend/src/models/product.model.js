import {
  mysqlTable,
  int,
  varchar,
  boolean,
  text,
  timestamp,
} from "drizzle-orm/mysql-core";

import { categories } from "./categories.model.js";

export const products = mysqlTable("products", {
  id: int().autoincrement().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  category_id: int()
    .notNull()
    .references(() => categories.id),
  is_active: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
