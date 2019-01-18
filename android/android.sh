#!/bin/bash
# rm -rf ../node_modules

npm install

npm run build

./gradlew assembleRelease

# Verificare firma
~/Library/Android/sdk/build-tools/28.0.2/apksigner verify --print-certs app/build/outputs/apk/release/app-release-unsigned.apk

# Allinea

~/Library/Android/sdk/build-tools/28.0.2/zipalign -v -p 4 app/build/outputs/apk/release/app-release-unsigned.apk app/build/outputs/apk/release/app-release-unsigned-aligned.apk
# Firma

~/Library/Android/sdk/build-tools/28.0.2/apksigner sign --ks app/kitchenAid-testfairy-key.keystore --out app/build/outputs/apk/release/kitchenAid-release.apk app/build/outputs/apk/release/app-release-unsigned-aligned.apk

# Verificare firma
~/Library/Android/sdk/build-tools/28.0.2/apksigner verify --print-certs app/build/outputs/apk/release/kitchenAid-release.apk
