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

// function displayAllCards() {
//     var logPrintingDiv = document.getElementById('logPrinting');

//     // $.ajax({
//     //     url: '/get_image_list',
//     //     success: function(data) {
//     //         $.each(data, function(index, filename) {
//     //             $("#allCards").append("<img src='/static/cardimages/" + filename + "'>");
//     //         });
//     //     }
//     // });

//     logPrintingDiv.innerHTML = (
//         "<p>DisplayAllCards called!</p>"
//     );

//     $.get('/static/cardimages', function(data) {
//         $(data).find("a").attr("href", function(i, val) {
//             $("allCards").append("<img src='/static/cardimages/" + val + "'>");
//         });
//     });

//     logPrintingDiv.innerHTML += (
//         "<p>DisplayAllCards successful!</p>"
//     );

//     // var folder = "{{url_for('static', filename='cardimages')}}";

//     // $.ajax({
//     //     url: folder,
//     //     success: function(data) {
//     //         $(data).find("a").attr("href", function(i, val) {
//     //             $("body").append("<img src='" + folder + '/' + val + "'>");
//     //         });
//     //     }
//     // });
// }



// Function to fetch JSON data from the Flask endpoint
// function displayAllCards() {
//     fetch('/get_image_list')
//     .then(response => response.json())
//     .then(data => {
//         // Call function to append images to HTML div
//         appendImages(data.images);
//     })
//     .catch(error => {
//         console.error('Error fetching images:', error);
//     });
// }

// // Function to append images to HTML div
// function appendImages(imageList) {
//     const div = document.getElementById('allCards');

//     imageList.forEach(imageFilename => {
//         const img = document.createElement('img');
//         img.src = imageFilename;
//         div.appendChild(img);
//     });
// }

// // Fetch the JSON data from the Flask endpoint
// function displayAllCards() {
//     fetch('/get_image_list')
//     .then(response => response.json())
//     .then(data => {
//         // Select the HTML div where you want to append the images
//         const div = document.getElementById('allCards');

//         // Loop through each image filename in the JSON data
//         data.forEach(filename => {
//         // Create a new <img> element
//         const img = document.createElement('img');

//         // Set the src attribute of the <img> element to the filename
//         img.src = "{{url_for('static', filename='" + filename + "')}}"

//         // Append the <img> element to the HTML div
//         div.appendChild(img);
//         });
//     })
//     .catch(error => {
//         console.error('Error fetching JSON:', error);
//     });
// }


// Function to preload images
function preloadImages(imageUrls) {
    imageUrls.forEach(url => {
      const fullUrl = `/your-flask-endpoint/${url}`;

      console.log("whyyyy")

      const img = new Image();
      img.src = fullUrl;
      //img.style.display = 'none'; // Hide the image
      document.body.appendChild(img); // Append to body to trigger loading
    });
}
  
function fetchImages(){
    // Fetch the image URLs from the Flask endpoint
    fetch('/your-flask-endpoint')
        .then(response => response.json())
        .then(data => {
        // Preload the images
        preloadImages(data);
        })
        .catch(error => {
        console.error('Error fetching image URLs:', error);
        });
}

    
// // Call the fetchImages function when the page loads
window.onload = fetchImages();