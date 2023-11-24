const rxjs = require('rxjs');
const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
// const http = require('http');
// const socketIo = require('socket.io');

const app = express();
// const server = http.createServer(app);
const server = createServer(app);
// const io = socketIo(server);
const io = new Server(server);

app.get('/', function (req, res) {
  res.sendFile(join(__dirname, 'index.html'));
});

// Lista para conexões de clientes
io.on('connection', (socket) => {
  console.log('Novo cliente conectado');

  // Observable para mensagens de chat
  const chatObservable = new rxjs.Observable((observer) => {
    // Listener para mensagens do cliente
    socket.on('chat message', (message) => {
      observer.next(message);
    });

    // Retorna uma função de limpeza que será chamada quando o cliente se desconectar
    return () => {
      console.log('Cliente desconectado');
    };
  });

  // Subscreve ao Observable para encaminhar mensagens para todos os clientes conectados
  const chatSubscription = chatObservable.subscribe((message) => {
    io.emit('chat message', message); // Envia a mensagem para todos os clientes conectados
  });

  // Cancela a Subscription quando o cliente se desconectar
  socket.on('disconnect', () => {
    chatSubscription.unsubscribe();
  });
});

// Inicia o servidor na porta 3000
server.listen(3000, () => {
  console.log('Servidor escutando na porta 3000');
});
