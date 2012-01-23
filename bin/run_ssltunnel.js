var ssltunnel = require('./../lib/ssltunnel');

var argv = require('optimist')
    .usage('Usage $0')
    .demand('c')
    .alias('c', 'client_port')
    .describe('c', 'The client port number')
    .default('h','localhost')
    .alias('h', 'client_host')
    .describe('h', 'The client hostname')
    .demand('s')
    .alias('s', 'server_port')
    .describe('s', 'The server port number')
    .demand('r')
    .alias('r', 'role')
    .describe('r', 'The role of the tunnel component, either "client" or "server"')
    .demand('server_public_cert')
    .describe('server_public_cert', 'Server public certificate file')
    .describe('server_public_cert', 'Server private certificate file')
    .demand('client_public_cert')
    .describe('client_public_cert', 'Client public certificate file')
    .describe('client_public_cert', 'Client private certificate file')
    .check(function(argv) {

        if (argv.role !== 'client' && argv.role !== 'server')
        {
            // the component must be either "client" or "server"
            return false;
        }

        if (argv.role === 'client' && !argv.client_private_cert)
        {
            // if this is a client component it must have client private key
            return false;
        }

        if (argv.role === 'server' && !argv.server_private_cert)
        {
            // if this is a server component it must have server private key
            return false;
        }

        return true;

    })
    .argv;


var options = {     
        'client_private_cert' : argv.client_private_cert,
        'client_public_cert' : argv.client_public_cert,
        'server_public_cert' : argv.server_public_cert,
        'client_port' : argv.c,
        'server_port' : argv.s
    };

if (argv.role === 'client') {
    options.client_private_cert = argv.client_private_cert;
    ssltunnel.createClient(options);
}
else {
    options.server_private_cert = argv.server_private_cert;
    ssltunnel.createServer(options);
}

