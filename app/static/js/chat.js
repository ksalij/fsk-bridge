$(document).ready(function(){

  //var socket = io.connect('http://localhost:80');

  $('#send').on('click', function() {
    user = document.getElementById('username').innerHTML;
    socket.emit("sendMessage", user, user + ": " + document.getElementById('textInput').value);
    document.getElementById('textInput').value = '';
  });

  socket.on('updateChat', (user, response) => {
    console.log(response);
    const newText = document.createElement("div");

    if (user == document.getElementById('username').innerHTML) {
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

  $("#textInput").keydown(function(event) {
    if (event.keyCode === 13) {
        $("#send").click();
    }
  });

  $('#gameState').on('click', function() {
    
  })
      
});
