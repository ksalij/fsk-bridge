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

// var gameInfoDiv = document.getElementById('players');
// gameInfoDiv.innerHTML = (
//     "<p>Player Names: " + JSON.stringify(jsonData.playerNames) + "</p>"
//     + "<br>"
//     + "<button onclick=displayPlayers()>Click me!</button>"
//     // put game display stuff here!
    
// );

// function displayPlayers() {
//     var gameInfoDiv = document.getElementById('players');
//     gameInfoDiv.innerHTML = (
//         "<p>Clicked!</p>"
//     );
// }

function readyUp() {
    const gameDiv = document.getElementById("game");

    const start_button = document.getElementById("start-button");
    start_button.remove();

    const client_team = document.createElement("div");
    client_team.id = "client_team";
    const opp_team = document.createElement("div");
    opp_team.id = "opp_team";
    
    const client_hand = document.createElement("p");
    client_hand.id = "client_hand";
    const client_cards = document.createTextNode(jsonData.yourHand.join(" | "));
    client_hand.appendChild(client_cards);
    client_team.appendChild(client_hand);

    const opp1_hand = document.createElement("p");
    opp1_hand.id = "opp1_hand";
    const hand = [];
    for (let i = 0; i < jsonData.handSizes[1]; i++) {
        hand[i] = "??"
    }
    const opp1_cards = document.createTextNode(hand.join(" | "));
    opp1_hand.appendChild(opp1_cards);
    opp_team.appendChild(opp1_hand);

    const partner_hand = document.createElement("p");
    partner_hand.id = "partner_hand";
    hand.length = 0; // resets array
    for (let i = 0; i < jsonData.handSizes[1]; i++) {
        hand[i] = "??"
    }
    const partner_cards = document.createTextNode(hand.join(" | "));
    partner_hand.appendChild(partner_cards);
    client_team.appendChild(partner_hand);

    const opp3_hand = document.createElement("p");
    opp3_hand.id = "opp3_hand";
    hand.length = 0; // resets array
    for (let i = 0; i < jsonData.handSizes[1]; i++) {
        hand[i] = "??"
    }
    const opp3_cards = document.createTextNode(hand.join(" | "));
    opp3_hand.appendChild(opp3_cards);
    opp_team.appendChild(opp3_hand);

    gameDiv.appendChild(client_team);
    gameDiv.appendChild(opp_team);
}

// function readyUp() {
//     const hand = document.createElement("p");
//     const node = document.createTextNode(jsonData.yourHand.join(" | "));
//     hand.appendChild(node);

//     const gameDiv = document.getElementById("game");
//     gameDiv.appendChild(hand);
// }


// Add more lines like these to display other information


