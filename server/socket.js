const { Server } = require('socket.io');
let io;


function initSocket(server) {
io = new Server(server, {
cors: { origin: process.env.CLIENT_URL || '*', methods: ['GET', 'POST'] }
});


io.on('connection', (socket) => {
console.log('socket connected', socket.id);
socket.on('joinTrip', (tripId) => {
socket.join(tripId);
});
socket.on('leaveTrip', (tripId) => {
socket.leave(tripId);
});
socket.on('itineraryUpdated', ({ tripId, data }) => {
socket.to(tripId).emit('itineraryUpdated', data);
});
socket.on('expenseUpdated', ({ tripId, data }) => {
socket.to(tripId).emit('expenseUpdated', data);
});
socket.on('disconnect', () => {
// console.log('socket disconnected', socket.id);
});
});
}


function getIO() { return io; }


module.exports = { initSocket, getIO };