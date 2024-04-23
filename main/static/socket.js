$(document).ready(function(){

  var socket = io.connect('http://localhost:80');

  socket.on('connect', (arg, callback) => {
    console.log('Socket Connected');
  });

  $('#playcard').on('click', function() {
    socket.emit("cardPlayed", "data");
  });

  $('#gamestate').on('click', function() {
    socket.emit("gameState", "state");
  });

  socket.on('message', (response) => {
    console.log(response);
  });

  socket.on('gameState', (response) => {
    console.log(response);
  });
	
  socket.on('updateCount', (response) => {
    console.log(response.count);
    document.getElementById('clients').innerHTML = "Clients: " + response.count;
  });
      
});
