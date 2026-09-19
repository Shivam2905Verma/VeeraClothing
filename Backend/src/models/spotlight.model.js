import {
  mysqlTable,
  int,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const spotlights = mysqlTable("spotlights", {
  id: int().autoincrement().primaryKey(),
  tag: varchar({ length: 100 }).default("SPOTLIGHT").notNull(),
  title: varchar({ length: 255 }).notNull(),
  image_url: varchar({ length: 500 }).notNull(),
  link_url: varchar({ length: 500 }).default("/shopall").notNull(),
  is_active: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
