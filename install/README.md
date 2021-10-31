# Deploy

By default, we only provide deploy instructions under Arch Linux.

If you are using Ubuntu or other linux distros, you may need to solve it by yourself.

## Configurations

Firstly, clone a `config.json` to yourself.

```bash
cp _config.json config.json
```

Then modify some lines to suit your environment.

## MongoDB

Install [`aur/mongodb-bin`][mongodb] through your AUR package manager.

And start its service.

Then create a new file

```js
// /tmp/test.js
db.createUser({
  user: 'username',
  pwd: 'password',
  roles: [{ role: 'readWrite', db: 'dbname' }]
})
```

Then type commands

```bash
mongo 127.0.0.1:27017/dbname /tmp/test.js
```

Afterwards, write your `username`, `password`, `dbname` to `config.json`.

## MinIO

Install [`community/minio`][minio] through pacman.

Then modify `/etc/minio/minio.conf`, add two following lines:

```conf
MINIO_ACCESS_KEY=k318qoqdWINsr9h1yn5UmbaWMoQ5AfWc
MINIO_SECRET_KEY=3F1epPRc2A8Mya0m6tygvwmvwvfrIAAd
```

where both of two keys can be generated via `cat /dev/urandom | tr -cd a-zA-Z0-9 | head -c 32`.

Or if you are lazy, you can just run the following bash script

```bash
MINIO_ACCESS_KEY=`cat /dev/urandom | tr -cd a-zA-Z0-9 | head -c 32`
MINIO_SECRET_KEY=`cat /dev/urandom | tr -cd a-zA-Z0-9 | head -c 32`
echo MINIO_ACCESS_KEY=$MINIO_ACCESS_KEY | sudo tee -a /etc/minio/minio.conf
echo MINIO_SECRET_KEY=$MINIO_SECRET_KEY | sudo tee -a /etc/minio/minio.conf
```

Then start the service via systemctl.

```bash
sudo systemctl start minio.service
```

And finally, write you `MINIO_ACCESS_KEY` and `MINIO_SECRET_KEY` into `config.json`.

## Build the project

Building the project is very simple.

```bash
yarn install
yarn build
```

## Start the project

Simply you can use `yarn start` to start the server.

If you want to start it as a service, just use the following command.

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

[mongodb]: https://aur.archlinux.org/packages/mongodb-bin/
[minio]: https://archlinux.org/packages/community/x86_64/minio/
