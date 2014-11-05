var estatecrawler = require('./estatecrawler');
var fs = require('fs');

// estate webs definitions
var sources = requireSource(process.argv);

var finishedCount = 0;

var globals = {
	skip: ['luhačovice']
};

fs.mkdir('data/', function (err) { });



sources.forEach(function(source) {
	var crawler = estatecrawler.crawler(source);

	crawler.on('end', function crawlerEnd (definition, data) {
		// fully synchronous call
		save(definition.name, data);

		// if all sources have been processed -> exit program
		finishedCount++;
		if(sources && sources.length <= finishedCount) {
			console.log('Terminating ...');
			process.exit(0);
		}
	});

	//console.log("Starting crawling: " + source.name);
	crawler.crawl();
});

function requireSource(argv) {
	var args = argv.slice(2);

	if(args && args.length > 0) {
		args[0] = !args[0].match(/\.\//) ? './' + args[0] : args[0];
	}
	else {
		args[0] = './sources';
	}

	return require(args[0]);

};

function save(name, data) {
	var filename = 'data/' + name + '.json';

	// read file
	var all;
	var content;
	var fresh = new Array();
	try {
		content = fs.readFileSync(filename);
		all = JSON.parse(content);
	}
	catch(e) {
		all = new Array();
	};

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

	// write file
	try {
		fs.writeFileSync(filename, JSON.stringify(all));
	}
	catch(e) {
		console.log('Could not write a file: ' +  filename);
	}
}

function reportFresh(name, data) {
	//console.log('New estates: ' + name);
	//console.log(data);
}
