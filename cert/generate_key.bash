#!/bin/bash
openssl req -x509 -nodes -days 730 -newkey rsa:2048 -keyout key.pm -out cert.pm -config config.cnf