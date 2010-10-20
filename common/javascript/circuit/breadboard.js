//= require "qucsator"

/* FILE breadboard.js */

(function () {
    
    var q = sparks.circuit.qucsator;

    ////////////////////////////////////////////////////////////////////////////////
    //// GLOBAL DEFAULTS ///////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      var defs = {
        rows            : 31,
        powerRailHoles  : 25,
        debug           : true
      };

    ////////////////////////////////////////////////////////////////////////////////
    //// HELPER FUNCTIONS //////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      // Array Remove from John Resig http://ejohn.org
      var remove = function(array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
      };
      
      var HTMLLog = undefined, HTMLbody = undefined;
      this.debug = function(){
        if(defs.debug){
          if(typeof console!=='undefined'){
            console.log(arguments[0]);
          }else{
            if(!HTMLLog){
              HTMLLog = document.createElement('div');
              HTMLLog.setAttribute("id", "HTMLLog");
              HTMLBody = document.getElementsByTagName('body')[0];
              HTMLBody.appendChild(HTMLLog);
              HTMLLog.innerHTML += '<b>HTML-DEBUG-LOG:</b></b><br />';
            }
            HTMLLog.innerHTML += arguments[0] + '<br />';
          }
        }
      };

    ////////////////////////////////////////////////////////////////////////////////
    //// R E S I S T O R ///////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      this.Resistor = {
        colorMap : { '-1': 'gold', '-2': 'silver',
            0 : 'black', 1 : 'brown', 2 : 'red', 3 : 'orange',
            4 : 'yellow', 5 : 'green', 6 : 'blue', 7 : 'violet', 8 : 'grey',
            9 : 'white' },
        toleranceColorMap : { 0.01 : 'brown', 0.02 : 'red', 5e-3 : 'green',
            2.5e-3 : 'blue', 1e-3 : 'violet', 5e-4 : 'gray', 5e-2 : 'gold',
            0.1 : 'silver', 0.2 : 'none' },
        getColors4Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 2 - len; ++i){ s += '0'; }
            var mult = decLoc > 1 ? decLoc - 2 : 10;
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[decLoc - 2],
                     this.toleranceColorMap[tolerance]
                   ];
        },
        getColors5Band: function (ohms, tolerance) {
            var s = ohms.toString();
            var decIx = s.indexOf('.');
            var decLoc = decIx > -1 ? decIx : s.length;
            s = s.replace('.', '');
            var len = s.length;
            for (var i = 0; i < 3 - len; ++i) { s += '0'; }
            return [ this.colorMap[s.charAt(0)],
                     this.colorMap[s.charAt(1)],
                     this.colorMap[s.charAt(2)],
                     this.colorMap[decLoc - 3],
                     this.toleranceColorMap[tolerance]
                   ];
        },
        colorToNumber: function (color) {
          for (n in Resistor.colorMap) {
            if (Resistor.colorMap[n] == color) { return parseInt(n); }
          }
          // alternate spelling...
          if (color == "gray") return 8;
          return null;
        },
        getResistance: function(colors){
          var resistance = Resistor.colorToNumber(colors[0]);
          for (var i = 1; i < colors.length - 2; i++) {
            resistance = resistance * 10;
            resistance += Resistor.colorToNumber(colors[i]);
          }
          return resistance * Math.pow(10, Resistor.colorToNumber(colors[i]));
        }
      };

    ////////////////////////////////////////////////////////////////////////////////
    //// B R E A D - B O A R D - M O D E L /////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////

      //// BREADBOARD Prototype Model //////////////////////////////////////////////
      this.breadBoard = {};

      var Hole = function Hole( strip, name ){
        this.type ='hole';
        this.strip = strip;
        this.name = name;
        this.connections = [];
        return this;
      };

      Hole.prototype.nodeName = function() {
        return this.strip && this.strip.name;
      };
      
      Hole.prototype.getName = function() {
        return this.name;
      };

      var GhostHole = function GhostHole(name) {
        this.name = !!name ? name : 'node' + calls;
        return this;
      };

      GhostHole.prototype.nodeName = function() {
        return this.name;
      };
      
      GhostHole.prototype.getName = function() {
        return this.name;
      };

      var Strip = function Strip( holes, name ){
        this.type ='strip';
        this.holes={};
        this.name = name;
        if (holes) {
          for (var i=0, l=holes; i < l; i++) {
            this.holes[''+i] = new Hole();
            this.holes[''+i].strip = this;
          }
        }
        return this;
      };

      var Breadboard = function Breadboard(){
        var i;
        this.type ='Breadboard';

        // Create power-rails
        this.powerRail = { // I was told these were called power-rails
          left:{
            positive: new Strip( null, "powerPosL"),
            negative: new Strip( null, "powerNegL")
          },
          right:{
            positive: new Strip( null, "powerPosR" ),
            negative: new Strip( null, "powerNegR" )
          }
        };

        for (i=0, l=defs.powerRailHoles; i < l; i++) {
          for (side in this.powerRail) {
            for (sign in this.powerRail[side]) {
              var h = side + '_' + sign + i;
              this.powerRail[side][sign][h] = this.holes[h] = new Hole(this.powerRail[side][sign], h);
            }
          }
        }

        // Create board
        for (i=0, l=defs.rows; i < l; i++) {
          newStripL = this.makeStrip("L" + i);
          newStripR = this.makeStrip("R" + i);
          for (var a=0, ll=5; a < ll; a++ ) {
            var mapCode = String.fromCharCode(a+97)+i;
            newStripL.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripL, mapCode );
            mapCode = String.fromCharCode(a+102)+i;
            newStripR.holes[mapCode] = this.holes[ mapCode ] = new Hole( newStripR, mapCode );
          }
        }
        return this;
      };

      Breadboard.prototype.strips=[];
      Breadboard.prototype.components={};
      Breadboard.prototype.holes={};
      Breadboard.prototype.holeMap={};  // map of holes where one replaces the other, e.g. {a1: 'newGhostHole'}

      Breadboard.prototype.makeStrip = function (name) {
        var stripLen = this.strips.length;
        this.strips[ stripLen ] = new Strip(null, name);
        return this.strips[ stripLen ];
      };

      Breadboard.prototype.component = function (props) {
        if(typeof props=='string'){
          return this.components[props];
        }else {
          return new Component(props);
        }
      };

      Breadboard.prototype.clear = function () {
        var destroyed = 0;
        for( k in this.components ){
          destroyed += !!this.component(k).destroy();
        }
        return !!destroyed;
      };
      
      // can pass either a hole or a string
      Breadboard.prototype.getHole = function(hole) {
        if (hole.name){
          if (!!this.holeMap[hole.name]){
            return this.getHole(this.holeMap[hole.getName()]);
          }
          return hole;
        }
        
        // should be a string
        
        // replace with mapped name
        if (!!this.holeMap[hole]){
          hole = this.holeMap[hole]
        }
        
        // return hole if it is in breadboard
        if (!!this.holes[hole]){
          return this.holes[hole];
        }
        
        // otherwise, make a new ghosthole
        return new GhostHole(hole);
        
      };
      
      // Resets all connections, used when holeMap changes
      Breadboard.prototype.resetConnections = function(oldHoleName, newHoleName) {
        for( i in this.components ){
          var comp = this.component(i);
          for (j in comp.connections){
            if (!!comp.connections[j] && comp.connections[j].getName() === oldHoleName) {
              comp.connections[j] = this.getHole(newHoleName);
            }
          }
        }
      };

      //// COMPONENT MODEL /////////////////////////////////////////////////////////
      var Component = function (props) {
        var i;
        //console.log('ENTER Component');
        for (i in props) {
          this[i]=props[i];
        }
        this.breadBoard = breadBoard;
        this.breadBoard.components[props.UID] = this;
        
        this.connections=[];
        for (i in props.connections) {
          this.connections[i] = this.breadBoard.getHole(props.connections[i]);
          
          if (!!this.breadBoard.holes[props.connections[i]]) {
            this.breadBoard.holes[props.connections[i]].connections[this.breadBoard.holes[props.connections[i]].connections.length] = this;
          }
        }
        
        return this;
      };

      Component.prototype.move = function (connections) {
        var i;
        for (i in this.connections) {
          for (var j in this.connections[i].connections) {
            if (this.connections[i].connections[j] === this) {
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        for (i in connections){
          this.connections[i] = this.breadBoard.holes[connections[i]];
          this.breadBoard.holes[connections[i]].connections[this.breadBoard.holes[connections[i]].connections.length] = this;
        }
        return this;
      };

      Component.prototype.destroy = function destroy(){
        for(var i in this.connections){
          for( var j in this.connections[i].connections ){
            if( this.connections[i].connections[j] === this ){
              this.connections[i].connections = [];
            }
          }
          this.connections[i] = [];
        }
        this.connections = [];
        return delete this.breadBoard.components[this.name];
      };

      //// BreadBoard Instance & Interface /////////////////////////////////////////
      var breadBoard = new Breadboard();

      var interfaces = {
        // inserts a new component into the breadboard. Expects a type, the connections,
        // and other arguments as needed
        // e.g. insert('battery', 'a1,a2', '5')
        // e.g. insert('resistor, 'a1,left_positive_1', 'green,black,black,gold')
        insert: function(type, connections){
          var props = {
            UID         : type+calls,
            kind        : type,
            connections : connections.split(",")
          };

          switch(props.kind) {
            case "resistor":
             // props.UID = arguments[3];
              if (typeof(arguments[2])==="string") {
                props.resistance = Resistor.getResistance( arguments[2].split(",") );
                props.colors = arguments[2];
              }
              else if (typeof(arguments[2])=="number") {
                props.resistance = arguments[2];
                props.colors = Resistor.getColors4Band( arguments[2], 0.01);
              }
              break;
            case "wire":
             // props.UID = arguments[2];
              break;
            case 'battery':
              props.voltage = arguments[2];
              break;
          }
          var newComponent;
          newComponent = breadBoard.component(props);
          return newComponent.UID;
        },
        remove: function(type, connections){
          var comp = interfaces.findComponent(type, connections)
          if (!!comp){
            comp.destroy();
          }
        },
        findComponent: function(type, connections){
          if (!!type && !!connections && connections.split(",").length === 2){
            connections = connections.split(",");
            for (i in breadBoard.components){
              var component = breadBoard.components[i];
              if (component.kind === type && !!component.connections[0] && 
                ((component.connections[0].getName() === connections[0]
                && component.connections[1].getName() === connections[1]) || 
                (component.connections[0].getName() === connections[1]
                  && component.connections[1].getName() === connections[0]))){
                  return component;
                }
            }
          }
          return null;
        },
        destroy: function(component){
          breadBoard.component(component).destroy();
        },
        clear: function() {
          breadBoard.clear();
        },
        move: function(component, connections){
          breadBoard.component(component).move(connections.split(','));
        },
        getGhostHole: function(name){
          return new GhostHole(name);
        },
        mapHole: function(oldHoleName, newHoleName){
          breadBoard.holeMap[oldHoleName] = newHoleName;
          breadBoard.resetConnections(oldHoleName, newHoleName);
        },
        unmapHole: function(oldHoleName){
          var newHoleName = breadBoard.holeMap[oldHoleName];
          breadBoard.holeMap[oldHoleName] = undefined;
          breadBoard.resetConnections(newHoleName, oldHoleName);
        },
        addRandomResistor: function(name, location, options){
          var resistor = new sparks.circuit.Resistor4band(name);
          resistor.randomize((options | null));
          interfaces.insert('resistor', location, resistor.getRealValue(), name);
          return resistor;
        },
        query: function(type, connections){
          console.log("query! type = "+type);
          // Current dummy function will pass query to model
          // Model will then compile SPICE net list and send to server
          // Server will respond with voltage at queried points
          // Power and MultiMeter settings will be assumed

          //debug( breadBoard.query( arguments[1].split(',') ) );
          
          console.log("at time of measuring, netlist = ");
          console.log(q.makeNetlist(breadBoard));
          
          var tempComponents = [];
          
          if (type === 'resistance') {
            connections = connections.split(',');
            var ghost = new GhostHole();
            var ohmmeterBattery = breadBoard.component({
              UID: 'ohmmeterBattery', 
              kind: 'battery', 
              voltage: 1,
              connections: [connections[0], ghost]});
            var currentProbe = breadBoard.component({
              UID: 'meter', 
              kind: 'iprobe',
              connections: [ghost, connections[1]]});
            tempComponents.push(ohmmeterBattery, currentProbe);
          } else {
            if (type === 'voltage'){
              var voltmeterResistor = breadBoard.component({
                UID: 'voltmeterResistor', 
                kind: 'resistor', 
                resistance: 1000000000000,
                connections: connections.split(',')});
              tempComponents.push(voltmeterResistor);
            }
            var probe = breadBoard.component({
              UID: 'meter',
              kind: {'current' : 'iprobe', 'voltage' : 'vprobe'}[type],
              connections: connections.split(',')});
            tempComponents.push(probe);
          }
          
          // attach batteries to rails on the fly. This is weird -- why don't we
          // attach the batteries from the start, or when user attaches them?
          // if (type != 'resistance') {
          tempComponents.push(breadBoard.component({
            UID: 'leftRailPower', 
            kind: 'battery', 
            voltage: 9,
            connections: ["left_positive1", "left_negative1"]}));

          tempComponents.push(breadBoard.component({
            UID: 'rightRailPower', 
            kind: 'battery', 
            voltage: 9,
            connections:  ["right_positive1", "right_negative1"]}));
          // }

          var result;
          
          q.qucsate(q.makeNetlist(breadBoard),
                  function (r) { result = r.meter; } );

          console.log('result=' + result);
          
          $.each(tempComponents, function(i, component){
            component.destroy();
          });

          if (type === 'resistance') {
            result = (1 / result);
          }
          result = -1 * result;
          
          // round to 5 decimal places
          result = Math.round(result*Math.pow(10,5))/Math.pow(10,5);
          //document.getElementById('dmm-output').innerHTML = "Meter Reading: " + result;
          return  result;
        },
        updateFlash: function() {
          $.each(breadBoard.components, function(name, component) {
            
            if (!!component.connections[0] && !!component.connections[1]){
              var location = component.connections[0].getName() + "," + component.connections[1].getName();
            
              switch (component.kind) {
                case "resistor":
                  sparks.flash.sendCommand('insert_component', 'resistor', component.UID, location,'4band',component.colors);
                  break;
                case "wire":
                  var color;
                  if (location.indexOf("positive") > -1){
                    color = "0xaa0000";
                  } else if (location.indexOf("negative") > -1){
                    color = "0x000000";
                  } else {
                    if (Math.random() < 0.5){
                      color = "0x008800";
                    } else {
                      color = "0x000088";
                    }
                  }
                  sparks.flash.sendCommand('insert_component', 'wire', component.UID, location, color);
                  break;
              }
            }
          });
        }
      };

      //Stored the number of calls made to the Model: used to create UID
      var calls=0;

      // The inward interface between Flash's ExternalInterface and JavaScript's BreadBoard prototype model instance
      this.breadModel = function () {
        debug(arguments);
        calls++;
        var newArgs = [];
        for(var i=1,l=arguments.length;i< l;i++){
          newArgs[newArgs.length] = arguments[i];
        }
        var func = arguments[0];
        
        if (func === 'query') {
            var conns = arguments[2].split(',');

            if (conns[0] === 'null' || conns[1] === 'null') {
                return 0;
            }
            var v = interfaces.query.apply(window, newArgs);
            return v;
        }
        else {
          return interfaces[func].apply(window, newArgs);
        }
      };
      
      this.getBreadBoard = function() {
        return breadBoard;
      };

      // The outward interface between JS & Flash
      /*
      this.toFlash = function toFlash(){
        console.log(arguments[0]);
        document.getElementById('swf').fromBreadModel(arguments[0]);
      };
      document.addEventListener('click', function(){ flash("testing!","test2") }, false);
      */

})();
