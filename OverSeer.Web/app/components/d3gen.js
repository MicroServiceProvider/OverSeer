import d3 from 'd3';

//http://bl.ocks.org/ericcoopey/6c602d7cb14b25c179a4

var width = window.innerWidth, height = window.innerHeight;

export function create() {
	this.addNode = id => {
		nodes.push({"id": id });
		update();
	};

	this.addLink = (source, target, value) => {
		links.push({"source": findNode(source), "target": findNode(target), "value": value});
		update();
	};

	var findNode = function (id) {
		for (var i in nodes) {
			if (nodes[i]["id"] === id) return nodes[i];
		};
	};

	this.addData = data => {
		data.nodes.forEach(n => {
			this.addNode(n.name);	
		});

		data.links.forEach(l => {
			this.addLink(l.target, l.source, 10);
		});
	}

	var color = d3.scale.category10();

	var graph = d3.select("body")
			.append("svg:svg")
			.attr("width", width)
			.attr("height", height)
			.attr("id", "svg")
			.attr("pointer-events", "all")
			.attr("viewBox", "0 0 " + width + " " + height)
			.attr("perserveAspectRatio", "xMinYMid")
			.append('svg:g');

	var force = d3.layout.force();
	var nodes = force.nodes(), links = force.links();

	var update = function () {
		var link = graph.selectAll("line")
				.data(links, d => d.source.id + "-" + d.target.id);

		link.enter().append("line")
				.attr("id", d => d.source.id + "-" + d.target.id)
				.attr("stroke-width", d => d.value / 10)
				.attr("class", "link");

		link.append("title")
				.text(d => d.value);
		link.exit().remove();

		var node = graph.selectAll("g.node")
				.data(nodes, d => d.id);

		var nodeEnter = node.enter().append("g")
				.attr("class", "node")
				.call(force.drag);

		nodeEnter.append("svg:circle")
				.attr("r", 12)
				.attr("id", d => d.id)
				.attr("class", "nodeStrokeClass")
				.attr("fill", d => color(d.id));

		nodeEnter.append("svg:text")
				.attr("class", "textClass")
				.attr("x", 14)
				.attr("y", ".31em")
				.text(d => d.id);

		node.exit().remove();

		force.on("tick", function () {
			node.attr("transform", d => {
				return "translate(" + d.x + "," + d.y + ")";
			});

			link.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);
		});

		// Restart the force layout.
		force
			.gravity(-.01)
			.charge(-1000)
			.friction(0)
			.linkStrength(0.1)
			.linkDistance(d => d.value * 15)
			.size([width, height])
			.start();

	   	d3.selectAll(".node").forEach(node => {
            var parent = node[0].parentNode;
            parent.appendChild(node[0]);
        });
	};

	return this;
}

export default { create }
