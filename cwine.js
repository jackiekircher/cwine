var canvas  = document.getElementById("cwine"),
    context = canvas.getContext("2d");

var stage = new Kinetic.Stage({
                  container: "kinetic-test",
                  width:     1200,
                  height:    600
                });
var layer = new Kinetic.Layer();
stage.add(layer);

var cwine = (function Cwine(canvas, context) {

  context.draw = function cwineDraw() {
    layer.draw();
    /*
    var x = 0, y = 0,
        borderWidth = 3;

    for ( var i = 0; i < cwine.panels.length; i++ ) {
      for ( var j = 0; j < cwine.panels[i].length; j++ ) {

        var panel = cwine.panels[i][j];
        if ( panel !== undefined ) {
          xPos = panel.x();
          yPos = panel.y();
          this.drawBorder( panel.image, borderWidth, xPos, yPos );
          this.drawImage( panel.image, xPos, yPos );
        }
      }
    }
    */

  };

  context.drawBorder = function cwineDrawBorder(image, width, x, y) {

    this.fillStyle = "rgb(0, 0, 0)";
    this.fillRect( x - width, y - width,
                   image.width + width*2, image.height + width*2 );
  };

  // creates an animation function for a MiniDaemon that
  // translates the canvas <delta> units along the x axis
  function cwineSlide(deltaX, deltaY) {
    return function(index, length, reverse) {
      cwine.pos.x += deltaX;
      cwine.pos.y += deltaY;

      this.save();

      this.setTransform( 1, 0, 0, 1, 0 ,0 );
      this.clearRect( 0, 0,
                      canvas.width,
                      canvas.height );
      this.translate( cwine.pos.x, cwine.pos.y );
      this.draw();

      this.restore();
    };
  }

  function loadPanels(panelConfig, padding) {

    var sizeX  = 1,
        sizeY  = 1,
        panels = [];

    panelConfig.forEach(function(config) {
      sizeX = Math.max(sizeX, config.x + 1);
      sizey = Math.max(sizeY, config.y + 1);
    });

    for( var i = 0; i < sizeX ; i++ ) {
      panels[i] = new Array(sizeY);
    }

    panelConfig.forEach(function(config, i) {
      var x = config.x, y = config.y,
          xOffset = (x * 420) + 5, yOffset = (y * 320) + 5;
      panels[x][y] = new Kinetic.Image({
                       id: config.name,
                       image: config.image,
                       stroke: 'black',
                       strokeWidth: 5,
                       paths: config.paths,
                       x: xOffset, y: yOffset
                     });
      panels[x][y].on('mousedown toachstart', function() {
        var centerX = (stage.width() / 2 ) - (panels[x][y].width() / 2);
        var centerY = (stage.height() / 2 ) - (panels[x][y].height() / 2);
        layer.tween = new Kinetic.Tween({
          node: layer,
          x: centerX - xOffset,
          y: centerY - yOffset,
          easing: Kinetic.Easings.EaseIn,
          duration: 0.5
        });
        layer.tween.play();
      });
      layer.add(panels[x][y]);
    });

    return panels;
  }

  return {
    // state
    canvas:      canvas,
    context:     context,
    padding:     20,
    startIndex:  {},
    currIndex:   {},
    pos:         {},

    // animation daemons, each slides the canvas over by
    // x,y passed to cwineSlide() for given length
    animateLeft:  new MiniDaemon( context,
                                  cwineSlide( 20, 0 ),
                                  1, 21 ),
    animateRight: new MiniDaemon( context,
                                  cwineSlide( -20, 0 ),
                                  1, 21 ),
    animateUp:    new MiniDaemon( context,
                                  cwineSlide( 0, 20 ),
                                  1, 16 ),
    animateDown:  new MiniDaemon( context,
                                  cwineSlide( 0, -20 ),
                                  1, 16 ),

    // actions

    // initialize the canvas by transforming to the identity
    // matrix, clearing it, then calling context.draw()
    // cantered on the first panel
    init: function cwineInit(images) {
      this.panels = loadPanels(images, this.padding);
      this.startIndex.x = images[0].x;
      this.startIndex.y = images[0].y;
      this.reset();
    },

    right: function cwineRight() {
      if (this.panels[this.currIndex.x+1] &&
          this.panels[this.currIndex.x+1][this.currIndex.y]) {
        this.currIndex.x += 1;
        this.animateRight.resetIndex();
        this.animateRight.start();
      }
    },

    left: function cwineLeft() {
      if (this.panels[this.currIndex.x-1] &&
          this.panels[this.currIndex.x-1][this.currIndex.y]) {
        this.currIndex.x -= 1;
        this.animateLeft.resetIndex();
        this.animateLeft.start();
      }
    },

    up: function cwineUp() {
      if (this.panels[this.currIndex.x][this.currIndex.y-1]) {
        this.currIndex.y -= 1;
        this.animateUp.resetIndex();
        this.animateUp.start();
      }
    },

    down: function cwineDown() {
      if (this.panels[this.currIndex.x][this.currIndex.y+1]) {
        this.currIndex.y += 1;
        this.animateDown.resetIndex();
        this.animateDown.start();
      }
    },

    reset: function cwineReset() {
      // pause current animation
      this.animateLeft.pause();
      this.animateRight.pause();

      // reset state to start
      var startPanel = this.panels[this.startIndex.x][this.startIndex.y];

      this.currIndex.x = this.startIndex.x;
      this.currIndex.y = this.startIndex.y;

      this.pos.x =  (stage.width() / 2) - (startPanel.width() / 2) - startPanel.x();
      this.pos.y =  (stage.height() / 2) - (startPanel.height() / 2) - startPanel.y();

      layer.setX(this.pos.x);
      layer.setY(this.pos.y);
      layer.draw();
    }
  };

})(canvas, context);

// setup keybindings to slide the canvas
var canvas = document.getElementById("kinetic-test");
canvas.onkeydown = function(event) {

  switch(event.keyCode) {

    case 37:
      cwine.left();
      return false;
    case 38:
      cwine.up();
      return false;
    case 39:
      cwine.right();
      return false;
    case 40:
      cwine.down();
      return false;
  }
};

var panel1 = { name:  "yarn1",
               image: document.getElementById("yarn"),
               paths: [ "yarn2", "laser" ],
               x:     0,
               y:     0 };

var panel2 = { name:  "yarn2",
               image: document.getElementById("yarn"),
               paths: [ "yarn1" ],
               x:     0,
               y:     1 };

var panel3 = { name:  "laser",
               image: document.getElementById("laser"),
               paths: [ "yarn, sun" ],
               x:     1,
               y:     0 };

var panel4 = { name:  "sun",
               image: document.getElementById("sunbeam"),
               paths: [ "laser" ],
               x:     2,
               y:     0 };

var images = [ panel1, panel2, panel3, panel4 ];

cwine.init(images);
