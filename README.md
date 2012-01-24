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



Now you can run the tunnel. Suppose you have your client component called my_client and server component called my_server. my_server is listening on port 8080 and is runnign on machine my_server_host_machine. 

So you run the ssltunnel's client component on the client machine to listen on port 8080. Let's choose port 54443 for our ssltunnel server.

	> cd bin
	> ssltunnel.cmd -r client -c 54443 -h my_server_host_machine -s 8080 --server_public_cert ../testcerts/local_public.pem --client_public_cert ../testcerts/cc_public_test.pem --client_private_cert ../testcerts/cc_private_test.pem

And you run ssltunnel's server component on the server on port 54443, and configure it to work against my_server on port 8080:
	
	> cd bin
	> ssltunnel.cmd -r server -s 54443 -c 8080 --server_public_cert ../testcerts/local_public.pem --client_public_cert ../testcerts/cc_public_test.pem --server_private_cert ../testcerts/local_private.pem

That's it. You can connect with your client to localhost:8080 and ssltunnel will take care on forwarding it to the real server, securely.

