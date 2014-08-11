/// <reference path="../../types/mocha.d.ts" />
/// <reference path="../../types/node.d.ts" />

var fs = require('fs'),
	path = require('path'),
	memwatch = require('memwatch');

memwatch.on('leak', function(info) {
	console.log(info);
});

var kb = 1024;

var fileSize = 200;

var sync = function(stream, maxKb) {
	var i = 0,
		max = kb*maxKb,
		count = 0;

	var ok;

	var write = function(i, max) {
		while(i < max) {
			if(!(i%kb)) {		
				count++;					
				console.log(count);
			}
			ok = stream.write("1");
			i++;
			if(!ok) {
				console.log(i, max);
				break;
			}
		}
		if(i < max) {
			stream.once('drain', function() {
				write(i, max);
			});
		} else {
			stream.end();	
		}		
	}
	write(i, max);
}

var async = function(stream, maxKb) {
	var i = 0,
		max = kb*maxKb,
		count = 0;

	var write = function(i, max) {
		if(i < max) {
			if(!(i%kb)) {		
				count++;					
				console.log(count);
			}
			var ok = stream.write("1");
			i++;				
			if(ok) {
				setImmediate(function() {
					write(i, max);
				});
			} else {
				stream.once('drain', function() {
					setImmediate(function() {
						write(i, max);
					});
				});
			}
		} else {
			stream.end();
		}
	}

	write(i,max);
}

var partialAsync = function(stream, maxKb) {
	var i = 0,
		max = kb*maxKb,
		count = 0;

	var write = function(i, max) {
		if(i < max) {
			if(!(i%kb)) {		
				count++;					
				console.log(count);
			}
			var ok = stream.write("1");
			i++;				
			if(ok) {
				if(!(i%100)) {
					setImmediate(function() {
						write(i, max);
					});
				} else {
					write(i, max);
				}
			} else {
				stream.once('drain', function() {
					write(i, max);
				});
			}
		} else {
			stream.end();
		}
	}
	write(i,max);
}

describe("fs.createWriteStream", function(){

    this.timeout(1000000);

     it("should not die setImmediate always", function(done) {
 		var outFilePath = path.join(__dirname,'..', 'out','file-async.txt'),
 			stream = fs.createWriteStream(outFilePath);

     	stream.on('finish', function() {
     		done();
     	});

     	stream.on('error', function(err) {
     		done(err);	
     	});     	     	

     	async(stream, fileSize);
     });     

     it("should not die setImmediate sometimes", function(done) {
 		var outFilePath = path.join(__dirname,'..', 'out','file-partial-async.txt'),
 			stream = fs.createWriteStream(outFilePath);

     	stream.on('finish', function() {
     		done();
     	});

     	stream.on('error', function(err) {
     		done(err);	
     	});     	     	

     	partialAsync(stream, fileSize);
     });     

     it("should not die in tight loop", function(done) {
     		var outFilePath = path.join(__dirname,'..', 'out','file-sync.txt'),
     			stream = fs.createWriteStream(outFilePath);

     	stream.on('finish', function() {
     		done();
     	})

     	stream.on('error', function(err) {
     		done(err);
     	});

     	sync(stream, fileSize);

     });           
});