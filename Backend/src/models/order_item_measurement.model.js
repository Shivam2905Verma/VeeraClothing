import { int, mysqlTable } from "drizzle-orm/mysql-core";

import { order_items } from "./order_items.model.js";
import { measurement_types } from "./measurement_types.model.js";

export const order_item_measurements = mysqlTable("order_item_measurements", {
  id: int().autoincrement().primaryKey(),
  order_item_id: int()
    .notNull()
    .references(() => order_items.id),
  measurement_type_id: int()
    .notNull()
    .references(() => measurement_types.id),
  measurement_value: int().notNull(),
});
