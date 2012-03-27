Hi guys,

Today I'd like to discuss ssltunnel. So, what is it? ssltunnel is a lightweight TCP over SSL / TLS tunnel running over node. If you need to add confidentiality (privacy), integrity, and authenticity to your TCP stream this is the tool for you. ssltunnel is available as node package via [npm](http://search.npmjs.org/#/ssltunnel). It is distributed under MIT license. 

## Intro

In order to make the discussion about the deeper parts more concrete let's take a concrete example. Let's say that you use mongodb as your database and you need to connect to your CLI client (mongo.exe) running on you PC to your mongo server (mongod.exe) running on your remote VM. Now suppose that you want to assure that all the traffic is encrypted and that only you can connect to your mongo server. Here ssltunnel becomes handy. 

ssltunnel consists of two parts: *sslproxy* and *sslserver*. The sslproxy part is running on the client machine communicating with the real client, mongo.exe in our case, and sslserver. The sslserver part is running on the server machine and communicating with sslproxy and the back-end server, mongod.exe in our case. sslproxy authenticates sslserver via SSL server certificate. sslserver authenticates sslproxy via SSL client certificate. The traffic itself is encrypted using standard SSL / TLS protocol.


## Tunneling mongo traffic through ssltunnel

So, let's create this secure tunnel step by step. Let's suppose the following:

1. all parts are running on local machine (for the sake of simplicity)
2. mongod.exe listening port is 50080
3. sslserver listening port is 80443
4. sslclient listening port is 50081


### step 1: installation

Please download the [latest node](http://nodejs.org/#download). Open *cmd* and install ssltunnel package via npm. I'll install it on c:\ (I run Windows).

`anydir/> cd /d c:\`
`c:\> npm install ssltunnel`

You should now see *node_module* directory created under c:\ . Congratulations, you've successfully install ssltunnel :)

### step 2: running the mongo server

If you don't have mongo please [download](http://www.mongodb.org/downloads) the latest version now. Extract it in the directory of your choice. Run *cmd* and navigate to this directory. Now you can run the server. For the sake of simplicity I instruct it to put data in *data\db* folder.

`d:\src\mongodb-win32-x86_64-2.0.2\bin>mongod --port 50080 --dbpath data\db`

You should see something like this:

```
Tue Mar 27 16:41:56 [initandlisten] MongoDB starting : pid=3232 port=50080 dbpath=data\db 64-bit host=Dimast-laptop
Tue Mar 27 16:41:56 [initandlisten] db version v2.0.2, pdfile version 4.5
Tue Mar 27 16:41:56 [initandlisten] git version: 514b122d308928517f5841888ceaa4246a7f18e3
Tue Mar 27 16:41:56 [initandlisten] build info: windows (6, 1, 7601, 2, 'Service Pack 1') BOOST_LIB_VERSION=1_42
Tue Mar 27 16:41:56 [initandlisten] options: { dbpath: "data\db", port: 50080 }
Tue Mar 27 16:41:56 [initandlisten] journal dir=data/db/journal
Tue Mar 27 16:41:56 [initandlisten] recover : no journal files present, no recovery needed
Tue Mar 27 16:41:56 [initandlisten] waiting for connections on port 50080
Tue Mar 27 16:41:56 [websvr] admin web console waiting for connections on port 51080
```

### step 3: establishing the tunnel

Let's navigate to the *bin* directory of ssltunnel:

`c:\>cd c:\node_modules\ssltunnel\bin`

Now we will create sslserver. Note that you need server certificate with private key and public client certificate in order to be able to verify the client. I have provided test certificates as part of the package. *Please generate and use your own for production systems*. See how to do it [here](https://github.com/anodejs/node-ssltunnel). 

So we instruct the sslserver (*-r server*) to listen on port *50443* and connect to back end server on host *localhost* (the default, actually) and port *50080*. We also provide public and private server certificates and public client certificate which are stored in decrypted pem files. 

`c:\node_modules\ssltunnel\bin>ssltunnel.cmd -r server --proxy_port 50443 --server_port 50080 --server-host localhost --srv_pub_cert ..
\testcerts\sc_public.pem --srv_prv_cert ..\testcerts\sc_private.pem --clt_pub_cert ..\testcerts\cc_public.pem`

This is the output you should get:

```
Running 'server' role. Listening on 50443, decrypting and forwarding to real server machine on localhost:50080
ssltunnel's server is listening on port: 50443
```

Now let's fire the client:

Here we instruct the sslproxy (*-r client*) to listen on port *50081* and connect to sslserver on host *localhost* (also the default) and port *50443*. We also provide public and private client certificates and sslserver's public certificate. 

`c:\node_modules\ssltunnel\bin>ssltunnel.cmd -r client --proxy_port 50081 --server_port 50443 --server-host --srv_pub_cert ..\testcerts\sc_public.pem --clt_pub_cert ..\testcerts\cc_public.pem --clt_prv_cert ..\testcerts\cc_private.pem`

You should see something like this:

```
Running 'client' role. Listening on 50081, encrypting and forwarding to ssltunnel's server on localhost:50443
ssltunnel's client is listening on port: 50081
```

Congrats! You have an established secure tunnel. 

### step 3: connecting though the tunnel

Let's try to connect now. Fire up *cmd* and navigate to mongo's bing directory. Then run mongo.exe and instruct it to connect to *localhost:50081*.

```
d:\src\mongodb-win32-x86_64-2.0.2\bin>mongo localhost:50081
MongoDB shell version: 2.0.2
connecting to: localhost:50081/test
> show dbs
local   (empty)
test    0.078125GB
>
```

You have successfully connected to your mongo server through ssltunnel!

## Epilogue

Few additional words on this. In addition to the above ssltunnel enables setting TCP keep-alive between sslproxy and sslserver. This makes it possible to overcome problems with servers with low TCP timeouts. It also supports setting various logs verbosity. 

ssltunnel can also be used via node script. You just populate the *options* object with all the configuration details and run either *ssltunnel.createClient()* to create sslproxy or *ssltunnel.createServer()* to create sslserver. See [this](https://github.com/anodejs/node-ssltunnel/blob/master/bin/run_ssltunnel.js) file for example (scroll to the bottom).


If you use ssltunnel and missing a feature feel free to send a pull request or just ask me to do it. If you have any questions do not hesitate to contact me at dimast@microsoft.com

Cheers!
Dima Stopel

