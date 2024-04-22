# adapted from https://medium.com/@srbentley/python-multi-threaded-tcp-server-and-client-in-docker-492a0e3a075

import sys
from socketserver import StreamRequestHandler, ThreadingMixIn
from io import BytesIO

from utils.logger import logger


class TCPHandler(StreamRequestHandler):
  timeout = 30

  def handle(self):
    try:
      ip_address = self.client_address[0]
      buffer = BytesIO()

      self.data = self.request.recv(8192)
      
      buffer.write(self.data)
      decoded_message = buffer.getvalue().decode(encoding='utf-8', errors='ignore')
      # Save Message Here
      logging.info(f"Server Recieved Message - {decoded_message}")
      self.request.send("MESSAGE_RECIEVED".encode(encoding='utf-8'))
      self.request.close()

    except ConnectionResetError:
      logger.warning("Connection Reset")
    except Exception:
      logger.exception("Failed to handle request")
    sys.exit(0)