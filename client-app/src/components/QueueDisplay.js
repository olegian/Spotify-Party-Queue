import { useState, useEffect } from 'react'
import useAuthorize from './useAuthorize'
import { Container, Form, Col, Row, Button, InputGroup } from "react-bootstrap"
import SpotifyWebApi from 'spotify-web-api-node'
import TrackSearchResult from "./TrackSearchResult"
import io from "socket.io-client"

const spotifyApi = new SpotifyWebApi({
    clientId:"<CLIENT ID>"
});

const socket = io('http://localhost:4000');

export default function QueueDisplay({ code }) {
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [host, setHost] = useState(true);
    const [hostId, setHostId] = useState(makeId(5));
    const [connectId, setConnectId] = useState("");

    const accessToken = useAuthorize(code);

    function makeId(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }   
        return result;
    }  
    
    function addFront(track){
        if (host){
            queueTrack(track)
        } else {
            sendMessage(track);
        }
    }

    function sendMessage(track) {
        console.log("sending track to " + connectId);
        socket.emit("sendTrack", { destination: connectId, track: track });
    }

    function connectToRoom(){
        setHost(false);
        console.log(connectId);
        socket.emit("joinRoom", connectId);
    }

    function disconnect(){
        setHost(true);
        socket.emit("joinRoom", hostId);
    }

    function queueTrack(track){
        spotifyApi.addToQueue(track.uri).catch((err) => {
            alert("Unable to add to Queue (make sure a device is active)");
            console.log(err);
        });
    }

    useEffect(() => {
        socket.on("receiveTrack", ({target, track}) => {
            if (target == hostId) {
                console.log("recieved")
                queueTrack(track);
            }
        });
    }, []);

    useEffect(() => {
        disconnect();
    }, []);

    useEffect(() => {
        if (!accessToken) return;
        spotifyApi.setAccessToken(accessToken);
    }, [accessToken]); 

    useEffect(() => {
        if (!search) return setSearchResults([]);
        if (!accessToken) return;

        let cancel = false;
        spotifyApi.searchTracks(search).then((res) => {
            if (cancel) return;
            setSearchResults(res.body.tracks.items.map(track => {
                const smallAlbumImage = track.album.images.reduce((smallest, image) => {
                    if (image.height < smallest.height) return image;
                    return smallest
                }, track.album.images[0]);

                return {
                    artist: track.artists[0].name,
                    title: track.name,
                    uri: track.uri,
                    albumUrl: smallAlbumImage.url
                };
            }));
        });
        
        return () => cancel = true;
    }, [search, accessToken]);

    return (
      <Container
        className="d-flex flex-column py-2"
        style={{ height: "100vh" }}
      >
        <Form.Control
          type="search"
          placeholder="Search Songs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex-grow-1 my-2 mx-5" style={{ overflowY: "auto" }}>
          {searchResults.map((track) => (
            <TrackSearchResult
              track={track}
              key={track.uri}
              addFront={addFront}
            />
          ))}
        </div>
        <Row className="align-items-center">
            <Col> 
                <Row>
                    {host ? "You are the host." : "Connected to room."}
                </Row>
                <Row>
                    Room ID: {host ? "" + hostId : "" + connectId}
                </Row>
            </Col>
            <Col> 
                {host ? 
                <InputGroup>
                <Form.Control value={connectId} onChange={e => setConnectId(e.target.value)}/>
                    <Button onClick={() => {connectToRoom()}}> Connect to Room</Button>
                </InputGroup>
                : 
                <Button onClick={() => {disconnect()}}>Leave Room</Button>}
            </Col>
        </Row>
      </Container>
    );
}
