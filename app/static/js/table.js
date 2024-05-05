jsonData = {"game_phase": "AUCTION",
            "valid_bids": ["1C", "1D", "1H", "1S", "1N", "2C", "2D", "2H", "2S", "2N", "3C", "3D", "3H", "3S", "3N", "4C", "4D", "4H", "4S", "4N", "5C", "5D", "5H", "5S", "5N", "6C", "6D", "6H", "6S", "6N", "7C", "7D", "7H", "7S", "7N"], 
            "currentTrick": null, 
            "leader": null, 
            "your_direction": "S", 
            "your_hand": ["2C", "3C", "5C", "QC", "3D", "6D", "7D", "3H", "9H", "TH", "5S", "7S", "8S"], 
            "hand_sizes": {"N": 13, "E": 13, "S": 13, "W": 13}, 
            "dummy_direction": null, 
            "dummy_hand": null, 
            "contract": null, 
            "players": {"E": "user0", "S": "user1", "W": "user2", "N": "user3"}, 
            "current_player": 3
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
    displayAuction();
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

function displayAuction(){
    const gameDiv = document.getElementById("game");
    const bidding = document.createElement("div");
    bidding.setAttribute("id", "bidding");
    const tab = document.createElement("div");
    tab.setAttribute("class", "tab");
    
    window.alert(JSON.stringify(jsonData.valid_bids)[0][0]);
    // parseInt(jsonData['valid_bids'][0][0])
    for (let i = 1; i < 8; i++){
        const level = document.createElement("button");
        level.innerHTML = (
            "<button class=\"tablinks\" onclick=\"openBid(event, '" + i + "')\">" + i + "</button>");
        tab.appendChild(level);
    }
    bidding.appendChild(tab);
    for (let i = 1; i < 8; i++){
        const tabcontent = document.createElement("div");
        suitButtons = "<div id=\"" + i + "\" class=\"tabcontent\">";
        suitName = ["club", "diamond", "heart", "spade"];
        suits = ['\u2663', '\u2666', '\u2665', '\u2660'];
        for (let j = 0; j < 4; j++){
            suitButtons = suitButtons +  "<button class = \"suit\" id = \"" + suitName[j] + "\"> " + i + suits[j] + " </button> ";
        }
        suitButtons = suitButtons + "</div>";
        tabcontent.innerHTML = (suitButtons);
        bidding.appendChild(tabcontent);
    }
    gameDiv.appendChild(bidding);
}

function openBid(evt, level) {
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(level).style.display = "block";
    evt.currentTarget.className += " active";
  }