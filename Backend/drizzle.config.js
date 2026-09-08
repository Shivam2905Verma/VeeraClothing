// drizzle.config.js
import "dotenv/config";

export default {
  schema: "./src/models/*.model.js",
  out: "./src/config/drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
};
