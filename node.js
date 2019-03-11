const socket = require('socket.io-client')('http://localhost:3001');
// or with import syntax
socket.on('connect', function() {
    console.log('connect')
});
socket.on('statistics_push', function(data) {
    console.log(data)
});

socket.on('award_push', function(data) {
    console.log('test==>', data)
});

socket.on('disconnect', function() {
    console.log('disconnect')
});