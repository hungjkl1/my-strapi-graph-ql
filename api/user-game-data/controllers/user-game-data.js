'use strict';

/**
 * Read the documentation (https://strapi.io/documentation/3.0.0-beta.x/concepts/controllers.html#core-controllers)
 * to customize this controller
 */

const socketRoomHandle = roomToken => {
    const { io } = strapi
    console.log(roomToken);
    io.sockets.in(roomToken).on('web-connected', data => {
        console.log(data)
        io.sockets.in(roomToken).emit('web-enable')                
    })
    io.sockets.in(roomToken).on('console-connected', data => {
        io.sockets.in(roomToken).emit('console-enable')                
    })
    io.sockets.in(roomToken).on('console-press', data => {
        io.sockets.in(roomToken).emit('console-fire-action', data)                
    })
    io.sockets.in(roomToken).on('leave-room', data => {
        io.sockets.in(roomToken).emit('leave-room', data)
    })
}

module.exports = {
    joinControllerAndGame: async ctx => {
        try {
            const { request } = ctx
            const { body = null } = request
            if(body.id) {
                const { io } = strapi
                const token = new Date().getTime()
                await strapi.query('user-game-data').update({id: body.id}, {roomToken: token})
                socketRoomHandle(token)
                return {
                    status: 'T',
                    msg: 'create room for game success',
                    token: token
                }
            }
        }
        catch (err) {
            console.log(err)
            ctx.status = 404
            return {
                status: 'F',
                msg: 'fail to get your game id'
            }
        }
    }
};
