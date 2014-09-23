var querystring = require('querystring');
var estatecrawler = require('./estatecrawler');
var fs = require('fs');
var exec = require('child_process').exec;

var sources = [
	{
		name: 'bezrealitky_najem',
		data_format: 'json',
		post_data: querystring.stringify({
			'location' : 'Zlín',
			'offertype_id' : 5,
			'estatetype_id' : 1,
			'lat' : 49.2310425,
			'lng' : 17.67650685000001,
			'accuracy' : 0.06802619999999848,
			'accuracy_lng' :0.11466734999999062
		  }),
		post_options: function() {
			return {
				host: 'www.bezrealitky.cz',
				port: '80',
				path: '/search/synchro-json/',
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': this.post_data.length
				}
			};		
		},
		parser: function(data) {
			data = JSON.parse(data);
			result = new Array();

			data.adverts.forEach(function(a) {
				result.push({
					id: a.id,
					name: a.header,
					link: 'www.bezrealitky.cz' + a.detail_url
				});
			});

			return result;
		}
	},
	{
		name: 'bezrealitky_prodej',
		data_format: 'json',
		post_data: querystring.stringify({
			'location' : 'Zlín',
			'offertype_id' : 1,
			'estatetype_id' : 1,
			'lat' : 49.2310425,
			'lng' : 17.67650685000001,
			'accuracy' : 0.06802619999999848,
			'accuracy_lng' :0.11466734999999062
		  }),
		post_options: function() {
			return {
				host: 'www.bezrealitky.cz',
				port: '80',
				path: '/search/synchro-json/',
				method: 'POST',
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded',
					'Content-Length': this.post_data.length
				}
			};		
		},
		parser: function(data) {
			data = JSON.parse(data);
			result = new Array();

			data.adverts.forEach(function(a) {
				result.push({
					id: a.id,
					name: a.header,
					link: 'www.bezrealitky.cz' + a.detail_url
				});
			});

			return result;
		}
	},
	{
		name: 'sreality_najem',
		data_format: 'json',
		get_url: 'www.sreality.cz/api/cs/v1/estates?category_main_cb=1&category_sub_cb=2%7C3%7C47&category_type_cb=2&locality_district_id=38&locality_region_id=9&per_page=200',
		parser: function(data) {
			data = JSON.parse(data);
			result = new Array();

			data._embedded.estates.forEach(function(a) {
				result.push({
					id: a.hash_id,
					name: a.name,
					link: 'http://www.sreality.cz/detail/a/a/a/a/' + a.hash_id
				});
			});

			return result;
		}
	},
	{
		name: 'sreality_prodej',
		data_format: 'json',
		get_url: 'www.sreality.cz/api/cs/v1/estates?category_main_cb=1&category_sub_cb=4%7C5&category_type_cb=1&locality_district_id=38&locality_region_id=9&per_page=200',
		parser: function(data) {
			data = JSON.parse(data);
			result = new Array();

			data._embedded.estates.forEach(function(a) {
				result.push({
					id: a.hash_id,
					name: a.name,
					link: 'http://www.sreality.cz/detail/a/a/a/a/' + a.hash_id
				});
			});

			return result;
		}
	},
	{
		name: 'bazos_najem_garsoniera',
		data_format: 'html',
		get_url: 'http://reality.bazos.cz/pronajmu/garsoniera/?hledat=&hlokalita=76001&humkreis=25',
		parser: function(crawler, array, $) {
			$("table.inzeraty").each(function(index,a) {
				a = $(a);
				//console.log(a.find('.nadpis a').attr('href'));
		        array.push({
		        	id: a.find('.nadpis a').attr('href').match(/inzerat\/(.*)\//)[1],
		        	name: a.find('.nadpis a').text(),
		        	link: 'http://reality.bazos.cz' + a.find('.nadpis a').attr('href')
		        });
		    });

		    $("a:contains(Další)").each(function(index,a) {
		        crawler.queue(a.href);
		    });
		}
	},
	{
		name: 'bazos_najem',
		data_format: 'html',
		get_url: 'http://reality.bazos.cz/pronajmu/byt-1-1/?hledat=&hlokalita=76001&humkreis=25',
		parser: function(crawler, array, $) {
			$("table.inzeraty").each(function(index,a) {
				a = $(a);
				//console.log(a.find('.nadpis a').attr('href'));
		        array.push({
		        	id: a.find('.nadpis a').attr('href').match(/inzerat\/(.*)\//)[1],
		        	name: a.find('.nadpis a').text(),
		        	link: 'http://reality.bazos.cz' + a.find('.nadpis a').attr('href')
		        });
		    });

		    $("a:contains(Další)").each(function(index,a) {
		        crawler.queue(a.href);
		    });
		}
	},
	{
		name: 'bazos_prodej',
		data_format: 'html',
		get_url: 'http://reality.bazos.cz/prodam/byt-2-1/?hledat=&hlokalita=76001&humkreis=25',
		parser: function(crawler, array, $) {
			$("table.inzeraty").each(function(index,a) {
				a = $(a);
				//console.log(a.find('.nadpis a').attr('href'));
		        array.push({
		        	id: a.find('.nadpis a').attr('href').match(/inzerat\/(.*)\//)[1],
		        	name: a.find('.nadpis a').text(),
		        	link: 'http://reality.bazos.cz' + a.find('.nadpis a').attr('href')
		        });
		    });

		    $("a:contains(Další)").each(function(index,a) {
		        crawler.queue(a.href);
		    });
		}
	}
];

fs.unlink('/tmp/new_estates');
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
	data.forEach(function (estate) {
		fs.appendFile('/tmp/new_estates', estate.link + '\n');
	});
	
	console.log('New estates: ' + name);
	console.log(data);
}

process.on('exit', function (){
	exec('mail -s “New Estates” iv.sevcik@gmail.com < /tmp/new_estates');
});
