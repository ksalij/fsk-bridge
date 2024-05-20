// Some global variables to keep track of the client relative to the rest of the table
let user = "";
let tableID = 0;
let duringAuction = Boolean(true);
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
                card.setAttribute("id", "playable_card")
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
    // waitMessage.innerHTML = "Waiting for other players to ready up...";
    readyInfo.appendChild(waitMessage);

    // Add the unready button
    const unreadyButton = document.createElement("button");
    unreadyButton.setAttribute("id", "unready-button");
    unreadyButton.setAttribute("class", "ready-button")
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
    document.getElementById("game").innerHTML = `<button id="ready-button" class="ready-button" onclick="readyUp()">Ready Up!</button>`;

    // Notify the server that the user is ready
    socket.emit('unready', tableID, user);
}

function buildAuctionStructure(){
    console.log("this is called");
    const gameDiv = document.getElementById("game");
    const auction = document.createElement("table");
    auction.setAttribute("class", "auction");
    auction.setAttribute("id", "auction");
    gameDiv.appendChild(auction);
}

function clearAuction(){
    const auction = document.getElementById("auction");
    while (auction.firstChild){
        while (auction.firstChild.firstChild) {
            auction.firstChild.removeChild(auction.firstChild.firstChild);
            // Kill all the children
        }
        auction.removeChild(auction.firstChild);
    } 
}

function removeAuction(){
    const gameDiv = document.getElementById("game");
    const auction = document.getElementById("auction");
    gameDiv.removeChild(auction);
}

function displayAuction(bids, dealer, direction){
    clearAuction();
    const suitSymbolMap = {'C': '\u2663', 'D': '\u2666', 'H': '\u2665', 'S': '\u2660', 'N': 'NT'};
    const header = document.createElement("tr");

    vulnerability = 'both';
    directions = ['N', "E", 'S', 'W'];
    for (let i = 0; i < 4; i++){
        const playerHeader = document.createElement('th');
        playerHeader.innerText = directions[(i + SEATMAP[direction] + 2) % 4];
        if (vulnerability == 'both'){
            playerHeader.setAttribute("id", "vul");
        }
        header.appendChild(playerHeader);
    }
    auction.appendChild(header);
    
    auctionList = [...Array((SEATMAP[dealer] - (SEATMAP[direction] + 1) + 4) % 4)].fill('none').concat(bids);
    if (auctionList.length < 16){
        auctionList = auctionList.concat([...Array(16 - auctionList.length)].fill('none'));
    }
    
    for (let i = 0; i < Math.ceil(auctionList.length/4); i++){
        const row = document.createElement("tr");
        for (let j = 0; j < 4; j++){
            if ((4*i + j) < auctionList.length){
                const rowEntry =  document.createElement('td');
                rowEntry.setAttribute('class', 'auctionBid');
                if (auctionList[4*i + j] == 'none'){
                    // rowEntry.innerText = 'NONE';
                } else if (auctionList[4*i + j] == 'p'){
                    rowEntry.setAttribute("id", "p");
                    rowEntry.innerText = 'PASS';
                } else if (auctionList[4*i + j] == 'd'){
                    rowEntry.setAttribute("id", "d");
                    rowEntry.innerText = 'X';
                } else if (auctionList[4*i + j] == 'r'){
                    rowEntry.setAttribute("id", "r");
                    rowEntry.innerText = 'XX';
                } else {
                    rowEntry.setAttribute("id", auctionList[4*i + j][1]);
                    rowEntry.innerText = auctionList[4*i + j][0] + suitSymbolMap[auctionList[4*i + j][1]];
                }
                // rowEntry.innerText = auctionList[4*i + j];
                row.appendChild(rowEntry);
            } 
        }
        auction.appendChild(row);
    }

}

function clearBids() {
    console.log('Clearing Bids');
    const bidding = document.getElementById("bidding");

    if (bidding) {
        while (bidding.firstChild) {
            while (bidding.firstChild.firstChild){
                if (bidding.firstChild.firstChild.firstChild) {
                    while (bidding.firstChild.firstChild.firstChild){
                        bidding.firstChild.firstChild.removeChild(bidding.firstChild.firstChild.firstChild);
                    }
                    bidding.firstChild.removeChild(bidding.firstChild.firstChild);
                }
            }
            bidding.removeChild(bidding.firstChild);
        }
        const gameDiv = document.getElementById("game");
        gameDiv.removeChild(bidding);
    }
}

