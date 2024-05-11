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
// Directions are strings, seats are numbers
const SEATMAP = {
    "E" : 0,
    "S" : 1,
    "W" : 2,
    "N" : 3
};

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
      - hand, the list of cards (as strings) to place in the hand
      - playableCards, the list of cards currently playable by the user
      - seat, the seat number corresponding to the hand being built
      - playingSeat, the seat number of the player whose turn it is
      - clientSeat, the seat number of the user
      - dummySeat, the seat number of the dummy
      - dummyUser, the username of the dummy player

    Functionality:
      - for each card in hand, build an HTML button for the card (via buildCard())
          - if a card is playable by the user, give it the css class "playable"
          - if a card is in the hand of the player whose turn it is, give it the css class "current-turn"
      - add each HTML card to handDiv
*/
function buildHand(handDiv, hand, playableCards, seat, playingSeat, clientSeat, dummySeat, dummyUser) {
    for (let i = 0; i < hand.length; i++) {
        //TODO load hand
        const card = buildCard(hand[i]);

        // If constructing the current player's hand, add the current-turn attribute to the cards.
        // Additionally, make these cards playable for the client if:
        //   - it's the client's turn and the client is not the dummy, or
        //   - it's the dummy's turn and the client is the dummy's partner
        if (seat == playingSeat) {
            card.setAttribute("class", card.getAttribute("class") + " current-turn");
            // 
            if (playableCards && playableCards.includes(hand[i])) {
                card.setAttribute("class", card.getAttribute("class") + " playable");
                if (clientSeat != dummySeat && seat == clientSeat) {
                    card.setAttribute("onclick", `cardPlayed("${user}", "${hand[i]}")`);
                } else if (seat == dummySeat && dummySeat == ((clientSeat + 2) % 4)) {
                    card.setAttribute("onclick", `cardPlayed("${dummyUser}", "${hand[i]}")`);
                }
            }
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
    buildHand(hand, Array(13).fill("back"), null, -1, 0, 0, 0, null);
    return hand;
}

/*
    Create the structure for the area where the trick-in-progress is displayed.

    Parameters:
      - cardsPlayed, a list of the cards played so far in the current trick (as strings)

    Functionality:
      - reset the play-area container
      - for each card in cardsPlayed, create an HTML element for the card and add the element to the play-area
*/
function buildPlayArea() {
    const playArea = document.getElementById("play-area");

    const clientTeam = document.createElement("div");
    clientTeam.setAttribute("class", "client-team");
    // clientTeam.setAttribute("id", "client-team-cards");
    const oppTeam = document.createElement("div");
    oppTeam.setAttribute("class", "opp-team");
    // oppTeam.setAttribute("id", "opp-team-cards");

    // create divs to organize the individual cards
    const clientCard = document.createElement("div");
    clientCard.setAttribute("id", "client-trick-card");
    clientCard.setAttribute("class", "in-trick");
    const partnerCard = document.createElement("div");
    partnerCard.setAttribute("id", "partner-trick-card");
    partnerCard.setAttribute("class", "in-trick");
    const oppLCard = document.createElement("div");
    oppLCard.setAttribute("id", "oppL-trick-card");
    oppLCard.setAttribute("class", "in-trick");
    const oppRCard = document.createElement("div");
    oppRCard.setAttribute("id", "oppR-trick-card");
    oppRCard.setAttribute("class", "in-trick");

    // Add each card div to the correct containers
    clientTeam.appendChild(clientCard);
    clientTeam.appendChild(partnerCard);
    oppTeam.appendChild(oppLCard);
    oppTeam.appendChild(oppRCard);

    // Add the new structures back into the document
    playArea.appendChild(clientTeam);
    playArea.appendChild(oppTeam);
}

function fillPlayArea(clientSeat, cardsPlayed) {
    const playArea = document.getElementById("play-area");
    const seats = [null, null, null, null];
    seats[clientSeat] = document.getElementById("client-trick-card");
    seats[(clientSeat + 2) % 4] = document.getElementById("partner-trick-card");
    seats[(clientSeat + 1) % 4] = document.getElementById("oppL-trick-card");
    seats[(clientSeat + 3) % 4] = document.getElementById("oppR-trick-card");
    for (let i = 0; i < 4; i++) {
        if (seats[i].firstChild) {
            seats[i].removeChild(seats[i].firstChild);
        }
    }

    if (cardsPlayed) {
        for (let i = 0; i < 4; i++) {
            if (cardsPlayed[i]) {
                seats[i].appendChild(buildCard(cardsPlayed[i]));
            }
        }
    }
}

/*
    Create the structure for the game table.

    Parameters: none

    Functionality: Builds the div structure for the game table, outlined as follows:
      - a "card" is a link element with an image as its content
      - cards are organized in "hand" divs
      - hands are organized into the structuring div for the appropriate team (ie. "client-team-hands" or "opp-team-hands")
      - client-team-hands and opp-team-hands are contained in the "game" div
      - the game div defines the geometry of the table and contains all of the divs relevant to the play of game
*/
function buildTableStructure() {
    // Get the game div from the page
    const gameDiv = document.getElementById("game");

    // Create the client-team-hands and opp-team-hands divs
    const clientTeam = document.createElement("div"); // the client-team-hands div contains elements for the user and their partner
    clientTeam.setAttribute("id", "client-team-hands");
    clientTeam.setAttribute("class", "client-team");
    const oppTeam = document.createElement("div"); // the opp-team-hands div contains elements for the user's two opponents
    oppTeam.setAttribute("id", "opp-team-hands");
    oppTeam.setAttribute("class", "opp-team");
    
    // Create an empty hand for each player
    const clientHand = buildHandStructure("client_hand");
    const partnerHand = buildHandStructure("partner_hand");
    const oppLHand = buildHandStructure("oppL_hand");
    const oppRHand = buildHandStructure("oppR_hand");

    // Add each hand to the correct containers
    clientTeam.appendChild(clientHand);
    clientTeam.appendChild(partnerHand);
    oppTeam.appendChild(oppLHand);
    oppTeam.appendChild(oppRHand);
    
    // Create an area for cards played during a trick
    const playArea = document.createElement("div");
    playArea.setAttribute("id", "play-area");

    // Add the new structures back into the document
    gameDiv.appendChild(clientTeam);
    gameDiv.appendChild(oppTeam);
    gameDiv.appendChild(playArea);
}

/*
    Indicate to the server that the client is ready to play.
    Called when the user clicks on the "ready-button" button.

    Parameters: none

    Functionality:
      - remove the readyUp button
      - inform the server that the user is ready to start the game
      - create div structuring for hands, and fills each hand with 13 card backs
      - inform the user that the table is waiting for other players
*/
function readyUp() {
    // Remove the ready button
    document.getElementById("ready-button").remove();

    // Notify the server that the user is ready
    socket.emit('ready', tableID, user);
    console.log(`emitted to socket: ready, ${tableID}, ${user}`);

    // Create the div structuring
    buildTableStructure();
    buildPlayArea();
    
    // Create ready message structuring
    const readyInfo = document.createElement("div");
    readyInfo.setAttribute("id", "ready-info");

    // Inform the user that the table is waiting for other players
    const waitMessage = document.createElement("p");
    waitMessage.setAttribute("id", "waiting");
    waitMessage.innerHTML = "Waiting for other players to ready up...";
    readyInfo.appendChild(waitMessage);

    // Add the unready button
    const unreadyButton = document.createElement("button");
    unreadyButton.setAttribute("id", "unready-button");
    unreadyButton.setAttribute("onclick", "readyDown()");
    unreadyButton.innerHTML = "Unready";
    readyInfo.appendChild(unreadyButton);

    document.getElementById("game").appendChild(readyInfo);
}

/*
    Unready the user from their table.

    Parameters: none

    Functionality:
      - reset the content of the "game" div to just the ready button
      - notify the server that the user is no longer ready to start the game
*/
function readyDown() {
    document.getElementById("game").innerHTML = `<button id="ready-button" onclick="readyUp()">Ready Up!</button>`;

    // Notify the server that the user is ready
    socket.emit('unready', tableID, user);
}

/*
    Update the hands for each player.

    Parameters:
      - jsonData, a dictionary defined in /app/bridge/server.py > get_json()
    
    Functionality:
      - clear all of the hands and make new hands for each player, based on the information available in jsonData
      - rebuild the div showcasing the current trick
*/
function renderUpdate(jsonData) {
    const seats = [null, null, null, null];
    seats[SEATMAP[jsonData.your_direction]] = document.getElementById("client_hand");
    seats[(SEATMAP[jsonData.your_direction] + 2) % 4] = document.getElementById("partner_hand");
    seats[(SEATMAP[jsonData.your_direction] + 1) % 4] = document.getElementById("oppL_hand");
    seats[(SEATMAP[jsonData.your_direction] + 3) % 4] = document.getElementById("oppR_hand");
    for (let i = 0; i < 4; i++) {
        while (seats[i].firstChild) {
            seats[i].removeChild(seats[i].firstChild);
        }
    }
    
    const hands = [];
    for (direction in jsonData.hand_sizes) {
        hands[SEATMAP[direction]] = Array(jsonData.hand_sizes[direction]).fill("back");
    }
    // for (let i = 0; i < 4; i++) {
    //     hands[i] = Array(jsonData.hand_sizes[i]).fill("back");
    // }
    hands[SEATMAP[jsonData.your_direction]] = jsonData.your_hand;
    hands[SEATMAP[jsonData.dummy_direction]] = jsonData.dummy_hand;

    for (let i = 0; i < 4; i++) {
        buildHand(seats[i], hands[i], jsonData.playable_cards, i, SEATMAP[jsonData.current_player], SEATMAP[jsonData.your_direction], SEATMAP[jsonData.dummy_direction], jsonData.players[jsonData.dummy_direction]);
    }

    const currentTrick = Array(4).fill(null);
    for (direction in jsonData.current_trick) {
        currentTrick[SEATMAP[direction]] = jsonData.current_trick[direction];
    }
    fillPlayArea(SEATMAP[jsonData.your_direction], currentTrick);
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

socket.on('userJoined', (response) => {
    players = document.getElementById("currentPlayers");
    players.innerHTML = "Current Users: " + response;
});

socket.on('requestGameState', (response) => {
    socket.emit('updateGameState', user);
});

socket.on('gameState', (jsonInput) => {
    jsonData = JSON.parse(jsonInput);
    console.log(jsonData);
    renderUpdate(jsonData);
});

socket.on('readyInfo', (data) => {
    console.log(data);
});

socket.on('isCardGood', (bool, json) => {
    if(bool) {
        console.log("good card");
    }
    else {
        console.log("bad card");
    }
    console.log(json);
});