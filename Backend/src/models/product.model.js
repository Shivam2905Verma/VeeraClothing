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
  price: int().notNull(),
  image_url: varchar({ length: 255 }).notNull(),
  highlights: varchar({ length: 500 }).notNull(),
  composition: varchar({ length: 500 }).notNull(),
  care: varchar({ length: 200 }).notNull(),
  extra_info: varchar({ length: 200 }).notNull(),
  is_active: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
