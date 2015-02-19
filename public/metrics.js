(function() {
	"use strict";
	var chart, data = ['magic',50,50,50,50,50,50];
	getNames("home_web_counts");
	initChart();
	var btn = document.getElementById('add');
	btn.addEventListener("click", addLine, false);

	function addLine() {
		var i;
		for(i=1;i<data.length;i++) {
			data[i] = data[i] + rnd(-10,20);
		}
		chart.load({columns: [data]});
		function rnd(min, max) {
			return Math.random() * (max - min) + min;
		}
	}
	function updateList(col, items) {
		var tags = document.getElementById('tags'), el, list;
		if (tags) {
			list = document.createElement('ul');
			items.forEach(function(v) {
				// add custom attribute
				el = createClickableItem(v, v, wireUp);
				el.setAttribute('data-col', col);
				list.appendChild(el);
			});      
			tags.appendChild(list);
		}
	}
    function dtm(diff) {
        var d = new Date(), p = function(num) { return (num < 10) ? ("0" + num) : (num.toString());};
        diff = diff || {};
        d.setUTCFullYear(d.getUTCFullYear() + (diff.year||0));
        d.setUTCMonth(d.getUTCMonth() + (diff.month||0));
        d.setUTCDate(d.getUTCDate() + (diff.day||0));
        d.setUTCHours(d.getUTCHours() + (diff.hour||0));
        d.setUTCMinutes(d.getUTCMinutes() + (diff.min||0));
        return d.getUTCFullYear() + "-" +
	        p(d.getUTCMonth()+1) + "-" +
	        p(d.getUTCDate()) + "T" +
	        p(d.getUTCHours()) + ":" +
	        "00:00";
    }
    function buildUrl(metric_name, col) {
        var baseUrl = 'http://horizon.comparethemarket.com/cube/1.0/metric?',
        exp = 'expression=sum(' + col + '.eq(name,"' + metric_name + '"))',
        dates = '&start=' + dtm({day:-1}) + '&stop=' + dtm(),
        step = '&step=3600000';
        return baseUrl + exp + dates + step;
    }
	function wireUp() {
		var col = this.getAttribute('data-col');
		httpGet(
			buildUrl(this.id, col),
				function(data) {
					console.log(data);
				}
			);
	}
	function createClickableItem(id, text, callback) {
		var li = document.createElement('li');
		li.id = id;
		li.innerHTML = text;
		li.onclick = callback; 
		return li;
	}
	function getNames(col) {
		httpGet(
			"/api/list/" + col + "_events", 
			function (data) {
				updateList(col, JSON.parse(data));
			},
			function (d,s) {
				console.log("Oh dear",d,s);
			}
		);
	}
	function initChart() {
		chart = c3.generate({
			bindto: '#chart',
			data: {
				columns: [
				['data1', 30, 200, 100, 400, 150, 250],
				['data2', 50, 20, 10, 40, 15, 25]
				]
			}
		});
      //       bindto: '#chart',
      //       size: { height: 640 },
      //       data: {
      //         x : 'x',
      //         xFormat : '%Y-%m-%dT%H:%M:%S',
      //         columns: columns,
      //         type: 'bar',
      //         types: {data_1:'step',data_3:'step'},
      //         groups: [
      //               [
      //               "data_1", "data_2",
      //               "data_3", "data_14"
      //               ]
      //           ]
      //       },
      //         axis : {
      //             x : {
      //               type : 'timeseries',
      //               tick : {
      //                 format : "%a-%H:%M" // https://github.com/mbostock/d3/wiki/Time-Formatting#wiki-format
      //             }
      //         }
      //     }
      // });
	}
	function httpGet(url, done, error) {
		error = error || function(){};
		var r = new XMLHttpRequest();
		r.open("GET", url, true);
		r.onreadystatechange = function () {
			if (r.readyState === 4) {
				if (r.status >= 200 && r.status <=299) {
					done(r.responseText, r.status);
				} else {				
					error(r, r.status);
				}
			}
		};
		r.send();
	}
}());