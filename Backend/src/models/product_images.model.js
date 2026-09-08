import { mysqlTable, int, varchar } from "drizzle-orm/mysql-core";
import { products } from "./product.model.js";

export const product_images = mysqlTable("product_images", {
  id: int().autoincrement().primaryKey(),
  product_id: int()
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  image_url: varchar({ length: 255 }).notNull(),
});
