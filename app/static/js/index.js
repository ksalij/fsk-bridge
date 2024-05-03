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

function buildEmptyHand(handDiv, handSize) {
    for (let i = 0; i < handSize; i++) {
        const card = document.createElement("IMG");
        card.setAttribute("src", "/getimages/static/QS.svg");

        const link = document.createElement('a');
        link.setAttribute("href", "/getimages/static/QS.svg");
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

// Executed when the user says that they're ready to play.
// As of 4/23/24, fills the div with id "game" with some default text-based hands for four players.
function readyUp() {
    const gameDiv = document.getElementById("game");

    // remove the start button
    const start_button = document.getElementById("start-button");
    start_button.remove();

    // the client_team div contains elements for the user and their partner
    const client_team = document.createElement("div");
    client_team.setAttribute("id", "client_team");
    // the opp_team div contains elements for the user's two opponents
    const opp_team = document.createElement("div");
    opp_team.setAttribute("id", "opp_team");
    
    // fill the user's hand
    const client_hand = document.createElement("div");
    client_hand.setAttribute("id", "client_hand");
    client_hand.setAttribute("class", "hand");
    buildEmptyHand(client_hand, 13);
    client_team.appendChild(client_hand);

    // fill the user's partner's hand
    const partner_hand = document.createElement("div");
    partner_hand.setAttribute("id", "partner_hand");
    partner_hand.setAttribute("class", "hand");
    buildEmptyHand(partner_hand, 13);
    client_team.appendChild(partner_hand);

    // fill the left opponent's hand
    const oppL_hand = document.createElement("div");
    oppL_hand.setAttribute("id", "oppL_hand");
    oppL_hand.setAttribute("class", "hand");
    buildEmptyHand(oppL_hand, 13);
    opp_team.appendChild(oppL_hand);

    // fill the right opponent's hand
    const oppR_hand = document.createElement("div");
    oppR_hand.setAttribute("id", "oppR_hand");
    oppR_hand.setAttribute("class", "hand");
    buildEmptyHand(oppR_hand, 13);
    opp_team.appendChild(oppR_hand);

    // put the new divs in the existing "game" div
    gameDiv.appendChild(client_team);
    gameDiv.appendChild(opp_team);
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
});

socket.on('userJoined', (response) => {
  players = document.getElementById("currentPlayers");
  players.innerHTML = "Current Users: " + response;
});
