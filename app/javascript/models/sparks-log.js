/*globals console sparks $ breadModel getBreadBoard */

/**
 * report:
 * {
 *   pageReports: {
 *         pageX:
 *           {
 *             sessionReports: [
 *                       {
 *                         questions: [],
 *                         log: {},
 *                         score: x,
 *                         maxScore: y
 *                       },
 *              highestScore: x,  ?
 *              maxScore: y       ?
 */
(function() {
  sparks.SparksLog = function(startTime){
    this.events = [];
    this.startTime = startTime;
    this.endTime = -1;
  };
  
  sparks.LogEvent = function(name, value, time){
    this.name = name;
    this.value = value;
    this.time = time;
  };
  
  sparks.LogEvent.CLICKED_TUTORIAL = "Clicked tutorial";
  sparks.LogEvent.BLEW_FUSE = "Blew fuse";
  sparks.LogEvent.DMM_MEASUREMENT = "DMM measurement";
  sparks.LogEvent.CHANGED_CIRCUIT = "Changed circuit";
  
  sparks.SparksLog.prototype = {
    
    measurements: function () {
      return sparks.sparksLogController.numEvents(this, sparks.LogEvent.DMM_MEASUREMENT);
    },
    
    uniqueVMeasurements: function () {
      return sparks.sparksLogController.numUniqueMeasurements(this, "voltage");
    },
    
    uniqueIMeasurements: function () {
      return sparks.sparksLogController.numUniqueMeasurements(this, "current");
    },
    
    uniqueRMeasurements: function () {
      return sparks.sparksLogController.numUniqueMeasurements(this, "resistance");
    },
    
    connectionBreaks: function() {
      return sparks.sparksLogController.numConnectionChanges(this, "disconnect lead");
    },
    
    connectionMakes: function() {
      return sparks.sparksLogController.numConnectionChanges(this, "connect lead");
    },
    
    blownFuses: function () {
      return sparks.sparksLogController.numEvents(this, sparks.LogEvent.BLEW_FUSE);
    }
  };
  
})();