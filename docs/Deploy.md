# Deploy (Arch Linux)

If you are using other Linux distros (or maybe Windows), you may need to solve it by yourself.

## Node

Install [`community/nodejs-lts-gallium`][nodejs] and [`community/yarn`][yarn].

Note that you must install nodejs v16, otherwise the build will fail.

## Build & Configurations

Building the project is very simple.

```bash
yarn install
yarn build
```

If you doesn't have a `config.json`, you can run `yarn start --generate` to generate a default one (in `$PWD/config.json`).

Then edit some values to suit your configuration.

## MongoDB

Install [`aur/mongodb-bin`][mongodb] through your AUR package manager.

And start it as a service.

```bash
sudo systemctl enable --now mongodb.service
```

Then create a new file

```js
// /tmp/test.js
db.createUser({
  user: 'username',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'dbname' }]
});
```

Then type commands

```bash
mongo 127.0.0.1:27017/dbname /tmp/test.js
```

**Note:** If you want to run tests on your own PC, then you need to create a testing database with the same username and password.

**Note:** By default, the auth database was the same as `dbname`. If you don't like that, you can use environment `MONGO_AUTH_SOURCE=admin` to set the auth database to be `admin`.

Afterwards, write your `username`, `password`, `dbname` to `config.json`.

## MinIO

Install [`community/minio`][minio].

Then modify `/etc/minio/minio.conf`, add two following lines:

```conf
MINIO_ROOT_USER=k318qoqdWINsr9h1yn5UmbaWMoQ5AfWc
MINIO_ROOT_PASSWORD=3F1epPRc2A8Mya0m6tygvwmvwvfrIAAd
```

where both of two keys can be generated via `cat /dev/urandom | tr -cd a-zA-Z0-9 | head -c 32`.

Or if you are lazy, you can just run the following bash script

```bash
MINIO_ROOT_USER=`cat /dev/urandom | tr -cd a-zA-Z0-9 | head -c 32`
MINIO_ROOT_PASSWORD=`cat /dev/urandom | tr -cd a-zA-Z0-9 | head -c 32`
echo MINIO_ROOT_USER=$MINIO_ROOT_USER | sudo tee -a /etc/minio/minio.conf
echo MINIO_ROOT_PASSWORD=$MINIO_ROOT_PASSWORD | sudo tee -a /etc/minio/minio.conf
```

Then start the service via systemctl.

```bash
sudo systemctl enable --now minio.service
```

And finally, write your `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD` into `config.json`.

## Start the project

Simply you can use `yarn start` to start the server.

If you want to start it as a service in production, just use the following command.

```bash
# make sure you run this script in the root of this project
# otherwise you may need to modify $(pwd) yourself

echo "
[Unit]
Description=A powerful nodejs website
After=network.target

[Service]
WorkingDirectory=$(pwd)
Environment=NODE_ENV=production
ExecStart=$(which node) $(pwd)/build/main.js

[Install]
WantedBy=multi-user.target
" | sudo tee /lib/systemd/system/website.service

# enable the service and start it now
sudo systemctl enable --now website.service
```

Or use `pm2` as your own choice.

[nodejs]: https://archlinux.org/packages/community/x86_64/nodejs-lts-gallium/
[yarn]: https://archlinux.org/packages/community/any/yarn/
[mongodb]: https://aur.archlinux.org/packages/mongodb-bin/
[minio]: https://archlinux.org/packages/community/x86_64/minio/
