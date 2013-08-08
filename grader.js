#!/usr/bin/env node

var fs = require('fs');
var program = require('commander');
var cheerio = require('cheerio');
var sys = require('util');
var rest = require('restler');

var assertFileExists = function(infile) {
    var instr = infile.toString();
    if(!fs.existsSync(instr)) {
        console.log("%s does not exist. Exiting.", instr);
        process.exit(1);//http://nodejs.org/api/process.html#process_process_exit_code
    }
    return instr;
};

var cheerioHtmlFile = function(htmlfile) {
    return cheerio.load(fs.readFileSync(htmlfile));
};

var loadChecks = function(checksfile) {
    return JSON.parse(fs.readFileSync(checksfile));
};

var checkHtmlFile = function(htmlfile, checksfile) {
    $ = cheerioHtmlFile(htmlfile);
    var checks = loadChecks(checksfile).sort();
    var out = {};
    for(var ii in checks) {
        var present = $(checks[ii]).length > 0;
        out[checks[ii]] = present;
    }
    return out;
};

var checkURL = function (URL, checksfile) {
    rest.get(URL).on('complete',function(result){
	if (result instanceof Error) {
	    sys.puts('Error' + result.message);
	    this.retry(5000);
	} else {
	    $=cheerio.load(result);
	    var checks=loadChecks(checksfile).sort();
	    var out = {};
	    for (var ii in checks) {
		var present = $(checks[ii]).length >0;
		out[checks[ii]]=present;
	    }
	    var outJson = JSON.stringify(out,null,4);
	    console.log(outJson);
	}
    });
};

var clone = function(fn) {
    // Workaround for commander.js issue.
    // http://stackoverflow.com/a/6772648
    return fn.bind({});
};

if(require.main == module) {
    program
        .option('-c, --checks <check_file>', 'Path to checks.json', clone(assertFileExists))
        .option('-f, --file <html_file>', 'Path to index.html', clone(assertFileExists))
        .option('-u, --url <url>','URL to index.html')   
	.parse(process.argv);
    if (program.url != null) {
	checkURL (program.url, program.checks);
    } else {
	var checkJson = checkHtmlFile(program.file, program.checks);
	var outJson = JSON.stringify(checkJson, null, 4);
	console.log(outJson);
   }	
}
else {
    exports.checkHtmlFile = checkHtmlFile;
}
