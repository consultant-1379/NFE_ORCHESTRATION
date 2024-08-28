define([
    "jscore/core",
    "stomp/stomp"
    ], function(core, stomp, View) {

       return core.Widget.extend({

            View: View,

            onViewReady: function() {
            	
            	this.createStompClient(this.options.regionEventBus);                
            }, 



            createStompClient: function(regionEventBus) {
                var pad=function(text,field){
                    var n = '' + text;
                    var w = n.length;
                    var l = field.length;
                    var pad = w < l ? l-w : 0;
                    return n+field.substr(0,pad);
                };

            	this.regionEventBus = regionEventBus;
                var stomp = Stomp.client("ws://localhost:61614/stomp");
     
                stomp.debug = function(str) {
                 // console.log("Debug  " + str)
                }        

                errorCallback = function(error) {
                    console.log("Error" + error);
                }                 

                wfInstanceCallback = function(message) {
                	var event = JSON.parse(message.body);
                    console.log("instance-event: " + event.eventTime + " " + event.workflowInstanceId + " " + pad(event.eventType, "          "));
                	if ( event.eventType == 'start' || event.eventType == 'end') {                	
                		regionEventBus.publish("instance-event", event);
                	} 
                	
                }.bind(this)

                wfProgressCallback = function(message) {
                    var event = JSON.parse(message.body);
                    console.log("progress-event: " + event.eventTime + " " + event.workflowInstanceId + 
                                    " " + pad(event.eventType, "          ") + " " + event.nodeId);
                	regionEventBus.publish("progress-event",  event);                                   
                }.bind(this)

                wfUserTaskCallback = function(message) {
                    var event = JSON.parse(message.body);
                    console.log("usertask-event: " + event.eventTime + " " + event.id +
                                    " " + pad(event.eventType, "          ") + " " + event.definitionId);
                	regionEventBus.publish("usertask-event", event);                                   
                }.bind(this)                                 
                 
                connectCallback = function() {
                    stomp.subscribe("jms.topic.wfsInstanceTopic", wfInstanceCallback);
                    stomp.subscribe("jms.topic.wfsProgressTopic", wfProgressCallback);                    
                    stomp.subscribe("jms.topic.wfsTaskTopic", wfUserTaskCallback);
                }         

                stomp.connect("wfsuser", "Password123!", connectCallback, errorCallback);

                window.onbeforeunload = stomp.disconnect;
                
            }.bind(this)

        });
});