This is a lightweight TCP over SSL / TLS tunnel running over node. If you need to add confidentiality (privacy), integrity, and authenticity to your TCP stream this is the tool for you.

In order to run this module you will need to download and install nodejs (don't worry, it is small): http://nodejs.org/#download

Additionaly, you will need to create client and server SSL certificates. The easiest way to do so is to use openssl [http://www.openssl.org/]. The steps are the same for both client and server certificates. Note that you have test certificates to play with under the testcerts folder. 


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


Now you have the key pair for you certificate. You can use it for either client or server component. Please create another pair for the remaining component. PLEASE KEEP YOU PRIVATE KEYS SECURE. 

Now you can run the tunnel. Suppose you have your client component called my_client and server component called my_server. my_server is listening on port 8080 and is runnign on machine my_server_host_machine. 

So you run the ssltunnel's client component on the client machine to listen on port 8080. Let's choose port 54443 for our ssltunnel server.

	> cd bin
	> ssltunnel.cmd -r client -c 54443 -s 8080 --server_public_cert ../testcerts/local_public.pem --client_public_cert ../testcerts/cc_public_test.pem --client_private_cert ../testcerts/cc_private_test.pem

And you run ssltunnel's server component on the server on port 54443, and configure it to work against my_server on port 8080:
	
	> cd bin
	> ssltunnel.cmd -r server -s 54443 -c 8080 --server_public_cert ../testcerts/local_public.pem --client_public_cert ../testcerts/cc_public_test.pem --server_private_cert ../testcerts/local_private.pem

That's it. You can connect with your client to localhost:8080 and ssltunnel will take care on forwarding it to the real server, securely.

