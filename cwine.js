var canvas  = document.getElementById("cwine"),
    context = canvas.getContext("2d");

var cwine = (function Cwine(canvas, context) {

  context.draw = function cwineDraw() {
    var x = 0, y = 0,
        borderWidth = 3;

    cwine.panels.forEach(function(panel) {
      xPos = panel.xOffset();
      yPos = panel.yOffset();
      this.drawBorder( panel.image, borderWidth, xPos, yPos );
      this.drawImage( panel.image, xPos, yPos );
    }, this);
  };

  context.drawBorder = function cwineDrawBorder(image, width, x, y) {

    this.fillStyle = "rgb(255, 255, 255)";
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

  function loadPanels(images, padding) {
    panels = [];
    images.forEach(function(image, i) {
      panels[i] = new Panel(image[0], image[1], image[2], padding);
    });

    return panels;
  }

  return {
    // state
    canvas:      canvas,
    context:     context,
    padding:     20,
    currPanel:   0,
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
    init: function cwineInit(images, newPaths) {

      this.panels = loadPanels(images, this.padding);

      // configure paths - this could use a bit of work
      for (var panelIndex in newPaths) {

        var panel = this.panels[panelIndex],
            paths = newPaths[panelIndex];

        for (var j = 0; j < paths.length; j++) {
          var pathIndex = paths[j];
          panel.addPath(panels[pathIndex]);
        }
      }

      this.reset();
    },

    right: function cwineRight() {
      if (panels[this.currPanel].hasPath(panels[this.currPanel+1])) {
        this.currPanel += 1;
        this.animateRight.resetIndex();
        this.animateRight.start();
      }
    },

    left: function cwineLeft() {
      if (panels[this.currPanel].hasPath(panels[this.currPanel-1])) {
        this.currPanel -= 1;
        this.animateLeft.resetIndex();
        this.animateLeft.start();
      }
    },

    up: function cwineUp() {
      //if ( this.currPanel <= 0 ) return;
      //this.currPanel -= 1;
      this.animateUp.resetIndex();
      this.animateUp.start();
    },

    down: function cwineDown() {
      //if ( this.currPanel <= 0 ) return;
      //this.currPanel -= 1;
      this.animateDown.resetIndex();
      this.animateDown.start();
    },

    reset: function cwineReset() {
      // pause current animation
      this.animateLeft.pause();
      this.animateRight.pause();

      // reset state to start
      this.context.save();

      this.currPanel = 0;
      var startPanel = this.panels[0];

      this.context.setTransform( 1, 0, 0, 1, 0 ,0 );

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

var img1    = document.getElementById("yarn"),
    img2    = document.getElementById("laser"),
    img3    = document.getElementById("sunbeam");

var images = [ [img1, 0, 1],
               [img2, 1, 1],
               [img3, 2, 1] ];
// what other format can be used here?
var paths = { 0: [1],
              1: [0,2],
              2: [1] };


cwine.init(images, paths);
