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
import time

'''
session has several fields:
    username: website username
    currentTable: the table the user is currently at, if there is one (whether they are in_game or not)
    userPosition: the seat the user is currently at in their table (whether they are in_game or not)
'''

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
    active_tables = {}
    table_chat = {}
    nextUserID = 0
    store = {}

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
    user_pos_dict = {"N": None, "E": None, "S": None, "W": None}
    for position,user in Server.active_tables[table_id].players.items():
        user_pos_dict[position] = user
        # html += '<div id="user">{0}: {1}</div>'.format(position, user)
    return json.dumps(user_pos_dict)
    # return html

@app.route('/')
def index():
    if session.get('username') is not None:
        # return 'Cannot sign in on multiple tabs'
        return redirect('/home')
    return redirect('/login')

@app.route('/home/<error>')
@app.route('/home')
def home(error=None):
    table_id = session.get('currentTable')
    if table_id:
        return redirect('/table')
    socketio.emit('testoutput', f"table_id is {table_id}")
    # try:
    #     Server.active_tables[table_id]
    # except:
    #     socketio.emit('testoutput', "exception, no active table at table_id")
    #     session['currentTable'] = None
    #     session['userPosition'] = None
    #     table_id = None
    # if table_id != None:
    #     socketio.emit('testoutput', f'home current game is {Server.active_tables[table_id].current_game}')
    
    # check whether the player is at a table, then check whether that table has started a game
    in_game = (table_id != None) and (Server.active_tables[table_id].current_game != None)
    if error == None:
        return render_template("home.html", app_data=app_data, current_user=session['username'], in_game=in_game)
    else:
        return render_template("home.html", app_data=app_data, current_user=session['username'], in_game=in_game, error=error)

# @app.route('/rejoinTable')
# def rejoin_table():
#     table_id = session['currentTable']
#     try:
#         Server.active_tables[table_id]
#     except:
#         error = "whoopsie doopsie the table's gone TODO"
#         return redirect('/home/' + error) # not sure we should call kill table here, maybe redirect to home?
#     return redirect('/table/' + table_id)

@app.route('/chat')
def chat():
    return render_template("chat.html", app_data=app_data, current_user=session['username'])

@app.route('/learn')
def learn():
    return render_template("learn.html", app_data=app_data, current_user=session['username'])

@app.route('/logout')
def logout():
   session.clear()
   return redirect('/')

@app.route('/login', methods=['GET', 'POST'])
def login():
    error = ''
    if request.method == 'POST':
        user_username = request.form['username']
        user_password = request.form['password']

        cur.execute("SELECT password,salt FROM users WHERE login= %s;", (user_username,))
        pass_info = cur.fetchone()
        if pass_info == None:
            error = "There is not a user with that login in our database."
            return render_template("login.html", app_data=app_data, error=error)
        correct_pass, salt = tuple([item.tobytes() for item in pass_info])

        if hash(user_password, salt) == correct_pass:
            if session.get('username') is not None:
                if session['username'] == request.form['username']:
                    error = "Already logged in as this user."
            else:
                session['username'] = request.form['username']
                return redirect(url_for('home'))    
        else:
            error = "Incorrect Password"
            # return redirect('/test/' + user_password + '/' + correct_pass)

    return render_template("login.html", app_data=app_data, error=error)

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
    socketio.emit('testoutput', 'OPEN TABLE')
    new_table = Table({'E' : None, 'S' : None, 'W' : None, 'N' : None})
    Server.active_tables[str(new_table.table_id)] = new_table
    
    # TODO replace clients list with database?

    Server.table_chat[str(new_table.table_id)] = []
    Server.table_chat[str(new_table.table_id)].append("id/" + str(new_table.table_id))

    return redirect('/joinTable/' + str(new_table.table_id))

@app.route('/joinTable/<table_id>')
def joinTable(table_id):
    socketio.emit('testoutput', f"JOIN TABLE {table_id}")
    if not session.get('currentTable'):
        session['currentTable'] = table_id
    return redirect('/table')

