// Workflow progress model

define([
    "jscore/core",
    "jscore/ext/mvp",
    "jscore/ext/net",
    "wfs/WfDefinitionClient",
    "wfs/WfProgressClient"
    ], function(core, mvp, net, WfDefinitionClient, WfProgressClient) {

    var WfProgressModel = {};

    WfProgressModel.build = function(options) {

        var createKeyableProgress = function(nodeProgresses) {
            var keyableProgress = Object.create(null);
            for (var i = 0; i < nodeProgresses.length; i++) {
                keyableProgress[nodeProgresses[i].nodeId] = nodeProgresses[i];
            }
            return keyableProgress;
        };

        var hasProgressAnnotation = function(flowNode) {
            if (flowNode.annotations != null && flowNode.annotations.length > 0) {
                for (var i = 0; i < flowNode.annotations.length; i++) {
                    if (flowNode.annotations[i] === "prg") {
                        return true;
                    }
                }
            }
            return false;
        };

        var getPercentAnnotation = function(flowNode) {
            var percent  = null;
            if (flowNode.annotations != null && flowNode.annotations.length > 0) {
                for (var i = 0; i < flowNode.annotations.length; i++) {
                    var matches = flowNode.annotations[i].match("^p([0-9]+)");
                    if (matches != null && matches.length > 1) {
                        var value = parseInt(matches[1]);
                        if (value < 0) value = 0;
                        if (value > 100) value = 100;
                        percent = { percent: value};
                        break;
                    }
                }
            }
            return percent;
        };

        var isBoundaryErrorStarted  = function(flowNode) {
            var error = false;
            for (var i = 0; i < flowNode.boundaryEvents.length; i++) {
                var boundaryEvent = flowNode.boundaryEvents[i];
                if (boundaryEvent.type === "boundaryError") {
                    error = getNodeStatus(boundaryEvent) != "";
                    break;
                }
            }
            return error;
        };

        var isNodeCompensated = function(flowNode) {
            var compensationHandler = getCompensationHandler(flowNode);
            return compensationHandler != null && getNodeStatus(compensationHandler) !=  "";
        };

        var getCompensationHandler = function(flowNode) {
            for (var i = 0; i < flowNode.boundaryEvents.length; i++) {
                var boundaryEvent = flowNode.boundaryEvents[i];
                if (boundaryEvent.type === "compensationBoundaryCatch") {
                    if (boundaryEvent.assocFlowNodes.length == 1) {
                        return boundaryEvent.assocFlowNodes[0];
                    }
                }
            }
        };

        var getExecutionCount = function(flowNode) {
            var executions = 0;
            if (keyableProgress[flowNode.id] != null) {
                var events = keyableProgress[flowNode.id].events;
                for (var i = 0; i < events.length; i++) {
                    if (events[i].type == "end") {
                        executions++;
                    }
                }
            }
            return executions;
        };

        var getNodeStatus = function(flowNode) {
            var status = null;
            if (keyableProgress[flowNode.id] != null) {
                if (isBoundaryErrorStarted(flowNode, keyableProgress)) {
                    status = "Failed";
                } else {
                    var events = keyableProgress[flowNode.id].events;
                    var numStarts = 0, numEnds = 0, numCalls = 0;
                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        if (event.type == "start") {
                            numStarts++;
                        }
                        if (event.type == "end") {
                            numEnds++;
                        }
                        if (event.type == "call") {
                            numCalls++;
                            flowNode.eventData = event.eventData;    // TODO - what to do when multiple calls ?
                            calledWorkflows.push( { activityName: flowNode.name,
                                                    childDefinitionId: event.eventData.childDefinitionId, 
                                                    childExecutionId: event.eventData.childExecutionId });
                        }
                    }

                    if (numStarts == numEnds) {
                        status = "Completed";

                        var nodePercentComplete = getPercentAnnotation(flowNode);
                        if (nodePercentComplete != null && nodePercentComplete.percent > percentComplete) {
                            percentComplete = nodePercentComplete.percent;
                        }
                    }
                    else if (numStarts > numEnds) {
                        if (flowNode.forCompensation == true) {
                            status = "Completed";
                        }
                        else {
                            status = "Started";
                        }
                    }
                }
            }
            return (status != null ? status : "");
        };

        var decorateStructureWithProgress = function(flow) {
            var flowNodes = flow.flowNodes;
            for (var i = 0; i < flowNodes.length; i++) {
                var flowNode = flowNodes[i];
                if (hasProgressAnnotation(flowNode)) {
                    flowNode.showProgress = true;
                    var progressStatus = getNodeStatus(flowNode);
                    flowNode.progressStatus = progressStatus;
                    keyableStatus[flowNode.id] = progressStatus;

                    if (isNodeCompensated(flowNode)) {
                        flowNode.compensationHandler = getCompensationHandler(flowNode);
                        keyableStatus[flowNode.compensationHandler.id] = getNodeStatus(flowNode.compensationHandler);
                    }

                    flowNode.executionCount = getExecutionCount(flowNode);
                    keyableCount[flowNode.id] = flowNode.executionCount;
                }

                // add boundary flows to the current flow nodes flows
                for (var j = 0; j < flowNode.boundaryEvents.length; j++) {
                    var boundaryEvent = flowNode.boundaryEvents[j];
                    if (hasProgressAnnotation(boundaryEvent) && boundaryEvent.type === "boundaryError" && keyableProgress[boundaryEvent.id] != null) {
                        keyableStatus[boundaryEvent.id] = "Failed";
                    }
                    for (var k = 0; k < boundaryEvent.flows.length; k++) {
                        flowNode.flows.push(boundaryEvent.flows[k]);
                    }
                }   

                for (var j = 0; j < flowNode.flows.length; j++) {            
                    var innerFlow = flowNode.flows[j];
                    decorateStructureWithProgress(innerFlow);     // recursive
                }          
            }
            return;
        };

        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        var workflowDefinitionId = options.workflowDefinitionId;
        var workflowInstanceId = options.workflowInstanceId;

        var keyableProgress = null;
        var keyableStatus = Object.create(null);
        var keyableCount = Object.create(null);
        var percentComplete = -1;
        var calledWorkflows = [];

        // Get workflow definition structure
        WfDefinitionClient.getStructure({
            wfDefinitionId: workflowDefinitionId,
            success: function(wfStructureModel) {
                // Get workflow instance progress
                WfProgressClient.getProgress({
                    wfInstanceId: workflowInstanceId,
                    success: function(wfProgressModel) {
                        var structureFlows = wfStructureModel.getAttribute("flows");
                        var nodeProgresses = wfProgressModel.getAttribute("nodeProgresses");
                        //console.log(structureFlows);
                        keyableProgress = createKeyableProgress(nodeProgresses);
                        //console.log(keyableProgress);
                        decorateStructureWithProgress(structureFlows[0]);    // TODO - only using main flow nodes for now (ie. 1 start event)

                        options.success.call(this, { wfStructureModel: wfStructureModel, 
                                                     wfProgressModel: wfProgressModel,
                                                     keyableStatus: keyableStatus,
                                                     keyableCount: keyableCount,
                                                     percentComplete:  percentComplete > -1 ? percentComplete : null,
                                                     calledWorkflows: calledWorkflows });
                    },
                    error: function(err) {
                        console.log(err);
                    }
                });

            },
            error: function(err) {
                console.log(err);
            }
        });

    };

    return WfProgressModel;

});
