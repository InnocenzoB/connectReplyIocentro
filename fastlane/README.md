fastlane documentation
================
# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```
xcode-select --install
```

Install _fastlane_ using
```
[sudo] gem install fastlane -NV
```
or alternatively using `brew cask install fastlane`

# Available Actions
## Android
### android test
```
fastlane android test
```
Runs all the tests
### android testfairy
```
fastlane android testfairy
```
Build signed, release version of application with all developement features.
### android customer_release
```
fastlane android customer_release
```
Unsigned version of app, with some features disabled. Prepared for customer to sign and realease.

----

## iOS
### ios test
```
fastlane ios test
```
Runs all the tests
### ios default
```
fastlane ios default
```
Default app

----

This README.md is auto-generated and will be re-generated every time [fastlane](https://fastlane.tools) is run.
More information about fastlane can be found on [fastlane.tools](https://fastlane.tools).
The documentation of fastlane can be found on [docs.fastlane.tools](https://docs.fastlane.tools).
