(function() {
	"use strict";
	var chart, data = ['magic',50,50,50,50,50,50];
	getNames();
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

	function updateList(items) {
		var tags = document.getElementById('tags');
		if (tags) {
			var list = document.createElement('ul');
			var data = "";
			items.forEach(function(v){
				data += "<li>"+v+"</li>";
			});      
			list.innerHTML = data;
			tags.appendChild( list );
		}
	}
	function getNames() {
		httpGet(
			"/api/list/test-data", 
			function (data) {
				updateList(JSON.parse(data));
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
		if (r.readyState != 4 || r.status != 200) {
			return error(r, r.status);
		}
		done(r.responseText, r.status);
	};
	r.send();
}
}());