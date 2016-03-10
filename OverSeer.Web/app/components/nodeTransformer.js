var objects = 
	{ 
		"nodes" :[], 
		"links" :[],
		addLink : function (source, target) {
			if(this.nodes.filter((e, i, a) => (e.source === source && e.target === target) ||
								(e.source === target && e.target === source)).length === 0) {
				this.links.push({"source": source, "target": target, "weight" : 1});
			}
		},
		addNode : function (node) {
			if(this.nodes.filter((e, i, a) => e.name === node.name).length === 0) {
			this.nodes.push({...node});
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

export function addNodes (structure, obj) {
  obj.addNode({ "name": structure.name, "type": structure.serviceType, "status": structure.status });
  forEachChildNode(structure, (c, p) => obj.addNode(c));
  forEachChildNode(structure, (c, p) => obj.addLink(c.name, p.name));
  return objects;
};

export default { addNodes, objects }
