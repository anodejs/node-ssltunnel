var tls = require('tls');
var fs = require('fs');
var net = require('net');

var options = null;

exports.createClient = function (options, callback) {
  options.client = true;
  createComponent(options, callback);
};

exports.createServer = function (options, callback) {
  options.server = true;
  createComponent(options, callback);
};

var Log = {"error":0, "warning":1, "info":2, "verbose":3};
exports.Log = Log;

function createComponent(options, callback) {
	
  function log(level, message) {
		if (level <= options.loglevel) {
      switch(level)
      {
      case 0:
        console.error(message);
        break;
      case 1:
        console.warn(message);
        break;
      case 2:
      case 3:
        console.log(message);
        break;
      default:
        console.log(message);
      }
    }
	}

  callback = callback || function () { };

  if (options.client && options.server || !options.client && !options.server) {
    log(Log.error,'got invalid options');
    throw new Error('invalid ssl tunnel instantiation - should be server or client');
  }

  var isClient = options.client;

  var clientPort = options.client_port;
  var serverPort = options.server_port;

  var clientHost = options.client_host;

  var clientPackage = isClient ? tls : net;
  var serverPackage = isClient ? net : tls;

  // options for the listener
  var serverOptions = {};
  if (!isClient) {
    serverOptions = {

      // read the server certificate   
      key: fs.readFileSync(options.server_private_cert),
      cert: fs.readFileSync(options.server_public_cert),

      // request client certificate 
      requestCert: true,

      // reject unauthorized requests
      rejectUnauthorized: true,

      // validate the CA of the client certificate
      ca: [fs.readFileSync(options.client_public_cert)]
    };
  }

  // options for the client socket
  var clientOptions = {};
  if (isClient) {
    clientOptions = {

      // read the client certificate   
      key: fs.readFileSync(options.client_private_cert),
      cert: fs.readFileSync(options.client_public_cert),

      // get public server certificate and mark it as approved
      ca: [fs.readFileSync(options.server_public_cert)]
    };
  }

  var server = serverPackage.createServer(serverOptions, function (proxySocket) {

    // the socket to the service (either ssltunnel server or real backend server)
    var serviceSocket = null;

    // pause the input stream until the connection is established
    proxySocket.pause();

    // connect to the server
    if (isClient) {
      clientOptions.socket = new net.Socket();
      clientOptions.socket.on('connect', function () {
        clientOptions.socket.setKeepAlive(true, 30000);
      });
      clientOptions.socket.connect(clientPort, clientHost);
      serviceSocket = clientPackage.connect(clientPort, clientHost, clientOptions);
    }
    else {
      serviceSocket = clientPackage.connect(clientPort, clientHost);
    }

    // on secureConnect (for ssltunnel client)
    serviceSocket.on("secureConnect", function () {

      log(Log.info,'Connected to the ssltunnel server');

      // pipe service stream to client stream
      // piple client stream to service stream
      // resume the client stream
      serviceSocket.pipe(proxySocket);
      proxySocket.pipe(serviceSocket);
      proxySocket.resume();
    });

    // check that we got no errors
    serviceSocket.on("error", function (exception) {

      log(Log.info,'Can\'t open socket to the server. Error: ' + JSON.stringify(exception));
      proxySocket.end();

    });

    // on connect (for ssltunnel server)
    serviceSocket.on("connect", function () {

      log(Log.info,'Connected to the real BE server');
      serviceSocket.setKeepAlive(true, 30000);

      // pipe service stream to client stream
      // piple client stream to service stream
      // resume the client stream
      serviceSocket.pipe(proxySocket);
      proxySocket.pipe(serviceSocket);
      proxySocket.resume();
    });

    // print diagnostics when connection to server ends
    serviceSocket.on("end", function () {
      log(Log.verbose,'connection to server was closed');
    });

    // print diagnostics when connection to client ends
    proxySocket.on("end", function () {
      log(Log.verbose,'connection to client was closed');
    });
  });

  server.listen(serverPort);

  // calls the callback when the server is in listening state with the actual port
  server.on("listening", function () {
    if (isClient) {
      log(Log.info,'Running \'client\' role. Listening on ' + server.address().port +
            ', encrypting and forwarding to ssltunnel\'s server on ' + options.client_host + ':' + options.client_port);
    } else {
      log(Log.info,'Running \'server\' role. Listening on ' + server.address().port +
            ', decrypting and forwarding to real server machine on ' + options.client_host + ':' + options.client_port);
    }
    callback(null, server.address().port);
  });
}

