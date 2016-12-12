
/** Script to generate the charts for poll results. */

function genPollChart(elemID, choices, votes, opts) {
    opts = opts || {};

    var $DEBUG = opts.$DEBUG || 0;

    var maxWidth = 400;
    var maxHeight = opts.height || 560;
	var margin = opts.margin || {top: 10, left: 10, right: 10, bottom: 20};

    var chartDiv = d3.select(elemID) || null;

    if (chartDiv === null) {
		console.error("Poll chart must be id'ed with an ID which exists.");
		return;
	}

    var maxVotes = Math.max.apply(null, votes);

    if (isNaN(maxVotes)) {
		console.error("Max votes is: " + maxVotes
			+ " Expected number. Abortin...");
		return;
	}

    var svg = d3.select("svg");
    if (svg.empty()) {
        console.log("svg selection is empty. Creating a new elment.");
        chartDiv.append("svg");
        svg = d3.select("svg");
        svg.attr("style", "height: " + maxHeight + "px");
    }

    var svgWidth = svg.style("width").replace("px", "");
    var svgHeight = svg.style("height").replace("px", "");

	maxWidth = svgWidth - margin.left - margin.right;
    maxHeight = svgHeight - margin.top - margin.bottom;

    console.log("SVG W: " + svgWidth + " H: " + svgHeight);
    console.log("Plot: W " + maxWidth + " H: " + maxHeight);

    var i = 0;
    var data = [];
    for (i = 0; i < choices.length; i++) {
        var dataObj = {v: parseInt(votes[i]), o: choices[i]};
        data.push(dataObj);
    }

    var xScale = d3.scaleLinear()
        .domain([0, maxVotes])
        .range([0, maxWidth]);

    // Creates scales for mapping data (domain) to pixels (range)
    var yScale = d3.scaleBand().rangeRound([0, maxHeight]).padding(0.2);
    yScale.domain(choices.map(function(d,i) {
        return i;
    }));

    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var outerPadding = yScale.paddingOuter() * yScale.step();
    var xAxisY = yScale(choices.length - 1) + yScale.bandwidth() + outerPadding;
    console.log("xAxisY max is " + xAxisY + " outer: " + outerPadding);
    //var xAxisY = yScale.range()[1];

    // Create X-axis
    g.append("g")
        .attr("class", "axis x--axis")
        .attr("transform", "translate(0, " + xAxisY + ")")
        .call(
            d3.axisBottom(xScale)
                //.tickValues(d3.range(0, maxVotes))
        );

    // Create Y-axis
    g.append("g")
        .attr("class", "axis y-axis")
        .text("choices")
        .call(d3.axisLeft(yScale)
    );

    // Create the bars for each voting option
	g.selectAll(".voteBar")
		.data(data).enter()
		.append("rect")
            //.attr("height", function(d) {return bandHeigh;t})
            .attr("height", function(d) {return yScale.bandwidth();})
            //.attr("width", xScale.bandwidth())
            .attr("width", function(d) {return xScale(d.v);})
            //.attr("x", function(d, i) {return xScale(d.year)})
            .attr("x", function(d, i) {return 0;})
            .attr("y", function(d, i) {
                console.log("yScale i " + i + " val " + yScale(i));
                //return yScale(i);
                return yScale(i);
            });

    // Create labels with number of votes in them
	g.selectAll(".voteBar")
		.data(data).enter()
        .append("text")
            .text(function(d) {return d.o + ": " + d.v;})
            .attr("class", "vote-label")
            .attr("style", "font-size: 20px")
            .attr("x", 20)
            .attr("y", function(d, i) {
                return yScale(i) + yScale.bandwidth() * 0.25;
            });


/*
			.attr({'x':0,'y':function(d,i){ return yscale(i)+19; }})
			.style('fill',function(d,i){ return colorScale(i); })
			.attr('width',function(d){ return 0; });
*/


};
