var estatecrawler = require('./estatecrawler');
var fs = require('fs');
var exec = require('child_process').exec;
var moment = require('moment');

// estate webs definitions
var sources = require('./sources');

var globals = {
	skip: ['luhačovice']
};

fs.unlink('/tmp/new_estates', function (err) { });
fs.mkdir('data/', function (err) { });

sources.forEach(function(source) {
	var crawler = estatecrawler.crawler(source);

	crawler.on('end', function crawlerEnd (definition, data) {
		save(definition.name, data);
	});

	console.log("Starting crawling: " + source.name);
	crawler.crawl();
});

function save(name, data) {
	fs.readFile('data/' + name + '.json', function (err, content) {
		var all;
		var fresh = new Array();
		if (err) {
			all = new Array();
		} else {
			all = JSON.parse(content);
		}

		data.forEach(function(newEstate) {
			for(var i=0; i<all.length; i++) {
				if (all[i].id === newEstate.id) {
					// nic noveho
					return;
				}
			}

			fresh.push(newEstate);
		})

		reportFresh(name, fresh);
		all = all.concat(fresh);

		fs.writeFile('data/' + name + '.json', JSON.stringify(all), function (err) {
			if (err) throw err;
		});
	});
}

var date = moment().format('YYYY_MM_DD_HH_mm_ss');

function reportFresh(name, data) {	
	data.forEach(function (estate) {
		fs.appendFile('/tmp/new_estates', estate.link + '\n');
		fs.appendFile('data/' + date, estate.link + '\n');
	});
	
	console.log('New estates: ' + name);
	console.log(data);
}

process.on('exit', function (){
	exec('mail -s "New Estates" iv.sevcik@gmail.com < /tmp/new_estates', function (error, stdout, stderr) { });
	exec('mail -s "New Estates" isevcik@vodafonemail.cz < /tmp/new_estates', function (error, stdout, stderr) { });
});
