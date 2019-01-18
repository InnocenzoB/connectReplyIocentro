#!/bin/bash

set -e
set -o pipefail

# Install JavaScript world; transpile TypeScript to JavaScript
npm install
npm run build

# Build, bundle & all
# fastlane ios default
~/.fastlane/bin/fastlane  android testfairy
~/.fastlane/bin/fastlane  android customer_release
