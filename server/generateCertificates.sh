outdir=../../certificates

# make certificate request
openssl req -new -nodes -newkey rsa:2048 -keyout $outdir/firo.key -out $outdir/firo.csr -subj "/C=PL/ST=Masovian Voivodeship/L=Warsaw/O=rxsio/CN=firo.local"

# make website cert
openssl x509 -req -sha256 -days 1024 -in $outdir/firo.csr -CA $outdir/RootCA.pem -CAkey $outdir/RootCA.key -CAcreateserial -extfile domains.ext -out $outdir/firo.crt

# make pkcs12 for webrtcsink
openssl pkcs12 -export -out $outdir/firo.p12 -in $outdir/firo.crt -inkey $outdir/firo.key -passout pass:skar
