var cwine = (function Cwine(container) {

  function loadPanels(layer, panelConfig, padding) {

    var stage  = layer.getStage(),
        sizeX  = 1,
        sizeY  = 1,
        panels = [];

    // determine the size our the page
    panelConfig.forEach(function(config) {
      sizeX = Math.max(sizeX, config.x + 1);
      sizey = Math.max(sizeY, config.y + 1);
    });

    // initialize the page with empty values
    for( var i = 0; i < sizeX ; i++ ) {
      panels[i] = new Array(sizeY);
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
      panel.paths  = config.paths;
      panel.xIndex = x;
      panel.yIndex = y;

      layer.add(panel);

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

      panels[x][y] = panel;
    });

    return panels;
  }

  return {
    /* state *******
     *
     * stage:      the Kinetic stage associated with the
     *             container
     *
     * layer:      the Kinetic layer that holds all of the
     *             panels
     *
     * padding:    the space between each panel
     *
     * panels:     a two-dimensional array that contains
     *             every image on the page. it may
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
          layer = new Kinetic.Layer();

      stage.add(layer);

      this.stage      = stage;
      this.layer      = layer;
      this.padding    = padding;
      this.panels     = loadPanels(layer, images, padding);
      this.startPanel = this.panels[images[0].x][images[0].y];

      this.reset();
    },

    right: function cwineRight() {
      cwine.layer.tween = new Kinetic.Tween({
        node:     cwine.layer,
        x:        cwine.layer.x() - 400 - cwine.padding,
        y:        cwine.layer.y(),
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      cwine.layer.tween.play();
    },

    left: function cwineLeft() {
      cwine.layer.tween = new Kinetic.Tween({
        node:     cwine.layer,
        x:        cwine.layer.x() + 400 + cwine.padding,
        y:        cwine.layer.y(),
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      cwine.layer.tween.play();
    },

    up: function cwineUp() {
      cwine.layer.tween = new Kinetic.Tween({
        node:     cwine.layer,
        x:        cwine.layer.x(),
        y:        cwine.layer.y() + 300 + cwine.padding,
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      cwine.layer.tween.play();
    },

    down: function cwineDown() {
      cwine.layer.tween = new Kinetic.Tween({
        node:     cwine.layer,
        x:        cwine.layer.x(),
        y:        cwine.layer.y() - 300 - cwine.padding,
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      cwine.layer.tween.play();
    },

    reset: function cwineReset() {

      // reset state to start
      centerX = (cwine.stage.width() / 2) -
                (cwine.startPanel.width() / 2) -
                 cwine.startPanel.x();
      centerY = (cwine.stage.height() / 2) -
                (cwine.startPanel.height() / 2) -
                 cwine.startPanel.y();

      cwine.layer.setX(centerX);
      cwine.layer.setY(centerY);
      cwine.layer.draw();
    }
  };

})("cwine");

document.getElementById("left").
  addEventListener("click", cwine.left, false);
document.getElementById("up").
  addEventListener("click", cwine.up, false);
document.getElementById("down").
  addEventListener("click", cwine.down, false);
document.getElementById("right").
  addEventListener("click", cwine.right, false);
document.getElementById("reset").
  addEventListener("click", cwine.reset, false);

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
               paths: [ "yarn, sun" ],
               x:     1,
               y:     0 };

var panel4 = { id:    "sun",
               image: document.getElementById("sunbeam"),
               paths: [ "laser" ],
               x:     2,
               y:     0 };

var images = [ panel1, panel2, panel3, panel4 ];

cwine.init(images, 20);
