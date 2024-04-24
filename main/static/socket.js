$(document).ready(function(){

  var socket = io.connect('http://localhost:5000');

  socket.on('connect', (arg, callback) => {
    console.log('Socket Connected');
  });

  $('#send').on('click', function() {
    user = document.getElementById('username').value;
    socket.emit("sendMessage", user, user + ": " + document.getElementById('textInput').value);
    document.getElementById('textInput').value = '';
  });

  socket.on('message', (response) => {
    console.log(response);
  });

  socket.on('updateChat', (user, response) => {
    console.log(response);
    const newText = document.createElement("div");

    if (user == document.getElementById('username').value) {
      newText.id = "currentUserChat";
    } else {
      newText.id = "userChat";
    }
    newText.innerHTML = response;

    newTextContainer = document.createElement("div");
    newTextContainer.id = "chatContainer"
    newTextContainer.appendChild(newText);
    
    const parent = document.getElementById('chat')
    parent.appendChild(newTextContainer);
  });

  socket.on('updateCount', (response) => {
    console.log(response.count);
    document.getElementById('clients').innerHTML = "Clients: " + response.count;
  });

  $("#textInput").keydown(function(event) {
    if (event.keyCode === 13) {
        $("#send").click();
    }
  });
      
});
