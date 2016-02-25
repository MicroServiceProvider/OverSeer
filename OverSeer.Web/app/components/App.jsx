import './App.css';
import React, {Component} from 'react';
import d3 from 'd3';

export default class App extends Component {
	render() {

var structure = {
  "name" : "GG.Web.Crowdfunding",
  "type" : "service",
  "dependancies" : [
	{ 
	  "name" : "GG.Service.IdentityVerification",
	  "type" : "service",
	  "dependancies" : [
  		{ "name" : "NetVerify", "type" : "external" },
  		{ "name" : "Onfido", "type" : "external" },
  		{ "name" : "CallCredit", "type" : "external" },
  		{ "name" : "PayPal", "type" : "external" },
  		{ "name" : "GG.Service.User", "type" : "service" }
	  ]
	},
	{
	  "name" : "GG.Service.Project",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "EventStore", "type" : "internal" },
	    { "name" : "BB01", "type" : "db" }
	   ]
	},
	{
	  "name" : "GG.Service.Profile",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "GG.Service.User", "type" : "service" },
	    { "name" : "GG.Care.Read", "type" : "service" },
	    { "name" : "GG.Service.Charity", "type" : "service", "dependancies" : [ {"name" : "BB01", "type" : "db" } ] },
	    { "name" : "BB01", "type" : "db" },
	    { "name" : "Membached", "type" : "db" },
	    { "name" : "GG.Profile", "type" : "db" },
	    { "name" : "EventStore", "type" : "internal" }
	   ]
	},
	{
	  "name" : "GG.Service.Crm.ExactTarget",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "ExactTarget", "type" : "external" }
	   ]
	},
	{
	  "name" : "GG.Service.User",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "GG.Service.IpLocale", "type" : "service" },
	    { "name" : "BB01", "type" : "db" },
	    { "name" : "GG.User", "type" : "db" }
	   ]
	},	
	{
	  "name" : "GG.Service.AddressLookup",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "PostCodeAnywhere", "type" : "external" },
      { "name" : "GetAddressIo", "type" : "external" }
	   ]
	},
	{
	  "name" : "GG.Service.Project.RiskAnalysis",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "EventStore", "type" : "internal" },
	    { "name" : "GG.Service.Project", "type" : "service" }
	   ]
	},
	{
	  "name" : "GG.Imaging.Read",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "S3", "type" : "external" }
	   ]
	},
	{
	  "name" : "GG.Imaging.Write",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "S3", "type" : "external" }
	   ]
	},
	{
	  "name" : "GG.Service.Project.Registration",
	  "type" : "service",
	  "dependancies" : [
	    { "name" : "GG.FMS", "type" : "service" },
	    { "name" : "GG.Service.User", "type" : "service" },
	    { "name" : "GG.Service.AB", "type" : "service" },
	    { "name" : "EventStore", "type" : "internal" },
	    { "name" : "BB01", "type" : "db" }
	   ]
	},
	{
	  "name" : "GG.Service.AB",
	  "type" : "service",   
	  "dependancies" : [
	    { "name" : "AB", "type" : "db" }
	   ]
	},
	{
	 "name" : "PayPal",
	 "type" : "external"
	}
	]
};

// Extract the nodes
// Extract the links!!

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

var objects = transform(structure, objects);
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
