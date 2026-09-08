import {
  mysqlTable,
  int,
  mysqlEnum,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";

import { user } from "./user.model.js";
import { address } from "./address.model.js";
import { payment_methods } from "./payment_methods.model.js";

export const order = mysqlTable("order", {
  id: int().autoincrement().primaryKey(),
  user_id: int()
    .notNull()
    .references(() => user.id),
  address_id: int()
    .notNull()
    .references(() => address.id),
  payment_method_id: int()
    .notNull()
    .references(() => payment_methods.id),
  order_status: mysqlEnum("order_status", [
    "pending",
    "confirmed",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ])
    .default("pending")
    .notNull(),
  payment_status: mysqlEnum("payment_status", [
    "pending",
    "paid",
    "failed",
    "refunded",
  ])
    .default("pending")
    .notNull(),
  total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  discount: decimal("discount", { precision: 10, scale: 2 })
    .default(0)
    .notNull(),
  final_amount: decimal("final_amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
