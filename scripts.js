// scripts.js
const currentData = [];

document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("#upload-form");
    form.addEventListener("submit", handleUpload);
});

function handleUpload(e) {
    e.preventDefault();
    const input = document.querySelector("#file-input");
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(ev) {
            const csvData = ev.target.result;
            processData(csvData);
        };
        reader.readAsText(file);
    }
}

function processData(csvData) {
    const data = d3.csvParse(csvData);
    currentData.push(...data.map(d => ({
        year: d.year,
        gdp: +d.gdp,
        population: +d.population,
        gdpPerCapita: +d.gdp / +d.population
    })));

    console.log("Current Data:", currentData); // Проверка данных

    updateVisualization();
}

function updateVisualization() {
    const chartType = document.querySelector("#chart-type").value;
    const title = document.querySelector("#title").value;
    const xlabel = document.querySelector("#xlabel").value;
    const ylabel = document.querySelector("#ylabel").value;

    const outputContainer = document.querySelector("#visualization-output");
    outputContainer.innerHTML = '';

    switch (chartType) {
        case "line": drawLineChart(outputContainer, title, xlabel, ylabel); break;
        case "pie": drawPieChart(outputContainer, title); break;
        case "heatmap": drawHeatmap(outputContainer, title); break;
        case "treemap": drawTreemap(outputContainer, title); break;
        case "force-directed": drawForceDirectedGraph(outputContainer, title); break;
        case "radar": drawRadarChart(outputContainer, title); break;
        case "area": drawAreaChart(outputContainer, title, xlabel, ylabel); break;
        case "parallel-coordinates": drawParallelCoordinates(outputContainer, title); break;
        case "streamgraph": drawStreamgraph(outputContainer, title); break;
        case "choropleth-map": drawChoroplethMap(outputContainer, title); break;
        case "waterfall": drawWaterfallChart(outputContainer, title); break;
        case "bubble": drawBubbleChart(outputContainer, title); break;
        case "cartogram": drawCartogram(outputContainer, title); break;
        default: console.error("Unknown chart type:", chartType);
    }
}

// ---- ФУНКЦИИ РИСОВАНИЯ ИНФОГРАФИК -----

// ЛИНЕЙНЫЙ ГРАФИК
function drawLineChart(outputContainer, title, xlabel, ylabel) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(currentData.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(currentData, d => d.gdp)])
        .range([height, 0]);

    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.gdp));

    svg.append("path")
        .datum(currentData)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "axis-y")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text(xlabel);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text(ylabel);
}

// КРУГОВАЯ ДИАГРАММА
function drawPieChart(outputContainer, title) {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value(d => d.gdp);
    const arcs = pie(currentData);

    const arcPath = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    svg.selectAll("path")
        .data(arcs)
        .enter()
        .append("path")
        .attr("d", arcPath)
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10])
        .attr("stroke", "white")
        .style("stroke-width", "2px");

    svg.append("text")
        .attr("x", 0)
        .attr("y", -radius * 0.8)
        .attr("text-anchor", "middle")
        .text(title);
}

// СЕТЧАТАЯ ДИАГРАММА (HEATMAP)
function drawHeatmap(outputContainer, title) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(currentData.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleBand()
        .domain(["Population", "GDP"])
        .range([0, height])
        .padding(0.1);

    const colorScale = d3.scaleSequential(d3.interpolateViridis)
        .domain([0, d3.max(currentData, d => d.gdp)]);

    svg.selectAll("rect")
        .data(currentData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale("Population"))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.population));

    svg.selectAll("rect")
        .data(currentData)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale("GDP"))
        .attr("width", xScale.bandwidth())
        .attr("height", yScale.bandwidth())
        .attr("fill", d => colorScale(d.gdp));

    svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "axis-y")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);
}

