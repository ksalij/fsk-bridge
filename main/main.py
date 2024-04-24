from flask import Flask, render_template, session
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

count = 0
message_history = {}

@app.route('/')
def homepage():
    return render_template("home.html", app_data=app_data)

@app.route('/chat', app_data=app_data)
def chat():
    return render_template("chat.html")

@app.route('/openTable/<playerID>')
def openTable(playerID):
    return render_template("table.html", app_data=app_data, playerID=playerID)
    emit('test', 'test')

@app.route('/startGame/<tableID>/<seat>')
def watchgame(tableID, seat):
    return json.dumps("{} is ready to start!".format(seat))

@socketio.on('cardPlayed')
def handle_message(message):
    data = {
      'hand' : ['2C','3C','6C','7C','9C','AC','4H','9H','QH','AH','4S','8S','QS']
    }
    send(str(data))
    print('Received Message', file=sys.stdout)

@socketio.on('gameState')
def broadcast_gamestate(message):
    emit('gameState', 'Test Message', broadcast=True)

@socketio.on('sendMessage')
def send_message(user, message):
    global message_history
    message_history[user] = message
    emit('updateChat', (user, message), broadcast=True)

# Count the number of connected clients
@socketio.on('connect')
def connect(): 
    global count
    count += 1
    emit('updateCount', {'count' : count}, broadcast=True)
    for key, value in message_history.items():
        emit('updateChat', (key, value), broadcast=True)

@socketio.on('disconnect')
def disconnect():
    global count
    count -= 1
    emit('updateCount', {'count' : count}, broadcast=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug = True)
