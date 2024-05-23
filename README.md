# fsk-bridge

[Team agreement](https://docs.google.com/document/d/1p7zBJ_SLwscSLrcoHE5ijd5qBRRkLlsX1Z_twxIO7Ag/edit?usp=sharing) 

Card back sourced from Wikimedia Commons: https://commons.wikimedia.org/wiki/File:Card_back_01.svg

.
├── README.md
├── app
│   ├── Dockerfile
│   ├── app.py
│   ├── bridge
│   │   ├── __init__.py
│   │   ├── __pycache__
│   │   │   ├── linparse.cpython-38.pyc
│   │   │   ├── score.cpython-38.pyc
│   │   │   └── server.cpython-38.pyc
│   │   ├── linparse.py
│   │   ├── linwrite.py
│   │   ├── score.py
│   │   ├── server.py
│   │   └── test.py
│   ├── lin
│   │   └── example.lin
│   ├── static
│   │   ├── cardimages
│   │   │   ├── 2C.svg
│   │   │   ├── . . .
│   │   │   ├── TS.svg
│   │   │   └── back.svg
│   │   ├── css
│   │   │   ├── layout.css
│   │   │   ├── login.css
│   │   │   └── table.css
│   │   ├── favicon
│   │   │   └── favicon.ico
│   │   ├── js
│   │   │   ├── chat.js
│   │   │   ├── home.js
│   │   │   ├── index.js
│   │   │   ├── login.js
│   │   │   └── table.js
│   │   └── otherimages
│   │       ├── bridge-icon.svg
│   │       └── dali.jpg
│   └── templates
│       ├── chat.html
│       ├── home.html
│       ├── layout.html
│       ├── login.html
│       ├── oldlogin.html
│       ├── register.html
│       └── table.html
├── compose.yaml
├── postgres
│   └── init.sql
└── testingscript
    ├── setuptest.sh
    └── test.py