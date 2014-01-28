function Panel(image) {

  this.image  = image;
  this.width  = image.width;
  this.height = image.height;
  this.paths  = [];
}

// connect a panel to another, allowing the reader to move
// between them
Panel.prototype.addPath = function panelAddPath(panel) {
  this.paths.push(panel);
};

// determine whether a panel has a path to another panel.
Panel.prototype.hasPath = function panelHasPath(panel) {
  return this.paths.indexOf(panel) >= 0;
};
