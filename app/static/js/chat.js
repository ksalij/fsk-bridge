$(document).ready(function(){

  //var socket = io.connect('http://localhost:80');

  $('#send').on('click', function() {
    //user = document.getElementById('username').innerHTML;
    user = username;
    socket.emit("sendMessage", user, document.getElementById('textInput').value, window.location.pathname.split("/")[2]);
    document.getElementById('textInput').value = '';
  });

  socket.on('updateChat', (user, response) => {
    console.log(response);
    const newText = document.createElement("div");

    if (user == username) {
      newText.id = "currentUserChat";
    } else if (user == "Server") {
      newText.id = "serverChat"
    } else {
      newText.id = "userChat";
    }
    newText.innerHTML = user + ": " + response;

    newTextContainer = document.createElement("div");
    newTextContainer.id = "chatContainer"
    newTextContainer.appendChild(newText);
    
    const parent = document.getElementById('chat')
    parent.appendChild(newTextContainer);
	
    parent.scroll(0, 10000)
  });

  $("#textInput").keydown(function(event) {
    if (event.keyCode === 13) {
        $("#send").click();
    }
  });

  $('#gameState').on('click', function() {
    
  })
      
});
