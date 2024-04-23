from flask import Flask, jsonify, url_for, render_template, send_from_directory
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

@app.route('/get_image_list')
def get_image_list():
    print('Getting image list!', file=sys.stderr)
    image_folder = 'static/cardimages/'  # Your image folder path
    image_list = os.listdir(image_folder)
    print("Image list: " + str(image_list), file=sys.stderr)
    return jsonify(image_list)

@app.route('/your-flask-endpoint')
def get_image_urls():
    image_folder = 'static/cardimages/'  # Your image folder path
    image_list = os.listdir(image_folder)
    # Prepend the static URL to each filename
    print(image_list, file=sys.stderr)
    image_urls = [url_for('static', filename=filename) for filename in image_list]
    return jsonify(image_urls)


@app.route('/your-flask-endpoint/static/<path:filename>')
def get_image(filename):
    return send_from_directory('static', 'cardimages/' + filename)


if __name__ == '__main__':
    my_port = 5000
    app.run(host='0.0.0.0', port = my_port, debug=True)