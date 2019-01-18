#!/bin/bash

echo "Clearing out build folder with some potencially old builds..."
rm -rf build

echo "Clearing out node modules..."
rm -rf node_modules

echo "Clearing out transpiled app..."
rm -rf out

echo "Clearing installed Pods and XCode workspace..."
rm -rf Pods

# echo "Clearing out potencially agumented Podfile..."
# git checkout Podfile
