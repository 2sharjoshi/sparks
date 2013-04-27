//= require ./resistor
//= require ./r-values
/*global sparks */

/* FILE Diode.js */

(function () {

    var circuit = sparks.circuit;

    circuit.Diode = function (props, breadBoard) {
      sparks.circuit.Resistor.parentConstructor.call(this, props, breadBoard);
      var superclass = sparks.circuit.Diode.uber;
      superclass.init.apply(this, [props.UID]);
      this.resistance = this.Resistance;
    };

    sparks.extend(circuit.Diode, circuit.Resistor, {

      getMinResistance: function() {
        return this.minimumResistance;
      },

      getMaxResistance: function() {          
        return this.maximumResistance;
      },

      scaleResistance: function(value) {
        var perc = value / 10,       // values are 0-10
            range = this.maximumResistance - this.minimumResistance,
            newValue = this.minimumResistance + (range * perc);
        this.resistance = newValue;
      }

    });

})();
