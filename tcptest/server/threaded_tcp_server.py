# adapted from https://medium.com/@srbentley/python-multi-threaded-tcp-server-and-client-in-docker-492a0e3a075

from threading import Thread
from socketserver import ThreadingTCPServer
from server.listener import TCPHandler
from utils.logger import logger

ThreadingTCPServer.allow_reuse_address = True

with ThreadingTCPServer(('127.0.0.1', 9000), TCPHandler) as server:
  for n in range(10):
    t = Thread(target=server.serve_forever, kwargs={'poll_interval': 1})
    t.daemon = True
    t.start()
  logger.info(f"Started Threads:{10}")

  logger.info(f"Waiting for connections on 127.0.0.1:{9000}...")
  server.serve_forever()