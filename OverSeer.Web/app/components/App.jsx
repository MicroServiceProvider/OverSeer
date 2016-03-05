import './App.css';
import React, {Component} from 'react';
import testNodes from './test_nodes.json';
import nodeTransformer from './nodeTransformer.js';
import d3graph from './d3gen.js';

export default class App extends Component {
	render() {
		var graph = d3graph.create();
		var objects = nodeTransformer.objects;
		fetch('http://localhost:3000/status/health')
			.then(response => response.json())
			.then(function(json) {
				json.dependancies.forEach(function (c) {
					fetch(c.url)
						.then(resp => resp.json())
						.then(js => {
							nodeTransformer.addNodes(js, objects);
							graph.addData(objects)
						});
				});
				nodeTransformer.addNodes(json, objects);
			    graph.addData(objects)
			}).catch(function(ex) {
				console.log(ex);
			});
		return (
		  <div>
		  </div>
		);
	}
}
