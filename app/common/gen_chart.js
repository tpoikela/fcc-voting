
/** Script to generate the charts for poll results. */


function genPollChart(options, votes) {
    var maxWidth = 400;
    var maxHeight = 600;

    var chartDiv = document.querySelector('#poll-chart') || null;
    if (chartDiv === null) return;

    var maxVotes = Math.max(votes);
    if (isNaN(maxVotes)) return;

    var xScale = d3.scale.linear()
        .domain([0, maxVotes])
        .range([0, maxWidth]);

    var yScale = d3.scale.linear()
        .domain([0, options.length])
        .range([0, maxHeight]);

    var svg = d3.select("#poll-chart")
        .append('svg')
        .attr({'width': maxWidth, 'height': maxHeight});


    var xAxis = d3.svg.axis();
    xAxis.orient("Bottom").scale(xScale);

    var yAxis = d3.svg.axis();
    yAxis.orient("Left").scale(yScale);

    var gXaxis = svg.append("g")
		.attr("transform", "translate(150,480)")
		.attr('id','xaxis')
		.call(xAxis);

    var gYaxis = svg.append("g")
		.attr("transform", "translate(150,0)")
		.attr('id','yaxis')
		.call(yAxis);

	var chart = svg.append("g")
		.attr("transform", "translate(150,0)")
		.selectAll("rect")
		.data(votes).enter()
		.append("rect")
		.attr({'x':0,'y':function(d,i){ return yscale(i)+19; }})
		.style('fill',function(d,i){ return colorScale(i); })
		.attr('width',function(d){ return 0; });


};
