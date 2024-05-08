//var socket = io.connect('http://localhost:80');;

// Sample jsonData for test purposes
// jsonData = {
//     "cardsPlayed": [null, null, null, null],
//     "yourHand": [
//         "C2",
//         "C3",
//         "C4",
//         "C5",
//         "C6",
//         "C7",
//         "C8",
//         "C9",
//         "CT",
//         "CJ",
//         "CQ",
//         "CK",
//         "CA",
//     ],
//     "hand_sizes": [13, 13, 13, 13],
//     "dummyHand": null,
//     "auctionValue": [0, 0],
//     "playerNames": ["You", "Player2", "Player3", "Player4"],
//     "your_direction": 0,
//     "dummy_direction": null,
//     "current_player": 0
// }

// Some global variables to keep track of the client relative to the rest of the table
let user = "";
let tableID = 0;

// // Fill the "players" div with information for testing/debugging purposes
// function loadPlayerDiv() {
//     var gameInfoDiv = document.getElementById('players');
//     gameInfoDiv.innerHTML = (
//         "<p>Player Names: " + JSON.stringify(jsonData.playerNames) + "</p>"
//         + "<button onclick=displayPlayers()>Click me to display players!</button>"
//         // put game display stuff here!
//         + "<button id=show-cards-button onclick=showAllCards()>Click me to display cards!</button>"
//     );
// }

// Load debugging info on page load
// window.addEventListener("load", (event) => { loadPlayerDiv(); });

// function displayPlayers() {
//     var gameInfoDiv = document.getElementById('players');
//     gameInfoDiv.innerHTML = (
//         "<p>Clicked!</p>"
//     );
// }

/*
    Build a card object.
*/
function buildCard(cardString) {
    const card = document.createElement("input");
    card.setAttribute("src", "/getimages/static/" + cardString + ".svg");
    card.setAttribute("type", "image");
    card.setAttribute("class", "card");
    return card;
}

/*
    Construct a default hand of X card backs.

    Parameters:
      - handDiv, the hand div to fill with card backs
      - handSize, the number of cards to place in the hand

    Functionality:
      - For each card, create a button object with the following properties
          - its class is "card"
          - its content is the card back image
*/
function buildEmptyHand(handDiv, handSize, isPlaying) {
    for (let i = 0; i < handSize; i++) {
        const card = buildCard("back");
        if (isPlaying == 0) {
            card.style.boxShadow = "0px 0px 22px #8fd7d2";
        }
        else {
            card.style.boxShadow = "";
        }
        handDiv.appendChild(card);
    }
}

/*
    Construct an HTML hand of card images from a list of card strings.

    Parameters:
      - handDiv, the hand div to fill with cards
      - hand, the list of card strings to place in the hand

    Functionality:
      - For each card, create an anchor object with the following properties
          - it links to the .svg image of the card
          - its content is an image element of the card
*/
function buildHand(handDiv, hand, seat, isPlaying) {
    for (let i = 0; i < hand.length; i++) {
        //TODO load hand
        const card = buildCard(hand[i]);
        if (seat == 0) {
            card.setAttribute("onclick", `cardPlayed("${user}", "${hand[i]}")`);
        }
        if (isPlaying == 0) {
            card.style.boxShadow = "0px 0px 22px #8fd7d2";
        }
        else {
            card.style.boxShadow = "";
        }
        
        // link.addEventListener('mouseover', function() {
        //     card.style.border = '2px solid blue'; // Add border on mouseover
        //     card.style.transition = 'border-color 0.5s ease';
        //     });

        // link.addEventListener('mouseout', function() {
        //     card.style.border = '2px transparent'; // Remove border on mouseout
        //     card.style.transition = 'border-color 0.5s ease';
        //     });

        handDiv.appendChild(card);
    }
}

function buildDummyHand(handDiv, hand, seat, isPlaying, dummyUser) {
    for (let i = 0; i < hand.length; i++) {
        //TODO load hand
        const card = buildCard(hand[i]);
        if (seat == 2) {
            card.setAttribute("onclick", `cardPlayed("${dummyUser}", "${hand[i]}")`);
        }   
        if (isPlaying == 0) {
            card.style.boxShadow = "0px 0px 22px #8fd7d2";
        }
        else {
            card.style.boxShadow = "";
        }
        
        // link.addEventListener('mouseover', function() {
        //     card.style.border = '2px solid blue'; // Add border on mouseover
        //     card.style.transition = 'border-color 0.5s ease';
        //     });

        // link.addEventListener('mouseout', function() {
        //     card.style.border = '2px transparent'; // Remove border on mouseout
        //     card.style.transition = 'border-color 0.5s ease';
        //     });

        handDiv.appendChild(card);
    }
}

function cardPlayed(user, value) {
    socket.emit("cardPlayed", user, value);
}

function buildPlayArea(cardsPlayed) {
    const playArea = document.getElementById("playArea");

    for (var i = 0; i < 4; i++) {
        if (playArea.firstChild) {
            playArea.removeChild(playArea.firstChild);
        }
    }
    for (let i = 0; i < 4; i++) {
        if (cardsPlayed[i]) {
            playArea.appendChild(buildCard(cardsPlayed[i]));
        }
    }
}

