var span;
var makeIdCopy;
var sendLocalMessage;

makeIdCopy = function() {
  span = document.getElementById('tableid');
  span.onclick = function() {
    document.execCommand("copy");
    sendLocalMessage("Room ID has been copied to clipboard!")
  }

  span.addEventListener("copy", function(event){
    event.preventDefault();
    if (event.clipboardData) {
      event.clipboardData.setData("text/plain", span.textContent);
      console.log(event.clipboardData.getData("text"));
    }
  })
}

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
	socket.emit("sendMessage", 'server', user.charAt(0).toUpperCase() + user.slice(1) + ', you are typing too quickly! You have been muted for 10 seconds.', tableID);
	timeLimit = 10000;
	muteTime = new Date().getTime();
	return;
    }
    
    // Emit the user's chat
    socket.emit("sendMessage", user, message, tableID);
  });

  socket.on('updateChat', (user, response) => {
    console.log(response);
    const newText = document.createElement("div");

    var isId;
    if (user == username) {
      newText.id = "currentUserChat";
    } else if (user == "server") {
      newText.id = "serverChat";
    } else if (user == "enter") {
      newText.id = "enter";
      newText.innerHTML = response;
      newText.style.color = "green";
    } else if (user == "leave") {
      newText.id = "leave"
      newText.innerHTML = response;
      newText.style.color = "red";
    } else if (user == "id") {
      newText.id = "serverChat";
      user = "server";
      isId = true;
      response = "Room created with id <span id='tableid'>" + response + "</span>";
    } else {
      newText.id = "userChat";
    }

    // color the usernames
    if (user === "enter" || user === "leave") {
        newText.innerHTML = response;
    } else if (user === "server") {
	newText.innerHTML = "<b>" + user + ": " + "</b>" + response;
    } else {
        newText.innerHTML = "<b>" + user + ": " + "</b>" + response.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
   
    // Assign a deterministically generated color to each user's chats
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

    if (isId === true) {
      makeIdCopy();
    }
	
    parent.scroll(0, 10000)
  });

  $("#textInput").keydown(function(event) {
    if (event.keyCode === 13) {
        $("#send").click();
    }
  });

  sendLocalMessage = function(message) {
    const newText = document.createElement("div");

    newText.id = "serverChat";
    newText.innerHTML = "<b>server:</b> " + message;

    newTextContainer = document.createElement("div");
    newTextContainer.id = "chatContainer"
    newTextContainer.appendChild(newText);
    
    const parent = document.getElementById('chat')
    parent.appendChild(newTextContainer);

    parent.scroll(0, 10000)
  }

});
