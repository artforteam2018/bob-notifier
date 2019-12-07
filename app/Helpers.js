global.config = require('../config/main.json');
global.EventEmitter = require('events');
global.WebSocket = require('ws');
global.axios = require('axios');
global.zlib = require("zlib");
global.moment = require('moment');
global.getVal = function(lastVal, path){

  try{
    path.split('.').forEach(val=>{
      lastVal = lastVal[val];
    })
    return lastVal;
  }catch(e){
    return undefined;
  }

}
