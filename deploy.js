require('dotenv').config();
var FtpDeploy = require('ftp-deploy');
var ProgressBar = require('progress');

var ftpDeploy = new FtpDeploy();

var config = {
  username: process.env.FTP_USERNAME,
  password: process.env.FTP_PASSWORD,
  host: process.env.FTP_SERVER,
  port: 21,
  localRoot: __dirname + "/dest",
  remoteRoot: "/public_html/",
}

var bar;

var makeBar = function(data){
  bar = new ProgressBar('Uploading [:bar] :percent (:filename)', {
    total: data.totalFileCount
  });
}

ftpDeploy.on('uploading', function(data) {
  if(!bar){
    makeBar(data);
  }

  bar.tick({
    filename: data.filename,
    percent: data.percentComplete
  })
  
  data.totalFileCount;       // total file count being transferred
  data.transferredFileCount; // number of files transferred
  data.percentComplete;      // percent as a number 1 - 100
  data.filename;             // partial path with filename being uploaded
});

ftpDeploy.deploy(config, function(err) {
	if (err) console.log(err)
	else console.log('Done.');
});
