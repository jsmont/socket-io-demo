var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});


io.on('connection', function(socket){
    console.log('a user connected');

    //The state for this specific socket, as it is contained in its scope
    var session_name = "";

    //Join default room
    socket.join(session_name);

    //When the session is updated
    socket.on('session-change', function(id){

        console.log("Connection to "+id);

        //Update the state of this socket
        session_name=id; 
        //Join the new room
        socket.join(id);
        //Ask for the current state. Id is provided to optimize the answer.
        socket.broadcast.to(session_name).emit('request', socket.id);
    });

    //When the clients answer with the current state
    socket.on('refresh', function(msg){
        //Emit to only the client with socket id: msg.sid in order to refresh its state
        socket.broadcast.to(msg.sid).emit('refresh', msg.val);
    });

    //On atomic changes
    socket.on('change', function(msg){
        //Boradcast to all other clients in the session
        socket.broadcast.to(session_name).emit('change', msg);
    });
});

http.listen(3000, function(){
    console.log('listening on *:3000');
});
