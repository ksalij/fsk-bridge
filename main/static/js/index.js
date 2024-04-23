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
    + "<button onclick=displayPlayers()>Click me to display players!</button>"
    // put game display stuff here!
    + "<button onclick=displayAllCards()>Click me to display cards!</button>"
);

function displayPlayers() {
    var gameInfoDiv = document.getElementById('players');
    gameInfoDiv.innerHTML = (
        "<p>Clicked!</p>"
    );
}

// Function to preload images, called by fetchImages below
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
      const fullUrl = `/getimages/${url}`;

      const img = new Image(); // Create an image object
      img.src = fullUrl;
      //img.style.display = 'none'; // Hide the image
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

    
// Call the fetchImages function when the page loads
window.onload = fetchImages();