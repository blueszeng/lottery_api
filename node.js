const socket = require('socket.io-client')('http://localhost:3000');
// or with import syntax
socket.on('connect', function() {
    console.log('connect')
});
socket.on('event', function(data) {
    console.log('event')
});

socket.on('test', function(data) {
    console.log('test==>', data)
});

socket.on('disconnect', function() {
    console.log('disconnect')
});