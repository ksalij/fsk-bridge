var socket = io.connect('http://localhost:80');

socket.on('connect', (arg, callback) => {
  console.log('Socket Connected');
});

socket.on('updateCount', (response) => {
  console.log(response.count);
  document.getElementById('clients').innerHTML = "Clients: " + response.count;
});