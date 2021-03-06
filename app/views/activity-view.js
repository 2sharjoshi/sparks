/*global sparks $ breadboardView breadModel getBreadBoard*/

(function() {

  sparks.ActivityView = function(activity){
    this.activity = activity;
    this.commandQueue = [];

    this.divs = {
      $breadboardDiv:   $('#breadboard'),
      $imageDiv:        $('#image'),
      $questionsDiv:    $('#questions_area'),
      $titleDiv:        $('#title'),
      $scopeDiv:        $('#oscope_mini'),
      $fgDiv:           $('#fg_mini'),
      $addCompsWrapper: $('#add_components'),
      $addCompsBtn:     $('#add_components_btn')
    };
  };

  sparks.ActivityView.prototype = {

    layoutCurrentSection: function() {
      var section = sparks.activityController.currentSection;

      $('#loading').hide();
      this.divs.$breadboardDiv.hide();

      this.divs.$titleDiv.text(section.title);

      this.divs.$imageDiv.html('');

      if (!!section.image){
        var $image = sparks.activityController.currentSection.view.getImageView();
        this.divs.$imageDiv.append($image);
      }

      if (!!section.circuit && !section.hide_circuit){
        this.divs.$breadboardDiv.show();
        this.divs.$breadboardDiv.html('');

        var self = this;
        breadboardView.ready(function() {
          sparks.breadboardView = breadboardView.create("breadboard");

          // pass queued-up component right-click function to breadboard view
          if (self.rightClickFunction) {
            sparks.breadboardView.setRightClickFunction(self.rightClickFunction);
          }

          // FIXME: view should accept battery as standard component via API
          sparks.breadboardView.addBattery("left_negative21,left_positive21");
          breadModel('updateView');

          sparks.sound.mute = true;

          self.showDMM(section.show_multimeter);
          self.showOScope(section.show_oscilloscope);
          // this.allowMoveYellowProbe(section.allow_move_yellow_probe);
          // this.hidePinkProbe(section.hide_pink_probe);

          sparks.sound.mute = false;

          sparks.activityController.currentSection.meter.update();
        });

        var source = getBreadBoard().components.source;
        if (source.frequency) {
          var fgView = new sparks.FunctionGeneratorView(source);
          var $fg = fgView.getView();
          this.divs.$fgDiv.append($fg);
          this.divs.$fgDiv.show();
        }
        section.meter.reset();
      }

      if (section.showComponentDrawer || section.showComponentEditor) {
        var addComponentsView = new sparks.AddComponentsView(section);

        if (section.showComponentDrawer) {
          this.divs.$addCompsWrapper.show();
          this.divs.$addCompsBtn.off();
          this.divs.$addCompsBtn.on('click', addComponentsView.openPane);
        }
      }

      this.layoutPage(true);
    },

    layoutPage: function(hidePopups) {
      if (hidePopups) {
        this.hidePopups();
      }
      if (!!sparks.sectionController.currentPage){
        this.divs.$questionsDiv.html('');
        var $page = sparks.sectionController.currentPage.view.getView();
        this.divs.$questionsDiv.append($page);
      }
      $('body').scrollTop(0);
    },

     showOScope: function(visible) {
       this.divs.$scopeDiv.html('');

       if (visible) {
         var scopeView = new sparks.OscilloscopeView();
         var $scope = scopeView.getView();
         this.divs.$scopeDiv.append($scope);
         this.divs.$scopeDiv.show();
         sparks.activityController.currentSection.meter.oscope.setView(scopeView);

         sparks.breadboardView.addOScope({
              "yellow":{
              "connection": "left_positive21",
              "draggable": true
            },"pink": {
              "connection": "f22",
              "draggable": true
            }
          });
       }
     },

     showDMM: function(visible) {
      if (visible) {
       sparks.breadboardView.addDMM({
            "dial": "dcv_20",
            "black":{
            "connection": "g12",
            "draggable": true
          },"red": {
            "connection": "f3",
            "draggable": true
          }
        });
      }
     },

     allowMoveYellowProbe: function() {
     },

     hidePinkProbe: function() {
     },

     hidePopups: function() {
       $('.ui-dialog').empty().remove();
       var section = sparks.activityController.currentSection;
       if (section && section.meter) {
        section.meter.reset();
        section.meter.update();
       }
     },

     setRightClickFunction: function(func) {
      this.rightClickFunction = func;
     },

     // not usually necessary. Justs for tests?
     setEmbeddingTargets: function(targets) {
       if (!!targets.$breadboardDiv){
         this.divs.$breadboardDiv = targets.$breadboardDiv;
       }
       if (!!targets.$imageDiv){
         this.divs.$imageDiv = targets.$imageDiv;
       }
       if (!!targets.$questionsDiv){
         this.divs.$questionsDiv = targets.$questionsDiv;
       }
     }
  };
})();