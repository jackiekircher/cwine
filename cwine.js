Kinetic.Image.prototype.sprite = function(x, y, width, height) {
  this.setAttrs({ width: width, height: height });
  this.crop({ x: x, y: y, width: width, height: height });
};

var cwine = (function Cwine(container) {

  function loadPanels(obj, panelConfig, padding) {

    var stage  = obj.stage,
        layer  = obj.page,
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
      panel = new Panel( config, obj );

      panel.pathNames = config.paths;

      layer.add(panel.image);

      obj.panels[config.x][config.y] = panel;
      obj.indices[panel.image.id()] = { x: config.x,
                                        y: config.y };
    });

    obj.panels.forEach(function(panelRow, i) {
      panelRow.forEach(function(panel, j) {
        // create paths between panels
        panel.pathNames.forEach(function(path) {
          var targetPanel = cwine.getPanel(path);
          panel.addPath(targetPanel);
        });

        // center the layer on the current panel whenever
        // it is clicked
        panel.image.on('mousedown toachstart', function(){
          layer.tween = new Kinetic.Tween({
            node:     layer,
            x:        stage.width()/2  - this.x(),
            y:        stage.height()/2 - this.y(),
            easing:   Kinetic.Easings.EaseIn,
            duration: 0.25
          });

          layer.tween.play();

          // reveal connected panels
          panel.pathNames.forEach(function(path) {
            var targetPanel = cwine.getPanel(path);

            targetPanel.image.show();
            targetPanel.image.tween = new Kinetic.Tween({
              node:     targetPanel.image,
              scaleX:   1.0,
              scaleY:   1.0,
              easing:   Kinetic.Easings.ElasticEaseOut,
              duration: 0.4
            });
            targetPanel.image.tween.play();
          });

          panel.showPaths();
        });
      });
    });
  }

  function loadUI(layer) {
    var arrows   = document.getElementById("arrows");
    var elements = [
      { x: 0,  y: 20, fn: cwine.slide.bind(cwine, "left")  },
      { x: 40, y: 0,  fn: cwine.slide.bind(cwine, "up")    },
      { x: 40, y: 40, fn: cwine.slide.bind(cwine, "down")  },
      { x: 80, y: 20, fn: cwine.slide.bind(cwine, "right") },
      { x: layer.getStage().width() - 40, y: 20,
        fn: cwine.reset.bind(cwine) }
    ];

    elements.forEach(function(element, i) {
      var image = new Kinetic.Image({
                        image: arrows,
                        x: element.x,
                        y: element.y,
                      });
      image.sprite( i*40, 0, 40, 40 );
      image.on("mousedown touchstart", element.fn);

      layer.add(image);
    });

    layer.tween = new Kinetic.Tween({
                        node:     layer,
                        opacity:  1.0,
                        duration: 0.2
                      });
    layer.on("mouseover", function() {
      layer.tween.play();
    });
    layer.on("mouseout",  function() {
      layer.tween.reverse();
    });

  }

  return {
    /* state *******
     *
     * stage:      the Kinetic stage associated with the
     *             container
     *
     * page:       the Kinetic layer that holds the story
     *             elements (the panels and paths)
     *
     * ui:         a Kinetic layer that holds all of the
     *             UI elemnts.
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
    init: function cwineInit(config) {

      var stage = new Kinetic.Stage({
                        container: container,
                        width:     1200,
                        height:    600
                      }),
          page = new Kinetic.Layer(),
          ui   = new Kinetic.Layer({ opacity: 0.2 }),
          panelGroup = new Kinetic.Group(),
          pathsGroup = new Kinetic.Group();

      page.add(panelGroup);
      page.add(pathsGroup);
      stage.add(page);
      stage.add(ui);

      this.stage      = stage;
      this.page       = page;
      this.ui         = ui;
      this.panelGroup = panelGroup;
      this.pathsGroup = pathsGroup;

      this.panelWidth  = config.panelWidth;
      this.panelHeight = config.panelHeight;
      this.padding     = config.padding;

      this.pathsGroup.moveToBottom();
      loadPanels(this, config.panels, this.padding);
      loadUI(this.ui);

      this.startPanel = this.getPanel(config.startPanel);
      this.reset();
    },

    getPanel: function cwineGetPanel(id) {
      var index = this.indices[id];
      return this.panels[index.x][index.y];
    },

    hidePanels: function cwineHidePanels() {
      this.panels.forEach(function(panelRow) {
        panelRow.forEach(function(panel) {
          if ( panel !== this.startPanel ) {
            panel.image.scale({ x: 0.8, y: 0.8 });
            panel.image.hide();
          }
          panel.hidePaths();
        }, this);
      }, this);

    },

    slide: function cwineSlide(direction) {
      // panelWidth and panelHeight must be consistent
      // for a slide UI to work
      var x = { left:  this.panelWidth + this.padding,
                up:    0,
                down:  0,
                right: -this.panelWidth - this.padding },
          y = { left:  0,
                up:    this.panelHeight + this.padding,
                down: -this.panelHeight - this.padding,
                right: 0 };

      this.page.tween = new Kinetic.Tween({
        node:     this.page,
        x:        this.page.x() + x[direction],
        y:        this.page.y() + y[direction],
        easing:   Kinetic.Easings.EaseIn,
        duration: 0.25
      });

      this.page.tween.play();
    },

    reset: function cwineReset() {

      // reset state to start
      centerX = (this.stage.width() / 2) -
                 this.startPanel.image.x();
      centerY = (this.stage.height() / 2) -
                 this.startPanel.image.y();

      this.page.setX(centerX);
      this.page.setY(centerY);

      this.hidePanels();
      this.startPanel.image.fire("mousedown");
      this.page.draw();
    }
  };

})("cwine");

var panel1 = { id:    "west_of_house",
               image: document.getElementById("west"),
               paths: [ "north_of_house", "south_of_house" ],
               x:     0,
               y:     1 };

var panel2 = { id:    "north_of_house",
               image: document.getElementById("north"),
               paths: [ "west_of_house", "behind_house" ],
               x:     1,
               y:     0 };

var panel3 = { id:    "behind_house",
               image: document.getElementById("east"),
               paths: [ "north_of_house", "south_of_house" ],
               x:     2,
               y:     1 };

var panel4 = { id:    "south_of_house",
               image: document.getElementById("south"),
               paths: [ "west_of_house", "behind_house" ],
               x:     1,
               y:     2 };


cwine.init({
  panels:      [ panel1, panel2, panel3, panel4 ],
  padding:     40,
  panelWidth:  240,
  panelHeight: 240,
  startPanel:  "west_of_house"
});
