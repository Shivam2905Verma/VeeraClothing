import {
  mysqlTable,
  int,
  varchar,
  timestamp,
  boolean,
  decimal,
} from "drizzle-orm/mysql-core";

import { products } from "./product.model.js";

export const product_variants = mysqlTable("product_variants", {
  id: int().autoincrement().primaryKey(),
  product_id: int()
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  color: varchar({ length: 255 }).notNull(),
  price: decimal({ precision: 10, scale: 2, unsigned: true }).notNull(),
  stock: int({ unsigned: true }).default(0).notNull(),
  is_active: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
