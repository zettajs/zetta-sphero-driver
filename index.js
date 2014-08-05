var util = require('util');
var Scout = require('zetta').Scout;
var simpleSphero = require('simple-sphero');
var serialport = require('serialport');
var Sphero = require('./sphero');

var SpheroScout = module.exports = function() {
  Scout.call(this);
  this._foundPorts = [];
};
util.inherits(SpheroScout, Scout);

SpheroScout.prototype.init = function(cb){
  this.searchPorts();
  cb();
};

SpheroScout.prototype.searchPorts = function() {
  var self = this;
  serialport.list(function(err, ports) {
    ports.forEach(function(port) {
      if(port.comName.search('Sphero') !== -1) {
        self.initDevice(port);
      }
    });
  });
};

SpheroScout.prototype.initDevice = function(port) {
  var self = this;
  var hubQuery = self.server.where({ type: 'sphero' });
  var sphero = simpleSphero(port.comName);
  sphero._sphero = require('simple-sphero').sphero;
  sphero.on('ready', function() {
    sphero._sphero.resetTimeout(true); // helps keep bluetooth from disconnecting

    self.server.find(hubQuery, function(err, results){
      if (results.length > 0) {
        self.provision(results[0], Sphero, sphero);
      } else {
        self.discover(Sphero, sphero);
      }
    });
  }); 
};

