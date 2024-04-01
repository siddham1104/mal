0
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const chalk = require('chalk');
const wrapper = require('./lib/wrapper');
const utility = require('./lib/utility');
const cors = require('cors');
const argv = require('yargs')
  .usage('Usage: $0 [options]')
  .option('p', {
    alias: 'permissions-only',
    describe: 'only output permissions',
    type: 'boolean',
    default: false,
  })
  .option('x', {
    alias: 'specify-permission',
    nargs: 1,
    describe: '<string> name of permission to search',
  })
  .alias('v', 'version')
  .describe('v', 'show version information')
  .help('h')
  .alias('h', 'help')
  .argv;

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // change the location of your downloaded floder here 
    cb(null, '/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('apkFile'), async (req, res) => {
  try {
    const filePath = req.file.path;
    await main(filePath);
    res.json({ message: 'Analysis completed. Check output.json.' });
  } catch (error) {
    console.error(chalk.red('Error:', error.message));
    res.status(500).json({ error: 'An error occurred during analysis.' });
  }
});

app.listen(port, () => {
  console.log(`⚙️ Server is running at port : ${port}`);
});

// Given dataset
const dataset = [
  'android.permission.GET_ACCOUNTS',
  'com.sonyericsson.home.permission.BROADCAST_BADGE',
  'android.permission.READ_PROFILE',
  'android.permission.MANAGE_ACCOUNTS',
  'android.permission.WRITE_SYNC_SETTINGS',
  'android.permission.READ_EXTERNAL_STORAGE',
  'android.permission.RECEIVE_SMS',
  'com.android.launcher.permission.READ_SETTINGS',
  'android.permission.WRITE_SETTINGS',
  'com.google.android.providers.gsf.permission.READ_GSERVICES',
  'android.permission.DOWNLOAD_WITHOUT_NOTIFICATION',
  'android.permission.GET_TASKS',
  'android.permission.WRITE_EXTERNAL_STORAGE',
  'android.permission.RECORD_AUDIO',
  'com.huawei.android.launcher.permission.CHANGE_BADGE',
  'com.oppo.launcher.permission.READ_SETTINGS',
  'android.permission.CHANGE_NETWORK_STATE',
  'com.android.launcher.permission.INSTALL_SHORTCUT',
  'android.permission.READ_PHONE_STATE',
  'android.permission.CALL_PHONE',
  'android.permission.WRITE_CONTACTS',
  'android.permission.READ_PHONE_STATE',
  'com.samsung.android.providers.context.permission.WRITE_USE_APP_FEATURE_SURVEY',
  'android.permission.MODIFY_AUDIO_SETTINGS',
  'android.permission.ACCESS_LOCATION_EXTRA_COMMANDS',
  'android.permission.INTERNET',
  'android.permission.MOUNT_UNMOUNT_FILESYSTEMS',
  'com.majeur.launcher.permission.UPDATE_BADGE',
  'android.permission.AUTHENTICATE_ACCOUNTS',
  'com.htc.launcher.permission.READ_SETTINGS',
  'android.permission.ACCESS_WIFI_STATE',
  'android.permission.FLASHLIGHT',
  'android.permission.READ_APP_BADGE',
  'android.permission.USE_CREDENTIALS',
  'android.permission.CHANGE_CONFIGURATION',
  'android.permission.READ_SYNC_SETTINGS',
  'android.permission.BROADCAST_STICKY',
  'com.anddoes.launcher.permission.UPDATE_COUNT',
  'com.android.alarm.permission.SET_ALARM',
  'com.google.android.c2dm.permission.RECEIVE',
  'android.permission.KILL_BACKGROUND_PROCESSES',
  'com.sonymobile.home.permission.PROVIDER_INSERT_BADGE',
  'com.sec.android.provider.badge.permission.READ',
  'android.permission.WRITE_CALENDAR',
  'android.permission.SEND_SMS',
  'com.huawei.android.launcher.permission.WRITE_SETTINGS',
  'android.permission.REQUEST_INSTALL_PACKAGES',
  'android.permission.SET_WALLPAPER_HINTS',
  'android.permission.SET_WALLPAPER',
  'com.oppo.launcher.permission.WRITE_SETTINGS',
  'android.permission.RESTART_PACKAGES',
  'me.everything.badger.permission.BADGE_COUNT_WRITE',
  'android.permission.ACCESS_MOCK_LOCATION',
  'android.permission.ACCESS_COARSE_LOCATION',
  'android.permission.READ_LOGS',
  'com.google.android.gms.permission.ACTIVITY_RECOGNITION',
  'com.amazon.device.messaging.permission.RECEIVE',
  'android.permission.SYSTEM_ALERT_WINDOW',
  'android.permission.DISABLE_KEYGUARD',
  'android.permission.USE_FINGERPRINT',
  'me.everything.badger.permission.BADGE_COUNT_READ',
  'android.permission.CHANGE_WIFI_STATE',
  'android.permission.READ_CONTACTS',
  'com.android.vending.BILLING',
  'android.permission.READ_CALENDAR',
  'android.permission.RECEIVE_BOOT_COMPLETED',
  'android.permission.WAKE_LOCK',
  'android.permission.ACCESS_FINE_LOCATION',
  'android.permission.BLUETOOTH',
  'android.permission.CAMERA',
  'com.android.vending.CHECK_LICENSE',
  'android.permission.FOREGROUND_SERVICE',
  'android.permission.BLUETOOTH_ADMIN',
  'android.permission.VIBRATE',
  'android.permission.NFC',
  'android.permission.RECEIVE_USER_PRESENT',
  'android.permission.CLEAR_APP_CACHE',
  'com.android.launcher.permission.UNINSTALL_SHORTCUT',
  'com.sec.android.iap.permission.BILLING',
  'com.htc.launcher.permission.UPDATE_SHORTCUT',
  'com.sec.android.provider.badge.permission.WRITE',
  'android.permission.ACCESS_NETWORK_STATE',
  'com.google.android.finsky.permission.BIND_GET_INSTALL_REFERRER_SERVICE',
  'com.huawei.android.launcher.permission.READ_SETTINGS',
  'android.permission.READ_SMS',
  'android.permission.PROCESS_INCOMING_CALLS'
];



async function main(filePath) {
  let pathToUnzippedApk = '';
  let specificPermission = '';
  let root = __dirname;

  try {
    let outputData = {};

    if (!fs.existsSync(filePath)) {
      throw new Error('APK file not found.');
    }

    pathToUnzippedApk = await utility.unzipApk(filePath);
    if (!pathToUnzippedApk) {
      throw new Error('Error unzipping APK file.');
    }

    if (argv.x) {
      specificPermission = argv.x;
    }

    console.log('Path to Unzipped APK:', pathToUnzippedApk);

    // Get permissions from the APK
    const permissions = wrapper.getPermissions(pathToUnzippedApk);

    // Convert permissions to an array of 0s and 1s based on dataset
    const permissionArray = dataset.map(permission => permissions.includes(permission) ? 1 : 0);

    // Assign the permission array to outputData
    outputData.permissions = permissionArray;

    // Write output to output.json
    let jsonData = JSON.stringify(outputData, null, 2);
    fs.writeFileSync('output.json', jsonData);

    console.log('Output written to output.json file.');
  } catch (error) {
    console.error(chalk.red('Error:', error.message));
    process.exit(1);
  }
}
