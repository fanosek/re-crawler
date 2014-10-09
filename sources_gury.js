var querystring = require('querystring');

module.exports = [
	{
		name: 'bezrealitky_vse',
		data_format: 'json',
		post_data: querystring.stringify({
			'location' : 'Zlín',
			'offertype_id' : 1,
			'estatetype_id' : 1,
			'lat' : 49.20472812045357,
			'lng' : 17.563210341210947,
			'accuracy' : 0.09952732334769117,
			'accuracy_lng' : 0.21258544921875
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
		name: 'sreality_pozemky',
		data_format: 'json',
		get_url: 'www.sreality.cz/api/cs/v1/estates?category_main_cb=3&category_sub_cb=19%7C21%7C22%7C23%7C48&category_type_cb=1&locality_district_id=38&locality_region_id=9&per_page=200',
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
		name: 'sreality_domy',
		data_format: 'json',
		get_url: 'www.sreality.cz/api/cs/v1/estates?category_main_cb=2&category_type_cb=1&locality_district_id=38&locality_region_id=9&per_page=200',
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
		name: 'bazos_pozemky',
		data_format: 'html',
		get_url: 'http://reality.bazos.cz/prodam/pozemek/15/?hledat=&rubriky=reality&hlokalita=76502&humkreis=12',
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
		name: 'bazos_domy',
		data_format: 'html',
		get_url: 'http://reality.bazos.cz/prodam/dum/30/?hledat=&hlokalita=76502&humkreis=12',
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
/*
	{
		name: 'wiki_prodej',
		data_format: 'html',
		get_url: 'http://www.wikireality.cz/hledat/vysledky/zlin?search_adverttype[0]=1&search_estatetype[0]=1&search_disposition[0]=5&search_disposition[1]=6&search_gpsNelat=49.2990687&search_gpsNelng=17.7911742&search_gpsSwlat=49.1630163&search_gpsSwlng=17.56183950000002',
		parser: function(crawler, array, $) {
			$("div.item").each(function(index,a) {
				a = $(a);
				//console.log(a.find('.nadpis a').attr('href'));
		        array.push({
		        	id: a.find('h3 a').attr('href').match(/detail\/([^-]+)-/)[1],
		        	name: a.find('h3 a').text(),
		        	link: 'http://www.wikireality.cz' + a.find('h3 a').attr('href')
		        });
		    });

		    $("a.next").each(function(index,a) {
		        crawler.queue(a.href);
		    });
		}
	}
*/
];
