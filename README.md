# A complicated NodeJS Full-Stack Template

Features:

- Vue 3 + Vuex
- Koa + MongoDB
- Vite + Webpack 5 + esbuild
- Eslint
- Mocha + Chai

## Deploy

Read [install/README.md](./install/README.md)

## File structure

- `src/` puts all the frontend codes
- `app/` puts all the backend codes

## How to use

```bash
# install all dependencies
yarn install

# ======= build =======

# build the frontend for browsers
# output to `dist/client/`
yarn build:client

# build the frontend for backend SSR use
# output to `dist/server/`
yarn build:ssr

# build the backend for nodejs to run
# output to `build/main.js`
yarn build:server

# or build all threes parts within one command
yarn build

# ======== develop =======

# start a frontend HMR development environment
# you must ensure you backend was built already
# - yarn build:server
yarn dev

# start a backend development environment
# build code when change
yarn build:server --watch
# or use node --inspect-brk
yarn debug

# ======== lint =======

# lint frontend code (or with auto fix)
yarn lint:client
yarn lint:client --fix
# lint backend code (or with auto fix)
yarn lint:server
yarn lint:server --fix

# ======== test =======

# it just works
yarn test

```
