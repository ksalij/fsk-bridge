// Directions are strings, seats are numbers
const SEATMAP = {
    "E" : 0,
    "S" : 1,
    "W" : 2,
    "N" : 3
};

/*
    Switch a user with a seat, occupied or unoccupied.

    Parameters:
    - direction, the seat which the user wants to switch to

    Functionality:
      - set the display style of each cardImage element to be "inline" (from "none")
      - change the display button to a hide button
*/
function switchSeat(direction) {
    console.log("direction");
    socket.emit('switchSeat', direction, username);
    clientDirection = direction;
}

function addSwitchSeatButtons(players, readyUsers) {
    console.log("clientDir: " + clientDirection);
    const clientTeam = document.getElementById("client-team-hands");
    const oppTeam = document.getElementById("opp-team-hands");

    // padding divs for spacing between seat divs
    const oppTeamPadding = document.createElement('div');
    oppTeamPadding.setAttribute('class', 'switch-seat-div');
    oppTeamPadding.setAttribute('id', 'switch-seat-padding');

    const clientTeamPadding = document.createElement('div');
    clientTeamPadding.setAttribute('class', 'switch-seat-div');
    clientTeamPadding.setAttribute('id', 'switch-seat-padding');

    let oppTeamCount = 0;
    let clientTeamCount = 0;

    let directions = {};
    if (clientDirection == "E" || clientDirection == "W") {
        directions = {"E": clientTeam, "S": oppTeam, "W": clientTeam, "N": oppTeam};
    } else {
        directions = {"E": oppTeam, "S": clientTeam, "W": oppTeam, "N": clientTeam};
    }

    directionOrder = ["E", "S", "W", "N"];

    for (let i = 0; i < 4; i++) {
        let dir = directionOrder[(i + SEATMAP[clientDirection]) % 4];
        const resident = players[dir];

        const seatDiv = document.createElement("div");
        seatDiv.setAttribute("class", "switch-seat-div");

        const seatInfo = document.createElement("p");
        if (!resident) {
            seatInfo.innerHTML = "Empty seat.";
        } else if (resident == username) {
            seatInfo.innerHTML = "Your seat.";
        } else if (readyUsers.includes(resident)) {
            seatInfo.innerHTML = resident + " is ready to go.";
        } else if (readyUsers.includes(username)) {
            seatInfo.innerHTML = resident + " is not ready to go.";
        } else {
            seatInfo.innerHTML = resident + "'s seat.";
        }
        seatDiv.appendChild(seatInfo);

        if (resident != username && !readyUsers.includes(username) && !readyUsers.includes(resident)) {
            const switchButton = document.createElement("button");
            // button.setAttribute("class", "switch-seat-button");
            switchButton.setAttribute("class", "seat-buttons");
            switchButton.setAttribute("onclick", `switchSeat("${dir}")`);
            if (!resident) {
                switchButton.innerHTML = "Take " + dir + " seat";
            } else {
                switchButton.innerHTML = "Switch with " + resident;
            }
            seatDiv.appendChild(switchButton);

            // Robot button
            const robotButton = document.createElement("button");
            robotButton.setAttribute("class", "robotButton");
            robotButton.setAttribute("onclick", `seatRobot("${dir}")`);
            robotButton.innerHTML = "Seat Robot";
            seatDiv.appendChild(robotButton);
            // End Robot button
        }

        directions[dir].appendChild(seatDiv);

        // puts a padding div in between the two seat divs
        if (directions[dir] == oppTeam) {
            oppTeamCount = oppTeamCount + 1;
        }
        if (directions[dir] == clientTeam) {
            clientTeamCount = clientTeamCount + 1;
        }
        if (oppTeamCount == 1) {
            oppTeam.appendChild(oppTeamPadding);
        }
        if (clientTeamCount == 1) {
            clientTeam.appendChild(clientTeamPadding);
        }
    }

    // const directionDivs = [
    //     document.getElementById("bottom-dir"),
    //     document.getElementById("left-dir"),
    //     document.getElementById("top-dir"),
    //     document.getElementById("right-dir")
    // ];

    const directionDivs = document.querySelectorAll(".direction");

    for (let i = 0; i < 4; i++) {
        directionDivs[i].innerHTML = "<p>" + directionOrder[(i + SEATMAP[clientDirection]) % 4] + "</p>";
    }
}

