## Description
Project is building using [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Installation & Setup
It is assumed following are available on your machine.
- node (v20 or v22). Code was developed using v20 but should work with v22 as well
- docker (in case you have postgres setup, that should work however you would need to change the database credentials accordingly)

```bash
npm install # install the required node packages

docker compose up -d postgres # if you don't want the daemon process, ignore the -d flag
```

## Swagger Docs
Swagger has been enabled for the project and should provide a good playground for testing
different routes and the functionality available in it. It is available as the home-page/index of the website `localhost:3000/`

## Running the app
```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

## Seeding the data
This shall seed the database with some data and help you test the different routes
and functionality of the app
```bash
npm run seed
```

## Creating Database Index
```sql
CREATE EXTENSION pg_trgm;
CREATE INDEX idx_gin ON users USING gin (username gin_trgm_ops);
```
[Reference Article](https://www.cybertec-postgresql.com/en/postgresql-more-performance-for-like-and-ilike-statements/) used while implementing indexing for the ILIKE operator



## Notes
While the project implements all the functional requirements, I was not able to implement the Testing due to time constraint.
- Please refer to swagger to take a quick look at DTOs and related routes.
- You can generate an appropriate token using /users/token. It will only generate a valid token for users in the database. Based on the specifications of the project, token is not validated or checked for expiry
- Database models are automatically synced, ideally having migrations would have been helpful but considering it is an assignment I have setup Sequelize to sync the models on application statup. Also don't forget to create the database index, likely to bring seconds of query time to milliseconds. Specially if you decide load millions of records into database. You can use `scripts/seed.ts`, however I am not sure how good faker would be in generating a million unique usernames.
