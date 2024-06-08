const http = require("http");
const server = http.createServer();
const io = require("socket.io")(server, {
  cors: { origin: "*" }
});

const clients = {};

io.on("connection", (socket) => {
  console.log("Un cliente se ha conectado");

  // Emitir la lista de clientes conectados al nuevo socket
  socket.emit('clients_list', Object.keys(clients));

  socket.on('join_room', (room) => {
    socket.join(room);
    if (!clients[room]) {
      clients[room] = [];
    }
    clients[room].push(socket.id);
    console.log(`Cliente con ID ${socket.id} se ha unido a la sala ${room}`);
    io.emit('clients_list', Object.keys(clients));
  });

  socket.on('chat_message', (data) => {
    console.log('Received chat message on server:', data);
    io.to(data.room).emit('chat_message', data);
  });

  socket.on("disconnect", () => {
    console.log(`Cliente con ID ${socket.id} se ha desconectado`);
    for (const room in clients) {
      clients[room] = clients[room].filter(id => id !== socket.id);
      if (clients[room].length === 0) {
        delete clients[room];
      }
    }
    io.emit('clients_list', Object.keys(clients));
  });
});

server.listen(3000, () => {
  console.log('Servidor escuchando en el puerto 3000');
});
