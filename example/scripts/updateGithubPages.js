/** Copy main.css and main.js from build into githubPages folder */

const fs = require('fs');
const rimraf = require('rimraf');

rimraf.sync('githubPages');
fs.mkdirSync('githubPages');

const copyFile = (path) => {
  fs.readdir(path, (err, files) => {
    files.forEach(file => {
      if (!file.endsWith('map')) {
        const fileExt = path.split('/')[2];
        //copy files to github pages folder:
        fs.createReadStream(`${path}/${file}`).pipe(fs.createWriteStream(`githubPages/main.${fileExt}`));
      }
    });
  });
};

copyFile('build/static/js');
copyFile('build/static/css');