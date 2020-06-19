process.env.NODE_ENV !== "production" && require("dotenv").config();

module.exports = {
  development: {
    client: "sqlite3",
    connection: { filename: "./data/dev.db3" },
    useNullAsDefault: true,
    migrations: {
      directory: "./data/migrations",
    },
    seeds: { directory: "./data/seeds" },
    pool: {
      afterCreate: (conn, done) => {
        conn.run("PRAGMA foreign_keys = ON", done);
      },
    },
  },
  test: {
    client: "pg",
    connection: process.env.TEST_DB_URL || {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASS,
    },
    useNullAsDefault: true,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: "./data/migrations",
      tableName: "knex_migrations",
    },
    seeds: {
      directory: "./data/seeds",
    },
  },
  production: {
    client: "pg",
    connection: process.env.DATABASE_URL,
    useNullAsDefault: true,
    migrations: {
      directory: "./data/migrations",
    },
    seeds: { directory: "./data/seeds" },
    pool: {
      // afterCreate: (conn, done) => {
      //   conn.run("PRAGMA foreign_keys = ON", done);
      // },
      min: 2,
      max: 10,
    },
  },
};
