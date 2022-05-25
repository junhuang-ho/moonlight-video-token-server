// import express from 'express';
// import cors from "cors";
// import pkg from 'agora-access-token';
// const { RtcTokenBuilder, RtcRole } = pkg;
// // import { RtcTokenBuilder, RtcRole } from 'agora-access-token';
// import 'dotenv/config'
// above is ES6, add :- "type": "module" to package.json

const express = require('express')
const { RtcTokenBuilder, RtcRole } = require('agora-access-token')
const cors = require('cors')
require('dotenv').config()


const PORT = 8080;
const APP_ID = process.env.APP_ID
const APP_CERT = process.env.APP_CERT

const app = express()
app.use(cors());

const nocache = (request, response, next) =>
{
    response.header('Cache-Control', 'private, no-cache, no-store, must--revalidate')
    response.header('Expires', '-1')
    response.header('Pragma', 'no-cache')
    next()
}

const generateAccessToken = (request, response) =>
{
    // set response header
    response.header('Access-Control-Allow-Origin', '*')

    // get channel name
    const channelName = request.query.channelName
    if (!channelName)
    {
        return response.status(500).json({ 'error': 'channel is required' })
    }

    // get uid
    let uid = request.query.uid
    if (!uid || uid == '')
    {
        uid = 0
    }

    // get role
    let role = RtcRole.SUBSCRIBER
    if (request.query.role == 'publisher')
    {
        role = RtcRole.PUBLISHER
    }

    // get expire time
    let expireTime = request.query.expireTime
    if (!expireTime || expireTime == '')
    {
        expireTime = 3600
    } else
    {
        expireTime = parseInt(expireTime, 10)
    }

    // calculate privilege expire time
    const currentTime = Math.floor(Date.now() / 1000)
    const privilegeExpireTime = currentTime + expireTime

    // build the token
    console.log("request with:", APP_ID, APP_CERT, channelName, uid, role, privilegeExpireTime)
    const token = RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERT, channelName, uid, role, privilegeExpireTime)

    // return the token
    return response.json({ 'token': token })
}

app.get('/access_token', nocache, generateAccessToken)

app.listen(PORT, () =>
{
    console.log(`Listening on port: ${PORT}`)
})