$(document).ready(function(){

  var numOfMessages = 0;
  var date = new Date().getTime();
  var averages = [10000, 10000, 10000, 10000, 10000];

  var timeLimit = 0;
  var muteTime;

  $('#send').on('click', function() {
    user = username;
    let message = document.getElementById('textInput').value;
    if (message === '') {
        return;
    }
	
    // Clear the text input feild
    document.getElementById('textInput').value = '';
    

    // Rate limiter
    var currentTime = new Date().getTime();

    if (timeLimit !== 0) {
	if (currentTime - muteTime > timeLimit) {
	    timeLimit = 0;
	} else if (currentTime - muteTime <= timeLimit) {
	    return;
	}
    }

    var sepTime = currentTime - date;
    date = currentTime;

    averages.push(sepTime);
    averages.shift();

    var total = 0;
    for (var i = 0; i < averages.length; i++) {
        total += averages[i];
    }
    var avgTime = total / averages.length;

    // If messages are being sent too fast
    if (avgTime <= 1000) {
	socket.emit("sendMessage", 'server', user + ', you are typing too quickly! You have been muted for 10 seconds.', window.location.pathname.split("/")[2]);
	timeLimit = 10000;
	muteTime = new Date().getTime();
	return;
    }
    
    // Emit the user's chat
    socket.emit("sendMessage", user, message, window.location.pathname.split("/")[2]);
  });

  socket.on('updateChat', (user, response) => {
    console.log(response);
    const newText = document.createElement("div");

    if (user == username) {
      newText.id = "currentUserChat";
    } else if (user == "server") {
      newText.id = "serverChat";
    } else if (user == "enter") {
      newText.id = "enter";
      newText.innerHTML = response;
      newText.style.color = "green";
    } else if (user =="leave") {
      newText.id = "leave"
      newText.innerHTML = response;
      newText.style.color = "red";
    } else {
      newText.id = "userChat";
    }

    // color the usernames
    if (user === "enter" || user === "leave") {
        newText.innerHTML = response;
    } else {
        newText.innerHTML = user + ": " + response;
    }
    
    if (user !== 'server' && user !== 'enter' && user !== 'leave') {
        var chatColor = colorTag(user).hex();
        console.log(chatColor);
        newText.style.color = '#' + chatColor;
    }

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

});