@app.route('/table')
def table():
    table_id = session['currentTable']
    try:
        Server.active_tables[table_id]
    except KeyError:
        error = 'There is no table with that ID.'
        session['currentTable'] = None
        session['userPosition'] = None
        return redirect('/home/' + error)
    
    if (table_id != None) and (Server.active_tables[table_id].current_game == None):    
        socketio.emit('testoutput', "TABLE "+ str(table_id))
        # session['currentTable'] = table_id
        Server.client_list[session['username']] = table_id
        # socketio.emit('testoutput', 'player s!!! ' + str(Server.active_tables[table_id].players))

        for direction, player in Server.active_tables[table_id].players.items():
            # socketio.emit('testoutput', direction)
            # socketio.emit('testoutput', player)
            if player == session['username']:
                socketio.emit('testoutput', 'hit hit ' + session['username'] + ' ' + player)
                break
            elif player == None:
                Server.active_tables[table_id].join_table(session['username'], direction)
                session['userPosition'] = direction
                break
        socketio.emit('testoutput', 'players!!! ' + str(Server.active_tables[table_id].players))
    return render_template("table.html", app_data=app_data, table_id=session['currentTable'])

@app.route('/leaveTable')
def leave_table():
    table_id = session.get('currentTable')
    try:
        table = Server.active_tables[table_id]
    except:
        error = 'Table does not exist.'
        return redirect('/home/' + error)

    socketio.emit('testoutput', f'current game is {table.current_game}')
    # chat stuff
    Server.table_chat[session['currentTable']].append("leave/" + "← " + session['username'] + " has left the room")
    socketio.emit('updateChat', ('leave', "← " + session['username'] + ' has left the room'), to=table_id)   
    
    # removes user from table
    table.leave_table(session['userPosition'])
    
    socketio.emit('testoutput', 'after ' + str(Server.active_tables[table_id].players))
    user_unready(table_id, session['username'])
    session['currentTable'] = None
    session['userPosition'] = None

    roomEmpty = True
    for player in table.players.values():
        if player != None:
            roomEmpty = False

    if table.current_game != None or (table.current_game == None and roomEmpty):
        Server.active_tables[table_id].players = {'N': None, 'S': None, 'E': None, 'W': None}
        socketio.emit('killTable', str(table_id), to=table_id)
        del Server.active_tables[table_id]
        del ready_users[table_id]
    return redirect('/home/Table Closed')

@app.route('/killTable/<table_id>')
def kill_table(table_id):
    '''
    called when the kill table button is pressed. Only can happen after the game has begun
    '''
    if session.get('currentTable'):
        socketio.emit('testoutput', 'kill_table')
        # socketio.emit('closeTable', table_id, to=table_id)
        session['currentTable'] = None
        session['userPosition'] = None
    return redirect('/home/Table Closed')

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
    if table_id not in Server.active_tables:
        error = 'The table you are at is no longer active'
        socketio.emit('testoutput', 'NO TABBLE WIH ID IN JOINROMM')
        socketio.emit('redirectHome', error, to=request.sid)
        return
        # return redirect('/home/' + error)
    socketio.emit('testoutput', f"user {session['username']}, table_id {table_id}, position: {session['userPosition']}")
    join_room(table_id)
    socketio.emit("yourLocalInfo", (session['username'], table_id, session['userPosition']), to=request.sid)
    socketio.emit('testoutput', 'joined room 1')
    if table_id not in ready_users:
        ready_users[table_id] = set()
    # Server.active_tables[table_id].players.values()[:-1]
    if Server.active_tables[table_id].current_game == None:
        socketio.emit("updateUsers", (genUsers(table_id), list(ready_users[table_id])), to=table_id)

@socketio.on('addRobot')
def put_robot_in_room(table_id, dir):
    if table_id not in ready_users:
        ready_users[table_id] = set()
    Server.client_list["Robot" + dir] = table_id
    Server.active_tables[table_id].players[dir] = "Robot" + dir
    socketio.emit("updateUsers", (genUsers(table_id), list(ready_users[table_id])), to=table_id)
    user_ready(table_id, "Robot" + dir)

