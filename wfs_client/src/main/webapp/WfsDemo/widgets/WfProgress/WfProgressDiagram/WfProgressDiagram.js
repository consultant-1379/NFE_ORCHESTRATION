// Workflow progress widget

define([
    "jscore/core",
    "widgets/Tooltip",
    "../WfProgressModel",
    "../../WfDiagram/WfDiagram",
    "./WfProgressDiagramView"
    ], function(core, Tooltip, WfProgressModel, WfDiagram, View) {

  return core.Widget.extend({

            View: View,

            onViewReady: function() {
                this.handleOptions();

                this.subscribeForEvents();

                this.setupBackButton();
                this.hideBackButton();

                this.activeWorkflowDefinitionId = this.workflowDefinitionId;
                this.activeWorkflowInstanceId = this.workflowInstanceId;
                this.showingChild = false;

                this.showDiagram();
            },

            handleOptions: function() {
                this.regionEventBus = this.options.regionEventBus;
                this.workflowDefinitionId = this.options.ids.workflowDefinitionId;
                this.workflowName = this.options.ids.workflowName;
                this.workflowInstanceId = this.options.ids.workflowInstanceId;
            },

            subscribeForEvents: function() {
                this.progressEventChannel = this.regionEventBus.subscribe("progress-event", function(pushEvent) {     
                    this.handlePushEvent(pushEvent);
                }.bind(this));
            },

            unsubscribeForEvents: function() {
                if (hasOwnProperty('progressEventChannel')) {
                    this.regionEventBus.unsubscribe("progress-event", this.progressEventChannel);
                }
                delete this.progressEventChannel;
            },

            setupBackButton: function() {
                var backButton = this.view.getBackButton();
                backButton.addEventHandler("click", function (e) {
                    if (this.showingChild == true) {
                        this.activeWorkflowDefinitionId = this.workflowDefinitionId;
                        this.activeWorkflowInstanceId = this.workflowInstanceId;
                        this.showingChild = false;
                        this.hideBackButton();
                        this.redrawDiagram();
                    }
                }.bind(this), this);

                // Diagram button tooltip
                var backButtonTooltip = new Tooltip({
                    parent: backButton,
                    enabled: true,
                    contentText: 'Back to parent',
                    modifiers: [{name: 'size', value: 'large'}]
                });
                backButtonTooltip.attachTo(this.getElement());
            },

            showBackButton: function() {
                this.view.getBackButton().setStyle("visibility", "visible");
            },

            hideBackButton: function() {
                this.view.getBackButton().setStyle("visibility", "hidden");
            },

            showDiagram: function() {
                // Build progress models
                WfProgressModel.build({
                    workflowDefinitionId: this.activeWorkflowDefinitionId, 
                    workflowInstanceId: this.activeWorkflowInstanceId,
                    success: function(progressModels) {
                        this.wfStructureModel = progressModels.wfStructureModel;
                        this.wfProgressModel = progressModels.wfProgressModel;
                        this.keyableStatus = progressModels.keyableStatus;
                        this.keyableCount = progressModels.keyableCount;
                        this.percentComplete = progressModels.percentComplete;
                        this.calledWorkflows = progressModels.calledWorkflows;

                        var overlays = this.buildOverlays(this.keyableStatus, this.keyableCount);

                        this.bpmnDiagram = new WfDiagram({  xid: "prg-",
                                                            wfDefinitionId: this.activeWorkflowDefinitionId,
                                                            wfName: this.workflowName,
                                                            highlights: overlays.highlights,
                                                            countBadges: overlays.countBadges });

                        this.bpmnDiagram.attachTo(this.view.getDiagramContent());

                        this.addCalledWorkflows();

                    }.bind(this),
                    error: function(err) {
                        console.log(err);       // TODO - recommended UI SDK logging ?
                    }.bind(this)
                });
            },

            buildOverlays: function(keyableStatus, keyableCount){
                var highlights = [];
                var countBadges = [];
                for (var key in keyableStatus) {
                    var status = keyableStatus[key];
                    if (status && status != null && status !== "") {
                        highlights.push({nodeId: key, style: "highlight-"+status});
                        var count = keyableCount[key];
                        if (count && count > 0) {
                            if ((count > 1) || (count == 1 && status === "Started")) {
                                countBadges.push({nodeId: key, count: count});
                            }
                        }
                    }
                }
                return {highlights: highlights, countBadges: countBadges};
            },

            addCalledWorkflows: function() {
                prgdiagRenderCallActProgress = function(childExecutionId, childDefinitionId) {                           
                    if (this.showingChild == true) {
                        throw "Only one level of call activity supported";
                    }
                    this.activeWorkflowDefinitionId = childDefinitionId;
                    this.activeWorkflowInstanceId = childExecutionId;
                    this.showingChild = true;
                    this.showBackButton();
                    this.view.getCalledContent().children()[0].remove();

                    this.redrawDiagram();

                }.bind(this);

                if (this.calledWorkflows.length > 0) {
                    var html = "<table><tr>";
                    html += "<td>Called workflow instances: </td>";
                    for (var i = 0; i < this.calledWorkflows.length; i++) {
                        var called = this.calledWorkflows[i];
                        html += "<td class='eaWfsDemo-WfProgressDiagram-calledInstance'>"
                        html += "<a href='#'  class='ebBreadcrumbs-link' onclick=\"prgdiagRenderCallActProgress(\'" + called.childExecutionId + "\','" + called.childDefinitionId+ "\')\">";
                        html += called.activityName;
                        html += "</a>";
                        html += "</td>"
                    }
                    html += "</tr></table>";

                    calledElement = core.Element.parse(html);

                    var calledContent = this.view.getCalledContent();
                    var children = calledContent.children();
                    if (children.length != 0) {
                        children[0].remove();
                    }
                    calledContent.append(calledElement);
                }
            },

            redrawDiagram: function() {
                if (this.hasOwnProperty('bpmnDiagram')) {
                    this.bpmnDiagram.destroy();
                    delete this.bpmnDiagram;
                    this.showDiagram();
                }
            },

            updateProgress: function() {
                // Build progress models
                WfProgressModel.build({
                    workflowDefinitionId: this.activeWorkflowDefinitionId, 
                    workflowInstanceId: this.activeWorkflowInstanceId,
                    success: function(progressModels) {
                        this.keyableStatus = progressModels.keyableStatus;
                        this.keyableCount = progressModels.keyableCount;
                        this.percentComplete = progressModels.percentComplete;
                        this.calledWorkflows = progressModels.calledWorkflows;

                        var overlays = this.buildOverlays(this.keyableStatus, this.keyableCount);
                        this.bpmnDiagram.setHighlights(overlays.highlights);
                        this.bpmnDiagram.setCountBadges(overlays.countBadges);

                        this.addCalledWorkflows();

                    }.bind(this),
                    error: function(err) {
                        console.log(err);       // TODO - recommended UI SDK logging ?
                    }.bind(this)
                });
            },

            handlePushEvent: function(pushEvent) {
                if ( pushEvent.workflowInstanceId == this.activeWorkflowInstanceId) {
                    setTimeout(function () {
                        this.updateProgress();
                    }.bind(this), 1000);
                }                
            }

        });

});
