import React from 'react'
import QueryString from 'qs'
import { Container } from "react-bootstrap"

const AUTHORIZATION_URL = "https://accounts.spotify.com/authorize?"+ QueryString.stringify({
    client_id: "<CLIENT ID>",
    response_type: "code",
    redirect_uri: "http://localhost:3001/",
    show_dialog: true,
    scope: "streaming user-read-email user-read-private user-library-read user-library-modify user-read-playback-state user-modify-playback-state"
})

export default function Login() {
    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
            <a className="btn btn-success btn-lg" href={AUTHORIZATION_URL}> Login with Spotify</a> 
        </Container>
    )
}
