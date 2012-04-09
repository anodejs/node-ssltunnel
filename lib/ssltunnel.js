var tls = require('tls');
var fs = require('fs');
var net = require('net');

exports.createClient = function (options, callback) {
  options.client = true;
  createComponent(options, callback);
};

exports.createServer = function (options, callback) {
  options.server = true;
  createComponent(options, callback);
};

function createComponent(options, callback) {

  var logLevels = ['error', 'warn', 'info', 'log'];
  var log = {};

  function initLogs(options) {

    if (!options.log_level) {
      options.log_level = 'log';
      console.log('did not receive any log level. using default which is: ' + options.log_level);
    }

    var found = false;
    for (var i = 0; i < logLevels.length; i++) {
      var logLevel = logLevels[i];

      if (!found) {
        log[logLevel] = function (message) {
          console[logLevel](message);
        };
      } else {
        log[logLevel] = function (message) { };
      }

      if (logLevel === options.log_level) {
        found = true;
      }
    }
  }

  initLogs(options);

  if (options.client && options.server || !options.client && !options.server) {
    log.error('invalid ssl tunnel instantiation - should be server or client');
    throw new Error('invalid ssl tunnel instantiation - should be server or client');
  }

  var isClient = options.client;
  var serverPackage = isClient ? tls : net;
  var proxyPackage = isClient ? net : tls;

  // options for the proxy listener
  var proxyOptions = {};
  if (!isClient) {
    proxyOptions = {

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

  // options for the server connection
  var serverOptions = {};
  if (isClient) {
    serverOptions = {

      // read the client certificate   
      key: fs.readFileSync(options.client_private_cert),
      cert: fs.readFileSync(options.client_public_cert),

      // get public server certificate and mark it as approved
      ca: [fs.readFileSync(options.server_public_cert)]
    };
  }

  var server = proxyPackage.createServer(proxyOptions, function (clientStream) {

    // the socket to the service (either ssltunnel server or real backend server)
    var serverStream = null;

    // pause the input stream until the connection is established
    clientStream.pause();

    // connect to the server
    if (isClient) {
      serverStream = serverPackage.connect(options.server_port, options.server_host, serverOptions);
    } else {
      serverStream = serverPackage.connect(options.server_port, options.server_host);
    }

    // on secureConnect (for client role only)
    serverStream.on("secureConnect", function () {

      log.log('Connected to the ssltunnel server');

      // set TCP keep-alive if needed
      if (options.keep_alive >= 0) {
        log.info('Using TCP Keep-Alive with delay: ' + options.keep_alive);
        serverStream.socket.setKeepAlive(true, options.keep_alive);
      } 

      // pipe service stream to client stream
      // piple client stream to service stream
      // resume the client stream
      serverStream.pipe(clientStream);
      clientStream.pipe(serverStream);
      clientStream.resume();
    });

    // on connect (for server tole only)
    serverStream.on("connect", function () {

      log.log('Connected to the real BE server');
      //serverStream.setKeepAlive(true, 30000);

      // pipe service stream to client stream
      // piple client stream to service stream
      // resume the client stream
      serverStream.pipe(clientStream);
      clientStream.pipe(serverStream);
      clientStream.resume();
    });

    // check that we got no errors when talking to the server
    serverStream.on("error", function (exception) {

      log.info('Error communicating with the server. Error: ' + JSON.stringify(exception));
      clientStream.end();

    });

    // check that we got no errors when talking to the client
    clientStream.on("error", function (exception) {

      log.info('Error communicating with the client. Error: ' + JSON.stringify(exception));
      serverStream.end();

    });

    // print diagnostics when connection to server ends
    serverStream.on("end", function () {
      log.log('connection to server was closed');
    });

    // print diagnostics when connection to client ends
    clientStream.on("end", function () {
      log.log('connection to client was closed');
    });
  });

  server.listen(options.proxy_port);

  // calls the callback when the server is in listening state with the actual port
  server.on("listening", function () {
    
    if (isClient) {
      log.info('Running \'client\' role. Listening on ' + server.address().port +
            ', encrypting and forwarding to ssltunnel\'s server on ' + options.server_host + ':' + options.server_port);
    } else {
      log.info('Running \'server\' role. Listening on ' + server.address().port +
            ', decrypting and forwarding to real server machine on ' + options.server_host + ':' + options.server_port);
    }

    if (callback) {
      callback(null, server.address().port);
    }
  });
}
