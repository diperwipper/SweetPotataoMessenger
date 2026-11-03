#!/usr/bin/env bash
# Build the offline WebView shell with standard Android SDK command-line tools.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
SDK="${ANDROID_HOME:-${ANDROID_SDK_ROOT:-}}"
BUILD_TOOLS_VERSION="${BUILD_TOOLS_VERSION:-35.0.0}"
PLATFORM_VERSION="${PLATFORM_VERSION:-35}"
AAPT2="${AAPT2:-${SDK:+$SDK/build-tools/$BUILD_TOOLS_VERSION/aapt2}}"
D8_JAR="${D8_JAR:-${SDK:+$SDK/build-tools/$BUILD_TOOLS_VERSION/lib/d8.jar}}"
APKSIGNER_JAR="${APKSIGNER_JAR:-${SDK:+$SDK/build-tools/$BUILD_TOOLS_VERSION/lib/apksigner.jar}}"
ANDROID_JAR="${ANDROID_JAR:-${SDK:+$SDK/platforms/android-$PLATFORM_VERSION/android.jar}}"
JAVA="${JAVA_HOME:+$JAVA_HOME/bin/}java"
JAVAC="${JAVA_HOME:+$JAVA_HOME/bin/}javac"
JAR="${JAVA_HOME:+$JAVA_HOME/bin/}jar"
KEYTOOL="${JAVA_HOME:+$JAVA_HOME/bin/}keytool"
for tool in "$AAPT2" "$D8_JAR" "$APKSIGNER_JAR" "$ANDROID_JAR"; do
  if [[ -z "$tool" || ! -f "$tool" ]]; then
    echo "Missing Android SDK tool: ${tool:-<not configured>}. Set ANDROID_HOME or the individual tool variables; see README.md." >&2
    exit 1
  fi
done
BUILD="$ROOT/android/.build"
SIGNING="$ROOT/android/.signing"
rm -rf "$BUILD"
mkdir -p "$BUILD/compiled" "$BUILD/classes" "$BUILD/dex" "$SIGNING" "$ROOT/release"

npm run build
mkdir -p "$BUILD/assets/www"
cp -R dist/. "$BUILD/assets/www/"
"$AAPT2" compile --dir android/res -o "$BUILD/compiled/resources.zip"
"$AAPT2" link --manifest android/AndroidManifest.xml -I "$ANDROID_JAR" \
  -A "$BUILD/assets" -o "$BUILD/unsigned.apk" "$BUILD/compiled/resources.zip"
"$JAVAC" -source 8 -target 8 -classpath "$ANDROID_JAR" -d "$BUILD/classes" \
  android/src/com/morrow/workspace/MainActivity.java
"$JAR" cf "$BUILD/classes.jar" -C "$BUILD/classes" .
"$JAVA" -cp "$D8_JAR" com.android.tools.r8.D8 --min-api 24 --output "$BUILD/dex" "$BUILD/classes.jar"
(cd "$BUILD/dex" && zip -q -0 "$BUILD/unsigned.apk" classes.dex)
python3 scripts/align-apk.py "$BUILD/unsigned.apk" "$BUILD/aligned.apk"

# This is a development signing key, not a Play Store release credential.
KEYSTORE="${MORROW_KEYSTORE:-$SIGNING/morrow-debug.keystore}"
KEY_ALIAS="${MORROW_KEY_ALIAS:-morrow-debug}"
KEY_PASS="${MORROW_KEY_PASS:-android}"
if [[ ! -f "$KEYSTORE" ]]; then
  "$KEYTOOL" -genkeypair -keystore "$KEYSTORE" -storepass "$KEY_PASS" -keypass "$KEY_PASS" \
    -alias "$KEY_ALIAS" -keyalg RSA -keysize 2048 -validity 10000 \
    -dname "CN=Morrow Development, O=Morrow, C=US" -noprompt >/dev/null 2>&1
fi
"$JAVA" -jar "$APKSIGNER_JAR" sign --ks "$KEYSTORE" --ks-key-alias "$KEY_ALIAS" \
  --ks-pass "pass:$KEY_PASS" --key-pass "pass:$KEY_PASS" --v4-signing-enabled false \
  --out "$ROOT/release/Morrow.apk" "$BUILD/aligned.apk"
"$JAVA" -jar "$APKSIGNER_JAR" verify --verbose --print-certs "$ROOT/release/Morrow.apk"
echo "Built $ROOT/release/Morrow.apk"
