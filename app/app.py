from flask import Flask, jsonify, url_for, render_template, send_from_directory, session, redirect, request
from flask_socketio import SocketIO, emit, send 
from flask_socketio import join_room, leave_room
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
import bridge.linparse

app = Flask(__name__, static_url_path='/static')
app.secret_key = b'159151191247130924858171211'
socketio = SocketIO(app)

app_data = {
    "name": "Formerly Peter's Starter Template for a Flask Web App (Now our project)",
    "description": "A basic Flask app using bootstrap for layout",
    "author": "Peter Simeth",
    "html_title": "FSK Bridge",
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
    client_list = {}
    message_history = {}
    active_tables = {}
    nextUserID = 0

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
    if session.get('username') is not None:
        return redirect('/home')
    return redirect('/login')

@app.route('/home')
def home():
    return render_template("home.html", app_data=app_data, current_user=session['username'])

@app.route('/chat')
def chat():
    return render_template("chat.html", app_data=app_data, current_user=session['username'])

@app.route('/logout')
def logout():
    session.clear()
    return redirect('/')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user_username = request.form['username']
        user_password = request.form['password']

        cur.execute("SELECT password,salt FROM users WHERE login= %s;", (user_username,))
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

        cur.execute("SELECT login FROM users WHERE login = %s;", (user_username,))
        if cur.fetchone() is not None:
            error = "There is already a user with that name in our database. Please choose another."
            return render_template("register.html", app_data=app_data, error=error)

        if user_password == user_confirm:
            salt = gen_salt(16)
            cur.execute("INSERT INTO users VALUES (%s, %s, %s)", (user_username, hash(user_password, salt).decode(), salt.decode()))
            conn.commit()

        return redirect('/login')

    return render_template("register.html", app_data=app_data)

@app.route('/openTable')
def openTable():

    new_table = Table({'E' : None, 'S' : None, 'W' : None, 'N' : None})
    Server.active_tables[str(new_table.table_id)] = new_table
    # TODO replace clients list with database?

    return redirect('/table/' + str(new_table.table_id))

@app.route('/table/<table_id>')
def joinTable(table_id):
    session['currentTable'] = table_id
    Server.client_list[session['username']] = table_id

    for direction, player in Server.active_tables[table_id].players.items():
        if player == None:
            Server.active_tables[table_id].players[direction] = session['username']
            session['userPosition'] = direction
            break
        elif player == session['username']:
            Server.active_tables[table_id].players[direction] == None
            return redirect('/home')
    socketio.emit("updateUsers", genUsers(table_id))
    return render_template("table.html", app_data=app_data, table=Server.active_tables[table_id], users=genUsers(table_id), session_table=session['currentTable'])

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

@socketio.on('joinRoom')
def put_user_in_room(table_id):
    socketio.emit("yourLocalInfo", (session['username'], table_id), to=request.sid)
    join_room(table_id)
    # Server.active_tables[table_id].players.values()[:-1]
    socketio.emit("updateUsers", genUsers(table_id), to=table_id)

ready_users = {}
@socketio.on('ready')
def user_ready(table_id, user):
    if table_id not in ready_users.keys():
        ready_users[table_id] = set()
    ready_users[table_id].add(user)
    # socketio.emit("readyInfo", list(ready_users[table_id]), to=request.sid)
    print("\n\n\n{} ready\n{}\n\n\n".format(user, ready_users[table_id]))
    if len(ready_users[table_id]) >= 4:
        emit('buildAuction', to=table_id)
        emit('requestGameState', to=table_id)
        Server.active_tables[table_id].new_game()

@socketio.on('unready')
def user_unready(table_id, user):
    if table_id in ready_users.keys():
        ready_users[table_id].remove(user)
    # socketio.emit("readyInfo", list(ready_users[table_id]), to=request.sid)

@socketio.on('cardPlayed')
def handle_message(user, card):
    played_card = bridge.linparse.convert_card(card[1] + card[0])
    table_id = Server.client_list[user]
    user_dir = {player: dir for dir, player in Server.active_tables[table_id].current_game.current_bridgehand.players.items()}[user]
    if not Server.active_tables[table_id].current_game.play_card(user_dir, played_card):
        emit('isCardGood', (False, Server.active_tables[table_id].current_game.get_json(user)), to=request.sid)
        print('bad card')
    else:
        emit('isCardGood', (True, Server.active_tables[table_id].current_game.get_json(user)), to=request.sid)
        print('good card')
        # When the server wants to send each player their json, it asks every player in the room to request the json from the server
        emit('requestGameState', to=table_id)

# The server then responds to each player asking with the json
@socketio.on('updateGameState')
def broadcast_gamestate(user):
    table_id = Server.client_list[user]
    game_state = Server.active_tables[table_id].current_game.get_json(user)
    emit('gameState', game_state, to=request.sid)

@socketio.on('sendMessage')
def send_message(user, message):
    #global Server.message_history
    Server.message_history[user] = message
    emit('updateChat', (user, message), broadcast=True)

# Update the whole game state
# This should be called from the client table whenever a change is made to the table
@socketio.on('updateGameState')
def update_game_state(user):
    # Get the data from the server and format it for the specific clients
    # Send it to each client based on their player id/position
    game = Server.active_tables[Server.client_list[user]].current_game
    json = game.get_json(user)
    emit('gameState', json, to=request.sid)

@socketio.on('sendBid')
def send_bid(user, bid):
    table_id = Server.client_list[user]
    game = Server.active_tables[table_id].current_game
    user_dir = {player: dir for dir, player in Server.active_tables[table_id].current_game.current_bridgehand.players.items()}[user]
    game.make_bid(user_dir, bid)
    emit('requestGameState', to=table_id)

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
            emit('updateChat', (key, value), to=request.sid)

@socketio.on('disconnect')
def disconnect():
    Server.client_count -= 1
    emit('updateCount', {'count' : Server.client_count}, broadcast=True)
    if session.get('currentTable') is not None:
        #if Server.active_tables[session.get('currentTable')]:
        session['currentTable'] = 'reload'
        print('table exists', file=sys.stderr)
            #emit("updateUsers", genUsers(session['currentTable']), broadcast=True)

@socketio.on('storeFinishedGame')
def store_finished_game(table_id, lin_file):
    table = Server.active_tables[table_id]
    players = table.players
    game_num = table.game_count

    cur.execute("SELECT table_id FROM tables WHERE table_id = %s;", (int(table_id),))
    result = cur.fetchone()
    if result == None:
        cur.execute("INSERT INTO tables VALUES (%s, %s, %s, %s, %s);", (int(table_id), players['E'], players['S'], players['W'], players['N']))

        cur.execute("INSERT INTO games VALUES (%s, %s, %s);", (int(table_id), int(game_num), lin_file))

    conn.commit()

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug = True)
