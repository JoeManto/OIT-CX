## OIT-CX
Docker deployable customer and shift management internal tool developed for the Western Michigan Helpdesk

``https://shifts.it.wmich.edu/``
___
### After Cloning
Modify the environment variables and the server `config-file` which holds variables like database host and ldap host, root passwords ..etc

### Running a local development build
To run a development build for Contributing or testing whether your config settings are correct can be done by running the following commands.

- `npm install` (If you haven't already)

- `npm start &`

  This will start the local react developed server on localhost:3000

- `node Server/server.js`

  This will start the backend server for which the proxy is already set up

### Deploying a production build with docker

Deploying a production build with docker is very easy. First thing you need to do is confirm that the exposed http port in the `dockerFile` is the same as in `server.js`.
> **Server.js**
- Changing http/https port
```javascript
let server = https.createServer(sslOptions, app);
server.listen(443, () => {
    console.log("server starting on port : " + 443)
});
```
- Change Certificate
```javascript
const key = fs.readFileSync(__dirname + '/ssl/selfsigned.key');
const cert = fs.readFileSync(__dirname + '/ssl/selfsigned.crt');
const sslOptions = {
    key: key,
    cert: cert
};
```

once all config editing is finished we need to build the production version of our react build.

- `npm run build`

This will turn our React development files into static js chunks which can be found in the newly created directory `build`. Next we need to modify our server to statically serve the build folder.

> **Server.js**
```javascript
app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
```
more info can be found here https://create-react-app.dev/docs/deployment

you can now start your docker container. Run the docker container
which will start 3 services the Mysql Database and the Node/express server, and adminer with the following command.

- `docker-compose up --build`



### Contribute

### Change Log
