const express = require("express");
const SpotifyWebApi = require("spotify-web-api-node");
const cors = require("cors");
const bodyParser = require("body-parser")

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

const http = require('http').createServer(app);



// LOGIN REQUESTS
app.post("/login", (req, res) => {
    const code = req.body.code;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: "http://localhost:3001/",
        clientId: "<CLIENT ID>",
        clientSecret: "<CLIENT SEC>"
    });

    spotifyApi.authorizationCodeGrant(code).then(data => {
        res.json({
            accessToken: data.body.access_token,
            refreshToken: data.body.refresh_token,
            expiresIn: data.body.expires_in
        })
    }).catch((err) => {
        res.sendStatus(400)
    });
});

// REFRESH REQUESTS
app.post("/refresh", (req, res) => {
    const refreshToken = req.body.refreshToken;

    const spotifyApi = new SpotifyWebApi({
        redirectUri: "http://localhost:3001/",
        clientId: "<CLIENT ID>",
        clientSecret: "<CLIENT SEC>",
        refreshToken
    });

    spotifyApi.refreshAccessToken().then((data) => {
        console.log("Access Token has been refreshed.");
        res.json({
            accessToken: data.body.access_token,
            expiresIn: data.body.expires_in
        });
    }).catch(() => {
        res.sendStatus(400);
    });
    
});

http.listen(4000, () => {
    console.log("Listening on 4000");
});

const io = require('socket.io')(http, {
    cors: {
        origin: "http://localhost:3001",
        methods: ["GET", "POST"]
    }
});

// MESSAGING FOR CONNECTIONS
io.on('connection', (socket) => {
    socket.on('joinRoom', (destination) => {
        socket.join(destination);
        console.log("Sending Tracks to Room " + destination);
    });

    socket.on('sendTrack', ({ destination, track}) => {
        console.log('Telling ' + destination + 'to play track');
        socket.to(destination).emit("receiveTrack", {target:destination, track:track})
    });
});