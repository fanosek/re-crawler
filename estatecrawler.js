var util         = require("util");
var EventEmitter = require("events").EventEmitter;
var http = require('http');
var querystring = require('querystring');
var Crawler = require("crawler").Crawler;

function EstateCrawler(definition) {
	this.definition = definition
	EventEmitter.call(this);	
}

util.inherits(EstateCrawler, EventEmitter);

EstateCrawler.prototype.crawl = function() {
	if (this.definition.data_format === 'json') {
		this.crawl_json();
	} else {
		this.crawl_html();
	}
}

EstateCrawler.prototype.crawl_html = function() {
	var self = this;
	var array = new Array();
	var crawler = new Crawler({
		"maxConnections": 10,
		"callback": function(error,result,$) {
			if (error) {
				console.print('error getting content from: ' + self.definition.name);
			} else {
				self.definition.parser(crawler, array, $);
			}
		},
		"onDrain": function() {
			self.emit('end', self.definition, array);
		}
	});

	crawler.queue(this.definition.get_url);
}

EstateCrawler.prototype.crawl_json = function() {
	var data = '';
	var self = this;

	var options;
	if (this.definition.hasOwnProperty('post_options')) {
		options = this.definition.post_options();
	} else {
		options = {
			host: this.definition.get_url.match(/([^\/]+)\//)[1],
			path: this.definition.get_url.match(/[^\/]+(\/.*)/)[1]
		}
	}

	var post_req = http.request(options, function(res) {
		res.setEncoding('utf8');
		res.on('data', function (chunk) {
			data += chunk;
		});
		res.on('end', function () {
			var result = self.definition.parser(data);
			self.emit('end', self.definition, result);
		});
	});

	if (this.definition.hasOwnProperty('post_data')) {
		post_req.write(this.definition.post_data);
	}

	post_req.end();
}

exports.crawler = function(definition) {
	return new EstateCrawler(definition);
};