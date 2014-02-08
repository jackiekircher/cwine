function Panel(config, frame) {

  var xOffset = (config.x * (frame.panelWidth  + frame.padding)) + 5,
      yOffset = (config.y * (frame.panelHeight + frame.padding)) + 5;

  this.frame = frame;
  this.image = new Kinetic.Image({
                 id:          config.id,
                 image:       config.image,
                 x:           xOffset,
                 y:           yOffset,
                 offset:      { x: frame.panelWidth/2,
                                y: frame.panelHeight/2 },
                 stroke:      'black',
                 strokeWidth: 5,
                 scaleX: 1.0,
                 scaleY: 1.0
               });

  this.paths = new Kinetic.Collection();
}

// connect a panel to another, allowing the reader to move
// between them
Panel.prototype.addPath = function panelAddPath(targetPanel) {
  var startX   = this.image.x(),
      startY   = this.image.y(),
      endX     = targetPanel.image.x(),
      endY     = targetPanel.image.y();

  path = new Kinetic.Line({
            points: [startX, startY, endX, endY],
            stroke: 'black',
            strokeWidth: 5,
            visible: false
         });

  this.paths.push(path);
  this.frame.pathsGroup.add(path);
};

// determine whether a panel has a path to another panel.
Panel.prototype.hasPath = function panelHasPath(path) {
  return this.paths.indexOf(path) >= 0;
};

// display all paths
Panel.prototype.showPaths = function panelShowPaths() {
  this.paths.each(function(path) {
    path.show();
  });
};

// hide all paths
Panel.prototype.hidePaths = function panelHidePaths() {
  this.paths.each(function(path) {
    path.hide();
  });
};
