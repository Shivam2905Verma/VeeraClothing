import {
  mysqlTable,
  int,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

import { user } from "./user.model.js";
import { product_variants } from "./product_variants.model.js";

export const cart_items = mysqlTable(
  "cart_items",
  {
    id: int().autoincrement().primaryKey(),
    user_id: int()
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    variant_id: int()
      .notNull()
      .references(() => product_variants.id, { onDelete: "cascade" }),
    quantity: int({ unsigned: true }).default(1).notNull(),
    createdAt: timestamp()
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp()
      .default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_variant_unique").on(table.user_id, table.variant_id),
  ],
);
