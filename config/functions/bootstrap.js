'use strict';

/**
 * An asynchronous bootstrap function that runs before
 * your application gets started.
 *
 * This gives you an opportunity to set up your data model,
 * run jobs, or perform some special logic.
 *
 * See more details here: https://strapi.io/documentation/3.0.0-beta.x/concepts/configurations.html#bootstrap
 */

module.exports = async () => {
    process.nextTick(() => {
        const io = require('socket.io').listen(strapi.server)
        io.on('connection', (socket) => {
            console.log('here')
            socket.on("disconnect", () => {
                console.log('user')
            });
            socket.on("join-room-console", data => {
                socket.join(data.roomToken)
                io.sockets.in(data.roomToken).emit('connectToRoom', data);
            })
            socket.on("send-input", data => {
                console.log('--------------------------------');
                console.log(data);
                io.sockets.in(data.roomToken).emit('receive-input', data.key)
            })
        })
        strapi.io = io
    })
};
