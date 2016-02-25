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

export default function transform (structure) {
  objects.addNode({ "name": structure.name, "type": structure.type });
  forEachChildNode(structure, (c, p) => objects.addNode(c));
  forEachChildNode(structure, (c, p) => {
  	let pOrder = objects.getOrder(p.name);
  	let cOrder = objects.getOrder(c.name);
  	objects.addLink(cOrder, pOrder)
  });
  return objects;
};
