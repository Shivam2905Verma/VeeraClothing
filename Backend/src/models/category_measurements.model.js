import { mysqlTable, int } from "drizzle-orm/mysql-core";

import { measurement_types } from "./measurement_types.model.js";
import { categories } from "./categories.model.js";

export const categories_measurements = mysqlTable("categories_measurements", {
  id: int().autoincrement().primaryKey(),
  category_id: int()
    .notNull()
    .references(() => categories.id),
  measurement_type_id: int()
    .notNull()
    .references(() => measurement_types.id),
});
