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

module.exports = (cb) => {
    const io = require('socket.io').listen('3001')
    io.origins('http://localhost:3000')
    console.log('here')
    io.on('connection', (socket) => {
        console.log('user connected')
        socket.on("disconnect", () => {
            console.log('user')
        });
        socket.on("click-button", (data) => {
            socket.emit('click-response',data)
        });
    })
};
