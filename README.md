# NC News Seeding

https://backend-nc-news-gozg.onrender.com/api
This project is the backend for a reddit-like platform. The database contains tables for articles, topics, comments and users.

1. git clone: https://github.com/ukduw/backend-nc-news.git
2. Install dependencies:
    Developer dependencies: jest, jest-extended, jest-sorted
    Dependencies: dotenv, express, pg, pg-format, supertest
3. Seed local database with "npm run setup-dbs" then "npm run seed-dev"
4. Run tests with "npm test"

5. Create .env.development and .env.test files
    PGDATABASE should be assigned the database names found in /db/setup-dbs.sql

Minimum version requirements:
    Node.js - v23.5.0
    Postgres - v16.8