import { mysqlTable, decimal, int } from "drizzle-orm/mysql-core";

import { order } from "./order.model.js";
import { product_variants } from "./product_variants.model.js";

export const order_items = mysqlTable("order_items", {
  id: int().autoincrement().primaryKey(),
  order_id: int()
    .notNull()
    .references(() => order.id),
  variant_id: int()
    .notNull()
    .references(() => product_variants.id),
  quantity: int().notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});
