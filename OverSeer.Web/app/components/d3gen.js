import d3 from 'd3';

//http://bl.ocks.org/ericcoopey/6c602d7cb14b25c179a4

var width = innerWidth, height = window.innerHeight;

export function create() {
	this.addNode = node => {
		nodes.push({...node, "id": node.name });
	};

	this.addLink = (source, target, value) => {
		links.push({"source": findNode(source), "target": findNode(target), "value": value});
	};

	var findNode = function (id) {
		for (var i in nodes) {
			if (nodes[i]["id"] === id) return nodes[i];
		};
	};

	this.addData = data => {
		data.nodes.forEach(n => {
			this.addNode(n);	
		});

		data.links.forEach(l => {
			this.addLink(l.target, l.source, 10);
		});
		update();
	}

	var graph = d3.select("body")
			.append("svg")
			.attr("width", width)
			.attr("height", height);

	var force = d3.layout.force()
			      .charge(-400)
				  .linkDistance(50)
				  .size([width, height]);

    var drag = force.drag()
				.on("dragstart", d => {
					d3.select(this).classed("fixed", d.fixed = true)
				});

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
				.call(drag);

		nodeEnter.append("circle")
				.attr("r", 6)
				.attr("id", d => d.id)
				.attr("class", "nodeStrokeClass");

		nodeEnter.append("text")
				.attr("class", "textClass")
				.attr("x", 8)
				.attr("y", "-.61em")
				.text(d => d.id);

		node.exit().remove();

		force.on("tick", function () {
			node
				.attr("transform", d => "translate(" + d.x + "," + d.y + ")")
				.attr("fill", d => d.status ? "green" : "red");

			link.attr("x1", d => d.source.x)
				.attr("y1", d => d.source.y)
				.attr("x2", d => d.target.x)
				.attr("y2", d => d.target.y);
		});

		// Restart the force layout.
		force.start();

	   	d3.selectAll(".node").forEach(nodeArr => {
			var g = nodeArr[0];
            var parent = g.parentNode;
            parent.appendChild(g);
        });
	};

	return this;
}

export default { create }
