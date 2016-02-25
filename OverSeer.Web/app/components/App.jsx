import './App.css';
import React, {Component} from 'react';
import d3 from 'd3';
import testNodes from './test_nodes.json';

export default class App extends Component {
	render() {

var objects = 
	{ 
  	"counter" : -1,
		"nodes" :[], 
		"links" :[],
    getOrder : function (nodeName) {
    	let foundNode = this.nodes.filter((e, i, a) => e.name === nodeName);
      return foundNode[0].order;
    },
    addLink : function (source, target) {
    	this.links.push({"source": source, "target": target, "weight" : 1});
    },
    addNode : function (node) {
    	if(this.nodes.filter((e, i, a) => e.name === node.name).length === 0) {
        this.counter++;
        this.nodes.push({...node, 'order' : this.counter});
      }
    }
  };

var forEachChildNode = function(node, func) {
  if(node.dependancies !== undefined)
  {
    node.dependancies.forEach(function (child) {
    	func(child, node);
      forEachChildNode(child, func);
    });
  }
}

var transform = function (structure, objects) {
  objects.addNode({ "name": structure.name, "type": structure.type });
  forEachChildNode(structure, (c, p) => objects.addNode(c));
  forEachChildNode(structure, (c, p) => {
  	let pOrder = objects.getOrder(p.name);
  	let cOrder = objects.getOrder(c.name);
  	objects.addLink(cOrder, pOrder)
  });
  return objects;
};

var objects = transform(testNodes, objects);
var width = window.innerWidth, height = window.innerHeight;

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var force = d3.layout.force()
    .gravity(.05)
    .distance(10)
    .charge(-1000)
    .size([width, height]);

  force
      .nodes(objects.nodes)
      .links(objects.links)
      .start();

  var link = svg.selectAll(".link")
      .data(objects.links)
    .enter().append("line")
      .attr("class", "link")
    .style("stroke-width", function(d) { return Math.sqrt(d.weight); });

  var node = svg.selectAll(".node")
      .data(objects.nodes)
    .enter().append("g")
      .attr("class", "node")
      .call(force.drag);

  node.append("circle")
  		.attr("class", "status-ok")
      .attr("r","7");

  node.append("text")
      .attr("dx", 10)
      .attr("dy", ".15em")
      .text(function(d) { return d.name });

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
  });

		return (
		  <div>
		  </div>
		);
	}
}
