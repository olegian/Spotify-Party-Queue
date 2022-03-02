import React from 'react'
import { Container, Col, Button } from 'react-bootstrap' 
import "./componentcss.css"

export default function TrackSearchResult({ track, addFront }) {
    function handleFront(){
        addFront(track);
    }

    return (
        <Container className="d-flex my-2 py-2 align-items-center border hideTrigger">
            <Col className="col-md-auto">
                <img src={track.albumUrl} style={{ height:"64px", width:"64px"}} />
            </Col>
            <Col className="mx-3 col-9">
                <div>{track.title}</div>
                <div className="text-muted">{track.artist}</div>
            </Col>
            <Col className="flex-column-reverse hide">
                <Button className="p-2 btn-success form-control" onClick={handleFront}>Add to Queue</Button>
            </Col>
        </Container>
    )
}
