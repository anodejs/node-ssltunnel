var tls = require('tls');
var fs = require('fs');
var net = require('net');

exports.createClient = function (options)
{
    options.client = true;
    createComponent(options);
};

exports.createServer = function (options)
{
    options.server = true;
    createComponent(options);
};

function createComponent(options)
{
    if (options.client && options.server || 
        !options.client && !options.server)
        {
            console.log('Got invalid options. Doing nothing.');
            return;
        }

    var isClient = options.client;

    var clientPort = options.client_port;
    var serverPort = options.server_port;  

    var clientHost = options.client_host;

    var clientPackage = isClient ? tls : net;
    var serverPackage = isClient ? net : tls;

    // options for the listener
    var serverOptions = {};
    if (!isClient)
    {
        serverOptions = {
        
            // read the server certificate   
            key: fs.readFileSync(options.server_private_cert),
            cert: fs.readFileSync(options.server_public_cert),

            // request client certificate 
            requestCert: true,

            // validate the CA of the client certificate
            ca: [ fs.readFileSync(options.client_public_cert) ]
        };
    }

    // options for the client socket
    var clientOptions = {};
    if (isClient)
    {
        clientOptions = {

            // read the client certificate   
            key: fs.readFileSync(options.client_private_cert),
            cert: fs.readFileSync(options.client_public_cert),

            // get public server certificate and mark it as approved
            ca: [ fs.readFileSync(options.server_public_cert) ]
        };
    }

    serverPackage.createServer(serverOptions, function (proxySocket) {

        // the socket to the service (either ssltunnel server or real backend server)
        var serviceSocket = null;

        // pause the input stream until the connection is established
        proxySocket.pause();

        // connect to the server
        if (isClient) {
            serviceSocket = clientPackage.connect(clientPort, clientHost, clientOptions);
        }
        else {
            serviceSocket = clientPackage.connect(clientPort, clientHost);
        }

        // on secureConnect (for ssltunnel client)
        serviceSocket.on("secureConnect", function () {
            
            console.log('Connected to the ssltunnel server');

            // pipe service stream to client stream
            // piple client stream to service stream
            // resume the client stream
            serviceSocket.pipe(proxySocket);
            proxySocket.pipe(serviceSocket);
            proxySocket.resume();
        });

        // on connect (for ssltunnel server)
        serviceSocket.on("connect", function () {
            
            console.log('Connected to the real BE server');

            // pipe service stream to client stream
            // piple client stream to service stream
            // resume the client stream
            serviceSocket.pipe(proxySocket);
            proxySocket.pipe(serviceSocket);
            proxySocket.resume();
        });

        // print diagnostics when connection to server ends
        serviceSocket.on("end", function () {
            console.log('connection to server was closed');
        });

        // print diagnostics when connection to client ends
        proxySocket.on("end", function () {
            console.log('connection to client was closed');
        });

    }).listen(serverPort);

    
    if (isClient) {
        console.log('Running \'client\' role. Listening on ' + options.server_port + 
            ', encrypting and forwarding to ssltunnel\'s server on ' + options.client_host + ':' + options.client_port);
    } else {
        console.log('Running \'server\' role. Listening on ' + options.server_port +
            ', decrypting and forwarding to real server machine on ' +  + options.client_host + ':' + options.client_port); 
    }

}

