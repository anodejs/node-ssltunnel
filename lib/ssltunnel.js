var tls = require('tls');
var fs = require('fs');
var net = require('net');
var argv = require('optimist')
    //.usage('Usage $0 -cp [client port] -sp [serverport] -role [client | server]')
    .usage('Usage $0')
    .demand('c')
    .alias('c', 'client_port')
    .describe('c', 'The client port number')
    .demand('s')
    .alias('s', 'server_port')
    .describe('s', 'The server port number')
    .demand('r')
    .alias('r', 'role')
    .describe('r', 'The role of the tunnel component, either "client" or "server"')
    .check(function(argv) {return argv.role === 'client' || argv.role === 'server'})
    .argv;

var isClient = argv.role === 'client';

var clientPort = argv.client_port;
var serverPort = argv.server_port;  

var clientPackage = isClient ? tls : net;
var serverPackage = isClient ? net : tls;

/*
if (isClient)
{
    //TODO change
    serverPackage = net;
    clientPackage = tls;
    //serverPort = 54080;
    //clientPort = 54443;
}
else
{
    //TODO change
    serverPackage = tls;
    clientPackage = net;
    //serverPort = 54443;
    //clientPort = 54321;
}
*/

var serverOptions = {
  key: fs.readFileSync('local_private.pem'),
  cert: fs.readFileSync('local_public.pem'),

  // This is necessary only if using the client certificate authentication.
  requestCert: true,

  // This is necessary only if the client uses the self-signed certificate.
  ca: [ fs.readFileSync('cc_public_test.pem') ]
};

var clientOptions = {
  key: fs.readFileSync('cc_private_test.pem'),
  cert: fs.readFileSync('cc_public_test.pem'),

  // This is necessary only if using the client certificate authentication.
  //requestCert: true,

  // This is necessary only if the client uses the self-signed certificate.
  ca: [ fs.readFileSync('local_public.pem') ]
};

serverPackage.createServer(serverOptions, function (proxySocket) {
    var serviceSocket= null;

    if (isClient)
    {
        serviceSocket = clientPackage.connect(clientPort, clientOptions);   
    }
    else
    {
        serviceSocket = clientPackage.connect(clientPort);          
    }

    proxySocket.on("data", function (data) {
        serviceSocket.write(data);
    });
    serviceSocket.on("data", function(data) {
        proxySocket.write(data);
    });

    proxySocket.on("close", function(had_error) {
        serviceSocket.end();
    });
    serviceSocket.on("close", function(had_error) {
        proxySocket.end();
    });
}).listen(serverPort);


// Create client to forward clear text data.