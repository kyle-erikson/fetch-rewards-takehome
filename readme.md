# Fetch Rewards Coding Exercise - Backend Software Engineering
A simple web application built to solve the Fetch Rewards Coding Exercise described in [points.pdf](https://fetch-hiring.s3.us-east-1.amazonaws.com/points.pdf). Built with NodeJS, Express, and TS. Submission by Kyle Erikson.

## Table of Contents
- [Fetch Rewards Coding Exercise - Backend Software Engineering](#fetch-rewards-coding-exercise---backend-software-engineering)
  - [Table of Contents](#table-of-contents)
  - [Requirements](#requirements)
    - [Git](#git)
    - [Node](#node)
  - [Installation](#installation)
  - [Running The Project](#running-the-project)
    - [Starting The Project](#starting-the-project)
    - [Using The Project](#using-the-project)
  - [API Information](#api-information)
    - [Endpoints](#endpoints)
  - [Running Tests](#running-tests)

---

## Requirements
For development, only the latest version of Git, Node.js and a global package manager, `npm`, are required to be installed. It is recommended to follow this order of installation as the Git Bash CLI tool can be used to run the commands needed for Node and `npm` installation.

### Git
Simply visit the [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installation page and follow the instructions for your correct OS.

### Node
- #### Node installation on Windows

  Just go on [official Node.js website](https://nodejs.org/) and download the installer.
Also, be sure to have `git` available in your PATH, `npm` might need it (You can find git [here](https://git-scm.com/)). Feel free to use the default options in the installer.

- #### Node installation on Ubuntu

  You can install nodejs and npm easily with apt install, just run the following commands.

      $ sudo apt install nodejs
      $ sudo apt install npm

- #### Other Operating Systems
  You can find more information about the installation on the [official Node.js website](https://nodejs.org/) and the [official NPM website](https://npmjs.org/).

If the installation was successful, you should be able to run the following command.

    $ node --version
    v14.17.3

    $ npm --version
    7.20.0

If you need to update `npm`, you can make it using `npm`! Cool right? After running the following command, just open again the command line and be happy.

    $ npm install -g npm@latest

---
## Installation
The below series of commands will clone my submitted project, move your user into the working directory, and install all relevant project dependencies.
```
$ git clone https://github.com/kyle-erikson/fetch-rewards-takehome.git
$ cd fetch-rewards-takehome
$ npm install
```

---
## Running The Project
### Starting The Project
The following command will attempt to start the web application at the url: `localhost:3000`
```
$ npm start
```

### Using The Project
Calls to the web application can be made using a tool like [Postman](https://www.postman.com/downloads/). The next section will showcase the accessible endpoints and the necessary request bodies, as well as expected responses.

---
## API Information
All endpoints can be accessed via tool like Postman, when the proper HTTP method and url are given.
![Postman Request URL Example](/postmanRequestURLExample.png)
### Endpoints
- `POST /addTransaction`
  - #### Request Body
    ```
    {
      "payer": "DANNON",
      "points": 1000,                       //Must be a number
      "timestamp": "2020-11-02T14:00:00Z"   //Must be string in ISO-8061 format with time and zone 
                                              designator for zero UTC offset (Z) at the end.
    }
    ```
  - #### Responses
    - 200 OK
      ```
      { "message": "Transaction added successfully." }
      ```
    - 400 Bad Request
      ```
      {
        message: "Please correct request body.",
        error: <error>,
      }
      ```
- `POST /spendPoints`
  - #### Request Body
    ```
    {
      "points": 1000,   //Must be positive number
    }
    ```
  - #### Responses
    - 200 OK
      ```
      { 
        <payer1> : <points spent>,
        <payer2> : <points spent>,
        ...
        <payerN> : <points spent>
      }
      ```
    - 400 Bad Request
      ```
      {
        message: "Points must be greater than zero."
      }
      ```
    - 500 Internal Server Error
      ```
      {
        message: "Not enough total points across all payers to cover this spend."
      }
      ```
- `GET /viewBalances`
  - #### Responses
    - 200 OK
      - Balances Exist
        ```
        { 
          <payer1> : <points spent>,
          <payer2> : <points spent>,
          ...
          <payerN> : <points spent>
        }
        ```
      - No Balances Exist
        ```
        {
          message: "No balances on record."
        }
        ```

---
## Running Tests
Unit and integration tests may be run using the following command:
```
$ npm test
```