ready_users = {}
@socketio.on('ready')
def user_ready(table_id, user):
    ready_users[table_id].add(user)
   
    Server.table_chat[session['currentTable']].append("enter/" + user + " is ready to play!")
    emit('updateChat', ('enter', user  + ' is ready to play!'), to=table_id)

    # socketio.emit("readyInfo", list(ready_users[table_id]), to=request.sid)
    print("\n\n\n{} ready\n{}\n\n\n".format(user, ready_users[table_id]))
    if len(ready_users[table_id]) == 4:
        emit('usersReady', to=table_id)
        emit('buildAuction', to=table_id)
        emit('requestGameState', to=table_id)
        Server.active_tables[table_id].new_game()
        if "Robot" in Server.active_tables[table_id].current_game.current_player:
            bid = Server.active_tables[table_id].AI_bid()
            send_new_game(user, bid)

    else:
        socketio.emit("updateUsers", (genUsers(table_id), list(ready_users[table_id])), to=table_id)

@socketio.on('unready')
def user_unready(table_id, user):
    if table_id in ready_users.keys() and user in ready_users[table_id]:
        ready_users[table_id].remove(user)

    Server.table_chat[session['currentTable']].append("leave/" + user + " is not ready to play")
    socketio.emit('updateChat', ('leave', user  + ' is not ready to play'), to=table_id)

    socketio.emit("updateUsers", (genUsers(table_id), list(ready_users[table_id])), to=table_id)

@socketio.on('cardPlayed')
# user is a username
def handle_message(user, card):
    table_id = Server.client_list[user]
    played_card = None
    played_card = bridge.linparse.convert_card(card[1] + card[0])
    user_dir = {player: dir for dir, player in Server.active_tables[table_id].current_game.current_bridgehand.players.items()}[user]
    if not Server.active_tables[table_id].current_game.play_card(user_dir, played_card):
        emit('isCardGood', (False, Server.active_tables[table_id].current_game.get_json(user)), to=request.sid)
        print('bad card')
    else:
        emit('isCardGood', (True, Server.active_tables[table_id].current_game.get_json(user)), to=request.sid)
        print('good card')
        # When the server wants to send each player their json, it asks every player in the room to request the json from the server
        emit('requestGameState', to=table_id)

@socketio.on('aiPlay')
def AI_play(table_id):
    Table = Server.active_tables[table_id]
    dummy = Table.current_game.get_partner(Table.current_game.current_bridgehand.declarer)
    if 'Robot' in Table.current_game.current_bridgehand.players[Table.current_game.current_player] or (Table.current_game.current_player == dummy and 'Robot' in Table.current_game.current_bridgehand.players[Table.current_game.current_bridgehand.declarer]):
        if len(Table.current_game.current_bridgehand.play) == 0:
            card = Table.AI_opening_lead()
        else:
            card = Table.AI_select_card()
        handle_message(Table.current_game.current_bridgehand.players[Table.current_game.current_player], [card.rankname, card.suitname])
        time.sleep(.75)

# The server then responds to each player asking with the json
@socketio.on('updateGameState')
def broadcast_gamestate(user):
    table_id = Server.client_list[user]
    game_state = Server.active_tables[table_id].current_game.get_json(user)
    emit('gameState', game_state, to=request.sid)

@socketio.on('sendMessage')
def send_message(user, message, game_room):
    Server.table_chat[session['currentTable']].append(user + "/" + message)
    emit('updateChat', (user, message), to=game_room)
    #emit('updateChat', (user, message), broadcast=True)
    print(game_room, file=sys.stderr)

@socketio.on('populateChat')
def populate_chat():
    for message in Server.table_chat[session['currentTable']]:
        split = message.split("/")
        emit('updateChat', (split[0], split[1]), to=request.sid)

@socketio.on('userJoined')
def user_joined(user, table_id):
    socketio.emit('testoutput', 'userJoined')
    join_room(table_id)
    Server.table_chat[session['currentTable']].append("enter/" + "→ " + user + " has joined the room")
    #emit('updateChat', ('server', user  + ' has joined the room'), room=game_room)
    emit('updateChat', ('enter', "→ " + user  + ' has joined the room'), to=table_id)


