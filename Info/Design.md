# Major Design Choices for OIT-CX

## OS
Our server is running in a Docker container that uses the most up to date version of linux, but the hosting and serving of our project does not relies on a linux distribution as all is need is node which is support on (linux,windows, and MacOS) 

## Languages
Javascript, HTML, CSS, MySQL, Bash

## Frameworks/Libraries
We chose to use the React Library for this project that provide a great work flow as we can create and reuse highly abstract components. The decision to use React rather than some other MVC framework comes down to having more flexibility in our design choices, along with being able to integrate other Javascript libraries as we need: This keeps our project lightweight, and allows us to build in functionalities as we need them.

We chose to use the Testing framework Jest as it provides everything we need all in one tool. Jest provides things like automation, mock objects, code coverage testing, and a great view of failed tests, so we know exactly where and how a test failed. 

## Databases
We have a MySQL database as a sub-service container in our root docker container which is hosted on a server in the Bernhard center. We chose to use a MySql database as this is a database that both teammates understand and will allow us to get a faster start. 

## Server
We are using one of Western Michigan University's servers located in the Bernhard center which runs linux-vms.

## Docker
Docker was one of our most important design choices as it allows us to build our project using scripts and run those scripts in a very easy and intuitive way. This makes for easy startup and stopping of the project, which is very important for the client.
