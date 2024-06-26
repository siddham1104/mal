// const path = require('path');
// const fs = require('fs');
// const { execSync } = require('child_process');
// const isUrl = require('is-url');
// const inquirer = require('inquirer');
// const chalk = require('chalk');

// // Define the directory path for storing downloaded and unpacked APK files
// const apkStorageDirectory = 'D:\\Downloads\\apk-inspector\\apk-inspector-0.1.0\\public\\uploads';


// let correctLocalApk = {
//   type: 'input',
//   name: 'pathToApk',
//   message: 'Please enter a valid APK filepath:',
// }

// let correctRemoteApk = {
//   type: 'input',
//   name: 'urlToApk',
//   message: 'Please enter a valid APK URL:',
// }

// module.exports = {
//   downloadApk: function (root, urlToApk) {
//     console.log(chalk.cyan("Downloading APK...\n"));
//     const downloadPath = path.join(apkStorageDirectory, 'apki-download.apk');

//     execSync(`curl -L ${urlToApk} > ${downloadPath}`, (err, stdout, stderr) => {
//       if (err) {
//         console.log(chalk.yellow("nodejs error downloading apk:", err.message, err.stack));
//       }
//       if (stderr) {
//         console.log(chalk.yellow("apktool error:", stderr));
//       }
//     });
//     console.log('\n');
//     return path.resolve(downloadPath);
//   },

//   unzipApk: async function (pathToApk) {
//     console.log(chalk.cyan("Unpacking APK with APKTool...\n"));
//     execSync(`apktool d -f ${pathToApk} -o ${apkStorageDirectory}`, (err, stdout, stderr) => {
//       if (err) {
//         console.log(chalk.yellow("nodejs error running apktool:", err.message, err.stack));
//       }
//       if (stderr) {
//         console.log(chalk.yellow("apktool error:", stderr));
//       }
//     });
//     console.log('\n');
//     return path.join(apkStorageDirectory);
//   },

//   verifyPathToApk: async function (pathToApk) {
//     pathToApk = path.resolve(pathToApk);
//     while (!fs.existsSync(pathToApk)) {
//       console.log(chalk.red('Path to APK is invalid. Please verify correct path and try again.'), chalk.red('Current path: ', pathToApk));
//       let correctPath = await inquirer.prompt([correctLocalApk]);
//       pathToApk = correctPath.pathToApk;
//     }
//     console.log('\n');
//     return pathToApk;
//   },

//   verifyUrlToApk: async function (urlToApk) {
//     while (!isUrl(urlToApk)) {
//       console.log(chalk.red('URL is invalid. Please correct the URL and try again.'), chalk.red('Current URL: ', urlToApk));
//       let correctUrl = await inquirer.prompt([correctRemoteApk]);
//       urlToApk = correctUrl.urlToApk;
//     }
//     console.log('\n');
//     return urlToApk;
//   }
// };

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');
const isUrl = require('is-url');
const inquirer = require('inquirer');
const chalk = require('chalk');

let correctLocalApk = {
  type: 'input',
  name: 'pathToApk',
  message: 'Please enter a valid APK filepath:',
}

let correctRemoteApk = {
  type: 'input',
  name: 'urlToApk',
  message: 'Please enter a valid APK URL:',
}

module.exports = {
  /**
   * Download APK from specified URL
   * @param {path} root 
   * @param {string: URL} urlToApk 
   * @returns {path} downloadPath
   */
  downloadApk: function (root, urlToApk) {
    console.log(
      chalk.cyan("Downloading APK...\n")
    );
    let downloadPath = path.join(root, 'apki-download.apk');

    execSync(`curl -L ${urlToApk} > ${downloadPath}`, (err, stdout, stderr) => {
      if (err) {
        console.log(
          chalk.yellow("nodejs error downloading apk:", err.message, err.stack)
        );
      }

      if (stderr) {
        console.log(
          chalk.yellow("apktool error:", stderr)
        );
      }
    });
    console.log('\n');
    return path.resolve('apki-download.apk');
  },

  /**
   * Unzip APK
   * @param {path} pathToApk 
   * @returns {path} pathToUnzippedApk
   */
  unzipApk: async function (pathToApk) {
    console.log(
      chalk.cyan("Unpacking APK with APKTool...\n")
    );
    // Put a progress bar here
    execSync(`apktool d -f ${pathToApk}`, (err, stdout, stderr) => {
      if (err) {
        console.log(
          chalk.yellow("nodejs error running apktool:", err.message, err.stack)
        );
      }

      if (stderr) {
        console.log(
          chalk.yellow("apktool error:", stderr)
        );
      }
    });
    console.log('\n');
    return pathToApk.replace('.apk', '');
  },

  /**
   * Verify the path points to a valid file, ask for user input if not
   * @param {path} root 
   * @param {path} pathToApk 
   * @returns {path} pathToApk
   */
  verifyPathToApk: async function (pathToApk) {
    pathToApk = path.resolve(pathToApk);
    while (!fs.existsSync(pathToApk)) {
      console.log(
        chalk.red('Path to APK is invalid. Please verify correct path and try again.'),
        chalk.red('Current path: ', pathToApk)
      );
      let correctPath = await inquirer.prompt([correctLocalApk]);
      pathToApk = correctPath.pathToApk;
    }
    console.log('\n');
    return pathToApk;
  },

  /**
   * Verify the URL is valid, ask for user input if not
   * @param {string: URL} urlToApk 
   * @returns urlToApk
   */
  verifyUrlToApk: async function (urlToApk) {
    while (!isUrl(urlToApk)) {
      console.log(
        chalk.red('URL is invalid. Please correct the URL and try again.'),
        chalk.red('Current URL: ', urlToApk)
      );
      let correctUrl = await inquirer.prompt([correctRemoteApk]);
      urlToApk = correctUrl.urlToApk
    }
    console.log('\n');
    return urlToApk;
  }

};