function seatRobot(dir){
    console.log("seat robot");
    socket.emit("addRobot", tableID, dir);
}

/*
    Remove all seat switching related items from the page.
    Syntax sourced from this stackoverflow answer: https://stackoverflow.com/a/57547187
*/
function removeSwitchSeatButtons() {
    document.querySelectorAll(".switch-seat-div").forEach(e => e.remove());
}

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
    Informs the server that the username wants to play a specific card.
*/
function cardPlayed(username, value) {
    socket.emit("cardPlayed", username, value);
}

/*
    Construct an HTML hand of card images from a list of card strings.

    Parameters:
      - handDiv, the hand div to fill with cards
      - hand, the list of cards (as strings) to place in the hand
      - playableCards, the list of cards currently playable by the username
      - seat, the seat number corresponding to the hand being built
      - playingSeat, the seat number of the player whose turn it is
      - clientSeat, the seat number of the username
      - dummySeat, the seat number of the dummy
      - dummyUser, the username of the dummy player

    Functionality:
      - for each card in hand, build an HTML button for the card (via buildCard())
          - if a card is playable by the username, give it the css class "playable"
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
                    card.setAttribute("onclick", `cardPlayed("${username}", "${hand[i]}")`);
                } else if (seat == dummySeat && dummySeat == ((clientSeat + 2) % 4)) {
                    card.setAttribute("onclick", `cardPlayed("${dummyUser}", "${hand[i]}")`);
                }
            }
        }

        handDiv.appendChild(card);
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
    buildHand(hand, Array(13).fill("back"), null, -1, 0, 0, 0, null);
    return hand;
}

/*
    Create empty hands for each seat.
    Create the structure for the area where the trick-in-progress isCardGood displayed.

    Parameters:
      - cardsPlayed, a list of the cards played so far in the current trick (as strings)

    Functionality:
      - reset the play-area container
      - for each card in cardsPlayed, create an HTML element for the card and add the element to the play-area
*/
function buildPlayArea() {
    // Create an area for cards played during a trick
    const playArea = document.createElement("div");
    playArea.setAttribute("id", "play-area");

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

    // Add each card to the correct container
    clientTeam.appendChild(clientCard);
    clientTeam.appendChild(partnerCard);
    oppTeam.appendChild(oppLCard);
    oppTeam.appendChild(oppRCard);

    // Add the new structures into the play area div
    playArea.appendChild(clientTeam);
    playArea.appendChild(oppTeam);

    // Add the play area into the game div
    document.getElementById("game").appendChild(playArea);
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

    Functionality: Builds the hands for each seat at the table, outlined as follows:
      - a "card" is a link element with an image as its content
      - cards are organized in "hand" divs
      - hands are organized into the structuring div for the appropriate team (ie. "client-team-hands" or "opp-team-hands")
      - client-team-hands and opp-team-hands are contained in the "game" div
      - the game div defines the geometry of the table and contains all of the divs relevant to the play of game
*/
function buildHands() {
    // Grab the client-team-hands and opp-team-hands divs from the page
    const clientTeam = document.getElementById("client-team-hands");
    const oppTeam = document.getElementById("opp-team-hands");
    
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
}

/*
    Remove the hand for each seat.
*/
function removeHands() {
    document.querySelectorAll(".hand").forEach(e => e.remove());
}

/*
    Indicate to the server that the client is ready to play.
    Called when the username clicks on the "ready-button" button.

    Parameters: none

    Functionality:
      - remove the readyUp button
      - inform the server that the username is ready to start the game
      - create div structuring for hands, and fills each hand with 13 card backs
      - inform the username that the table is waiting for other players
*/
function readyUp() {
    // Notify the server that the username is ready
    socket.emit('ready', tableID, username);
    console.log(`emitted to socket: ready, ${tableID}, ${username}`);

    // Change the ready button
    const readyButton = document.getElementById("ready-button");
    readyButton.setAttribute("onclick", "readyDown()");
    readyButton.innerHTML = "Unready";

    // Inform the username that the table is waiting for other players
    const waitMessage = document.createElement("p");
    waitMessage.setAttribute("id", "waiting");
    waitMessage.innerHTML = "Waiting for other players to ready up...";
    document.getElementById("ready-info").insertBefore(waitMessage, readyButton);
}

/*
    Unready the username from their table.

    Parameters: none

    Functionality:
      - reset the content of the "game" div to just the ready button
      - notify the server that the username is no longer ready to start the game
*/
function readyDown() {
    // Change the ready button
    const readyButton = document.getElementById("ready-button");
    readyButton.setAttribute("onclick", "readyUp()");
    readyButton.innerHTML = "Ready Up!";

    // Remove the waiting message
    document.getElementById("waiting").remove();

    // Notify the server that the username is ready
    socket.emit('unready', tableID, username);
}

function buildAuctionStructure(){
    console.log("this is called");
    const gameDiv = document.getElementById("game");
    const auctionContainer = document.createElement("div");
    auctionContainer.setAttribute("class", "auctionContainer");
    gameDiv.appendChild(auctionContainer);
    const auction = document.createElement("table");
    auction.setAttribute("class", "auction");
    auction.setAttribute("id", "auction");
    auctionContainer.appendChild(auction);
}

function clearAuction(){
    const auction = document.getElementById("auction");
    while (auction.firstChild){
        while (auction.firstChild.firstChild) {
            auction.firstChild.removeChild(auction.firstChild.firstChild);
        }
        auction.removeChild(auction.firstChild);
    }
}

function removeAuction(){
    const gameDiv = document.getElementById("game");
    const auctionContainer = document.getElementsByClassName("auctionContainer");
    gameDiv.removeChild(auctionContainer[0]);
}

function displayAuction(bids, dealer, direction, vulnerability){
    clearAuction();
    const auction = document.getElementById("auction");
    const suitSymbolMap = {'C': '\u2663', 'D': '\u2666', 'H': '\u2665', 'S': '\u2660', 'N': 'NT'};
    const header = document.createElement("tr");

    const directions = ['N', "E", 'S', 'W'];
    for (let i = 0; i < 4; i++){
        const playerHeader = document.createElement('th');
        playerHeader.innerText = directions[(i + SEATMAP[direction] + 2) % 4];
        all_vul = vulnerability == 'both';
        NS_vul = vulnerability == 'NS' && (directions[(i + SEATMAP[direction] + 2) % 4] == 'N' || directions[(i + SEATMAP[direction] + 2) % 4] == 'S');
        EW_vul = vulnerability == 'EW' && (directions[(i + SEATMAP[direction] + 2) % 4] == 'E' || directions[(i + SEATMAP[direction] + 2) % 4] == 'W');
        if (all_vul || NS_vul || EW_vul){
            playerHeader.setAttribute("class", "vul");
        }
        else{
            playerHeader.setAttribute("class", "nonvul");
        }
        header.appendChild(playerHeader);
    }
    auction.appendChild(header);
    
    let auctionList = [...Array((SEATMAP[dealer] - (SEATMAP[direction] + 1) + 4) % 4)].fill('none').concat(bids);
    if (auctionList.length < 16){
        auctionList = auctionList.concat([...Array(16 - auctionList.length)].fill('none'));
    }

    for (let i = 0; i < Math.ceil(auctionList.length/4); i++){
        const row = document.createElement("tr");
        for (let j = 0; j < 4; j++){
            if ((4*i + j) < auctionList.length){
                const rowEntry = document.createElement('td');
                rowEntry.setAttribute('class', 'auctionBid');
                if (auctionList[4*i + j] == 'none'){
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
                row.appendChild(rowEntry);
            } 
        }
        auction.appendChild(row);
    }

}

function clearBids() {
    console.log('Clearing Bids');
    // document.getElementById("bidding").innerHTML = "";
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
    if (!validBids){
        return;
    }
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
        suitName = ["C", "D", "H", "S", "N"];
        suits = ['\u2663', '\u2666', '\u2665', '\u2660', 'NT'];
        for (let j = 0; j < 5; j++){
            if (validBids.includes(i + suitName[j])){
                suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'" + i + suitName[j] + "\')\" id = \"" + suitName[j] + "bid\"> " + i + suits[j] + " </button>";
            }
        }
        suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'p\')\" id = \"pbid\"> PASS </button>";
        if (validBids.includes('d')){
            suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'d\')\" id = \"dbid\"> X </button>";
        }
        if (validBids.includes('r')){
            suitButtons = suitButtons +  "<button class = \"suit\" onclick = \"makeBid(\'r\')\" id = \"rbid\"> XX </button>";
        }
        suitButtons = suitButtons + "</div>";
        tabcontent.innerHTML = (suitButtons);
        bidding.appendChild(tabcontent);
    }
    gameDiv.appendChild(bidding);
  
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(validBids[0][0]).style.display = "block";
    document.getElementById(validBids[0][0]).className += " active";
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
    socket.emit('sendBid', username, bid);
}

/*
    Create the structure for the area where the trick-in-progress is displayed.

    Parameters:
      - cardsPlayed, a list of the cards played so far in the current trick (as strings)

    Functionality:
      - reset the trick-area container
      - for each card in cardsPlayed, create an HTML element for the card and add the element to the trick-area
*/
function buildTrickArea() {
    // Create an area for cards played during a trick
    const trickArea = document.createElement("div");
    trickArea.setAttribute("id", "trick-area");

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

    // Add each card to the correct container
    clientTeam.appendChild(clientCard);
    clientTeam.appendChild(partnerCard);
    oppTeam.appendChild(oppLCard);
    oppTeam.appendChild(oppRCard);

    // Add the new structures into the play area div
    trickArea.appendChild(clientTeam);
    trickArea.appendChild(oppTeam);

    // Add the play area into the game div
    document.getElementById("game").appendChild(trickArea);
}

/*
    Removes the trick-area div from the page.
*/
function removeTrickArea() {
    document.getElementById("trick-area").remove();
}

/*
    Display the cards thus far played in the current trick.

    Parameters:
      - clientSeat, the seat number of the client
      - cardsPlayed, a list of the cards played during the current trick

    Functionality:
      - clear all of the cards from the trick-area
      - for each card played this trick, display that card in trick-area in front of the player who played the card
*/
function fillTrickArea(clientSeat, cardsPlayed) {
    const trickArea = document.getElementById("trick-area");
    const seats = [null, null, null, null];
    seats[clientSeat] = document.getElementById("client-trick-card");
    seats[(clientSeat + 2) % 4] = document.getElementById("partner-trick-card");
    seats[(clientSeat + 1) % 4] = document.getElementById("oppL-trick-card");
    seats[(clientSeat + 3) % 4] = document.getElementById("oppR-trick-card");
    for (let i = 0; i < 4; i++) {
        if(seats[i]){
            if (seats[i].firstChild) {
                seats[i].removeChild(seats[i].firstChild);
            }
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

function updateTricksTaken(nsScore, ewScore) {
    document.getElementById("NS-tricks").innerHTML = nsScore;
    document.getElementById("EW-tricks").innerHTML = ewScore;
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
    if (jsonData.game_phase == "AUCTION" || (jsonData.game_phase == "PLAY" && jsonData.display_dummy == false)) {
        duringAuction = Boolean(true);

        displayHands(jsonData);
        displayAuction(jsonData.bids, jsonData.dealer, jsonData.your_direction, jsonData.vulnerability);
        if (jsonData.current_player == jsonData.your_direction) {
            console.log(jsonData.current_player);
            console.log(jsonData.your_direction);
            console.log("displaying");
            displayBids(jsonData.valid_bids);
        }
        else {
            socket.emit('aiBid', username);
            console.log(jsonData.current_player);
            console.log(jsonData.your_direction);
            console.log("clear");
            clearBids();
        }
        if (jsonData.game_phase == "PLAY" && jsonData.display_dummy == false){
            clearBids();
            socket.emit('aiPlay', tableID);
        }
    }
    else if (jsonData.game_phase == "PLAY") {
        if (document.getElementById("auction")){
            clearBids();
            clearAuction();
            removeAuction();
            buildTrickArea();
            document.getElementById("contract-value").innerHTML = jsonData.contract;
        }
        updateTricksTaken(jsonData.NS_tricks, jsonData.EW_tricks);
        displayHands(jsonData);
        socket.emit('aiPlay', tableID);
    } else if (jsonData.game_phase == "END") {
        removeHands();
        removeTrickArea();
        displayEndGame(jsonData);
    }
}

function displayHands(jsonData) {
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
    if (jsonData.display_dummy) {
        hands[SEATMAP[jsonData.dummy_direction]] = jsonData.dummy_hand;
    }

    for (let i = 0; i < 4; i++) {
        buildHand(seats[i], hands[i], jsonData.playable_cards, i, SEATMAP[jsonData.current_player], SEATMAP[jsonData.your_direction], SEATMAP[jsonData.dummy_direction], jsonData.players[jsonData.dummy_direction]);
    }

    if (jsonData.game_phase == "PLAY") {
        const currentTrick = Array(4).fill(null);
        for (direction in jsonData.current_trick) {
            currentTrick[SEATMAP[direction]] = jsonData.current_trick[direction];
        }
        fillTrickArea(SEATMAP[jsonData.your_direction], currentTrick);
    }
}

function displayEndGame(jsonData) {
    // display scores
    document.getElementById("NS-score").innerHTML = jsonData.NS_score;
    document.getElementById("EW-score").innerHTML = jsonData.EW_score;
    
    // should clear the ready_users set
    socket.emit('unready', tableID, username);

    // call database function to store the finished game
    socket.emit('storeFinishedGame', tableID, jsonData.bridgehand_lin);

    // display button for new game (same as readyup just instead says start new game)
    const ready = document.createElement("div");
    ready.setAttribute("id", "ready-info");
    ready.innerHTML = `<button id="ready-button" class="ready-button" onclick="readyUp()">Start New Game</button>`;
    document.getElementById("game").appendChild(ready);
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

socket.emit('populateChat');
// joins the username to the table and room
socket.emit('userJoined', username, tableID); //window.location.pathname.split("/")[2])

// Socket stuff. Someone with more knowledge should comment this.
socket.on('connect', (arg, callback) => {
    console.log('Socket Connected & Room Joined');
    // socket.emit('joinRoom', window.location.pathname.substring(7));
    // socket.emit('hasGameStarted', window.location.pathname.substring(7));
    socket.emit('joinRoom', tableID);
    socket.emit('hasGameStarted', tableID);

});

socket.on('buildGame', (jsonInput, player) => {
    if (username == player){
        buildHands();
        jsonData = JSON.parse(jsonInput);
        document.getElementById('ready-info').remove();
        console.log("buildGame")
        if (jsonData.game_phase == "AUCTION") {
            console.log('AUCTION SHOULD BE BUILT')
            buildAuctionStructure();
        } else if (jsonData.game_phase == "PLAY") {
            console.log("TRICK AREA SHOULD BE BUILT")
            buildTrickArea();
        }
        renderUpdate(jsonData);
    }
});

// socket.on('yourLocalInfo', (your_user, your_table_id, your_direction) => {
//     username = your_user;
//     tableID = your_table_id;
//     clientDirection = your_direction;
//     console.log("my local info");
// });

socket.on('updateUsers', (response, readyUsers) => {
    let players = JSON.parse(response); // list of players
    removeSwitchSeatButtons();
    addSwitchSeatButtons(players, readyUsers);
});

socket.on('seatSwitched', (player, new_direction) => {
    if(player == username) {
        clientDirection = new_direction;
        socket.emit('updateSeatSession', player, new_direction);
    }
});

socket.on('requestGameState', (response) => {
    socket.emit('updateGameState', username);
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
    removeSwitchSeatButtons();
    buildHands();
    buildAuctionStructure();
});
  
socket.on('usersReady', (response) => {
    document.getElementById("ready-info").remove();
});

// socket.on('closeTable', (tableID) => {
//     console.log('close table!!');
//     socket.emit('tableClosed', tableID);
//     window.location.href = '/home';
// });

socket.on('killTable', (tableID) => {
    console.log('kill table!!');
    window.location.href = '/killTable/' + tableID;
});

socket.on('redirectHome', (error) => {
    window.location.href = '/home/' + error;
  });

socket.on('testoutput', (response) => {
    console.log("test: " + response);
})
