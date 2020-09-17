
const path=require("path");
const http=require('http');
const express=require("express");
const socketio=require("socket.io");
const app=express();
const formatMessage=require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUsers}=require('./utils/user');
const server=http.createServer(app);
const io=socketio(server);
const botname="ChatCord bot";
//set static folder
app.use(express.static(path.join(__dirname,'public')));

//run when client connects

io.on("connection",socket=>{
    socket.on('joinRoom',({username,room})=>{
        const user= userJoin(socket.id,username,room);
        socket.join(user.room);

    //welcome current user
    socket.emit("message",formatMessage(botname,"welcome to ChatChord"));

    //broadcast when a user emits
    socket.broadcast
        .to(user.room)
        .emit("message",formatMessage(botname,`${user.username} has joined the chat!`));

    //send users and room info
    io.to(user.room).emit('roomUsers',{
        room:user.room,
        users:getRoomUsers(user.room)
    });
});
   
    //runs when client disconnects
    socket.on('disconnect',()=>{
        const user=userLeave(socket.id);
        if(user){
            io.to(user.room).emit("message",formatMessage(botname,`${user.username} has left the chat`));
          //send users and room info
          io.to(user.room).emit('roomUsers',{
            room:user.room,
            users:getRoomUsers(user.room)
        });
        }
      
       
    });

    //listen for chatMessage
    socket.on('chatMessage',msg=>{
        const user=getCurrentUser(socket.id);
        io.to(user.room).emit("message",formatMessage(user.username,msg));
    });


});

const PORT= process.env.PORT || 3000;

server.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`);
});