

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
$ npm run build:db
$ npm run restart:db
$ npm run teardown:db
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
```

### WSL local development - websocket
```bash
# To circumvent issues with having websocket served on WSL machine while accessing it in Windows (e.g. through Postman) do following

#On WSL
$ sudo ip addr add 192.168.99.2/24 broadcast 192.168.99.255 dev eth0 label eth0:1
# On windows with admin privilege
$ netsh interface ip add address "vEthernet (WSL)" 192.168.99.1 255.255.255.0
# Proceed to connect with 192.168.99.2
```

