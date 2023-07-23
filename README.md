

## Description


## Installation

```bash
$ npm install
# setup DB
$ sudo apt install docker-compose
# if you have a service listening on port :5432 you will have to kill it
$ sudo lsof -i :5432
$ sudo kill <PID>
# build DB for local development
$ sudo docker-compose up
```

## Running the app

```bash
#migrations
$ npx prisma migrate dev --create-only #generate migration
$ npx prisma db push # push migration
$ npx prisma studio # UI for DB

# development
$ npm run start


# watch mode
$ npm run start:dev

