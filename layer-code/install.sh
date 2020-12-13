#!/bin/sh
if [ ! -d "./python" ]; then
    pip3 install -r requirements.txt -t ./python
fi