const path = require('path');
const express = require('express');
const http = require('http');
const app = express();

const socketio = require('socket.io');
const server =  http.createServer(app);
const io = socketio(server);
const botName = 'ChatSystem Bot';
const formatMessage = require('./utils/messages');

const { userJoin, getCurrentUser, userLeave, getRoomUsers}  = require('./utils/users')
app.use(express.static(path.join(__dirname,'public')));

io.on('connection', socket => {
    // console.log('New WS coonection');

    socket.on('joinRoom', ({username, room}) => {
        const user = userJoin(socket.id,username,room);
        socket.join(user.room);

    socket.emit('message', formatMessage(botName,'Welcome to chatsystem')); 


        // Broadcast when a user connects. This runs when a client connects.
    socket.broadcast.to(user.room).emit('message', 
    formatMessage(botName,`${user.username} has joined the chat`));

    // Send user and room infoo
    
    io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
    });

});

    // listen for chat message
    socket.on('chatMessage', msg =>{
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username,msg));
    });

    // When a user discoonects or leaves a room
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if(user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat.`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

});
const PORT = 3000 || process.env.PORT; 
server.listen(PORT, () => console.log(`Server running on PORT ${PORT}`));