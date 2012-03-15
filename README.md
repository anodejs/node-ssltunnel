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
d:\src\mygithub\ssltunnel\bin>ssltunnel.cmd -r server \
-p 54443 \
-h my_ssltunnel_server_host \
--remote_port 8080 \
--remote_host my_host \
--srv_pub_cert ..\testcerts\local_public.pem \
--clt_pub_cert ..\testcerts\cc_public_test.pem \
--srv_prv_cert ..\testcerts\local_private.pem 

Running 'server' role. Listening on 54443, decrypting and forwarding to real server machine on my_host:8080.
```

```
d:\src\mygithub\ssltunnel\bin>ssltunnel.cmd -r client \
-p 54443 \
-h my_ssltunnel_server_host \
--local_port 54080 \
--srv_pub_cert ..\testcerts\local_public.pem \
--clt_pub_cert ..\testcerts\cc_public_test.pem \
--clt_prv_cert ..\testcerts\cc_private_test.pem

Running 'client' role. Listening on 54080, encrypting and forwarding to ssltunnel's server on my_ssltunnel_server_host:54443.
```

Now, just point you client to the machine where ssltunnel's client is running (localhost?) port 54808, and ssltunnel will 
take care of forwarding the data to the server securely.

This is the list of all arguments ssltunnel supports:

```
d:\src\mygithub\ssltunnel\bin>ssltunnel.cmd
Usage node d:\src\mygithub\ssltunnel\bin\run_ssltunnel.js

Options:
  -r, --role      The role of the tunnel component, either 'client' or 'server'          [required]
  -p, --port      The port of ssltunnel's server                                         [required]
  -h, --host      The hostname of ssltunnel's server                                     [default: "localhost"]
  --local_port    The local port ssltunnel's client will listen on
  --remote_port   The port on the remote machine ssltunnel's server will connect to
  --remote_host   The hostname of the remote machine ssltunnel's server will connect to  [default: "localhost"]
  --srv_pub_cert  Public certificate file for ssltunnel's server                         [required]
  --srv_prv_cert  Private certificate file for ssltunnel's server
  --clt_pub_cert  Public certificate for ssltunnel's client                              [required]
  --clt_prv_cert  Private certificate for ssltunnel's client
```

## API

You can use the library in your node project. The are two exported methods:

```
var ssltunnel = require('ssltunnel');
ssltunnel.createServer(options)
ssltunnel.createClient(options)
```

The options are basically property bag with data similar to what arguments contain. Feel free to see usage example in ```bin/run_ssltunnel.js```

Please see detailed list below:

* options.client_port:
For createServer() this is a remote machine port.
For createClient() this is a ssltunnel's server port.

* options.client_host: 
For createServer() this is a remote machine host.
For createClient() this is a ssltunnel's server host.

* options.server_port:
For createServer() this is a listening port for ssltunnel's server.
For createClient() this is a listening port for ssltunnel's client.

* options.server_public_cert: Server public certificate. 

* options.server_private_cert:
Server private certificate. Not needed for createClient().

* options.client_public_cert:
Client  public certificate. 

* options.client_private_cert:
Client private certificate. Not needed for createServer().

## Enjoy!