// ДЕРЕВО (TREEMAP)
function drawTreemap(outputContainer, title) {
    const width = 800;
    const height = 400;

    const root = d3.hierarchy({ children: currentData }, d => d.children)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

    const treemapLayout = d3.treemap()
        .size([width, height])
        .paddingInner(1)
        .round(true)(root);

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const cell = svg.selectAll("g")
        .data(root.leaves())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0)
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    cell.append("text")
        .attr("dx", 4)
        .attr("dy", 14)
        .text(d => d.data.name);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);
}

// СЕТЕВОЙ ГРАФИК (FORCE DIRECTED GRAPH)
function drawForceDirectedGraph(outputContainer, title) {
    const width = 800;
    const height = 400;

    const simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(d => d.id))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 2, height / 2));

    const nodes = [
        { id: "Node1" },
        { id: "Node2" },
        { id: "Node3" },
        { id: "Node4" }
    ];

    const links = [
        { source: "Node1", target: "Node2" },
        { source: "Node2", target: "Node3" },
        { source: "Node3", target: "Node4" },
        { source: "Node4", target: "Node1" }
    ];

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const link = svg.append("g")
        .selectAll("line")
        .data(links)
        .enter()
        .append("line")
        .attr("stroke", "#aaa");

    const node = svg.append("g")
        .selectAll("circle")
        .data(nodes)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "steelblue");

    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);

    function ticked() {
        link.attr("x1", d => d.source.x)
           .attr("y1", d => d.source.y)
           .attr("x2", d => d.target.x)
           .attr("y2", d => d.target.y);

        node.attr("cx", d => d.x)
           .attr("cy", d => d.y);
    }

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);
}

// РАДАРНАЯ ДИАГРАММА (RADAR CHART)
function drawRadarChart(outputContainer, title) {
    const width = 400;
    const height = 400;
    const radius = Math.min(width, height) / 2;

    const categories = ["Population", "GDP"];
    const dataPoints = currentData.map(d => ({ Population: d.population, GDP: d.gdp }));

    const angleStep = (Math.PI * 2) / categories.length;
    const angles = Array.from(Array(categories.length)).map((_, i) => i * angleStep);

    const maxValue = d3.max(dataPoints.flatMap(point => Object.values(point)));
    const rScale = d3.scaleLinear().domain([0, maxValue]).range([0, radius]);

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

    const lines = svg.selectAll("line")
        .data(categories)
        .enter()
        .append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", (_, i) => rScale(maxValue) * Math.cos(angles[i]))
        .attr("y2", (_, i) => rScale(maxValue) * Math.sin(angles[i]));

    const area = d3.areaPolar()
        .angle((_, i) => angles[i])
        .radius(d => rScale(d));

    svg.append("path")
        .datum(dataPoints[0]) // Берём первую точку данных
        .attr("d", area)
        .attr("fill", "steelblue")
        .attr("fill-opacity", 0.7);

    svg.append("text")
        .attr("x", 0)
        .attr("y", -radius * 0.8)
        .attr("text-anchor", "middle")
        .text(title);
}

// ГРАФИК С ОБЛАСТЯМИ (AREA CHART)
function drawAreaChart(outputContainer, title, xlabel, ylabel) {
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(currentData.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(currentData, d => d.gdp)])
        .range([height, 0]);

    const area = d3.area()
        .x(d => xScale(d.year))
        .y0(height)
        .y1(d => yScale(d.gdp));

    svg.append("path")
        .datum(currentData)
        .attr("fill", "steelblue")
        .attr("d", area);

    svg.append("g")
        .attr("class", "axis-x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "axis-y")
        .call(d3.axisLeft(yScale));

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .text(xlabel);

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -(height / 2))
        .attr("y", -40)
        .attr("text-anchor", "middle")
        .text(ylabel);
}

