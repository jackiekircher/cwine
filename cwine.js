var canvas  = document.getElementById("cwine"),
    context = canvas.getContext("2d");

var cwine = (function Cwine(canvas, context) {

  context.draw = function cwineDraw() {
    var x = 0, y = 0,
        borderWidth = 3;

    for ( var i = 0; i < cwine.panels.length; i++ ) {
      for ( var j = 0; j < cwine.panels[i].length; j++ ) {

        var panel = cwine.panels[i][j];
        if ( panel !== undefined ) {
          xPos = panel.xOffset();
          yPos = panel.yOffset();
          this.drawBorder( panel.image, borderWidth, xPos, yPos );
          this.drawImage( panel.image, xPos, yPos );
        }
      }
    }

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
      var x = config.x, y = config.y;
      panels[x][y] = new Panel(config.name,
                               config.image,
                               config.paths,
                               x, y, padding);
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
      this.context.save();

      var startPanel = this.panels[this.startIndex.x][this.startIndex.y];

      this.context.setTransform( 1, 0, 0, 1, 0 ,0 );

      this.currIndex.x = this.startIndex.x;
      this.currIndex.y = this.startIndex.y;
      this.pos.x =  (this.canvas.width / 2) - (startPanel.width / 2) - startPanel.xOffset();
      this.pos.y =  (this.canvas.height / 2) - (startPanel.height / 2) - startPanel.yOffset();
      this.context.clearRect( 0, 0,
                              this.canvas.width,
                              this.canvas.height );
      this.context.translate( this.pos.x, this.pos.y );
      this.context.draw(context);

      this.context.restore();
    }
  };

})(canvas, context);

// setup keybindings to slide the canvas
var canvas = document.getElementById("cwine");
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