/*
    Create the structure for a hand.

    Parameters:
      - handID, the id for the hand div
    
    Functionality:
      - creates a hand div, sets its id to handID and gives it the class "hand"
      - fills the hand with 13 face down cards
*/
function buildHandStructure(handID) {
    const hand = document.createElement("div");
    hand.setAttribute("id", handID);
    hand.setAttribute("class", "hand");
    buildEmptyHand(hand, 13);
    return hand;
}

function specialModFour(num) {
    return ((num % 4) + 4) % 4;
}

/*
    Create the structure for the game table.

    Parameters: none

    Functionality: Builds the div structure for the game table, outlined as follows:
      - a "card" is a link element with an image as its content
      - cards are organized in "hand" divs
      - hands are organized into the structuring div for the appropriate team (ie. "client_team" or "opp_team")
      - client_team and opp_team are contained in the "game" div
      - the game div defines the geometry of the table and contains all of the divs relevant to the play of game
*/
function buildTableStructure() {
    // Get the game div from the page
    const gameDiv = document.getElementById("game");

    // Create the client_team and opp_team divs
    const client_team = document.createElement("div"); // the client_team div contains elements for the user and their partner
    client_team.setAttribute("id", "client_team");
    const opp_team = document.createElement("div"); // the opp_team div contains elements for the user's two opponents
    opp_team.setAttribute("id", "opp_team");
    
    // Create an empty hand for each player
    const client_hand = buildHandStructure("client_hand");
    const partner_hand = buildHandStructure("partner_hand");
    const oppL_hand = buildHandStructure("oppL_hand");
    const oppR_hand = buildHandStructure("oppR_hand");

    // Create an area for cards played during a trick
    const playArea = document.createElement("div");
    playArea.setAttribute("id", "playArea");
  
    // Add each hand to the correct containers
    client_team.appendChild(client_hand);
    client_team.appendChild(partner_hand);
    opp_team.appendChild(oppL_hand);
    opp_team.appendChild(oppR_hand);

    // Add the new structures back into the document
    gameDiv.appendChild(client_team);
    gameDiv.appendChild(opp_team);
    gameDiv.appendChild(playArea);
}

// TO DO ON PAGE LOAD: - connect the client to the server via a websocket

/*
    Indicate to the server that the client is ready to play.
    Called when the user clicks on the "start-button" button.

    Parameters: none

    Functionality:
      - remove the readyUp button
      - inform the server that the user is ready to start the game
      - create div structuring for hands, and fills each hand with 13 card backs
      - inform the user that the table is waiting for other players
*/
function readyUp() {
    // Remove the start button
    document.getElementById("start-button").remove();

    // Notify the server that the user is ready
    socket.emit('ready', tableID, user);
    console.log(`emitted to socket: ready, ${tableID}, ${user}`);

    // Create the div structuring
    buildTableStructure();
    
    // Inform the user that the table is waiting for other players
    const waitMessage = document.createElement("p");
    waitMessage.setAttribute("id", "waiting");
    waitMessage.innerHTML = "Waiting for other players to ready up...";
    document.getElementById("game").appendChild(waitMessage);
}

