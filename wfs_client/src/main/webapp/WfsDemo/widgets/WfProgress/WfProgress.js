// Workflow progress widget

define([
    "jscore/core",
    "jscore/ext/mvp",
    "jscore/ext/net",
    "widgets/Tooltip",
    "chartlib/widgets/DonutChart",
    "wfs/WfDefinitionClient",
    "wfs/WfProgressClient",
    "./WfProgressModel",
    "./WfProgressDiagram/WfProgressDiagram",
    "./WfProgressView"
    ], function(core, mvp, net, Tooltip, DonutChart, WfDefinitionClient, WfProgressClient, WfProgressModel, WfProgressDiagram, View) {

  return core.Widget.extend({

            View: View,

            onViewReady: function() {
                this.handleOptions();

                // Close button
                this.setupCloseButton();

                // Build progress models
                WfProgressModel.build({
                    workflowDefinitionId: this.workflowDefinitionId, 
                    workflowInstanceId: this.workflowInstanceId,
                    success: function(progressModels) {
                        this.wfStructureModel = progressModels.wfStructureModel;
                        this.wfProgressModel = progressModels.wfProgressModel;
                        this.keyableStatus = progressModels.keyableStatus;
                        this.percentComplete = progressModels.percentComplete;
                        this.calledWorkflows = progressModels.calledWorkflows;

                        // Render progress
                        this.renderProgress(this.regionEventBus);

                        // Diagram button
                        this.setupDiagramButton();
                        //this.showDiagram();
                        // Subscribe for progress events
                        this.progressEventChannel = this.regionEventBus.subscribe("progress-event", function(pushEvent) {     
                            this.handlePushEvent(pushEvent);
                        }.bind(this));

                    }.bind(this),
                    error: function(err) {
                        console.log(err);       // TODO - recommended UI SDK logging ?
                    }.bind(this)
                });
            },

            handleOptions: function() {
                this.regionEventBus = this.options.regionEventBus;

                this.workflowDefinitionId = this.options.ids.workflowDefinitionId;
                this.workflowName = this.options.ids.workflowName;
                this.workflowInstanceId = this.options.ids.workflowInstanceId;
                
                if ( this.options.ids.hasOwnProperty('childExecutionId')) {
                    this.workflowInstanceId = this.options.ids.childExecutionId;
                    this.workflowDefinitionId = this.options.ids.childDefinitionId;
                }

                if ( this.options.ids.hasOwnProperty('subProcessId')) {
                    this.subProcessId = this.options.ids.subProcessId;
                }
            },

            setupCloseButton: function() {
                this.view.getProgressCloseButton().addEventHandler("click", function (e) {
                    this.regionEventBus.unsubscribe("progress-event", this.progressEventChannel);
                    this.options.doneCallback();
                }.bind(this), this);
            },

            setupDiagramButton: function() {
                // Add diagram button handler
                var diagramButton = this.view.getProgressDiagramButton();
                diagramButton.addEventHandler("click", function (e) {
                    this.showDiagram();
                }.bind(this), this);

                // Diagram button tooltip
                var diagramButtonTooltip = new Tooltip({
                    parent: diagramButton,
                    enabled: true,
                    contentText: 'Show workflow diagram',
                    modifiers: [{name: 'size', value: 'large'}]
                });
                diagramButtonTooltip.attachTo(this.getElement());
            },

            renderProgress: function(regionEventBus) {

                prglistRenderCallActProgress = function(childExecutionId,childDefinitionId) {                           
                    regionEventBus.publish("progress-refresh", {childExecutionId : childExecutionId, childDefinitionId : childDefinitionId});
                };

                prglistRenderSubprocessProgress = function(subProcessId) {                           
                    regionEventBus.publish("progress-refresh", {subProcessId : subProcessId});
                };

                var createListItemHtml = function(flowNode, progress) {
                    var iconHtml = "";
                    var prefixHtml = "";
                    var style = "eaWfsDemo-WfProgress-List-item_default ";

                    if (progress === "Started") {
                        style = "eaWfsDemo-WfProgress-List-item_started ";
                        prefixHtml += "<span class='eaWfsDemo-WfProgress-List-item_prefix'>In Progress:&nbsp&nbsp</span>";
                    }
                    else if (progress === "Completed") {
                        style = "eaWfsDemo-WfProgress-List-item_completed ";
                        iconHtml = "<i class='ebIcon ebIcon_small ebIcon_tick'></i>&nbsp&nbsp";
                    }
                    else if (progress === "Failed") {
                        style = "eaWfsDemo-WfProgress-List-item_failed";
                        iconHtml = "<i class='ebIcon ebIcon_small ebIcon_error'></i>&nbsp&nbsp";
                    }

                    if (flowNode.hasOwnProperty('eventData')) {     
                        prefixHtml += "<a href='#'  class='ebBreadcrumbs-link' onclick=\"prglistRenderCallActProgress(\'" + flowNode.eventData.childExecutionId + "\','" + flowNode.eventData.childDefinitionId+ "\')\">";          
                    }

                    var valueHtml = "<span class=" + style + ">" + flowNode.name + "</span>";

                    // add badge to indicate the number of times 
                    if ((flowNode.executionCount > 1) || (flowNode.executionCount == 1 && progress === "Started")) {
                        valueHtml += "&nbsp&nbsp<span class='ebBgColor_grey_20 ebColor_white eaWfsDemo-WfProgress-badge'>" + flowNode.executionCount + "</span>";
                    }

                    // add compensdation handler name if node has been compensated
                    if(flowNode.compensationHandler) {
                        var compensationIconHtml = "&nbsp&nbsp<i class='ebIcon ebIcon_small ebIcon_prevArrow'></i>";
                        valueHtml += compensationIconHtml + 
                                    "<span class=" + style + ">" + flowNode.compensationHandler.name + "</span>";
                    }
                    
                    if (flowNode.hasOwnProperty('eventData')) {                        
                        valueHtml += "&nbsp&nbsp<i class='ebIcon ebIcon_medium ebIcon_externalApp'></i>";
                        valueHtml +='</a>';
                    }

                    // add anchor in case of subprocess to link to subprocess flow
                    if (flowNode.type === "subProcess") {
                        prefixHtml = prefixHtml + "<a href='#'  class='ebBreadcrumbs-link' onclick=\"prglistRenderSubprocessProgress(\'" + flowNode.id + "\')\">"; 
                        valueHtml += "&nbsp&nbsp<i class='ebIcon ebIcon_medium ebIcon_externalApp'></i>";
                        valueHtml +='</a>'         
                    }

                    return "<li class='" + style + "'>" + iconHtml + prefixHtml + valueHtml + "</li>";
                };

                var findFlowNode = function(flow, id) {
                    for (var i = 0; i < flow.flowNodes.length; i++) {
                        var flowNode = flow.flowNodes[i];    
                        if (flowNode.id === id) {
                            return flowNode;
                        } 
                        for (var j = 0; j < flowNode.flows.length; j++) {
                            var innerFlowNode = findFlowNode(flowNode.flows[j], id);
                            if (innerFlowNode != null) {
                                return innerFlowNode;
                            }
                        }
                    }  
                };

                var buildFlowProgress = function(flow) {
                    var flowHtml = "";
                    var hasActivity = false;
                    var flowNodes = flow.flowNodes;
                    for (var i = 0; i < flowNodes.length; i++) {
                        var flowNode = flowNodes[i];
                        if (flowNode.showProgress && flowNode.showProgress == true) {
                            if (flowNode.progressStatus != null && flowNode.progressStatus != "") {
                                hasActivity = true;
                            }
                            flowHtml += createListItemHtml(flowNode, flowNode.progressStatus);
                        }

                        for (var j = 0; j < flowNode.flows.length; j++) {            
                            var innerFlow = flowNode.flows[j];
                            innerResult = buildFlowProgress(innerFlow);     // recursive

                            flowHtml += htmlList;
                            flowHtml += createListItemHtml(innerFlow, innerResult.hasActivity ? "Completed" : "");
                            flowHtml += htmlList;

                            flowHtml += innerResult.html;
                           
                            flowHtml += "</ul>";
                            flowHtml += "</ul>";
                        }          
                    }
                    return { html: flowHtml, hasActivity: hasActivity};
                };

                // -------------------------------------------------------------------------------------------------------
                // Rendering work starts here.....

                // Get flow to render - note structure model for flow has previously been decorated with progress information
                var flows = this.wfStructureModel.getAttribute("flows");
                var flow = flows[0];      // TODO - only using main flow nodes for now (ie. 1 start event)

                if (this.subProcessId) { //display progress for subprocess only
                    var subProcessFlowNode = findFlowNode(flow, this.subProcessId);
                    flow = {flowNodes : subProcessFlowNode.assocFlowNodes};
                }

                // Construct progress HTML - basic implementation based on <ul>
                var html = "<table>";

                // Percent donut cell
                html += "<tr>"
                html += "<td class='eaWfsDemo-WfProgress-donut'>";
                html += "</td>";

                // List cell
                html += "<td class='eaWfsDemo-WfProgress-List-content'>";
                html += "<ul class='eaWfsDemo-WfProgress-List-top'>";

                var htmlList = "<ul class='eaWfsDemo-WfProgress-List'>";

                flow = buildFlowProgress(flow);
                html += flow.html;

                html += "</ul>";
                html += "</td>";
                html += "</tr>";
                html += "</table>";

                this.progressElement = core.Element.parse(html);

                this.view.getProgressContent().append(this.progressElement);

                // Optionally show percent donut
                if (this.percentComplete != null) {
                    this.showDonut();
                }

            },

            showDonut: function() {
                if (this.donutChart == null) {
                    this.donutChart = new DonutChart({
                        settings: {
                            width: 220,
                            height: 220,
                            colorPalette: ['#953882', '#D2D2D2'],
                            thickness: 10,
                            centerText: {
                                styles: {
                                'fill': '#333333',
                                'font-size': '2.2rem',
                                'font-weight': 'normal',
                                'font-family': 'EricssonCapitalTT'
                                },
                                heightTransform: 10
                            }
                        }
                    });

                    this.progressElement.find(".eaWfsDemo-WfProgress-donut").append(this.donutChart.getElement());
                }

                this.donutChart.update({
                    items: [
                        {label: "complete", value: this.percentComplete},
                        {label: "remaining", value: 100-this.percentComplete}
                    ],
                    centerText: this.percentComplete+'%'
                });
            },

            showDiagram: function() {
                if (this.progressDiagram && this.progressDiagram != null) {
                    this.progressDiagram.destroy();
                }
                this.progressDiagram = new WfProgressDiagram(this.options);
                this.regionEventBus.publish("display-element", ["ProgressDiagram", this.progressDiagram]);
            },
                        
            hideDiagram: function() {
                this.progressDiagram.destroy();
            },
       
            handlePushEvent: function(pushEvent) {
                if ( pushEvent.workflowInstanceId == this.workflowInstanceId) {
                    if ( !this.refreshRequested ) {
                        setTimeout(function () {  
                                this.regionEventBus.publish("progress-refresh", {workflowInstanceId : this.workflowInstanceId, 
                                                                                workflowDefinitionId : this.workflowDefinitionId});
                        }.bind(this), 1000);
                    }
                    this.refreshRequested = true;
                }                
            }

        });

});