// ПАРАЛЛЕЛЬНЫЕ КООРДИНАТЫ (PARALLEL COORDINATES)
function drawParallelCoordinates(outputContainer, title) {
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const dimensions = ["population", "gdp"];
    const dimensionScales = {};

    dimensions.forEach(dim => {
        dimensionScales[dim] = d3.scaleLinear()
        .domain([0, d3.max(currentData, d => d[dim])])
        .range([height, 0]);
    });

    const pathGen = d3.line()
        .defined(d => d !== undefined)
        .curve(d3.curveBasis);

    const lines = svg.selectAll("path")
        .data(currentData)
        .enter()
        .append("path")
        .attr("d", d => {
            const points = dimensions.map(dim => [dimensionScales[dim](d[dim]), dim === "population" ? 0 : height]);
            return pathGen(points);
        })
        .attr("fill", "none")
        .attr("stroke", "steelblue");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);
}

// СКОЛЬЗЯЩИЙ ГРАФИК (STREAMGRAPH)
function drawStreamgraph(outputContainer, title) {
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const stack = d3.stack()
        .keys(["population", "gdp"]);

    const layers = stack(currentData);

    const area = d3.area()
        .x((d, i) => i * (width / currentData.length))
        .y0(d => d[0])
        .y1(d => d[1]);

    const layerPaths = svg.selectAll("path")
        .data(layers)
        .enter()
        .append("path")
        .attr("d", area)
        .attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);
}

// ТЕПЛОВАЯ КАРТА (CHOROPLETH MAP)
function drawChoroplethMap(outputContainer, title) {
    const width = 800;
    const height = 400;
    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], { type: "Sphere" });

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("world-countries.json").then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;

        const colorScale = d3.scaleThreshold()
            .domain([1000000, 10000000, 100000000])
            .range(d3.schemeBlues[3]);

        svg.selectAll("path")
            .data(countries)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => colorScale(+d.properties.pop_est))
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(title);
    });
}

// ВОДОПАДНЫЙ ГРАФИК (WATERFALL CHART)
function drawWaterfallChart(outputContainer, title) {
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleBand()
        .domain(currentData.map(d => d.year))
        .range([0, width])
        .padding(0.1);

    const yScale = d3.scaleLinear()
        .domain([0, d3.sum(currentData, d => d.gdp)])
        .range([height, 0]);

    const cumulativeSum = currentData.reduce((acc, curr) => acc.concat(acc.slice(-1)[0] + curr.gdp), [0]);

    const bars = svg.selectAll("rect")
        .data(currentData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => xScale(d.year))
        .attr("y", (d, i) => yScale(cumulativeSum[i]))
        .attr("width", xScale.bandwidth())
        .attr("height", (d, i) => yScale(cumulativeSum[i + 1]) - yScale(cumulativeSum[i]))
        .attr("fill", "steelblue");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);
}

// ГРАФИК С ПУЗЫРЬКАМИ (BUBBLE CHART)
function drawBubbleChart(outputContainer, title) {
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(currentData, d => d.year)])
        .range([0, width]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(currentData, d => d.gdp)])
        .range([height, 0]);

    const bubbles = svg.selectAll("circle")
        .data(currentData)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.year))
        .attr("cy", d => yScale(d.gdp))
        .attr("r", d => Math.sqrt(d.population) / 100)
        .attr("fill", "steelblue");

    svg.append("text")
        .attr("x", width / 2)
        .attr("y", -10)
        .attr("text-anchor", "middle")
        .text(title);
}

// КАРТОГРАММА
function drawCartogram(outputContainer, title) {
    const width = 800;
    const height = 400;
    const projection = d3.geoNaturalEarth1()
        .fitSize([width, height], { type: "Sphere" });

    const path = d3.geoPath().projection(projection);

    const svg = d3.select(outputContainer)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    d3.json("world-countries.json").then(world => {
        const countries = topojson.feature(world, world.objects.countries).features;

        const cartogram = d3.cartogram()
            .properties(d => d.properties)
            .value(d => d.properties.pop_est);

        const layout = cartogram(countries, projection);

        svg.selectAll("path")
            .data(layout.features)
            .enter()
            .append("path")
            .attr("d", path)
            .attr("fill", d => d3.interpolateCool(d.properties.pop_est / 100000000))
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);

        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("text-anchor", "middle")
            .text(title);
    });
}