/*
    Update the hands for each player.

    Parameters:
      - jsonData, ???

    Functionality:
*/
function renderUpdate(jsonData) {
    const client_hand = document.getElementById("client_hand");
    const partner_hand = document.getElementById("partner_hand");
    const oppL_hand = document.getElementById("oppL_hand");
    const oppR_hand = document.getElementById("oppR_hand");
    for (var i = 0; i < 13; i++) {
        if (client_hand.firstChild) {
            client_hand.removeChild(client_hand.firstChild);
        }
        if (partner_hand.firstChild) {
            partner_hand.removeChild(partner_hand.firstChild);
        }
        if (oppL_hand.firstChild) {
            oppL_hand.removeChild(oppL_hand.firstChild);
        }
        if (oppR_hand.firstChild) {
            oppR_hand.removeChild(oppR_hand.firstChild);
        }
    }

    buildHand(client_hand, jsonData.your_hand, 0, specialModFour(jsonData.your_direction - jsonData.current_player));

    if(jsonData.dummy_direction) {
        switch(specialModFour(jsonData.dummy_direction - jsonData.your_direction)) {
            case 0:
                //TODO: maybe put a dummy indicator on you
                buildEmptyHand(partner_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 2)], specialModFour(jsonData.your_direction + 2 - jsonData.current_player));
                buildEmptyHand(oppL_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 1)], specialModFour(jsonData.your_direction + 1 - jsonData.current_player));
                buildEmptyHand(oppR_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 3)], specialModFour(jsonData.your_direction + 3 - jsonData.current_player));
                break;
            case 1:
                buildEmptyHand(partner_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 2)], specialModFour(jsonData.your_direction + 2 - jsonData.current_player));
                buildDummyHand(oppL_hand, jsonData.dummy_hand, 1, specialModFour(jsonData.your_direction + 1 - jsonData.current_player), jsonData.players[jsonData.dummy_direction]);
                buildEmptyHand(oppR_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 3)], specialModFour(jsonData.your_direction + 3 - jsonData.current_player));
                break;
            case 2:
                buildDummyHand(partner_hand, jsonData.dummy_hand, 2, specialModFour(jsonData.your_direction + 2 - jsonData.current_player), jsonData.players[jsonData.dummy_direction]);
                buildEmptyHand(oppL_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 1)], specialModFour(jsonData.your_direction + 1 - jsonData.current_player));
                buildEmptyHand(oppR_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 3)], specialModFour(jsonData.your_direction + 3 - jsonData.current_player));
                break;
            case 3:
                buildEmptyHand(partner_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 2)], specialModFour(jsonData.your_direction + 2 - jsonData.current_player));
                buildEmptyHand(oppL_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 1)], specialModFour(jsonData.your_direction + 1 - jsonData.current_player));
                buildDummyHand(oppR_hand, jsonData.dummy_hand, 3, specialModFour(jsonData.your_direction + 3 - jsonData.current_player), jsonData.players[jsonData.dummy_direction]);
                break;

            default:
                buildEmptyHand(partner_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 2)], specialModFour(jsonData.your_direction + 2 - jsonData.current_player));
                buildEmptyHand(oppL_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 1)], specialModFour(jsonData.your_direction + 1 - jsonData.current_player));
                buildEmptyHand(oppR_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 3)], specialModFour(jsonData.your_direction + 3 - jsonData.current_player));
                break;
        }
    } else {
        buildEmptyHand(partner_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 2)], specialModFour(jsonData.current_player - jsonData.yourDirection + 2));
        buildEmptyHand(oppL_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 1)], specialModFour(jsonData.current_player - jsonData.yourDirection + 1));
        buildEmptyHand(oppR_hand, jsonData.hand_sizes[specialModFour(jsonData.your_direction + 3)], specialModFour(jsonData.current_player - jsonData.yourDirection + 3));
    }

    buildPlayArea(jsonData.current_trick);
}

// Function to preload images, called by fetchImages below
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
      const fullUrl = `/getimages${url}`;

      const link = document.createElement('a');
      link.href = fullUrl;

      const img = new Image(); // Create an image object
      img.className = "cardImage";
      img.src = fullUrl;

      img.style.display = 'none'; // Hide the image

      link.appendChild(img);

      document.body.appendChild(link); // Append to body to trigger loading

      // Add event listeners for mouseover and mouseout
      link.addEventListener('mouseover', function() {
        img.style.border = '2px solid blue'; // Add border on mouseover
        img.style.transition = 'border-color 0.5s ease';
        });
    
      link.addEventListener('mouseout', function() {
        img.style.border = '2px transparent'; // Remove border on mouseout
        img.style.transition = 'border-color 0.5s ease';
        });
    });
}
  
// Query the server for the names of each of the card images, then call preloadImages() on the list of filenames.
function fetchImages(){
    fetch('/getimages')
        .then(response => response.json())
        .then(data => {
        // Preload the images
        preloadImages(data);
        })
        .catch(error => {
        console.error('Error fetching image URLs:', error);
        });
}

// Call the fetchImages function when the page loads
window.addEventListener("load", (event) => { fetchImages(); });

/*
    Display each card svg below the game board.

    Parameters: none

    Functionality:
      - set the display style of each cardImage element to be "inline" (from "none")
      - change the display button to a hide button
*/
function showAllCards() {
    const allCards = document.getElementsByClassName("cardImage");
    for (let i = 0; i < allCards.length; i++) {
        allCards[i].style.display = 'inline';
    }

    const button = document.getElementById("show-cards-button");
    button.id = "hide-cards-button";
    button.setAttribute("onclick", "hideAllCards()");
    button.innerHTML = ("Click me to hide cards!");
}

/*
    Hide each card svg below the game board.

    Parameters: none

    Functionality:
      - set the display style of each cardImage element to be "none" (from "inline")
      - change the hide button to a display button
*/
function hideAllCards() {
    const allCards = document.getElementsByClassName("cardImage");
    for (let i = 0; i < allCards.length; i++) {
        allCards[i].style.display = 'none';
    }

    const button = document.getElementById("hide-cards-button");
    button.id = "show-cards-button";
    button.setAttribute("onclick", "showAllCards()");
    button.innerHTML = ("Click me to display cards!");
}

// Call the fetchImages function when the page loads
window.addEventListener("load", (event) => { fetchImages(); });

// Socket stuff. Someone with more knowledge should comment this.
socket.on('connect', (arg, callback) => {
    console.log('Socket Connected');
    socket.emit('joinRoom', window.location.pathname.substring(7))
});

socket.on('yourLocalInfo', (your_user, your_table_id) => {
    user = your_user;
    tableID = your_table_id;
    console.log("my local info");
});

socket.on('updateUsers', (response) => {
    players = document.getElementById("users");
    players.innerHTML = response;
});

socket.on('requestGameState', (response) => {
    socket.emit('updateGameState', user);
});

socket.on('gameState', (jsonInput) => {
    jsonData = JSON.parse(jsonInput);
    console.log(jsonData);
    renderUpdate(jsonData);
});
