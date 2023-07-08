outdir=../../certificates
mkdir ../../certificates

# make CA
openssl req -x509 -nodes -new -sha256 -days 1024 -newkey rsa:2048 -keyout $outdir/RootCA.key -out $outdir/RootCA.pem -subj "/C=PL/CN=rxsio"

