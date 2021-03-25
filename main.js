// Add your JavaScript code here
const MAX_WIDTH = Math.max(1080, window.innerWidth);
const MAX_HEIGHT = 720;
const margin = {top: 40, right: 85, bottom: 40, left: 85};

// Assumes the same graph width, height dimensions as the example dashboard. Feel free to change these if you'd like
let graph_1_width = (MAX_WIDTH * 0.85), graph_1_height = 450;
let graph_2_width = (MAX_WIDTH * 0.85), graph_2_height = 450;
let graph_3_width = (MAX_WIDTH * 0.85), graph_3_height = 450;

let svg = d3.select("#graph1")
    .append("svg")
    .attr("height", graph_1_height + margin.bottom)
    .attr("width", graph_1_width)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .append("g");

let tooltip = d3.select("#graph1")     // HINT: div id for div containing scatterplot
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

// Set up reference to count SVG group
let countRef = svg.append("g");

// Load the artists CSV file into D3 by using the d3.csv() method
d3.csv("data/football.csv").then(function(data) {
    //  Clean and strip desired amount of data for barplot
    let nestedData = d3.nest()
            .key(function(d) { return parseInt(d.date.substring(0,4)) })
            .rollup(function(d) { return d.length; })
            .entries(data);

    let yMax = d3.max(d3.values(nestedData), function(d) {return d.value})

    let y = d3.scaleLinear()
        .domain([yMax, 0])
        .range([margin.top, graph_1_height]);

    let x = d3.scaleBand()
        .domain(nestedData.map(function(d) {return d.key}))
        .range([margin.left, graph_1_width - margin.right])
        .padding(0.1);

    let bars = svg.selectAll("rect").data(nestedData);

    let color = d3.scaleOrdinal()
        .domain(nestedData.map(function(d) { return d["value"] }))
        .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 150));

    let mouseover = function(d) {
        let color_span = `<span style="color: ${color(d.value)};">`;
        let html = `Year: ${d.key}<br/>
                ${color_span} # of Games: ${d.value}</span><br/>`;

        // Show the tooltip and set the position relative to the event X and Y location
        tooltip.html(html)
            .style("left", `${(d3.event.pageX) - 100}px`)
            .style("top", `${(d3.event.pageY) - 100}px`)
            .style("box-shadow", `3px 3px 7px #ADD8E6`)
            .style("background-color", `#F5F5F5`)
            .style("border-radius", `8px`)
            .style("padding", `10px`)
            .transition()
            .duration(200)
            .style("opacity", 0.9)
    };

    let mouseout = function(d) {
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    };

    bars.enter()
        .append("rect")
        .merge(bars)
        .attr("fill", function(d) { return color(d['value']) }) // Here, we are using functin(d) { ... } to return fill colors based on the data point d
        .attr("y", function(d) { return y(d['value']); })
        .attr("x", function(d) { return x(d['key']); })               // HINT: Use function(d) { return ...; } to apply styles based on the data point (d)
        .attr("height", function(d) {return y(yMax - d['value']) - margin.top; })
        .attr("width", x.bandwidth())
        .on("mouseover", mouseover) // HINT: Pass in the mouseover and mouseout functions here
        .on("mouseout", mouseout);

    svg.append("g")
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
        .attr("transform", `translate(0, ${graph_1_height})`) ;

    let filt = d3.selectAll(".tick text");
    filt.each(function(tick,index){
            if(index%10 !== 8) d3.select(this).remove();
        });

    svg.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
        .attr("transform", `translate(${(margin.left)}, 0)`) ;

    // Add x-axis label
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width) / 2},
                                        ${(graph_1_height) + 35})`)       // HINT: Place this at the bottom middle edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .text("Year");

    // Add y-axis label
    svg.append("text")
        .attr("transform", `translate(50, ${(graph_1_height) / 2}) rotate(-90) `)       // HINT: Place this at the center left edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .text("# of Matches");

    //  Add chart title
    svg.append("text")
        .attr("transform", `translate(${(graph_1_width) / 2}, 15)`)       // HINT: Place this at the top middle edge of the graph - use translate(x, y) that we discussed earlier
        .style("text-anchor", "middle")
        .style("font-size", 18)
        .text("# of International Football Matches Played Each Year");

});


// ------------------------------- Graph 2 ---------------------------------- \\


let svg2 = d3.select("#graph2")
    .append("svg")
    .attr("height", graph_1_height + margin.bottom + 25)
    .attr("width", graph_1_width)
    .attr("transform", `translate(${margin.left}, 5)`)
    .append("g");

let title = d3.select("#title")
    .append("svg")
    .attr("height", 60)
    .attr("width", graph_1_width)
    .attr("transform", `translate(${margin.left}, 30)`)
    .append("g");

// Load the artists CSV file into D3 by using the d3.csv() method
function setData(index) {
    svg2.selectAll("*").remove();
    title.selectAll("*").remove();
    let countRef2 = svg2.append("g");

    d3.csv("data/football.csv").then(function(data) {
        var teamRecords = {}
        for (var ii = 0; ii < data.length; ii++) {
            if (data[ii]['tournament'] != "Friendly" && (index == 0 || 1999 < parseInt(data[ii]['date'].substring(0,4)))){
                var home_team = data[ii]['home_team']
                var away_team = data[ii]['away_team']
                home_score = data[ii]['home_score']
                away_score = data[ii]['away_score']
                if (data[ii]['home_score'] > data[ii]['away_score']){
                    var home_score = 1;
                    var away_score = 0;
                } else if (data[ii]['home_score'] < data[ii]['away_score']){
                    var home_score = 0;
                    var away_score = 1;
                } else {
                    var home_score = 0.5;
                    var away_score = 0.5;
                }
                if (home_team in teamRecords){
                    teamRecords[home_team].push(home_score);
                } else{
                    teamRecords[home_team] = [home_score];
                }
                if (away_team in teamRecords){
                    teamRecords[away_team].push(away_score);
                } else{
                    teamRecords[away_team] = [away_score];
                }
            }
        }

        for (var team in teamRecords){
            if (teamRecords[team].length > 100){
                teamRecords[team] = teamRecords[team].reduce((x,y)=>x+y,0) / teamRecords[team].length
            } else {
                delete teamRecords[team]
            }
        }

        teamRecords = Object.keys(teamRecords).map((team)=>[team, teamRecords[team]]);
        teamRecords.sort((team1,team2)=>team2[1] - team1[1])
        teamRecords = teamRecords.slice(0,10)

        let y = d3.scaleBand()
            .domain(teamRecords.map(function(d) {return d[0]}))
            .range([0, graph_2_height])
            .padding(0.1);

        let x = d3.scaleLinear()
            .domain([.5, .8])
            .range([margin.left, graph_2_width - margin.right]);

        let bars = svg2.selectAll("rect").data(teamRecords);

        let color = d3.scaleOrdinal()
            .domain(teamRecords.map(function(d) { return d[1] }))
            .range(d3.quantize(d3.interpolateHcl("#66a0e2", "#81c2c3"), 10));

        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("fill", function(d) { return color(d[0]) })
            .attr("y", function(d) { return y(d[0]); })
            .attr("x", x(0.5))
            .attr("width", function(d) {return x(d[1]) - margin.left; })
            .attr("height", y.bandwidth());

        svg2.append("g")
            .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
            .attr("transform", `translate(0, ${graph_1_height})`) ;

        svg2.append("g")
            .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
            .attr("transform", `translate(${(margin.left)}, 0)`) ;

        let counts = countRef2.selectAll("text").data(teamRecords);

        // TODO: Render the text elements on the DOM
        counts.enter()
            .append("text")
            .merge(counts)
            .attr("x", function(d) {return x(d[1]) + 5; })
            .attr("y", function(d) { return y(d[0]) + y.bandwidth()/2 + 5; })
            .style("text-anchor", "start")
            .text( function(d) {return d[1].toFixed(3); });

        svg2.append("text")
            .attr("transform", `translate(${(graph_1_width) / 2},
                                            ${(graph_1_height) + 35})`)
            .style("text-anchor", "middle")
            .text("Win percentage");

            svg2.append("text")
                .attr("transform", `translate(${(graph_1_width) / 2},
                                                ${(graph_1_height) + 50})`)
                .style("text-anchor", "middle")
                .style("font-size", 10)
                .text("*Tournament win percentage determined by excluding friendlies from consideration, as \
                    these matches are often not very compaetitive and/or played by a nations B-team. Additionally,  \
                    teams that");

            svg2.append("text")
                .attr("transform", `translate(${(graph_1_width) / 2},
                                                ${(graph_1_height) + 60})`)
                .style("text-anchor", "middle")
                .style("font-size", 10)
                .text("have played fewer than 100 matches are filtered out to remove controvesial (eg. North Korea) and very small (eg, Jersey) teams. ");

        if(index == 0){
            title.append("text")
                .attr("transform", `translate(${(graph_1_width) / 2}, 25)`)
                .style("text-anchor", "middle")
                .style("font-size", 18)
                .text("Tournament Win percentage of top ten nations (All Time)*");
        } else {
            title.append("text")
                .attr("transform", `translate(${(graph_1_width) / 2}, 25)`)
                .style("text-anchor", "middle")
                .style("font-size", 18)
                .text("Tournament Win percentage of top ten nations (Since 2000)*");
        }
    });
}

setData(0);

// ------------------------------- Graph 3 ---------------------------------- \\

let svg3 = d3.select("#graph3")
    .append("svg")
    .attr("height", graph_3_height + margin.bottom + 25)
    .attr("width", graph_3_width)
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .append("g");

let tooltip3 = d3.select("#graph3")
        .append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

// Set up reference to count SVG group
let countRef3 = svg.append("g");

// Load the artists CSV file into D3 by using the d3.csv() method
d3.csv("data/football.csv").then(function(data) {
    var teamRecords = {}
    var teamGoals = {}
    for (var ii = 0; ii < data.length; ii++) {
        if (data[ii]['tournament'] == "FIFA World Cup" && 2013 < parseInt(data[ii]['date'].substring(0,4))){
            var home_team = data[ii]['home_team']
            var away_team = data[ii]['away_team']
            home_score = data[ii]['home_score']
            away_score = data[ii]['away_score']
            if (data[ii]['home_score'] > data[ii]['away_score']){
                var home_res = 1;
                var away_res = 0;
            } else if (data[ii]['home_score'] < data[ii]['away_score']){
                var home_res = 0;
                var away_res = 1;
            } else {
                var home_res = 0.5;
                var away_res = 0.5;
            }
            if (home_team in teamRecords){
                teamRecords[home_team].push(home_res);
                teamGoals[home_team].push(home_score - away_score);
            } else{
                teamRecords[home_team] = [home_res];
                teamGoals[home_team] = [home_score - away_score];
            }
            if (away_team in teamRecords){
                teamRecords[away_team].push(away_res);
                teamGoals[away_team].push(away_score - home_score);
            } else{
                teamRecords[away_team] = [away_res];
                teamGoals[away_team] = [away_score - home_score];
            }
        }
    };

    for (var team in teamRecords){
         teamRecords[team] = teamRecords[team].reduce((x,y)=>x+y,0)
    }

    for (var team in teamGoals){
        teamGoals[team] = teamGoals[team].reduce((x,y)=>x+y,0) / teamGoals[team].length
    }

    teamRecords = Object.keys(teamRecords).map((team)=>[team, teamRecords[team], teamGoals[team]]);
    teamRecords.sort((team1,team2)=>team2[1] - team1[1])

    console.log(teamRecords)

    xMax = d3.max(d3.values(teamRecords), function(d) {return d[1]});
    yMax = d3.max(d3.values(teamRecords), function(d) {return d[2]}) + .5;
    yMin = d3.min(d3.values(teamRecords), function(d) {return d[2]});

    let x = d3.scaleLinear()
        .domain([0, xMax])
        .range([margin.left, graph_1_width - margin.right]);

    let y = d3.scaleLinear()
        .domain([yMax, yMin])
        .range([margin.top, graph_1_height]);

    let dots = svg3.selectAll("dot").data(teamRecords);

    let color = d3.scaleOrdinal()
        .domain(teamRecords.map(function(d) {return d[1]}))
        .range(d3.quantize(d3.interpolateHcl("#CC66FF", "#3366FF"), 15));

    let mouseover2 = function(d) {
        let color_span = `<span style="color: ${color(d[1])};">`;
        let html = `Team: ${d[0]}<br/>
                ${color_span} # of Wins: ${d[1]}</span><br/>
                ${color_span} Avg. Goal Diff: ${d[2].toFixed(3)}</span><br/>`;

        // Show the tooltip and set the position relative to the event X and Y location
        tooltip3.html(html)
            .style("left", `${(d3.mouse(d3.event.target)[0]) + 100}px`)
            .style("top", `${(d3.mouse(d3.event.target)[1]) + 50}px`)
            .style("box-shadow", `3px 3px 7px #ADD8E6`)
            .style("background-color", `#F5F5F5`)
            .style("border-radius", `8px`)
            .style("padding", `10px`)
            .transition()
            .duration(200)
            .style("opacity", 0.9)
    };

    let mouseout2 = function(d) {
        tooltip3.transition()
            .duration(200)
            .style("opacity", 0);
    };

    dots.enter()
        .append("circle")
        .merge(dots)
        .attr("fill", function(d) { return color(d[1])})
        .attr("cy", function(d) { return y(d[2]); })
        .attr("cx", function(d) { return x(d[1]); })
        .attr("r", 4.8)
        .on("mouseover", mouseover2)
        .on("mouseout", mouseout2);

    svg3.append("g")
        .call(d3.axisBottom(x).tickSize(0).tickPadding(10))
        .attr("transform", `translate(0, ${graph_1_height})`) ;

    svg3.append("g")
        .call(d3.axisLeft(y).tickSize(0).tickPadding(10))
        .attr("transform", `translate(${(margin.left)}, 0)`) ;

    svg3.append("text")
        .attr("transform", `translate(${(graph_1_width) / 2},
                                        ${(graph_1_height) + 35})`)
        .style("text-anchor", "middle")
        .text("Number of Matches Won");

    svg3.append("text")
        .attr("transform", `translate(${(graph_1_width) / 2},
                                        ${(graph_1_height) + 50})`)
        .style("text-anchor", "middle")
        .style("font-size", 10)
        .text("*Here performance is determined by two metrics, average goal differential \
        (Average difference between # of goals a team scored and the # of goals their opponent scored) and total number ");

    svg3.append("text")
        .attr("transform", `translate(${(graph_1_width) / 2},
                                        ${(graph_1_height) + 60})`)
        .style("text-anchor", "middle")
        .style("font-size", 10)
        .text("of games won (which is a good indicator of how far the teams got in the tournaments).");

    svg3.append("text")
        .attr("transform", `translate(50, ${(graph_1_height) / 2}) rotate(-90) `)
        .style("text-anchor", "middle")
        .text("Average Goal Differential");

    svg3.append("text")
        .attr("transform", `translate(${(graph_1_width) / 2}, 15)`)
        .style("text-anchor", "middle")
        .style("font-size", 18)
        .text("Top Performers in the Last 2 World Cups*");

    svg3.append("text")
        .attr("transform", `translate(${(graph_1_width) / 2}, 35)`)
        .style("text-anchor", "middle")
        .style("font-size", 14)
        .text("The closer to the top right corner a team is, the better we predict they'll do in 2022!");

});
