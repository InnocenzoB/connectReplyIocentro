#!/bin/bash
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

set -e
set -o pipefail

while [ "$1" != "" ]; do
    PARAM=`echo $1 | awk -F= '{print $1}'`
    VALUE=`echo $1 | awk -F= '{print $2}'`
    sed -i -r "s/${PARAM} ?=.*;/${PARAM} = ${VALUE};/g" "$SCRIPT_DIR/src/build_config.ts"
    shift
done
