function Panel(name, image, paths, x, y, padding) {

  this.name    = name;
  this.image   = image;
  this.width   = image.width;
  this.height  = image.height;
  this.padding = padding;
  this.index   = { x: x, y: y };
  this.paths   = [];

  paths.forEach(function(pathName) {
    this.addPath(pathName);
  }, this);
}

Panel.prototype.xOffset = function panelXOffset() {
  return this.index.x * (this.width + this.padding);
};

Panel.prototype.yOffset = function panelXOffset() {
  return this.index.y * (this.height + this.padding);
};

// connect a panel to another, allowing the reader to move
// between them
Panel.prototype.addPath = function panelAddPath(name) {
  this.paths.push(name);
};

// determine whether a panel has a path to another panel.
Panel.prototype.hasPath = function panelHasPath(name) {
  return this.paths.indexOf(name) >= 0;
};
