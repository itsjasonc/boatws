const { Server } = require('socket.io');
require('dotenv').config();

const io = new Server({
	cors: {
		origin: "*",
	}
});

function Clients() {
	this.sockets = [];
}

/*
 * Given a socket, we add the socket to the list of known sockets
 * @param socket A socket-io socket
 */
Clients.prototype.add = function(socket) {
	this.sockets.push(socket);

	console.log("Client connected");

	// Automatically handle removing the socket
	// if the client disconnects
	var self = this;
	socket.on('disconnect', function() {
		console.log("Client disconnected");
		self.remove(socket);
	});
};

/*
 * Given a socket, we remove the socket from the list of known sockets
 * @param socket A socket-io socket
 */
Clients.prototype.remove = function(socket) {
	// Getting the index of the socket
	var i = this.sockets.indexOf(socket);
	// Removing the socket
	if (i != -1) {
		this.sockets.splice(i, 1);
	}
};

/*
 * Given a message, we can broadcast that message to other clients
 * @param name The name of the message
 * @param data The message contents
 * @param except The socket to ignore
 */
Clients.prototype.emit = function(name, data, except) {
	// Get the starting index
	var i = this.sockets.length;
	// Iterating all the sockets except for our own
	while (i--) {
		if (this.sockets[i] != except) {
			this.sockets[i].emit(name, data);
		}
	}
}

/*
 * The only information being passed around are updates to Swimlanes and updates to Boats
 */

var clients = new Clients();

io.on('connection', function(socket) {
	clients.add(socket);

	socket.on('message', function(data) {
		console.log(data);
		clients.emit('message', data, socket);
	});
});

const port = process.env.PORT || 8081;

io.listen(port);

