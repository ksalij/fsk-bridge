// Sample jsonData for test purposes
jsonData = {
    "cardsPlayed": [null, null, null, null],
    "yourHand": [
        "C2",
        "C3",
        "C4",
        "C5",
        "C6",
        "C7",
        "C8",
        "C9",
        "CT",
        "CJ",
        "CQ",
        "CK",
        "CA",
    ],
    "handSizes": [13, 13, 13, 13],
    "dummyHand": null,
    "auctionValue": [0, 0],
    "playerNames": ["You", "Player2", "Player3", "Player4"],
    "yourDirection": 0,
    "dummyDirection": null,
    "whoseTurn": 0
}

// Fill the "players" div with information for testing/debugging purposes
function loadPlayerDiv() {
    var gameInfoDiv = document.getElementById('players');
    gameInfoDiv.innerHTML = (
        "<p>Player Names: " + JSON.stringify(jsonData.playerNames) + "</p>"
        + "<button onclick=displayPlayers()>Click me to display players!</button>"
        // put game display stuff here!
        + "<button id=show-cards-button onclick=showAllCards()>Click me to display cards!</button>"
    );
}

// Load debugging info on page load
window.addEventListener("load", (event) => { loadPlayerDiv(); });

function displayPlayers() {
    var gameInfoDiv = document.getElementById('players');
    gameInfoDiv.innerHTML = (
        "<p>Clicked!</p>"
    );
}

/*
    Construct a default hand of X card backs.

    Parameters:
      - handDiv, the hand div to fill with card backs
      - handSize, the number of cards to place in the hand

    Functionality:
      - For each card, create an anchor object with the following properties
          - it links to the card back .svg
          - its content is an image element of the card back
*/
function buildEmptyHand(handDiv, handSize) {
    for (let i = 0; i < handSize; i++) {
        const card = document.createElement("IMG");
        card.setAttribute("src", "/getimages/static/QS.svg"); // CHANGE TO BACK.SVG

        const link = document.createElement('a');
        link.setAttribute("href", "/getimages/static/QS.svg");
        link.setAttribute("class", "card");
        link.appendChild(card);

        handDiv.appendChild(link);
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
function buildHand(handDiv, hand) {
    for (let i = 0; i < hand.length; i++) {
        //TODO load hand
        const card = document.createElement("IMG");
        card_image_path = "/getimages/static/" + jsonData.yourHand[i] + ".svg"
        card.setAttribute("src", card_image_path);

        const link = document.createElement('a');
        link.setAttribute("href", card_image_path);
        link.setAttribute("class", "card");
        link.appendChild(card);

        // link.addEventListener('mouseover', function() {
        //     card.style.border = '2px solid blue'; // Add border on mouseover
        //     card.style.transition = 'border-color 0.5s ease';
        //     });

        // link.addEventListener('mouseout', function() {
        //     card.style.border = '2px transparent'; // Remove border on mouseout
        //     card.style.transition = 'border-color 0.5s ease';
        //     });

        handDiv.appendChild(link);
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
  
    // Add each hand to the correct containers
    client_team.appendChild(client_hand);
    client_team.appendChild(partner_hand);
    opp_team.appendChild(oppL_hand);
    opp_team.appendChild(oppR_hand);

    // Add the new structures back into the document
    gameDiv.appendChild(client_team);
    gameDiv.appendChild(opp_team);
}

// TO DO ON PAGE LOAD: - connect the client to the server via a websocket

/*
    Indicate to the server that the client is ready to play.
    Called when the user clicks on the "start-button" button.

    Parameters: none

    Functionality:
      - remove the readyUp button
      - inform the user that the table is waiting for other players
      - create div structuring for hands, and fills each hand with 13 card backs
*/
function readyUp() {
    const gameDiv = document.getElementById("game");

    // Remove the start button
    document.getElementById("start-button").remove();

    // Inform the user that the table is waiting for other players
    // const waitMessage = document.createElement("p");
    // waitMessage.setAttribute("");

    // Create the div structuring
    buildTableStructure();
}

function renderUpdate(jsonData) {
    const client_hand = document.getElementById("client_hand");
    const partner_hand = document.getElementById("partner_hand");
    const oppL_hand = document.getElementById("oppL_hand");
    const oppR_hand = document.getElementById("oppR_hand");
    for (var i = 0; i < 13; i++) {
      client_hand.removeChild(client_hand.firstChild);
      partner_hand.removeChild(partner_hand.firstChild);
      oppL_hand.removeChild(oppL_hand.firstChild);
      oppR_hand.removeChild(oppR_hand.firstChild);
    }
    buildHand(client_hand, cards);

    if(jsonData.dummyDirection) {
        switch((jsonData.dummyDirection - jsonData.yourDirection)%4) {
            case 0:
                //TODO: maybe put a dummy indicator on you
                buildEmptyHand(partner_hand, jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
                buildEmptyHand(oppL_hand, jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                buildEmptyHand(oppR_hand, jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
            break;
            case 1:
                buildEmptyHand(partner_hand, jsonData.handSizes[(jsonData.yourDirection + 2)%4])
                buildHand(oppL_hand, jsonData.dummyHand);
                buildEmptyHand(oppR_hand, jsonData.handSizes[(jsonData.yourDirection + 3)%4])
            break;
            case 2:
                buildHand(partner_hand, jsonData.dummyHand);
                buildEmptyHand(oppL_hand, jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                buildEmptyHand(oppR_hand, jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
            break;
            case 3:
                buildEmptyHand(partner_hand, jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
                buildEmptyHand(oppL_hand, jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                buildHand(oppR_hand, jsonData.dummyHand);
            break;

            default:
                buildEmptyHand(partner_hand, jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
                buildEmptyHand(oppL_hand, jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                buildEmptyHand(oppR_hand, jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
            break;
        }
    } else {
        buildEmptyHand(partner_hand, jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
        buildEmptyHand(oppL_hand, jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
        buildEmptyHand(oppR_hand, jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
    }
}

function makeHand(cards) {
    var client_cards = new DocumentFragment();
    for (var i = 0; i < jsonData.yourHand.length; i++) {
        const client_card = document.createElement("input");
        client_card.type = "button";
        client_card.className = "card";
        client_card.value = cards[i];
        client_card.onclick = function () {
            socket.emit("cardPlayed", user, client_card.value);
        }
        client_cards.appendChild(client_card);
    }
    return client_cards;
}

// Function to preload images, called by fetchImages below
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
      const fullUrl = `/getimages${url}`;

      const link = document.createElement('a');
      link.href = fullUrl;

      const img = new Image(); // Create an image object
      img.className = "card";
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

function showAllCards() {
    const allCards = document.getElementsByClassName("card");
    for (let i = 0; i < allCards.length; i++) {
        allCards[i].style.display = 'inline';
    }

    const button = document.getElementById("show-cards-button");
    button.id = "hide-cards-button";
    button.setAttribute("onclick", "hideAllCards()");
    button.innerHTML = ("Click me to hide cards!");
}

function hideAllCards() {
    const allCards = document.getElementsByClassName("card");
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

var socket = io.connect('http://localhost:80');
socket.on('connect', (arg, callback) => {
    console.log('Socket Connected');
    socket.emit('joinRoom', window.location.pathname.substring(7))
});

socket.on('userJoined', (response) => {
    players = document.getElementById("currentPlayers");
    players.innerHTML = "Current Users: " + response;
});

socket.on('requestGameState', (response) => {
    socket.emit('updateGameState', user);
});

socket.on('gameState', (jsonData) => {
    renderUpdate(jsonData);
});
