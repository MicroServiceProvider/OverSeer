import './App.css';
import React, {Component} from 'react';
import testNodes from './test_nodes.json';
import nodeTransformer from './nodeTransformer.js';
import d3graph from './d3gen.js';

export default class App extends Component {
	render() {
		fetch('http://localhost:3000/status/health')
			.then(function(response) {
				return response.json();
			}).then(function(json) {
				var objects = nodeTransformer(json);
				d3graph(objects);
			}).catch(function(ex) {
				console.log(ex);
			});
		return (
		  <div>
		  </div>
		);
	}
}
