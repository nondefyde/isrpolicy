## Description

A service which consumes policy change events from a message queue and enables them to be published as webhooks for brokers to consume


Queue information
- Queue name =  'bikemo.events.queue'
- Event name = 'task.policy.push'
- Endpoint to check health of app http:localhost:4000/v1/health


## Requirement

- redis setup
- rabbitmq 
- mongodb

### Environment variable example

- PORT=4000
- DB_URL=mongodb://localhost:27017/isrpolicy
- REDIS_URL=redis://127.0.0.1:6379
- RABBITMQ_URL=amqp://guest:guest@127.0.0.1:5672

## Installation

```bash
$ yarn install
```

## Running the app

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```