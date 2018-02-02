var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket)
{
	socket.on('sender', function(name)
	{
		io.emit('sender', name);
	});
	socket.on('new_message', function(msg)
	{
		io.emit('new_message', msg);
	  console.log('chat message', msg);
	});
  //console.log("user is connected");
  socket.on('disconnect', function()
  {
    console.log('user disconnected');
  });
});

http.listen(port, function(){
  console.log('listening on *:' + port);
});