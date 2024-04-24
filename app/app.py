<<<<<<< HEAD:main/main.py
from flask import Flask, jsonify, url_for, render_template, send_from_directory, session
from flask_socketio import SocketIO, emit, send
from _thread import *
import random
import json
import requests
import time
import threading
import sys
import urllib
import os

app = Flask(__name__, static_url_path='/static')
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

@app.route('/chat')
def chat():
    return render_template("chat.html", app_data=app_data)

@app.route('/openTable/<playerID>')
def openTable(playerID):
    return render_template("table.html", app_data=app_data, playerID=playerID)
    emit('test', 'test')

@app.route('/startGame/<tableID>/<seat>')
def watchgame(tableID, seat):
    return json.dumps("{} is ready to start!".format(seat))

@app.route('/getimages')
def get_image_urls():
    image_folder = 'static/cardimages/'  # Your image folder path
    image_list = os.listdir(image_folder)
    # Prepend the static URL to each filename
    print(image_list, file=sys.stderr)
    image_urls = [url_for('static', filename=filename) for filename in image_list]
    return jsonify(image_urls)

@app.route('/getimages/static/<path:filename>')
def get_image(filename):
    return send_from_directory('static', 'cardimages/' + filename)

@app.route('/favicon.ico')
def give_favicon():
    return send_from_directory('static', 'favicon/favicon.ico')

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
=======
from flask import Flask, jsonify, url_for, render_template, send_from_directory, session
from flask_socketio import SocketIO, emit, send
from _thread import *
import random
import json
import requests
import time
import threading
import sys
import urllib
import os

app = Flask(__name__, static_url_path='/static')
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

@app.route('/getimages')
def get_image_urls():
    image_folder = 'static/cardimages/'  # Your image folder path
    image_list = os.listdir(image_folder)
    # Prepend the static URL to each filename
    print(image_list, file=sys.stderr)
    image_urls = [url_for('static', filename=filename) for filename in image_list]
    return jsonify(image_urls)

@app.route('/getimages/static/<path:filename>')
def get_image(filename):
    return send_from_directory('static', 'cardimages/' + filename)

@app.route('/favicon.ico')
def give_favicon():
    return send_from_directory('static', 'favicon/favicon.ico')

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
>>>>>>> fe62cee (renamed main to app):app/app.py
