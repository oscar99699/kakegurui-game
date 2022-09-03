var {Server} = require('Socket.io')
const {Kakegurui} = require('./sockets-events-server.js')

var http = require('http');
var fs = require('fs');
var path = require('path');

var extFiles = {'.html':'text/html','.js':'text/javascript','.css':'text/css'}

const nodeServer = http.createServer((req,res) => {
    
    res.writeHead(200,{'Content-Type': extFiles[ path.extname(req.url) ]})

    res.end(fs.readFileSync(req.url.substring(1)))

});

const io = new Server(nodeServer);

io.on("connection",Kakegurui(io))

nodeServer.listen(4000,()=>{
    console.log('listening to requests')
});