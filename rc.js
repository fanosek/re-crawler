var estatecrawler = require('./estatecrawler');
var fs = require('fs');

// estate webs definitions
var sources = require('./sources');

var globals = {
	skip: ['luhačovice']
};

fs.mkdir('data/');

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

function reportFresh(name, data) {
	console.log('New estates: ' + name);
	console.log(data);
}