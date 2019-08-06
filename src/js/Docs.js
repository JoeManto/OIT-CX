import React from 'react';
import '../css/Docs.css';
import '../css/util.css';

class Documentation extends React.Component {
    codeBlock = "{user:\"admin\",pass:\"test-http\",adminREQ:\"yes\"}";
    codeBlock1 = "{res:\"valid-login\"}   AND  {res:\"failed-login\"} AND {res:\"failed-RoleNotFound\"}";
    codeBlock2 = "{records-today:(records json),records-BNID:(records json),date:\"10/20/19\"}";
    codeBlock3 = "{user:\"jfj5666\",date:\"01/28/19\"}";

    render() {
        return (
            <div id={"Content"}>
                <div className={"row-item header"}>Documentation</div>
                <div className={"indented sub-header"}><a href={"#mysql"}>Configure the MySql database</a></div>
                <div className={"indented sub-header"}><a href={"#node"}>Starting the node.js server</a></div>
                <div className={"indented sub-header"}><a href={"#react"}>Starting the react app</a></div>
                <div className={"indented sub-header"}><a href={"#api"}>REST API</a></div>
                <div id="mysql" className={"indented sub-header bold"}>Configure the MySql database</div>
                <div className={"indented sub-header"}>mysql</div>
                <p className={"text-block"}>The first thing we need to do is get our database root user configured to
                    insure our server can establish a socket connection. If you have not already installed mysql you can
                    install it here <a href={"https://dev.mysql.com/downloads/mysql/"}>mysql community server</a>
                </p>
                <p className={"text-block"}>Now that we have mysql you want to open the mysql command line tool this can
                    be done by <span className={"high-light-text"}> mysql -u root -p</span> this will prompt you for a
                    password and this will be the root password that was setup on the installation of mysql.
                </p>
                <p className={"text-block"}>The next step is very important we are going to alter the root user and its
                    password so the server can connect.
                    In the mysql command line tool you want to run this sql query <span className={"high-light-text"}>ALTER USER 'root'@'localhost' IDENTIFIED BY '123456'; </span>
                    Yes the password is '123456' it does not matter because the data base is stored locally and only
                    used within the server.
                </p>
                <p className={"text-block"}> From this point no other sql queries will need to be ran. The rest of the
                    database setup (tables,users,triggers..etc) will done by the server.
                </p>
                <div id={"node"} className={"indented sub-header bold"}>Starting the node.js server</div>
                <div className={"indented sub-header"}>npm</div>
                <p className={"text-block"}>node.js, npm, and mysql are required and should be installed if they haven't
                    already been installed
                    sudo apt get or homebrew will work <span className={"high-light-text"}>brew install node </span></p>
                <p className={"text-block"}><span className={"high-light-text"}>cd projectWorkingDir</span> Install all
                    dependencies using <span className={"high-light-text"}>npm install</span></p>
                <p className={"text-block"}>Run <span className={"high-light-text"}>node . &</span> or <span
                    className={"high-light-text"}>nodemon &</span> run nodemon for a node server that automatically
                    restarts on changes.
                    <br/>Now after running one of the two commands the node.js sever is now running on your ip on port
                    5000. If you change the port number it recommend to use a high port number 2000 and up.</p>
                <div id={"react"} className={"indented sub-header bold"}>Starting the react app</div>
                <div className={"indented sub-header"}>npm</div>
                <p className={"text-block"}>Because our node.js sever only serves the data for our react app this leaves
                    the routing for the react app that is why we have two different node instances running on two
                    different ports.</p>
                <p className={"text-block"}>Like before we are going to need to install all the dependencies <span
                    className={"high-light-text"}>npm install</span></p>
                <p className={"text-block"}>Next we need to change the proxy to reflect our node sever. You can do this
                    by finding <span className={"high-light-text"}>package.json</span> in the project dir and change the
                    field <span className={"high-light-text"}>proxy</span> to the address of your node server.</p>
                <p className={"text-block"}>npm commands have already been setup, so starting the react app is as easy
                    as running. <span className={"high-light-text"}>npm start</span></p>
                <p className={"text-block"}>Now we have set up the react app with a proxy connection to our node sever
                    and can be found on port 3000.</p>
                <div id={"api"} className={"indented sub-header bold"}>REST API</div>
                <p className={"text-block"}>The Rest API is running on a node.js server using express to handle all the
                    http GET and POST requests.
                    All endpoints are served over <span className={"high-light-text"}>http://localhost:5000</span></p>
                <div className={"bold indented sub-header"}>The End Points</div>
                <div className={"indented sub-header"}>POST /Auth</div>
                <p className={"text-block"}>This endpoint handles all the authentication for the web app.
                    This endpoint needs certain parameters in order to work. The parameters are expected to be in the
                    format of stringify json and an example of a valid format may look like
                    <span className={"text-center text-block"}>{this.codeBlock}</span>
                    <strong>User:</strong> The bronco net id of the user that is stored in the data base<br/>
                    <strong>Pass:</strong> Users password sent over https a secure ssl connection, so when creating the
                    post request the password should be added in plain text (no hashing/salting needed).<br/>
                    <strong>adminREQ:</strong> Simply directly telling the server that your requesting an admin account.
                    <br/><br/>
                    This endpoint serves three response types in json format which are of type, valid login and a failed
                    login.
                    <span className={"text-center text-block"}>{this.codeBlock1}</span>
                    <span className={"high-light-text"}>valid-login</span> means all the credentials match a user in the
                    database and that user has the correct role as specified in the POST request.<br/>
                    <span className={"high-light-text"}>failed-RoleNotFound</span> response means the user was found in
                    the data base and credentials do match, but the user doesnt have an upper-level role such as an
                    admin.<br/>
                    <span className={"high-light-text"}>failed-login</span> response means two things; one is there has
                    been an error with the sql query this will only happen if the database is not setup correctly as the
                    request parameters have no interaction with the sql query because it is separated. The more common
                    reason is the credentials were not found in the database.
                    <br/>
                    <strong>The client should catch all response types.</strong>
                </p>
                <div className={"indented sub-header"}>POST /WaitList</div>
                <p className={"text-block"}>This endpoint handles sending all the records for the WaitList.
                    This endpoint will serve all records in the database from the current day or a selected date along
                    with all the records from a selected user.
                    /WaitList does not need certain parameters in order to work, But parameters can be used.
                    If parameters are empty or nil then the endpoint will just send all the records from that current
                    day.
                    If parameters are applied then they are expected to be in the format of stringify json. The
                    parameters
                    could look as the following
                    <span className={"text-center text-block"}>{this.codeBlock3}</span>
                    <strong>user:</strong> The bronco net id of the user that is stored in the data base if the user is
                    not
                    found or is empty then all records from all users will be sent<br/>
                    <strong>date:</strong> The date for which records are going to be received. If the date causes an
                    error is not valid/empty then the current date will be used<br/>
                    <br/>A response will be in json and will look like
                    <span className={"text-center text-block"}>{this.codeBlock2}</span>
                    <strong>on a request error the responses are empty.</strong><br/>
                    <span className={"high-light-text"}>records-today</span> Will provide all of the records from the
                    current day.<br/>
                    <span className={"high-light-text"}>records-BNID</span> Will provide all of the records for the
                    authenticated user.<br/>
                    <span className={"high-light-text"}>date</span>The selected date for which the records were received
                    from<br/>
                    <br/>
                    <strong>The client should validate all responses as responses are nullable.</strong>
                </p>
            </div>
        );
    }
}

export default Documentation;