@socketio.on('updateGameState')
def update_game_state(user):
    '''
    Update the whole game state
    his should be called from the client table whenever a change is made to the table
    '''
    # Get the data from the server and format it for the specific clients
    # Send it to each client based on their player id/position
    game = Server.active_tables[Server.client_list[user]].current_game
    json = game.get_json(user)
    emit('gameState', json, to=request.sid)

@socketio.on('sendBid')
def send_new_game(user, bid):
    table_id = Server.client_list[user]
    game = Server.active_tables[table_id].current_game
    user_dir = {player: dir for dir, player in Server.active_tables[table_id].current_game.current_bridgehand.players.items()}[user]
    game.make_bid(user_dir, bid)
    emit('requestGameState', to=table_id)


@socketio.on('aiBid')
def AI_bid(user):
    table_id = Server.client_list[user]
    current_player_name = Server.active_tables[table_id].current_game.current_bridgehand.players[Server.active_tables[table_id].current_game.current_player]
    phase = Server.active_tables[table_id].current_game.game_phase
    if "Robot" in current_player_name:
        if phase == "AUCTION":
            bid = Server.active_tables[table_id].AI_bid()
            send_new_game(current_player_name, bid)
            time.sleep(.75)

# Count the number of connected clients
@socketio.on('connect')
def connect():
    Server.client_count += 1
    socketio.emit('testoutput', f"connect called {session.get('username')}")
    if session.get('currentTable'):
    #     socketio.emit('testoutput', 'joined room here 2')
    #     # table = Server.active_tables[session['currentTable']]
    #     # table.connected_players.append(session['username'])
        join_room(session['currentTable'])
    emit('updateCount', {'count' : Server.client_count}, broadcast=True)
    #for key, value in Server.message_history.items():
    #    if key != session['username']:
    #        emit('updateChat', (key, value), to=request.sid)

@socketio.on('disconnect')
def disconnect():
    '''
    Called each time a tab is left or reloaded (double check)
    '''
    Server.client_count -= 1
    emit('updateCount', {'count' : Server.client_count}, broadcast=True)
    socketio.emit('testoutput', 'disconnect called ' + str(session['username']))
    
    if session.get('currentTable') in Server.active_tables:
        Server.table_chat[session['currentTable']].append("leave/" + "← " + session['username'] + " has left the room")
        socketio.emit('updateChat', ('leave', "← " + session['username'] + ' has left the room'), to=session['currentTable'])
        
# @socketio.on('tableClosed')
# def table_closed(closed_table_id):
#     '''
#     sent to all users at a table when the table is closed, sets the session variables
#     and removes the user from the table
#     '''
#     table_id = session['currentTable']
#     socketio.emit('testoutput', 'table closed is ' + str(closed_table_id))
#     if (table_id == closed_table_id):
#         Server.active_tables[table_id].leave_table(session['userPosition'])
#         session['currentTable'] = None
#         session['userPosition'] = None
#         leave_room(table_id)

@socketio.on('switchSeat')
def switch_seat(direction, user):
    table_id = Server.client_list[user]
    temp_player = Server.active_tables[table_id].players[direction]
    temp_direction = session['userPosition']
    session['userPosition'] = direction
    Server.active_tables[table_id].players[direction] = user
    Server.active_tables[table_id].players[temp_direction] = temp_player
    emit("seatSwitched", (temp_player, temp_direction), to=table_id)
    socketio.emit("updateUsers", (genUsers(table_id), list(ready_users[table_id])), to=table_id)


@socketio.on('updateSeatSession')
def update_seat_session(player, new_direction):
    if session['username'] == player:
        session['userPosition'] = new_direction

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

@socketio.on('hasGameStarted')
def has_game_started(table_id):
    socketio.emit('testoutput', "hasgamestarted called")
    if table_id not in Server.active_tables:
        socketio.emit('testoutput', "no table")
        return False
    elif Server.active_tables[table_id].current_game == None:
        socketio.emit('testoutput', "current_game is none")
        return False
    else:
        json = Server.active_tables[table_id].current_game.get_json(session['username'])
        socketio.emit('testoutput', 'hasGameStarted currentGame not none', to=table_id)
        socketio.emit('buildGame', (json, session['username']), to=table_id)
        return True

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=5000, debug = True)
