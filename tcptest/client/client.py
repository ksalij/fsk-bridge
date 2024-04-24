# adapted from https://medium.com/@srbentley/python-multi-threaded-tcp-server-and-client-in-docker-492a0e3a075


import socket


client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
print("Connecting")
client.connect(('127.0.0.1', 9000))

    
client.send("CLIENT_MESSAGE".encode('utf-8'))

response = client.recv(8192)
message = response.decode(encoding='utf-8')
print(message)
if message == "MESSAGE_RECIEVED":
    client.close()