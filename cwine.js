var cwine = (function Cwine(container) {

  function loadPanels(obj, panelConfig, padding) {

    var stage  = obj.stage,
        layer  = obj.layer,
        group  = obj.panelGroup,
        sizeX  = 1,
        sizeY  = 1;

    obj.panels  = [];
    obj.indices = {};

    // determine the size our the page
    panelConfig.forEach(function(config) {
      sizeX = Math.max(sizeX, config.x + 1);
      sizey = Math.max(sizeY, config.y + 1);
    });

    // initialize the page with empty values
    for( var i = 0; i < sizeX ; i++ ) {
      obj.panels[i] = new Array(sizeY);
    }

    panelConfig.forEach(function(config, i) {
      var x = config.x, xOffset = (x * (400 + padding)) + 5,
          y = config.y, yOffset = (y * (300 + padding)) + 5;

      panel = new Kinetic.Image({
                    id:          config.id,
                    image:       config.image,
                    x:           xOffset,
                    y:           yOffset,
                    stroke:      'black',
                    strokeWidth: 5,
                  });
      panel.paths = config.paths;

      group.add(panel);

      if ( i === 0 ) { obj.startPanel = panel; }

      // center the layer on the current panel whenever it is
      // clicked
      panel.on('mousedown toachstart', function(){
        var centerX = (stage.width()/2) - (this.width()/2);
        var centerY = (stage.height()/2) - (this.height()/2);
        layer.tween = new Kinetic.Tween({
          node:     layer,
          x:        centerX - this.x(),
          y:        centerY - this.y(),
          easing:   Kinetic.Easings.EaseIn,
          duration: 0.25
        });

        layer.tween.play();
      });

      obj.panels[x][y] = panel;
      obj.indices[panel.id()] = { x: x,
                                  y: y };
    });
  }

  function loadPaths(group, panels, indices) {

    panels.forEach(function(panelRow) {
      panelRow.forEach(function(panel){

        //center of panel
        startX = panel.x() + panel.width()/2;
        startY = panel.y() + panel.height()/2;

        panel.paths.forEach(function(path) {
          index    = indices[path];
          endPanel = panels[index.x][index.y];
          endX = endPanel.x() + endPanel.width()/2;
          endY = endPanel.y() + endPanel.height()/2;

          line = new Kinetic.Line({
                       points: [startX, startY, endX, endY],
                       stroke: 'black',
                       strokeWidth: 5,
                     });
          group.add(line);
        });
      });
    });
  }

  return {
    /* state *******
     *
     * stage:      the Kinetic stage associated with the
     *             container
     *
     * layer:      the Kinetic layer that holds the page
     *
     * panelGroup: a Kinetic group that holds all of the
     *             panels
     *
     * pathsGroup: a Kinetic group that holds all of the
     *             path lines between panels. it is always
     *             the bottom-most group.
     *
     * padding:    the space between each panel
     *
     * panels:     a two-dimensional array that contains
     *             every image on the page. it may
     *
     * indices:    a lookup table between panel ids and their
     *             index in the panels array.
     *
     * startPanel: the 'first' panel on the page, where
     *             reading should start
     *
     */

    // initialize the canvas by transforming to the identity
    // matrix, clearing it, then calling context.draw()
    // cantered on the first panel
    init: function cwineInit(images, padding) {

      var stage = new Kinetic.Stage({
                        container: container,
                        width:     1200,
                        height:    600
                      }),
          layer = new Kinetic.Layer(),
          panelGroup = new Kinetic.Group(),
          pathsGroup = new Kinetic.Group();

      layer.add(panelGroup);
      layer.add(pathsGroup);
      stage.add(layer);

      this.stage      = stage;
      this.layer      = layer;
      this.panelGroup = panelGroup;
      this.pathsGroup = pathsGroup;
      this.padding    = padding;

      this.pathsGroup.moveToBottom();
      loadPanels(this, images, padding);
      loadPaths(this.pathsGroup, this.panels, this.indices);

      this.reset();
    },

    right: function cwineRight() {
      this.layer.tween = new Kinetic.Tween({
        node:     this.layer,
        x:        this.layer.x() - 400 - this.padding,
        y:        this.layer.y(),
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      this.layer.tween.play();
    },

    left: function cwineLeft() {
      this.layer.tween = new Kinetic.Tween({
        node:     this.layer,
        x:        this.layer.x() + 400 + this.padding,
        y:        this.layer.y(),
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      this.layer.tween.play();
    },

    up: function cwineUp() {
      this.layer.tween = new Kinetic.Tween({
        node:     this.layer,
        x:        this.layer.x(),
        y:        this.layer.y() + 300 + this.padding,
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      this.layer.tween.play();
    },

    down: function cwineDown() {
      this.layer.tween = new Kinetic.Tween({
        node:     this.layer,
        x:        this.layer.x(),
        y:        this.layer.y() - 300 - this.padding,
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      this.layer.tween.play();
    },

    reset: function cwineReset() {

      // reset state to start
      centerX = (this.stage.width() / 2) -
                (this.startPanel.width() / 2) -
                 this.startPanel.x();
      centerY = (this.stage.height() / 2) -
                (this.startPanel.height() / 2) -
                 this.startPanel.y();

      this.layer.setX(centerX);
      this.layer.setY(centerY);
      this.layer.draw();
    }
  };

})("cwine");

// setup navigation buttons
document.getElementById("left").
  addEventListener("click", cwine.left.bind(cwine), false);
document.getElementById("up").
  addEventListener("click", cwine.up.bind(cwine), false);
document.getElementById("down").
  addEventListener("click", cwine.down.bind(cwine), false);
document.getElementById("right").
  addEventListener("click", cwine.right.bind(cwine), false);
document.getElementById("reset").
  addEventListener("click", cwine.reset.bind(cwine), false);

var panel1 = { id:    "yarn1",
               image: document.getElementById("yarn"),
               paths: [ "yarn2", "laser" ],
               x:     0,
               y:     0 };

var panel2 = { id:    "yarn2",
               image: document.getElementById("yarn"),
               paths: [ "yarn1" ],
               x:     0,
               y:     1 };

var panel3 = { id:    "laser",
               image: document.getElementById("laser"),
               paths: [ "yarn1", "sun" ],
               x:     1,
               y:     0 };

var panel4 = { id:    "sun",
               image: document.getElementById("sunbeam"),
               paths: [ "laser" ],
               x:     2,
               y:     0 };

var images = [ panel1, panel2, panel3, panel4 ];

cwine.init(images, 20);
