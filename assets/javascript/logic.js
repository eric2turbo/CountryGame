var config = {
    apiKey: "AIzaSyCkHIlr8v0zS57zLeVFdCmeWeUYCFpztdo",
    authDomain: "groupproject1-496a1.firebaseapp.com",
    databaseURL: "https://groupproject1-496a1.firebaseio.com",
    projectId: "groupproject1-496a1",
    storageBucket: "groupproject1-496a1.appspot.com",
    messagingSenderId: "370391785809"
};
firebase.initializeApp(config);

var database = firebase.database();
var chatData = database.ref("/chat");
var playersRef = database.ref("players");
var currentStageRef = database.ref("stage");
var currentCountryRef = database.ref("randCountry");
var username = "Guest";
var currentPlayers = null;
var currentStage = null;
var playerNum = false;
var playerOneExists = false;
var playerTwoExists = false;
var playerOneData = null;
var playerTwoData = null;
var currentAnswer = null;
var distance = 0;
var randCountry;
var x;

$(document).ready(function() {


//Variabels for Ajax
var country = [
    "columbia", "germany", "france", "mexico", "canada", "trinidad", "pakistan", "thailand",
    "phillipines", "china", "japan", "switzerland", "brazil", "peru", "bangladesh",
    "russia", "australia", "argentina", "indonesia", "nigeria", "kenya",
    "ethiopa", "egypt", "vietnam", "iran", "turkey", "italy", "tanzania",
    "myanmar", "spain", "ukraine", "sudan", "uganda", "algeria", "poland",
    "iraq", "morocco", "uzbekistan", "malaysia", "venezuela", "nepal",
    "angola", "ghana", "yemen", "mozambique", "cameroon", "afghanistan", "italy", "ireland"
];

//Picks a random country from the array
function picker() {
    
    if (playerNum === 1) {
        randCountry = country[Math.floor(Math.random() * country.length)];
        currentCountryRef.set({
            randCountry: randCountry
        });
    }
    console.log("Player " + playerNum + " called this. randCountry in picker is " + randCountry);
}


// USERNAME LISTENERS
// Start button - takes username and tries to get user in game
$("#start").on("click", function() {
    if ($("#username").val() !== "") { 
        console.log($("#username").val());
        username = escapeHtml($("#username").val()).trim();
        console.log(username + " variable");
        getInGame();
    }
});

// listener for 'enter' in username input
$("#username").keypress(function(e) {
    if (e.keyCode === 13 && $("#username").val() !== "") {
        username = escapeHtml($("#username").val()).trim();
        getInGame();
    }
});

//function to replace special characters
function escapeHtml(text) {
    var map = {
        '&': '',
        '<': '',
        '>': '',
        '"': '',
        "'": '',
        '$': '',
        '(': '',
        ')': '',
        '#': ''
    };
    return text.replace(/[&<>"'$()#]/g, function(m) {
        return map[m];
    });
}



// CHAT LISTENERS
// Chat send button listener, grabs input and pushes to firebase. (Firebase's push automatically creates a unique key)
$("#chat-send").click(function() {
    if ($("#chat-input").val() !== "") {

        var message = escapeHtml($("#chat-input").val());

        chatData.push({
            name: username,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
            idNum: playerNum
        });

        // check for answer.  
        if (currentStage === 1) {

            if (message.toLowerCase() == randCountry.toLowerCase()) {
               
                if (playerNum === 1) {
                    currentStageRef.set(2);
                    
                } else {
                    currentStageRef.set(3);
                }
            }
        }

        $("#chat-input").val("");
    }
});

// Chatbox input listener

$("#chat-input").keypress(function(e) {
    if (e.keyCode === 13 && $("#chat-input").val() !== "") {

        var message = escapeHtml($("#chat-input").val());

        chatData.push({
            name: username,
            message: message,
            time: firebase.database.ServerValue.TIMESTAMP,
            idNum: playerNum
        });

        if (currentStage === 1) {

            if (message.toLowerCase() == randCountry.toLowerCase()) {
               
                if (playerNum === 1) {
                    currentStageRef.set(2);
                    
                } else {
                    currentStageRef.set(3);
                }
            }
        }

        $("#chat-input").val("");
    }
});

// Update chat on screen when new message detected - ordered by 'time' value
chatData.orderByChild("time").on("child_added", function(snapshot) {

    // If idNum is 0, then its a disconnect message and displays accordingly
    // If not - its a user chat message
    if (snapshot.val().idNum === 0) {
        $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" +
            snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    } else {
        $("#chat-messages").append("<p class=player" + snapshot.val().idNum + "><span>" +
            snapshot.val().name + "</span>: " + snapshot.val().message + "</p>");
    }

    // Keeps div scrolled to bottom on each update.
    $("#chat-messages").scrollTop($("#chat-messages")[0].scrollHeight);
});

// Tracks changes in key which contains player objects
playersRef.on("value", function(snapshot) {

    // length of the 'players' array
    currentPlayers = snapshot.numChildren();
    
    // Check to see if players exist
    playerOneExists = snapshot.child("1").exists();
    playerTwoExists = snapshot.child("2").exists();

    // Player data objects
    playerOneData = snapshot.child("1").val();
    playerTwoData = snapshot.child("2").val();

    // If theres a player 1, fill in name and win loss data
    if (playerOneExists) {
        var queryURL = "https://api.giphy.com/v1/gifs/search?q=" +
            playerOneData.name + "&api_key=dc6zaTOxFJmzC&limit=3";
        var p1pic;

        $.ajax({
                url: queryURL,
                method: "GET"
            })
            .done(function(response) {
                var results = response.data;
                if (response.pagination.count === 0) {
                    p1pic = "assets/images/egg.jpg";
                } else {
                    p1pic = results[0].images.fixed_height.url;

                }
                $("#player1-pic").attr("src", p1pic);
            });


        $("#player1-name").text(playerOneData.name);
        $("#player1-score").text(playerOneData.score);
        //Picks the country when player 1 signs in
        if (playerNum === 1 && !playerTwoExists) {
         picker();
        }
    } else {

        // If there is no player 1, clear win/loss data and show waiting
        $("#player1-name").text("Waiting for Player 1");
        $("#player1-pic").attr("src", "assets/images/egg.jpg");
        $("#player1-score").text(0);
    }

    // If theres a player 2, fill in name and win/loss data
    if (playerTwoExists) {
        var queryURL = "https://api.giphy.com/v1/gifs/search?q=" +
            playerTwoData.name + "&api_key=dc6zaTOxFJmzC&limit=3";
        var p2pic;

        $.ajax({
                url: queryURL,
                method: "GET"
            })
            .done(function(response) {
                var results = response.data;
                if (response.pagination.count === 0) {
                    p2pic = "assets/images/egg.jpg";
                } else {
                    p2pic = results[0].images.fixed_height.url;
                    console.log(p2pic);
                }
                $("#player2-pic").attr("src", p2pic);

            });

        $("#player2-name").text(playerTwoData.name);
        $("#player2-score").text(playerTwoData.score);

    } else {

        // If no player 2, clear win/loss and show waiting
        $("#player2-name").text("Waiting for Player 2");
        $("#player2-pic").attr("src", "assets/images/egg.jpg");
        $("#player2-score").text(0);
    }
});

currentCountryRef.on("value", function(shot) {
    randCountry = shot.val().randCountry;
    console.log("randCountry from shot " + randCountry);
});


// TODO Change logic
// Detects changes in current stage key
currentStageRef.on("value", function(snapshot) {

    // Gets current stage from snapshot
    currentStage = snapshot.val();

    // Don't do the following unless you're logged in
    if (playerNum) {
       
        if (currentStage === 1) {

            var countryCode = "";
            
            console.log("stage 1 the answer: " + randCountry);
           
            var queryURLRC = "https://restcountries.eu/rest/v2/name/" + randCountry;
            // console.log(randCountry);
            //ajax for country info
            $.ajax({
                url: queryURLRC,
                method: "GET"
            }).done(function(response) {
                //displays flag
                $("#cImg").attr("src", response[0].flag);
                
                //phone country code
                // $("#api").text(response[0].callingCodes);
                // console.log(response[0].callingCodes);
                //display capital
                $("#api").append("<p>Capital: " + response[0].capital + "</p>");
                
                //total population is an intg
                $("#api").append("<p>Total Population: " + response[0].population + "</p>");
                
                //land area in sqKm and sqMi
                $("#api").append("<p>Land Area: " + (Math.floor((response[0].area) * 0.386102)) + " (Miles Sq.)");
               
                //get 2letter country code from response 
                // change variable cC to use for WBank ajax
                countryCode = response[0].alpha2Code;
                
                var queryURLWB = "http://api.worldbank.org/v2/countries/" + countryCode + "?format=json";
                //ajax within Ajax for World Bank
                $.ajax({
                    url: queryURLWB,
                    method: "GET"
                }).done(function(response) {
                    $("#api").append("<p>Region: " + response[1][0].region.value + "</p>");
                    console.log(response[1][0].region.value);
                    });
            });

            //Initialize Timer
            

            function playtime(cinterval) {
                clearInterval(x);
                $("#mid-col").empty();
            }

            var countDown = 61;
            var now = 0;
            var seconds = 0;
            distance = 0;

            // Update the count down every 1 second
            x = setInterval(function() {
                now = now + 1;
                // Find the distance between now an the count down time
                distance = countDown - now;
                seconds = Math.floor((distance % (1000 * 60)));
                // Display the result in the element with id="timer-panel"
                $("#mid-col").html("<h1><center><b>" + seconds + "</b></center></h1>");
                if (seconds <= 0) {
                    clearInterval(x);
                    currentStageRef.set(4);
                    $("#mid-col").html("<h3><center>TIME UP!</center></h3>");
                    //      ls=ls+1;
                    //      updateScore();
                }

                // If the count down is finished, write some text 
                if (seconds <= 20) {
                    // clearInterval(x);
                    document.getElementById('mid-col').style.backgroundColor = "red";
                    document.getElementById('mid-col').style.color = "blue";
                }
                }, 1000);


            //Player 1 got it right
            } else if (currentStage === 2) {
              console.log("stage 2");
              clearInterval(x);
              playersRef.child("1").child("score").set(playerOneData.score + distance);

              if (playerNum === 1) {
                chatData.push({
                  name: "",
                  message: playerOneData.name + " won.  The answer was " + randCountry,
                  time: firebase.database.ServerValue.TIMESTAMP,
                  idNum: 0
                });
              }

              currentStageRef.set(5);  

            }
    }
    //continued since bracket wasn't read after last if else

    if (playerNum) {
        if (currentStage === 3) {
            console.log("stage 3");
            clearInterval(x);
            playersRef.child("2").child("score").set(playerTwoData.score + distance);

            if (playerNum === 1) {
                chatData.push({
                  name: "",
                  message: playerTwoData.name + " won.  The answer was " + randCountry,
                  time: firebase.database.ServerValue.TIMESTAMP,
                  idNum: 0
                });
             } 
            

            currentStageRef.set(5);  
        } else if (currentStage === 4) {
            console.log("stage 4");

            if (playerNum === 1) {
                chatData.push({
                    name: "",
                    message: "Nobody got it. The answer was " + randCountry,
                    time: firebase.database.ServerValue.TIMESTAMP,
                    idNum: 0
                   });
            }

             currentStageRef.set(5);
        } else if (currentStage === 5) {
            //clean up and reset
            console.log("stage 5 reached");
              var moveOn = function() {

                
                $("#cImg").attr("src", "assets/images/usa.png");
                $("#api").empty();
                
              };
              clearInterval(x);
              currentCountryRef.remove();
              $("#mid-col").empty();
              $('#mid-col').css("backgroundColor", "black");
              $('#mid-col').css("color", "white");
              
             // setTimeout(moveOn, 5000);

          } else {
                
                chatData.push({
                  name: "",
                  message: "Waiting for another player to join.",
                  time: firebase.database.ServerValue.TIMESTAMP,
                  idNum: 0
               });
          }

    }
    
});

// When a player joins, checks to see if there are two players now. If yes, then it will start the game.
playersRef.on("child_added", function(snapshot) {

    if (currentPlayers === 1) {

        // set stage to 1, which starts the game
        currentStageRef.set(1);
        console.log("playersRef set currentStage to 1");
    }
});

// Function to get in the game
function getInGame() {

    // For adding disconnects to the chat with a unique id (the date/time the user entered the game)
    // Needed because Firebase's '.push()' creates its unique keys client side,
    // so you can't ".push()" in a ".onDisconnect"
    var chatDataDisc = database.ref("/chat/" + Date.now());

    // Checks for current players, if theres a player one connected, then the user becomes player 2.
    // If there is no player one, then the user becomes player 1
    if (currentPlayers < 2) {

        if (playerOneExists) {
            playerNum = 2;
        } else {
            playerNum = 1;
        }

        // Creates key based on assigned player number
        playerRef = database.ref("/players/" + playerNum);

        // Creates player object. 'choice' is unnecessary here, but I left it in to be as complete as possible
        playerRef.set({
            name: username,
            score: 0
        });

        // On disconnect remove this user's player object
        playerRef.onDisconnect().remove();

        // If a user disconnects, set the current stage to 'null' so the game does not continue
        currentStageRef.onDisconnect().remove();

        // Send disconnect message to chat with Firebase server generated timestamp and id of '0' to denote system message
        chatDataDisc.onDisconnect().set({
            name: username,
            time: firebase.database.ServerValue.TIMESTAMP,
            message: "has disconnected.",
            idNum: 0
        });

        // Remove name input box and show current player number.
       
    } else {

        // If current players is "2", will not allow the player to join
        alert("Sorry, Game Full! Try Again Later!");
    }
}
});