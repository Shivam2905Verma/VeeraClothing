import { mysqlTable, int, varchar, timestamp } from "drizzle-orm/mysql-core";

export const spotlights = mysqlTable("spotlights", {
  id: int().autoincrement().primaryKey(),
  tag: varchar({ length: 100 }).default("SPOTLIGHT").notNull(),
  title: varchar({ length: 255 }).notNull(),
  image_url: varchar({ length: 500 }).notNull(),
  public_id: varchar({ length: 255 }).notNull(),
  link_url: varchar({ length: 500 }).default("/shopall").notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
