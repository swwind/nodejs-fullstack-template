# Deploy

Our default environment is Arch Linux. If you are using Ubuntu or other linux distros, you may need to solve it by yourself.

Firstly, clone a `config.json` to yourself.

```bash
cp _config.json config.json
```

## Mongodb

Install [`aur/mongodb-bin`](mongodb) through your AUR package manager.

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
