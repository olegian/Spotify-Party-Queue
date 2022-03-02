import React,{ useState, useEffect } from "react"
import axios from "axios"

export default function useAuthorize( code ) {
    const [accessToken, setAccessToken] = useState();
    const [refreshToken, setRefreshToken] = useState();
    const [expiresIn, setExpiresIn] = useState();

    // send login request to server
    useEffect(() => {
        axios.post("http://localhost:4000/login", {
            code
        }).then(res => {
            setAccessToken(res.data.accessToken);
            setRefreshToken(res.data.refreshToken);
            setExpiresIn(res.data.expiresIn);
            
            window.history.pushState({}, null, "/");
        }).catch((err) => {
            window.location = "/";
        });
    }, [code]);

    // send refresh token request to the server
    useEffect(() => {
        if (!refreshToken || !expiresIn) return;
        const interval = setInterval(() => {
            axios.post("http://localhost:4000/refresh", {
                refreshToken
            }).then(res => {
               setAccessToken(res.data.accessToken);
               setExpiresIn(res.data.expiresIn);
            }).catch(() => {
                window.location = "/";
            })
        }, (expiresIn - 60) * 1000);

        return () => clearInterval(interval);
    }, [refreshToken, expiresIn]);
        
    return accessToken;
}