function displayBids(validBids){
    console.log('Displaying Bids');
    const gameDiv = document.getElementById("game");
    const bidding = document.createElement("div");
    bidding.setAttribute("id", "bidding");
    const tab = document.createElement("div");
    tab.setAttribute("class", "tab");
    for (let i = parseInt(validBids[0][0]); i < 8; i++){
        const level = document.createElement("button");
        level.setAttribute('class', 'tablinks');
        level.onclick = function(event){openBid(event, i);}
        level.innerText = i;
        tab.appendChild(level);
    }
    bidding.appendChild(tab);
    for (let i = 1; i < 8; i++){
        const tabcontent = document.createElement("div");
        suitButtons = "<div id=\"" + i + "\" class=\"tabcontent\">";
        
        // const suitButtons = document.createElement("div");
        // suitButtons.setAttribute('id', i);
        // suitButtons.setAttribute('class', 'tabcontent');

        suitName = ["C", "D", "H", "S", "N"];
        suits = ['\u2663', '\u2666', '\u2665', '\u2660', 'NT'];
        for (let j = 0; j < 5; j++){
            if (validBids.includes(i + suitName[j])){

                // const suitButton = document.createElement("button");
                // suitButton.setAttribute('class', 'suit');
                // level.onclick = function(event){makeBid(event, i + suitName[j]);}
                
                suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'" + i + suitName[j] + "\')\" id = \"" + suitName[j] + "\"> " + i + suits[j] + " </button>";
            }
        }
        suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'p\')\" id = \"p\"> PASS </button>";
        if (validBids.includes('d')){
            suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'d\')\" id = \"d\"> X </button>";
        }
        if (validBids.includes('r')){
            suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'r\')\" id = \"r\"> XX </button>";
        }
        suitButtons = suitButtons + "</div>";
        tabcontent.innerHTML = (suitButtons);
        bidding.appendChild(tabcontent);
    }
    gameDiv.appendChild(bidding);

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
    document.getElementById(validBids[0][0]).style.display = "block";
    tab.firstChild.currentTarget.className += " active";
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

function makeBid(bid){
    socket.emit('sendBid', user, bid);
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
    if (jsonData.game_phase == "AUCTION") {
        duringAuction = Boolean(true);
        displayHandsDuringAuction(jsonData);
        displayAuction(jsonData.bids, jsonData.dealer, jsonData.your_direction);
        if (jsonData.current_player == jsonData.your_direction) {
            console.log(jsonData.current_player);
            console.log(jsonData.your_direction);
            console.log("displaying");
            displayBids(jsonData.valid_bids);
        }
        else {
            console.log(jsonData.current_player);
            console.log(jsonData.your_direction);
            console.log("clear");
            clearBids();
        }
    }
    else if (jsonData.game_phase == "PLAY") {
        if (duringAuction) {
            clearBids();
            clearAuction();
            removeAuction();
            duringAuction = Boolean(false);
        }
        displayPlay(jsonData);
    } else if (jsonData.game_phase == "END") {
        displayEndGame(jsonData);
    }
}

function displayPlay(jsonData) {
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

function displayHandsDuringAuction(jsonData) {

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
    hands[SEATMAP[jsonData.your_direction]] = jsonData.your_hand;

    for (let i = 0; i < 4; i++) {
        buildHand(seats[i], hands[i], jsonData.playable_cards, i, SEATMAP[jsonData.current_player], SEATMAP[jsonData.your_direction], SEATMAP[jsonData.dummy_direction], jsonData.players[jsonData.dummy_direction]);
    }

    const currentTrick = Array(4).fill(null);
    for (direction in jsonData.current_trick) {
        currentTrick[SEATMAP[direction]] = jsonData.current_trick[direction];
    }
    fillPlayArea(SEATMAP[jsonData.your_direction], currentTrick);
}

function displayEndGame(jsonData) {
    // display scores
    console.log(jsonData.NS_score);
    console.log(jsonData.EW_score);
    
    // should clear the ready_users set
    socket.emit('unready', tableID, user);

    // call database function to store the finished game
    socket.emit('storeFinishedGame', tableID, jsonData.bridgehand_lin)

    // display button for new game (same as readyup just instead says start new game)
    document.getElementById("game").innerHTML = `<button id="ready-button" class="ready-button" onclick="readyUp()">Start New Game</button>`;
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


// Call the fetchImages function when the page loads
window.addEventListener("load", (event) => { fetchImages(); });

// Populate the chat when the page loads
socket.emit('populateChat');
socket.emit('userJoined', username, window.location.pathname.split("/")[2])

// Socket stuff. Someone with more knowledge should comment this.
socket.on('connect', (arg, callback) => {
    console.log('Socket Connected & Room Joined');
    socket.emit('joinRoom', window.location.pathname.substring(7));
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

socket.on('readyInfo', (data) => {
    console.log(data);
});

socket.on('buildAuction', (response) => {
    buildAuctionStructure();
});
  
socket.on('usersReady', (response) => {
    document.getElementById("unready-button").remove();
    document.getElementById("waiting").remove();
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

socket.on('testoutput', (response) => {
    console.log("test: " + response);
})
