var tls = require('tls');
var fs = require('fs');
var net = require('net');

//Create cleartext client
if (process.argv.length < 3 || (process.argv[2] != "client" && process.argv[2] != "server")) {
	console.log("Please specify client ro server");
	process.exit();
}

var isClient = process.argv[2] == "client";

var serverPackage, clientPackage;
var serverPort, clientPort;

if (isClient)
{
	//TODO change
	serverPackage = net;
	clientPackage = tls;
	serverPort = 54080;
	clientPort = 54443;
}
else
{
	//TODO change
	serverPackage = tls;
	clientPackage = net;
	serverPort = 54443;
	clientPort = 54321;
}


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