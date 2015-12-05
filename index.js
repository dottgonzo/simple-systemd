var outputFileSync=require('output-file-sync'),
exec=require('promised-exec'),
pathExists=require('path-exists'),
Promise=require('promise');

module.exports=function(options){
if(!options.label){
throw Error('label is required')
} else if(!options.user){
  throw Error('user is required')
} else if(!options.path){
  throw Error('path of main js file is required')
}
  new Promise(funtion(resolve,reject){
    if(pathExists.sync('/etc/systemd/system/'+options.label+'.service')){
      reject('unit is present')
    } else{
      unit='[Service]\n';
      unit=unit+'ExecStart=/usr/bin/node '+options.path+'\n';
      unit=unit+'Restart=always\n';
      unit=unit+'StandardOutput=syslog\n';
      unit=unit+'StandardError=syslog\n';
      unit=unit+'SyslogIdentifier='+options.label+'\n';
      unit=unit+'User='+options.label+'\n';
      unit=unit+'Group='+options.user+'\n';
      unit=unit+'Environment=NODE_ENV=production\n';
      unit=unit+'[Install]\n';
      unit=unit+'WantedBy=multi-user.target\n';
      outputFileSync('/etc/systemd/system/'+options.label+'.service',unit,'utf-8')
      exec('systemctl enable '+options.label).then(function(){
        exec('systemctl start '+options.label).then(function(){
          resolve(true)
        }).catch(function(err){
          reject(err)
        })
      }).catch(function(err){
        reject(err)
      })
    }
  })
}
