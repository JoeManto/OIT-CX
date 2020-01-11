# Environment Setup for Team Members

Before getting into any setup it is highly suggested that new team members take a look at all of the references and coding standards. References can be found in: `References/references.md` and programming standards can be found in: `Standards/ProgrammingStandards.md` 

## IDE Setup
We decided on using Visual Studio Code (VS Code) as our IDE. To use the built in terminal (CTRL+~) we used git bash for windows versions and a regular bash terminal for Unix environments.
The following standards should be followed:
- Tab spacing set to 4
- CRLF line endings
- UTF-8 character set
- Block Comments Package/Extension should be installed 

#### Example of Block Comment Format
This will provide universal comments for functions
```javascript
    Ex. 
    /**
    * @param {type} parameter
    * ...
    */
    Function(args){...}
```

Within this IDE we also used a Pair programming feature that should be utilized as much as possible: VS Code Live Share.
To set up Live Share it must be installed as an extension in VS Code. This feature allows for real time pair programming.

## Cloning from Github
To clone the project from Github the following commands should be used from the terminal: 

`git clone https://github.com/JoeManto/OIT-CX.git`

This command will copy the public project in a directory in your current working directory.

## Add Server Configuration File
This file is store locally by a team member as it contains sensitive passwords for ldap and smtp. You will have get this file from a teammate
You will need to place this file in `Server/`. This file is very important as it is imported by many modules throughout the server to provide easy access to database,ldap-auth,smtp configs.

Notice that this file is just a JS file that exports JS objects.

## Installing All Project Dependencies 
We need to make sure we have Node 8+ installed in the environment. To do so go to the following link for instructions for your OS: [Install Guide](https://nodejs.org/en/download/)

Before we install dependencies we need to make sure that the npm package manager has up to date packages.
Run `npm update -g npm` to update Npm. This will update the underlining program to grab the most up to date packages.


This will install all the project dependencies that are referenced in package.json 
`npm install`

Notice now a `node_modules` directory will now appear in the root directory. This directory contains all the API's for the dependencies that we just installed. This directory also should never be pushed to the the remote repository as this file is really large.

All **new** dependencies need to be spiked and reviewed by all team members before they can be merged and used throughout the project.

## Installing MySQL
To install MySQL version 5.11 go to the following link: [Install Guide](https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html)

## Setting up a superuser in Mysql
A super user in MySQL is necessary to create the appropriate Tables needed by the project. To create a superuser in MySQL follow this guide: [MySQL Guide](https://tableplus.com/blog/2018/10/how-to-create-a-superuser-in-mysql.html)

or run these commands in a unix terminal. If on windows then use the Mysql Command Line Program and skip to command 2. 

`mysql -u root -p`

Notice that you will be prompted for a password. This is the password that was set when mysql was installed.

`ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';`

## Setting up MySQL Tables
- A database will need to be created that is called `nodemysql`. This can be done with the following command in MySQL within a terminal: 

    `CREATE DATABASE nodemysql;`

- Next, locate the sqldump.sql file within the server directory. 
Run the following: 

    `mysql -u root -p nodemysql < sqldump.sql`.

- The tables should now be set up.

# Starting the Project

## Running a local development build
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