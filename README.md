<img src="cargo-ship.png" alt="drawing" width="150"/>

# fsk-bridge

[Team agreement](https://docs.google.com/document/d/1p7zBJ_SLwscSLrcoHE5ijd5qBRRkLlsX1Z_twxIO7Ag/edit?usp=sharing) 

Card back sourced from Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Card_back_01.svg

## Instructions

To run the Flask app, enter the command `docker compose build && docker compose up` while in the directory `fsk-bridge/` or any subdirectory. Then, navigate to http://localhost:80/ (or type [localhost](http://localhost:80/)) in an Internet browser to access the website.


## Repository file structure

```
fsk-bridge/
├── README.md
│   - this README file
├── app/
│   - contains the main application logic for the server
│   ├── Dockerfile
│   │   - the Dockerfile used to build the "app" Docker container
│   ├── app.py
│   │   - the Flask server for the application (big file)
│   │   - services webpages, manages active tables, and provides API and socket endpoints to the front-end
│   ├── bridge/
│   │   - contains the game logic for playing a bridge game/table
│   │   ├── linparse.py
│   │   ├── linwrite.py
│   │   ├── score.py
│   │   ├── server.py (big file)
│   │   └── test.py
│   ├── lin/
│   │   └── example.lin
│   ├── static/
│   │   - contains the static files served to a client by Flask (as requested)
│   │   ├── cardimages/
│   │   │   - contains the images for the card faces and card back
│   │   │   - card faces named as [value][suit] (value: 2-9 for numerals, T for 10, J for jack, Q for queen, K for king, A for ace)
│   │   ├── css/
│   │   │   - the css files for the website
│   │   │   ├── layout.css
│   │   │   │   - styles layout.html
│   │   │   ├── login.css
│   │   │   │   - styles login.html and register.html
│   │   │   └── table.css
│   │   │       - styles table.html (big file)
│   │   ├── favicon/
│   │   │   - the favicon for the website
│   │   │   └── favicon.ico
│   │   ├── js/
│   │   │   - the javascript files for the website
│   │   │   ├── chat.js
│   │   │   │   - javascript used for chat.html, allows the user to talk to other users on the website
│   │   │   │   - connects the client via a socket to the server to receive real-time updates to the chat
│   │   │   ├── color.js
│   │   │   │   - selects colors for individual users in the chat
│   │   │   ├── home.js
│   │   │   │   - redirects the user to the entered table id
│   │   │   ├── index.js
│   │   │   │   - connects the client to the socket
│   │   │   │   - used by layout.html
│   │   │   ├── login.js
│   │   │   │   - javascript used for login.html and register.html
│   │   │   └── table.js
│   │   │       - javascript used for table.html (big file)
│   │   └── otherimages/
│   │       - other images for miscellaneous uses
│   │       └── bridge-icon.svg
│   │           - used to style the login and register forms
│   └── templates/
│       - contains the html Jinja templates served by Flask
│       ├── chat.html
│       │   - creates the chat structural html
│       ├── home.html
│       │   - the home page
│       │   - allows a user to make a new table, join an existing table with a table ID, or rejoin a table in-progress
│       ├── layout.html
│       │   - the base template for all other html files on the website
│       ├── login.html
│       │   - the login page
│       ├── register.html
│       │   - the page where a user can register a new account on the website
│       └── table.html
│           - the page where a user plays bridge with other users at the same table (big file)
├── compose.yaml
│   - instructions to create all of the necessary Docker containers
│   - used in the `docker compose` commands
├── postgres/
│   - contains files relevant to the construction and operation of the database
│   - doesn't contain a Dockerfile because of how the service is integrated into compose.yaml
│   └── init.sql
│       - instructions for creating the tables in the database
└── testingscript/
    - script to help test gameplay functionality on the front-end
    - likely deprecated
```
