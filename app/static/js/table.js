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

function loadPlayerDiv() {
    var gameInfoDiv = document.getElementById('players');
    gameInfoDiv.innerHTML = (
        "<p>Player Names: " + JSON.stringify(jsonData.playerNames) + "</p>"
        + "<button onclick=displayPlayers()>Click me to display players!</button>"
        // put game display stuff here!
        + "<button id=show-cards-button onclick=showAllCards()>Click me to display cards!</button>"
    );
}

window.addEventListener("load", (event) => { loadPlayerDiv(); });

function displayPlayers() {
    var gameInfoDiv = document.getElementById('players');
    gameInfoDiv.innerHTML = (
        "<p>Clicked!</p>"
    );
}

// Executed when the user says that they're ready to play.
// As of 4/23/24, fills the div with id "game" with some default text-based hands for four players.
function readyUp() {
    const gameDiv = document.getElementById("game");

    // remove the start button
    const start_button = document.getElementById("start-button");
    start_button.remove();

    // the client_team div contains elements for the user and their partner
    const client_team = document.createElement("div");
    client_team.id = "client_team";
    // the opp_team div contains elements for the user's two opponents
    const opp_team = document.createElement("div");
    opp_team.id = "opp_team";
    
    // fill the user's hand, with each card in hand being a button of className card
    const client_hand = document.createElement("p");
    client_hand.id = "client_hand";
    var client_cards = new DocumentFragment();
    for (var i = 0; i < jsonData.yourHand.length; i++) {
        const client_card = document.createElement("input");
        client_card.type = "button";
        client_card.className = "card";
        client_card.value = jsonData.yourHand[i];
        client_card.onclick = function () {
            socket.emit("cardPlayed", user, client_card.value);
        }
        client_cards.appendChild(client_card);
    }
    client_hand.appendChild(client_cards);
    client_team.appendChild(client_hand);

    // fill the user's partner's hand
    const partner_hand = document.createElement("p");
    partner_hand.id = "partner_hand";
    const hand = [];
    for (let i = 0; i < jsonData.handSizes[1]; i++) {
        hand[i] = "??"
    }
    const partner_cards = document.createTextNode(hand.join(" | "));
    partner_hand.appendChild(partner_cards);
    client_team.appendChild(partner_hand);

    // fill the left opponent's hand
    const opp1_hand = document.createElement("p");
    opp1_hand.id = "opp1_hand";
    hand.length = 0; // resets array
    for (let i = 0; i < jsonData.handSizes[1]; i++) {
        hand[i] = "??"
    }
    const opp1_cards = document.createTextNode(hand.join(" | "));
    opp1_hand.appendChild(opp1_cards);
    opp_team.appendChild(opp1_hand);

    // fill the right opponent's hand
    const opp3_hand = document.createElement("p");
    opp3_hand.id = "opp3_hand";
    hand.length = 0; // resets array
    for (let i = 0; i < jsonData.handSizes[1]; i++) {
        hand[i] = "??"
    }
    const opp3_cards = document.createTextNode(hand.join(" | "));
    opp3_hand.appendChild(opp3_cards);
    opp_team.appendChild(opp3_hand);

    // put the new divs in the existing "game" div
    gameDiv.appendChild(client_team);
    gameDiv.appendChild(opp_team);
}

// Function to preload images, called by fetchImages below
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
      const fullUrl = `/getimages/${url}`;

      const img = new Image(); // Create an image object
      img.className = "card";
      img.src = fullUrl;
      img.style.display = 'none'; // Hide the image
      document.body.appendChild(img); // Append to body to trigger loading
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
});

socket.on('userJoined', (response) => {
  players = document.getElementById("currentPlayers");
  players.innerHTML = "Current Users: " + response;
});
