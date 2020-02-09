queue()
    .defer(d3.csv, "data/Hendrix.csv")
    .await(createCharts);



function createCharts(error, hendrixData) {
    var ndx = crossfilter(hendrixData);
   var parseDate = d3.time.format("%d/%m/%Y").parse;
    hendrixData.forEach(function(d) {
        d.date = parseDate(d.date);
    });

 
    show_cpes_per_person(ndx);
    show_cpes_per_region(ndx);
    show_cpe_type_by_volume(ndx);
    show_per_month_volumes(ndx);
    show_per_month_volumes_composite(ndx);
    show_cpes_per_region_stacked(ndx);
/*    per_month_volumes_scatter(ndx); */

    dc.renderAll();
}


function show_cpes_per_person(ndx) {
    var dim = ndx.dimension(dc.pluck('Person'));
    var group = dim.group().reduceSum(dc.pluck('CPEs'));

    dc.barChart("#cpes_per_person_chart")
        .width(600)
        .height(400)
        .dimension(dim)
        .group(group)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("People")
        .yAxis().ticks(6);

}

function show_cpes_per_region(ndx) {
    var dim = ndx.dimension(dc.pluck('CPE Status'));
    var group = dim.group();

    dc.barChart("#show_cpes_per_region")
        .width(600)
        .height(400)
        .dimension(dim)
        .group(group)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Region")
        .yAxis().ticks(6);

}

function show_cpe_type_by_volume(ndx) {
    var dim = ndx.dimension(dc.pluck('CPEType'));
    var group = dim.group();

    dc.pieChart("#show_cpe_type_by_volume")
        .height(330)
        .radius(100)
        .dimension(dim)
        .group(group)
        .transitionDuration(500);
}

// line chart

function show_per_month_volumes(ndx) {
    var dim = ndx.dimension(dc.pluck('date'));
    var group = dim.group().reduceSum(dc.pluck("CPEs"));


    var minDate = dim.bottom(1)[0].date;
    var maxDate = dim.top(1)[0].date;
    dc.lineChart("#per_month_volumes")
        .width(1000)
        .height(300)
        .margins({ top: 10, right: 50, bottom: 30, left: 50 })
        .dimension(dim)
        .group(group)
        .transitionDuration(500)
        .x(d3.time.scale().domain([minDate, maxDate]))
        .xAxisLabel("Date")
        .yAxis().ticks(4);
}

// composite chart

function show_per_month_volumes_composite(ndx) {
    var dim = ndx.dimension(dc.pluck('date'));
    var group = dim.group().reduceSum(dc.pluck("CPEs"));



    var minDate = dim.bottom(1)[0].date;
    var maxDate = dim.top(1)[0].date;
    
     function volume_by_person(Person) {
            return function(d) {
                if (d['Person'] === Person) {
                    return +d['CPEs'];
                } else {
                    return 0;
                }
            }
        }
        
        var FoxPerMonth = dim.group().reduceSum(volume_by_person('P.Fox'));
        var MoranPerMonth = dim.group().reduceSum(volume_by_person('G.Moran'));
        var CartyPerMonth = dim.group().reduceSum(volume_by_person('D.Carty'));
        
        var compositeChart = dc.compositeChart('#per_month_volumes_composite');




 compositeChart
            .width(990)
            .height(200)
            .dimension(dim)
            .x(d3.time.scale().domain([minDate, maxDate]))
            .yAxisLabel("CPEs")
            .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
            .renderHorizontalGridLines(true)
            .compose([
                dc.lineChart(compositeChart)
                    .colors('green')
                    .group(FoxPerMonth, 'Paddy'),
                dc.lineChart(compositeChart)
                    .colors('red')
                    .group(MoranPerMonth, 'Gina'),
                dc.lineChart(compositeChart)
                    .colors('blue')
                    .group(CartyPerMonth, 'Diarmuid')
            ])
            .brushOn(false)
            .render();
}


// CPEs Per Region - stacked by CPE Type

function show_cpes_per_region_stacked(ndx) {
    var dim = ndx.dimension(dc.pluck('CPE Status'));
    var group = dim.group();

        var cpeTypeA = dim.group().reduceSum(function (d) {
            if (d.CPEType === 'ADVA GE201') {
                return +d.CPEs;
            } else {
                return 0;
            }
        });
        var cpeTypeB = dim.group().reduceSum(function (d) {
            if (d.CPEType === 'ADVA 825') {
                return +d.CPEs;
            } else {
                return 0;
            }
        });
        var cpeTypeC = dim.group().reduceSum(function (d) {
            if (d.CPEType === 'ADVA 201') {
                return +d.CPEs;
            } else {
                return 0;
            }
        });  
        var cpeTypeD = dim.group().reduceSum(function (d) {
            if (d.CPEType === 'ADVA XG210') {
                return +d.CPEs;
            } else {
                return 0;
            }
        }); 

        var stackedChart = dc.barChart("#per_month_volumes_stacked");
        stackedChart
            .width(500)
            .height(500)
            .dimension(dim)
            .group(cpeTypeA, "ADVA GE201")
            .stack(cpeTypeB, "ADVA 825")
            .x(d3.scale.ordinal())
            .xUnits(dc.units.ordinal)
            .legend(dc.legend().x(420).y(0).itemHeight(15).gap(5));
        stackedChart.margins().right = 100;

}

            d3.text("Hendrix.csv", function(data) {
                var parsedCSV = d3.csv.parseRows(data);

                var container = d3.select("body")
                    .append("table")

                    .selectAll("tr")
                        .data(parsedCSV).enter()
                        .append("tr")

                    .selectAll("td")
                        .data(function(d) { return d; }).enter()
                        .append("td")
                        .text(function(d) { return d; });
            });
            