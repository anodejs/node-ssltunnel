var ssltunnel = require('./../lib/ssltunnel');

var argv = require('optimist')
    
    .usage('Usage $0')

    .demand('r')
    .alias('r', 'role')
    .describe('r', 'The role of the tunnel component, either \'client\' or \'server\'')

    .demand('p')
    .alias('p', 'port')
    .describe('p', 'The port of ssltunnel\'s server')

    .default('h','localhost')
    .alias('h', 'host')
    .describe('h', 'The hostname of ssltunnel\'s server')

    .describe('local_port', 'The local port ssltunnel\'s client will listen on')
    .describe('remote_port', 'The port on the remote machine ssltunnel\'s server will connect to')    
    .default('remote_host','localhost')
    .describe('remote_host', 'The hostname of the remote machine ssltunnel\'s server will connect to')    
    
    .demand('srv_pub_cert')
    .describe('srv_pub_cert', 'Public certificate file for ssltunnel\'s server')
    
    .describe('srv_prv_cert', 'Private certificate file for ssltunnel\'s server')

    .demand('clt_pub_cert')
    .describe('clt_pub_cert', 'Public certificate for ssltunnel\'s client')
    
    .describe('clt_prv_cert', 'Private certificate for ssltunnel\'s client')

    .check(function(argv) {

        if (argv.role !== 'client' && argv.role !== 'server')
        {
            // the component must be either "client" or "server"
            return false;
        }

        if (argv.role === 'client' && (!argv.clt_prv_cert || argv.local_port == undefined))
        {
            // if this is a client component it must have client private key
            return false;
        }

        if (argv.role === 'server' && (!argv.srv_prv_cert || !argv.remote_port))
        {
            // if this is a server component it must have server private key
            return false;
        }

        return true;

    })
    .argv;


var options = {     
        'client_public_cert' : argv.clt_pub_cert,
        'server_public_cert' : argv.srv_pub_cert,
    };

if (argv.role === 'client') {

    options.client_private_cert = argv.clt_prv_cert;
    options.client_port = argv.port;
    options.client_host = argv.host;
    options.server_port = argv.local_port;

    ssltunnel.createClient(options, function(port) {
        console.log('Server is listening on port: ' + port);
    });
}
else {

    options.server_private_cert = argv.srv_prv_cert;
    options.client_port = argv.remote_port;
    options.client_host = argv.remote_host;
    options.server_port = argv.port;

    ssltunnel.createServer(options, function(port) {
        console.log('Server is listening on port: ' + port);
    });
}

