from flask import Flask, jsonify, url_for, render_template, send_from_directory, session, redirect, request
from flask_socketio import SocketIO, emit, send 
from bridge.server import Game, Table
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
app.secret_key = b'159151191247130924858171211'
socketio = SocketIO(app)

app_data = {
    "name": "Peter's Starter Template for a Flask Web App",
    "description": "A basic Flask app using bootstrap for layout",
    "author": "Peter Simeth",
    "html_title": "Oliver and Cole's Bridge Website",
    "project_name": "Starter Template",
    "keywords": "flask, webapp, template, basic",
}

class Server:
    count = 0
    message_history = {}
    active_tables = {}

@app.route('/')
def index():
    return redirect('/login')

@app.route('/home')
def home():
    return render_template("home.html", app_data=app_data, current_user=session['username'])

@app.route('/chat')
def chat():
    return render_template("chat.html", app_data=app_data)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        session['username'] = request.form['username']
        return redirect(url_for('home'))
    return render_template("login.html", app_data=app_data)

@app.route('/openTable')
def openTable():

    new_table = Table({'E' : None, 'S' : None, 'W' : None, 'N' : None})
    Server.active_tables[str(new_table.table_id)] = new_table

    return redirect('/table/' + str(new_table.table_id))

@app.route('/table/<table_id>')
def joinTable(table_id):
    for direction, player in Server.active_tables[table_id].players.items():
        if player == None:
            Server.active_tables[table_id].players[direction] = session['username']
            break
    socketio.emit("userJoined", str(Server.active_tables[table_id].players.items()))
    return render_template("table.html", app_data=app_data, table=Server.active_tables[table_id])

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
    #global Server.message_history
    Server.message_history[user] = message
    emit('updateChat', (user, message), broadcast=True)

# Count the number of connected clients
@socketio.on('connect')
def connect(): 
    #global Server.count
    Server.count += 1
    emit('updateCount', {'count' : Server.count}, broadcast=True)
    for key, value in Server.message_history.items():
        emit('updateChat', (key, value), broadcast=True)

@socketio.on('disconnect')
def disconnect():
    #global Server.count
    Server.count -= 1
    emit('updateCount', {'count' : Server.count}, broadcast=True)
    emit("userJoined", str(Server.active_tables[table_id].players.items()))

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug = True)
