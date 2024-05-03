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
    jsonData = getStartingHand(); // TODO GET STARTING HAND
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

    // fill the user's partner's hand
    const partner_hand = document.createElement("div");
    partner_hand.setAttribute("id", "partner_hand");
    partner_hand.setAttribute("class", "hand");
    buildEmptyHand(partner_hand, 13);

    // fill the left opponent's hand
    const oppL_hand = document.createElement("div");
    oppL_hand.setAttribute("id", "oppL_hand");
    oppL_hand.setAttribute("class", "hand");
    buildEmptyHand(oppL_hand, 13);

    // fill the right opponent's hand
    const oppR_hand = document.createElement("div");
    oppR_hand.setAttribute("id", "oppR_hand");
    oppR_hand.setAttribute("class", "hand");
    buildEmptyHand(oppR_hand, 13);
  
    client_team.appendChild(client_hand);
    client_team.appendChild(partner_hand);
    opp_team.appendChild(oppL_hand);
    opp_team.appendChild(oppR_hand);

    // put the new divs in the existing "game" div
    gameDiv.appendChild(client_team);
    gameDiv.appendChild(opp_team);
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
      
    buildHand(client_hand, cards);

    if(jsonData.dummyDirection) {
        switch((jsonData.dummyDirection - jsonData.yourDirection)%4) {
            case 0:
                //TODO: maybe put a dummy indicator on you
                var partner_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
                partner_hand.appendChild(partner_cards);
                var oppL_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                oppL_hand.appendChild(oppL_cards);
                var oppR_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
                oppR_hand.appendChild(oppR_cards);
            break;
            case 1:
                var partner_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 2)%4])
                partner_hand.appendChild(partner_cards);
                var oppL_cards = makeHand(jsonData.dummyHand);
                oppL_hand.appendChild(oppL_cards);
                var oppR_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 3)%4])
                oppR_hand.appendChild(oppR_cards);
            break;
            case 2:
                var partner_cards = makeHand(jsonData.dummyHand);
                partner_hand.appendChild(partner_cards);
                var oppL_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                oppL_hand.appendChild(oppL_cards);
                var oppR_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
                oppR_hand.appendChild(oppR_cards);
            break;
            case 3:
                var partner_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
                partner_hand.appendChild(partner_cards);
                var oppL_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                oppL_hand.appendChild(oppL_cards);
                var oppR_cards = makeHand(jsonData.dummyHand);
                oppR_hand.appendChild(oppR_cards);
            break;

            default:
                var partner_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
                partner_hand.appendChild(partner_cards);
                var oppL_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
                oppL_hand.appendChild(oppL_cards);
                var oppR_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
                oppR_hand.appendChild(oppR_cards);
            break;
        }
    } else {
        var partner_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 2)%4]);
        partner_hand.appendChild(partner_cards);
        var oppL_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 1)%4]);
        oppL_hand.appendChild(oppL_cards);
        var oppR_cards = makeEmptyHand(jsonData.handSizes[(jsonData.yourDirection + 3)%4]);
        oppR_hand.appendChild(oppR_cards);
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
});

socket.on('userJoined', (response) => {
  players = document.getElementById("currentPlayers");
  players.innerHTML = "Current Users: " + response;
});

socket.on('gameState', (jsonData) => {
    renderUpdate(jsonData);
  });
