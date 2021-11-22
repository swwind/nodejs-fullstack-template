# Nodejs Fullstack Template

Features:

- Frontend: Vue 3 (SFX + `<script setup>`)
- Backend: Koa
- Building: Vite + Webpack 5 + esbuild
- Linting: Eslint
- Testing: Jest + Supertest + Should
- DataBase: MongoDB
- Storage: MinIO
- Server Side Render fully supported
- TypeScript with VSCode fully supported
- Vite Dev Server with HMR fully supported

## Code of conduct

- Use the latest features
- Keep your code **simple** and **stupid**
- Keep your develop environment **powerful** and **stupid**

For more informations, please read [docs/Develop.md](./docs/Develop.md)

## Deploy

Read [docs/Deploy.md](./docs/Deploy.md)

## File structure

- `src/` puts all the frontend codes
- `app/` puts all the backend codes

## How to use

Note that we are using `yarn` as a node package manager instead of `npm`.
You can install it via `npm i -g yarn`.

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

# because of vite build does not check typescript grammar
# we need to check it manually (it takes a long time!)
yarn build:check

# ======== deploy =======

# after building the project, you can easily start
# the server via `yarn start` or `node build/main.js`
yarn start

# pass --debug, --info, --warn, or --error to
# set log level, default log level is --info.
yarn start --debug

# use -c xxx.json to specify a config file (default ./config.json)
yarn start -c ~/.example/config.json

# use --generate to generate a default config file
yarn start --generate

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
# or lint both above
yarn lint
yarn lint:fix

# ======== test =======

# it just works
yarn test
# check coverage
yarn coverage
```
