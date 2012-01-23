
Example run for client component: 

> cd bin
> ssltunnel.cmd -r client -c 54443 -s 54080 --server_public_cert ../testcerts/local_public.pem --client_public_cert ../testcerts/cc_public_test.pem --client_private_cert ../testcerts/cc_private_test.pem

Example run for server component: 

> cd bin
> ssltunnel.cmd -r server -s 54443 -c 54321 --server_public_cert ../testcerts/local_public.pem --client_public_cert ../testcerts/cc_public_test.pem --server_private_cert ../testcerts/local_private.pem