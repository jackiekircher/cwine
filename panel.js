function Panel(image, x, y, padding) {

  this.image   = image;
  this.width   = image.width;
  this.height  = image.height;
  this.padding = padding;
  this.index   = { x: x, y: y };
  this.paths   = [];
}

Panel.prototype.xOffset = function panelXOffset() {
  return this.index.x * (this.width + this.padding);
};

Panel.prototype.yOffset = function panelXOffset() {
  return this.index.y * (this.height + this.padding);
};

// connect a panel to another, allowing the reader to move
// between them
Panel.prototype.addPath = function panelAddPath(panel) {
  this.paths.push(panel);
};

// determine whether a panel has a path to another panel.
Panel.prototype.hasPath = function panelHasPath(panel) {
  return this.paths.indexOf(panel) >= 0;
};
