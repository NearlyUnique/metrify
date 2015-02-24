(function() {
    "use strict";
    var chart,
        data = [],
        baseUrl = 'http://localhost:1081';
    getNames("home_web_counts");
    initChart();

    function updateList(col, items) {
        var tags = document.getElementById('tags'), el, list;
        if (tags) {
            list = document.createElement('ul');
            items.forEach(function(v) {
                el = createClickableItem(v, v, wireUp);
                el.setAttribute('data-collection', col);
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
        var metricUrl = baseUrl + '/1.0/metric?',
        exp = 'expression=sum(' + col + '.eq(name,"' + metric_name + '"))',
        dates = '&start=' + dtm({day:-1}) + '&stop=' + dtm(),
        step = '&step=3600000';
        return metricUrl + exp + dates + step;
    }
    function wireUp() {
        var collection = this.getAttribute('data-collection'),
            itemName = this.id;
        httpGet(
            buildUrl(this.id, collection),
                function(response) {
                    var i, temp;
                    if (response) {
                        response = JSON.parse(response);
                        updateTimeAxis(response);
                        temp = findColumn(itemName);
                        for (i=0; i < response.length; i++) {
                            temp[i + 1] = response[i].value;
                        }
                        chart.load({columns: data});
                    }
                }
            );
    }
    function responseToChart(chartData) {
        return function(value, index) {
            chartData[index + 1] = value;
        }
    }
    function updateTimeAxis(response) {
        var i, tmp, update = false, x = findColumn('x');
        for(i = 0; i < response.length; i++) {
            tmp = response[i].time.substr(0,19);
            if (tmp != x[i + 1]) {
                x[i + 1] = tmp;
                update = true;
            }
        }
        if (update) {
            chart.load({columns: [x]});
        }
    }
    function findColumn(col) {
        var i;
        for(i = 0; i < data.length; i++) {
            if (data[i][0] === col) {
                return data[i];
            }
        }
        var newItem = [col];
        data.push(newItem);
        return newItem;
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
        var i, time = findColumn('x');
        for(i=0; i>-24; i -= 1) {
            time.push(dtm({hour:i}));
        }

        chart = c3.generate({
            bindto: '#chart',
            data: {
                columns: data,
                x : 'x',
                xFormat : '%Y-%m-%dT%H:%M:%S',
            },
            axis : {
                x : {
                    type : 'timeseries',
                    tick : {
                        format : "%a-%H:%M" // https://github.com/mbostock/d3/wiki/Time-Formatting#wiki-format
                    }
                }
            }
        });
      //       size: { height: 640 },
      //       data: {
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
      //     }
      // });
    }
    function httpGet(url, done, error) {
        error = error || function() {};
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