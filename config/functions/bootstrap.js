'use strict';
const WebSocket = require('ws')
const _ = require('lodash')
const { ACTION_TYPES, ROOM_TYPES } = require('../const')
/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/concepts/configurations.html#bootstrap
 */
module.exports = async () => {
  process.nextTick(() => {
    const wss = new WebSocket.Server({ server: strapi.server })
    strapi.wss = wss
    let room = {}
    wss.on('connection', ws => {
      console.log(new Date().getTime())
      try {
        ws.send(JSON.stringify({
          action: "connected"
        }))
      } catch (error) {
        console.log(error)
      }
      ws.on('message', msg => {
        try {
          const data = JSON.parse(msg)
          console.log(data)
          if (data.action === "CREATE_ROOM") {
            const roomId = new Date().getTime()
            room[roomId] = {
              ...room[roomId],
              mobile: ws
            }
            ws.send(JSON.stringify({
              action: "GET_ROOM_ID",
              roomId: roomId
            }))
          }
          if (data.action === "JOIN_ROOM") {
            const { roomId } = data
            if(!_.isEmpty(_.get(room, roomId))) {
              room[roomId] = {
                ...room[roomId],
                client: ws
              }
              const {mobile} =  room[roomId]
              mobile.send(JSON.stringify({
                action: "WEB_JOINED"
              }))             
            } else {
              ws.send(JSON.stringify({
                action: "web-joined-failed"
              }))
            }
          }
          if (data.action === 'SEND_TOKEN') {
            const { roomId, jwt, user } = data
            const { client } = room[roomId]
            client.send(JSON.stringify({
              action: 'TRANSFER_TOKEN',
              jwt,
              roomId,
              user
            }))
          }
          if (data.action === 'DONE_PAIRING') {
            const { roomId } = data
            const { client, mobile } = room[roomId]
            client.send(JSON.stringify({
              action: "DONE_PAIRING"
            }))
            mobile.send(JSON.stringify({
              action: "DONE_PAIRING"
            }))
          }
          if (data.action === 'CONTROL') {
            const { roomId, button } = data
            const { client } = room[roomId]
            client.send(JSON.stringify({
              action: "MOBILE_CONTROL",
              button
            }))
          }
        } catch (error) {
          console.log(error)
        }
      })
    })
  })
};

const socketHelper = {
  sendDataRoomAll: (roomId, data) => {
    strapi.wss.clients.forEach(client => {
      if (client.roomId !== roomId) {
        client.send(JSON.stringify({ time: new Date().getTime() }))
      }
    });
  },
  roomParticipants: (roomId, roomType) => {
    let participants = []
    strapi.wss.clients.forEach(client => {
      if (client[roomType] === roomId) {
        participants.push(client)
      }
    })
    return  
  }
}