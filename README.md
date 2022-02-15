# Users

Service for manage users by platform.

## Requirements
* NodeJS 10 or latest
* Yarn or NPM
* MongoDB

### Build with
* Koa
* Mongoose

## Install 🚀

1. Clone the project
`git clone git@github.com:CreationsForBusiness/Users.git`
1. Copy .env.example
`cp .env.example .env`
1. Replace environments variable
   * **PORT**: This port will be used by the app.
   * **MONGO_HOST**: Host of the database server.
   * **MONGO_PORT**: Port of database connection.
   * **MONGO_DATABASE**: Name of the database.
   * **MONGO_USER**: User for autentication on database.
   * **MONGO_PASS**: Password for autentication on database.
   * **MONGO_PREFIX**: Prefix for string connection to database.
1. Install dependencies
`npm install` or `yarn install`
1. Run migrations
`npm run migrate` or `yarn migrate`
1. Run project
`npm run dev` or `yarn dev`

* Migration will execute before start script.

## Contributing 🏗
#### Migrations
For create migrations run: `npm run migrate:create`

For down migrations run: `npm run migrate:down`

## License
[MIT](https://choosealicense.com/licenses/mit/)