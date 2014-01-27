var cwine = (function() {

  var img1    = document.getElementById("yarn"),
      img2    = document.getElementById("laser"),
      img3    = document.getElementById("sunbeam"),
      canvas  = document.getElementById("cwine"),
      context = canvas.getContext("2d");

  context.draw = function cwineDraw() {
    var x = 0, y = 0;

    cwine.panels.forEach(function(image) {
      this.drawBorder( image, 3, x, y );
      this.drawImage( image, x, y );
      x += image.width + 20;
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


  return {
    // state
    canvas:      canvas,
    context:     context,
    panels:      [ img1, img2, img3 ],
    currPanel:   0,
    pos:         { x: 0, y: 5 },

    // animation daemons, each slides the canvas over by
    // x,y passed to cwineSlide() for given length
    animateLeft:  new MiniDaemon( context,
                                  cwineSlide( -20, 0 ),
                                  1, 21 ),
    animateRight: new MiniDaemon( context,
                                  cwineSlide( 20, 0 ),
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
    init: function cwineInit() {
      this.context.save();

      this.pos.x = (this.canvas.width / 2) - (this.panels[0].width / 2);
      this.pos.y = (this.canvas.height / 2) - (this.panels[0].height / 2);
      this.currPanel = 0;
      this.context.setTransform( 1, 0, 0, 1, 0 ,0 );
      this.context.clearRect( 0, 0,
                              this.canvas.width,
                              this.canvas.height );
      this.context.translate( this.pos.x, this.pos.y );
      this.context.draw(context);

      this.context.restore();
    },

    right: function cwineRight() {
      if ( this.currPanel >= this.panels.length - 1) return;
      this.currPanel += 1;
      this.animateLeft.resetIndex();
      this.animateLeft.start();
    },

    left: function cwineLeft() {
      if ( this.currPanel <= 0 ) return;
      this.currPanel -= 1;
      this.animateRight.resetIndex();
      this.animateRight.start();
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
      console.log(this.currPanel);

      // reset state to start
      this.init();
    }
  };

})();

cwine.init();

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
