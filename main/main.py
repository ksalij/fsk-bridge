from flask import Flask
from flask import render_template
from _thread import *
import random
import json
import requests
import time
import threading
import sys
import urllib

app = Flask(__name__)

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

if __name__ == '__main__':
    my_port = 5000
    app.run(host='0.0.0.0', port = my_port) 
