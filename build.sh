#!/bin/bash

set -e
set -o pipefail

# Add additional git remote for pushing of tags
# git remote remove extRepo || echo "Attempting to remove remote extRepo failed - ignoring"
# git remote add extRepo https://git-codecommit.eu-west-1.amazonaws.com/v1/repos/mobile_ioCentro

# Remove all local tags & fetch them from remote - potecially cleaning tags from failed builds
# git tag -l | xargs git tag -d
# git fetch extRepo --tags --unshallow

# Bump version & create tag that contains this information
cd build-tools && npm install && cd ..
node build-tools/node_modules/adb-build-tagger/index.js --plistPath ios/AppKitchenAid/Info.plist --gradlePath android/app/build.gradle  --appPrefix AppKitchenAid

# Build the app
./build-the-app.sh

# Push new tag
# git push extRepo --tags
