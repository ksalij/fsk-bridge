from flask import Flask
from flask import render_template
from flask_socketio import SocketIO, emit, send
from _thread import *
import random
import json
import requests
import time
import threading
import sys
import urllib


app = Flask(__name__)
socketio = SocketIO(app)

app_data = {
    "name": "Peter's Starter Template for a Flask Web App",
    "description": "A basic Flask app using bootstrap for layout",
    "author": "Peter Simeth",
    "html_title": "Oliver and Cole's Bridge Website",
    "project_name": "Starter Template",
    "keywords": "flask, webapp, template, basic",
}

@app.route('/')
def homepage():
    return render_template("home.html", app_data=app_data)

@app.route('/openTable/<playerID>')
def openTable(playerID):
    return render_template("table.html", app_data=app_data, playerID=playerID)

@app.route('/startGame/<tableID>/<seat>')
def watchgame(tableID, seat):
    return json.dumps("{} is ready to start!".format(seat))

@socketio.on('message')
def handle_message(message):
    send(message + "this is from flask")
    print('Received Message', file=sys.stdout)


if __name__ == '__main__':
    socketio.run(app, host='127.0.0.1', port=5000, debug = True)
