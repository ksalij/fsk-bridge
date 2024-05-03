from flask import Flask, jsonify, url_for, render_template, send_from_directory, session, redirect, request
from flask_socketio import SocketIO, emit, send 
from bridge.server import Game, Table
from _thread import *
import psycopg2
import random
import json
import requests
import time
import threading
import sys
import urllib
import os
import hashlib
import binascii

app = Flask(__name__, static_url_path='/static')
app.secret_key = b'159151191247130924858171211'
socketio = SocketIO(app)

app_data = {
    "name": "Formerly Peter's Starter Template for a Flask Web App (Now our project)",
    "description": "A basic Flask app using bootstrap for layout",
    "author": "Peter Simeth",
    "html_title": "Oliver and Cole's Bridge Website (and fsk bridge group)",
    "project_name": "Bridge Stuff",
    "keywords": "flask, webapp, bridge",
}

conn = psycopg2.connect(
    host = 'db',
    port = '5432',
    database = 'postgres',
    user = 'postgres',
    password = 'password'
)
cur = conn.cursor()

class Server:
    client_count = 0
    client_list = []
    message_history = {}
    active_tables = {}

def gen_salt(size: int) -> bytes:
    return binascii.hexlify(os.urandom(size))

def hash(password: str, b_salt: bytes) -> bytes:
    sha256 = hashlib.sha256()

    b_password = password.encode()
    #b_salt = salt.encode()

    sha256.update(b_password)
    sha256.update(b_salt)

    return sha256.hexdigest().encode()

def genUsers(table_id: str) -> str:
    html = ""
    for position,user in Server.active_tables[table_id].players.items():
        html += '<div id="user">{0}: {1}</div>'.format(position, user)
    return html

@app.route('/')
def index():
    return redirect('/login')

@app.route('/home')
def home():
    return render_template("home.html", app_data=app_data, current_user=session['username'])

@app.route('/chat')
def chat():
    return render_template("chat.html", app_data=app_data, current_user=session['username'])

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_username = request.form['username']
        user_password = request.form['password']

        cur.execute("SELECT password,salt FROM users WHERE login='{0}';".format(user_username))
        pass_info = cur.fetchone()
        correct_pass, salt = tuple([item.tobytes() for item in pass_info])

        # Fix this shit
        print(pass_info, file=sys.stderr)
        print(salt, file=sys.stderr)
        print(correct_pass, file=sys.stderr)
        print(hash(user_password, salt), file=sys.stderr)

        if hash(user_password, salt) == correct_pass:      
            session['username'] = request.form['username']
            return redirect(url_for('home'))
        else:
            return redirect('/test/' + user_password + '/' + correct_pass)

    return render_template("login.html", app_data=app_data)

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        user_username = request.form['username']
        user_password = request.form['password']
        user_confirm = request.form['confirm']

        if user_password == user_confirm:
            salt = gen_salt(16)
            cur.execute("INSERT INTO users VALUES ('{0}', '{1}', '{2}')".format(user_username, hash(user_password, salt).decode(), salt.decode()))
            conn.commit()

        return redirect('/login')

    return render_template("register.html", app_data=app_data)

@app.route('/openTable')
def openTable():

    new_table = Table({'E' : None, 'S' : None, 'W' : None, 'N' : None})
    Server.active_tables[str(new_table.table_id)] = new_table
    new_table.new_game()

    return redirect('/table/' + str(new_table.table_id))

@app.route('/table/<table_id>')
def joinTable(table_id):
    for direction, player in Server.active_tables[table_id].players.items():
        if player == None:
            Server.active_tables[table_id].players[direction] = session['username']
            session['userPosition'] = direction
            break
    socketio.emit("userJoined", genUsers(table_id))
    session['currentTable'] = table_id
    print(Server.active_tables[table_id].get_json(), file=sys.stderr)
    return render_template("table.html", app_data=app_data, table=Server.active_tables[table_id], users=genUsers(table_id))

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

# Update the whole game state
# This should be called from the client table whenever a change is made to the table
@socketio.on('updateGameState')
def update_game_state():
    # Get the data from the server and format it for the specific clients
    # Send it to each client based on their player id/position
    pass

# Count the number of connected clients
@socketio.on('connect')
def connect():
    #current_table = Server.active_tables[session['currentTable']]
    #print(current_table.current_game.current_bridgehand.hands, file=sys.stderr)
    #print(session['userPosition'], file=sys.stderr)
    #emit('tableConnect', str(current_table.current_game.current_bridgehand.hands[session['userPosition']]))
    
    Server.client_count += 1
    emit('updateCount', {'count' : Server.client_count}, broadcast=True)
    for key, value in Server.message_history.items():
        if key != session['username']:
            emit('updateChat', (key, value))

@socketio.on('disconnect')
def disconnect():
    Server.client_count -= 1
    emit('updateCount', {'count' : Server.client_count}, broadcast=True)
    emit("userJoined", str(Server.active_tables[table_id].players.items()))

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug = True)
