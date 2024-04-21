jsonData = {
    "cardsPlayed": [null, null, null, null],
    "yourHand": [
        (0,2),
        (0,3),
        (0,4),
        (0,5),
        (0,6),
        (0,7),
        (0,8),
        (0,9),
        (0,10),
        (0,11),
        (0,12),
        (0,13),
        (0,14)
    ],
    "handSizes": [13, 13, 13, 13],
    "dummyHand": null,
    "auctionValue": [0, 0],
    "playerNames": ["You", "Player2", "Player3", "Player4"],
    "yourDirection": 0,
    "dummyDirection": null,
    "whoseTurn": 0
}

var gameInfoDiv = document.getElementById('players');
gameInfoDiv.innerHTML = (
    "<p>Player Names: " + JSON.stringify(jsonData.playerNames) + "</p>"
    + "<br>"
    + "<button onclick=displayPlayers()>Click me!</button>"
    // put game display stuff here!
    
);

function displayPlayers() {
    var gameInfoDiv = document.getElementById('players');
    gameInfoDiv.innerHTML = (
        "<p>Clicked!</p>"
    );
}



// Add more lines like these to display other information


