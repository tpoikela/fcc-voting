
/** Script to generate the charts for poll results. */

/**
 * elemID specified the container element for svg.
 * choices contains the names of choices to vote for.
 * votes is a list of number of votes
 * opts is a configuration object
 */
function genPollChart(elemID, choices, votes, opts) {
    opts = opts || {};

    var $DEBUG = opts.$DEBUG || 1;

    var maxWidth = 400;
    var maxHeight = opts.height || 560;
	var margin = opts.margin || {top: 10, left: 10, right: 10, bottom: 20};

    var chartDiv = d3.select(elemID) || null;
    var w = chartDiv.style("width").replace("px", "");
    console.log("chartDiv w is " + w);

    if (chartDiv === null) {
		console.error("Poll chart must be id'ed with an ID which exists.");
		return;
	}

    var maxVotes = Math.max.apply(null, votes);

    if (isNaN(maxVotes)) {
		console.error("Max votes is: " + maxVotes
			+ " Expected number. Aborting...");
		return;
	}

    // Unless there's an existing SVG, we need to create one
    var svg = d3.select("svg");
    if (svg.empty()) {
        if ($DEBUG) console.log("svg selection is empty. Creating a new elment.");
        chartDiv.append("svg");
        svg = d3.select("svg");
        svg.attr("style", "height: " + maxHeight + "px");
    }

    var svgWidth = w * 0.8;
    var svgHeight = svg.style("height").replace("px", "");

	maxWidth = svgWidth - margin.left - margin.right;
    maxHeight = svgHeight - margin.top - margin.bottom;

    if ($DEBUG) console.log("SVG W: " + svgWidth + " H: " + svgHeight);
    if ($DEBUG) console.log("Plot: W " + maxWidth + " H: " + maxHeight);

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

    // Y-domain is simply the index in the array of votes/choices
    yScale.domain(choices.map(function(d,i) {
        return i;
    }));

    // Create inner g-element which applies the margins
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var outerPadding = yScale.paddingOuter() * yScale.step();
    var xAxisY = yScale(choices.length - 1) + yScale.bandwidth() + outerPadding;
    if ($DEBUG) console.log("xAxisY max is " + xAxisY + " outer: " + outerPadding);

    // Create X-axis
    g.append("g")
        .attr("class", "axis x--axis")
        .attr("transform", "translate(0, " + xAxisY + ")")
        .call(
            d3.axisBottom(xScale)
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
            .attr("height", function(d) {return yScale.bandwidth();})
            .attr("width", function(d) {return xScale(d.v);})
            .attr("x", function(d, i) {return 0;})
            .attr("y", function(d, i) {
                if ($DEBUG) console.log("yScale i " + i + " val " + yScale(i));
                return yScale(i);
            });

    var labelFontSize = Math.round(yScale.bandwidth() / 3);

    // Create labels with a number of votes in them. Each label has name and
    // number of votes for that label

    var styleFontSize = "font-size:" + labelFontSize + "px;";
	chartDiv.selectAll(".vote-option-label")
		.data(data).enter()
        .append("label")
            .text(function(d) {return d.o + ": " + d.v;})
            .attr("class", "vote-option-label")
            .attr("style", function(d, i) {
                var pixTop = yScale(i) + yScale.bandwidth() * 0.30;
                var style = "top: " + pixTop + "px;";
                var pixLeft = margin.left + 5 + 15;
                style += "left: " + pixLeft + "px;";
                style += styleFontSize;
                style += "max-height: " + 2*labelFontSize + "px;";
                return style;
            });

};
