import { mysqlTable, int, foreignKey } from "drizzle-orm/mysql-core";

import { measurement_types } from "./measurement_types.model.js";
import { categories } from "./categories.model.js";

export const categories_measurements = mysqlTable(
  "categories_measurements",
  {
    id: int().autoincrement().primaryKey(),
    category_id: int()
      .notNull()
      .references(() => categories.id),
    measurement_type_id: int().notNull(),
  },
  (table) => [
    foreignKey({
      name: "cat_meas_type_fk",
      columns: [table.measurement_type_id],
      foreignColumns: [measurement_types.id],
    }),
  ]
);

