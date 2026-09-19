import { int, mysqlTable, foreignKey } from "drizzle-orm/mysql-core";

import { measurement_types } from "./measurement_types.model.js";
import { order } from "./order.model.js";

export const order_item_measurements = mysqlTable(
  "order_item_measurements",
  {
    id: int().autoincrement().primaryKey(),
    order_id: int()
      .notNull()
      .references(() => order.id),
    measurement_type_id: int().notNull(),
    measurement_value: int().notNull(),
  },
  (table) => [
    foreignKey({
      name: "ord_item_meas_type_fk",
      columns: [table.measurement_type_id],
      foreignColumns: [measurement_types.id],
    }),
  ],
);
