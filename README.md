# Morrow

Morrow is a mobile-first, local-first workspace for notes, priorities, projects, and the shape of your day. The responsive web app is also packaged as an offline Android app.

## Download and install

The ready-to-install development build is **[`release/Morrow.apk`](release/Morrow.apk)**. Transfer it to an Android device running Android 7.0 (API 24) or newer, open it, and allow installation from your browser or file manager if Android asks. A current Android System WebView is recommended.

The APK is signed with a development key, not a Play Store release key. Android or Play Protect may warn about installing an app from outside the Play Store. The APK signature and archive were verified during the build; installation on a physical device was not available in this environment.

## What works

- Customize which cards appear on the overview.
- Add, complete, and remove priorities; create and edit notes and organize them into visual project folders.
- Add calendar events, switch between day and week views, and add in-app reminders.
- Send messages in the sample team space and stamp or unstamp the sample document.
- Search local tasks, notes, and projects. Changes persist on the current device.

**Important:** This is an offline, single-device demo. Team members and their initial activity are sample content; messages and stamps are not synchronized with other people. Reminders are displayed inside the app and do not trigger system notifications or alarms. Browser and Android app data are stored separately, and uninstalling the Android app removes its local data.

## Run the web app

```sh
npm install
npm run dev
```

The Vite server binds to `0.0.0.0` for a browser preview. While the server is running, `/download/Morrow.apk` serves the included APK as a downloadable attachment. `npm run build` creates the static web bundle, and `npm test` runs the date, seed-data, and calendar-layout tests.

## Build the Android APK

You need Node.js, Python 3, `zip`, JDK 17, Android SDK Platform 35, and Android SDK Build Tools 35.0.0. Then:

```sh
export ANDROID_HOME=/path/to/android-sdk
npm install
./scripts/build-apk.sh
```

The script builds the web assets, packages them into a small native WebView shell, aligns the APK, signs it, and verifies its signature. It writes `release/Morrow.apk`. `BUILD_TOOLS_VERSION` and `PLATFORM_VERSION` can be set to use different installed versions. The individual `AAPT2`, `D8_JAR`, `APKSIGNER_JAR`, and `ANDROID_JAR` paths can also be supplied directly.

By default, a development keystore is generated under the ignored `android/.signing/` directory. Keep the same keystore to install future builds as updates; a build signed with a different key requires uninstalling the existing app first (which removes its local data). For a public release, use your own properly secured signing key and release process; do not distribute the development key.
