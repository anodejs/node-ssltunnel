[![Build Status](https://secure.travis-ci.org/anodejs/node-ssltunnel.png?branch=master)](http://travis-ci.org/#!/anodejs/node-ssltunnel)

## What is ssltunnel?

This is a lightweight TCP over SSL / TLS tunnel running over node. If you need to add confidentiality (privacy), integrity, and authenticity to your TCP stream this is the tool for you.

## Installation

Please follow the following steps to get it up and running:

1. [Download and install latest node](http://nodejs.org/#download) (don't worry, it is small) (don't worry, it is small)
2. Enter CMD and run: ```npm install ssltunnel```
3. The ssltunnel package now resides under ```./node_modules/ssltunnel```

## Creating certificates 

ssltunnel uses client and server certificates for creating proper TLS connection. While server certificate is enough to assure confidentiality and integrity, client certificate is required for assuring authenticity.

Test certificates are provided in the ```testcerts``` folder. You can start playing with sltunnel using them. 

> Please do not use test certificates for production.

You can easily create your certificates using [openssl](http://www.openssl.org/). Each certificate is represented by a key pair. 
The steps are the same for both client and server certificates. See some example of certificate generation below.

```
  dimast@DIMAST-LAPTOP /d/src/mygithub/temp
  $ openssl genrsa -out private.pem 2048
  Generating RSA private key, 2048 bit long modulus
  ...+++
  ............+++
  e is 65537 (0x10001)

  dimast@DIMAST-LAPTOP /d/src/mygithub/temp
  $ ls
  private.pem

  dimast@DIMAST-LAPTOP /d/src/mygithub/temp
  $ openssl req -new -x509 -key private.pem -out public.pem -days 365
  You are about to be asked to enter information that will be incorporated
  into your certificate request.
  What you are about to enter is what is called a Distinguished Name or a DN.
  There are quite a few fields but you can leave some blank
  For some fields there will be a default value,
  If you enter '.', the field will be left blank.
  -----
  Country Name (2 letter code) [AU]:IL
  State or Province Name (full name) [Some-State]:
  Locality Name (eg, city) []:
  Organization Name (eg, company) [Internet Widgits Pty Ltd]:
  Organizational Unit Name (eg, section) []:
  Common Name (eg, YOUR name) []:my_server
  Email Address []:

  dimast@DIMAST-LAPTOP /d/src/mygithub/temp
  $ ls
  private.pem  public.pem
```

> PLEASE KEEP YOUR PRIVATE KEYS SECURE

## Running the ssltunnel

Imagine you have a client-server application. The server is running on ```my_host:8080```. You can route the traffic via ssl tunnel by 
creating both ssltunnel's server and client:

```
d:\src\ssltunnel\bin>ssltunnel.cmd -r server \
--proxy_port 54443 \
--server_port 8080 \
--server_host my_host \
--srv_pub_cert ..\testcerts\sc_public.pem \
--clt_pub_cert ..\testcerts\cc_public.pem \
--srv_prv_cert ..\testcerts\sc_private.pem \

Running 'server' role. Listening on 54443, decrypting and forwarding to real server machine on my_host:8080
```

```
d:\src\ssltunnel\bin>ssltunnel.cmd -r client \
--proxy_port 54080 \
--server_port 54443 \
--server_host my_ssltunnel_server_host \
--srv_pub_cert ..\testcerts\sc_public.pem \
--clt_pub_cert ..\testcerts\cc_public.pem \
--clt_prv_cert ..\testcerts\cc_private.pem \


Running 'client' role. Listening on 54080, encrypting and forwarding to ssltunnel's server on my_ssltunnel_server_host:54443
```

Now, just point you client to the machine where ssltunnel's client is running (localhost?) port 54808, and ssltunnel will 
take care of forwarding the data to the server securely.

This is the list of all arguments ssltunnel supports:

```
d:\src\ssltunnel\bin>ssltunnel
Usage node d:\src\ssltunnel\bin\run_ssltunnel.js

Options:
  -r, --role      The role of the tunnel component, either 'client' or 'server'              [required]
  --proxy_port    The proxy listener's port                                                  [required]
  --server_host   The server's hostname. Either ssltunnel's server role or back-end server   [default: "localhost"]
  --server_port   The server's port. Either ssltunnel's server role or back-end server       [required]
  --log_level     SSLTunnel logging level. One of: 'error', 'warn', 'info', or 'log'         [default: "log"]
  --keep_alive    Use TCP keep-alive when connecting to an sslserver. 
                  Provide keep-alive delay in ms. Use negative value for
                  turning keep-alive off. Relevant for client role only.                     [default: "30000"]
  --srv_pub_cert  Public certificate file for ssltunnel's server                             [required]
  --srv_prv_cert  Private certificate file for ssltunnel's server
  --clt_pub_cert  Public certificate for ssltunnel's client                                  [required]
  --clt_prv_cert  Private certificate for ssltunnel's client


Missing required arguments: r, proxy_port, server_port, srv_pub_cert, clt_pub_cert

```

## API

You can use the library in your node project. The are two exported methods:

```
var ssltunnel = require('ssltunnel');

var options = {
  
    'proxy_port' : 8080,
    'server_host' : my_host,
    'server_port' : 54443,
    //...
}

ssltunnel.createServer(options);

// or

ssltunnel.createClient(options);
```

The options are basically property bag with data similar to what arguments contain. 
See [run_ssltunnel.js](https://github.com/anodejs/node-ssltunnel/blob/master/bin/run_ssltunnel.js) for usage example.

The full list is below:

'proxy_port'          : the listening proxy port. Receives cleartext for *client* role and ciphertext for *server* role.
'server_port'         : the port of the server to forward the data to. 
'server_host'         : the host name of the server to forward the data to.

'client_public_cert'  : client's role public certificate. 
'server_public_cert'  : client's role private certificate. 
'client_private_cert' : servers's role public certificate. 
'server_private_cert' : servers's role public certificate. 

'log_level'           : One of: 'error', 'warn', 'info', or 'log'.
'keep_alive'          : Whether to use TCP keep alive when connecting to *server* role. This setting is relevant to *client* role only.

## Enjoy!
