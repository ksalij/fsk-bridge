var socket = io.connect(`http://${location.hostname}:${location.port}`);

socket.on('connect', (arg, callback) => {
  console.log('Socket Connected');
});

socket.on('updateCount', (response) => {
  console.log(response.count);
  document.getElementById('clients').innerHTML = "Clients: " + response.count;
});
