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

  $('#send').on('click', function() {
    socket.emit("sendMessage", document.getElementById('username').value + ": " + document.getElementById('textInput').value);
    document.getElementById('textInput').value = '';
  });

  socket.on('message', (response) => {
    console.log(response);
  });

  socket.on('updateChat', (response) => {
    console.log(response);
    const newText = document.createElement("p");
    newText.innerHTML = response;
    
    const parent = document.getElementById('chat')
    parent.appendChild(newText);
  });

  socket.on('gameState', (response) => {
    console.log(response);
  });
	
  socket.on('updateCount', (response) => {
    console.log(response.count);
    document.getElementById('clients').innerHTML = "Clients: " + response.count;
  });
      
});
