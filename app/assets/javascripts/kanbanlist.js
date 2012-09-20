var KanbanList = KanbanList || {};

KanbanList.namespace = function(ns_string){
  var parts = ns_string.split('.'),
      parent = KanbanList,
      i;

  if (parts[0] === "KanbanList"){
    parts = parts.slice(1);
  }

  for (i = 0; i < parts.length; i += 1){
    if (typeof parent[parts[i]] === "undefined"){
      parent[parts[i]] = {};
    }
    parent = parent[parts[i]];
  }
  return parent;
};



