#!/bin/bash

# wrapper to allow complex npm scripts that include bashisms to run
# both on windows (with git bash installed) and linux, and still allow
# command-line arguments to get passed through

# Author: Jonathan Segal josegal@cisco.com 20 Dec 2016

maincmd=$1
shift
rest="$@"

echo $maincmd "$rest"
echo $maincmd "$rest" | bash

