# Alpine is a very small/lightweight Linux distribution
# We are starting from an alpine image with Python 3 installed
FROM python:3.10-alpine

# The WORKDIR command both creates a directory in the container 
# and sets that directory to be the current directory for all further commands
WORKDIR /main

# We install Flask and requests in the container using Pip
RUN pip install flask flask-socketio requests eventlet

# We want port 5000 (the default Flask port) to be used outside the container
EXPOSE 5000

# We copy everything in the current directory on our machine 
# ... into the working directory in the container
# (In particular, this includes app.py)
COPY . .

# When the container starts running,
#    This is the final command that we want to be executed
#
# CMD is almost always used to start a program that
#    runs indefinitely and listens over the network for requests
CMD ["python3", "main.py"]
