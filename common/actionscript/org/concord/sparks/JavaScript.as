package org.concord.sparks
{
    import flash.events.ErrorEvent;
    import flash.external.ExternalInterface;
    
    import org.concord.sparks.Activity;
    
    // Interface with external JavaScript
    public class JavaScript
    {
        var activity:Activity;
        
        public function JavaScript(activity) {
            this.activity = activity;
            this.setupCallbacks();
        }
        
        public function call(func:String, ... values) {
            var args = values;
            args.unshift(func);
            ExternalInterface.call.apply(null, args);
        }
        
        public function sendEvent(name:String, ... values) {
            var time = String(new Date().valueOf());
            ExternalInterface.call('receiveEvent', name, values.join('|'), time);
        }
        
        private function setupCallbacks():void {
            ExternalInterface.addCallback("sendMessageToFlash",
                    getMessageFromJavaScript);
        }
        
        private function parseParameter(parm) {
            var tokens:Array = parm.split(':');
            switch (tokens[1]) {
                case "int":
                    return parseInt(tokens[0]);
                default: //string
                    return tokens[0];
            }
        }

        private function getMessageFromJavaScript(... Arguments):String {
            try {
                return activity.processMessageFromJavaScript(Arguments);
            }
            catch (e:ErrorEvent) {
                return 'flash_error|' + e.toString();
            }
            catch (e:Error) {
                return 'flash_error|' + e.name + '\n' + e.message + '\n' + e.getStackTrace();
            }
            return 'flash_error|this point should be unreachable';
        }
    }
}
