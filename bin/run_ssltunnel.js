var ssltunnel = require('./../lib/ssltunnel');

var argv = require('optimist')
  
  .usage('Usage $0')

  .demand('r')
  .alias('r', 'role')
  .describe('r', 'The role of the tunnel component, either \'client\' or \'server\'')

  .demand('proxy_port')
  .describe('proxy_port', 'The proxy listener\'s port')

  .default('server_host','localhost')
  .describe('server_host', 'The server\'s hostname. Either ssltunnel\'s server role or back-end server')

  .demand('server_port')
  .describe('server_port', 'The server\'s port. Either ssltunnel\'s server role or back-end server')

  .default('log_level','log')
  .describe('log_level', 'SSLTunnel logging level. One of: \'error\', \'warn\', \'info\', or \'log\'')

  .default('keep_alive','30000')
  .describe('keep_alive', 'Use TCP keep-alive when connecting to an sslserver. Provide keep-alive delay in ms. Use negative value for turning keep-alive off. Relevant for client role only.')

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

    if (argv.role === 'client' && (!argv.clt_prv_cert || argv.proxy_port == undefined))
    {
      // if this is a client component it must have client private key
      return false;
    }

    if (argv.role === 'server' && (!argv.srv_prv_cert || argv.proxy_port == undefined))
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
    'log_level' : argv.log_level,
    'proxy_port' : argv.proxy_port,
    'server_host' : argv.server_host,
    'server_port' : argv.server_port
  };


if (argv.role === 'client') {

  options.client_private_cert = argv.clt_prv_cert;
  options.keep_alive = argv.keep_alive;

  ssltunnel.createClient(options, function(err, port) {
    console.log('ssltunnel\'s client is listening on port: ' + port);
  });
}
else {

  options.server_private_cert = argv.srv_prv_cert;

  ssltunnel.createServer(options, function(err, port) {
    console.log('ssltunnel\'s server is listening on port: ' + port);
  });
}

