// Workflow diagram

define([
    "jscore/core",
    "wfs/WfDefinitionClient",
    "bpmn/Bpmn",
    "bpmn/Transformer",
    "./WfDiagramView"
    ], function(core, WfDefinitionClient, Bpmn, Transformer, View) {

       return core.Widget.extend({

            view: function() {
                // provide 'wfDefinitionId' to handlebars
                return new View({xid: this.options.xid, wfDefinitionId: this.options.wfDefinitionId});
            },

            onViewReady: function() {
                // TODO - query for workflow name rather than require clients to provide it

                this.xid = this.options.xid;
                this.workflowName = this.options.wfName;
                this.wfDefinitionId = this.options.wfDefinitionId;
                this.highlights = this.options.highlights;
                this.countBadges = this.options.countBadges;

              	// Get and render start form - note form is optional
                WfDefinitionClient.getWfDiagramXml({
                    wfDefinitionId: this.wfDefinitionId,
                    success: function(wfDiagramXmlModel) {
                        this.showDiagram(this.workflowName, wfDiagramXmlModel);
                    }.bind(this),
                    error: function(msg) {
                        console.log("Unable to retrieve diagram for " + this.wfDefinitionId + ". " + msg);
                    }.bind(this)
                });
            },

            showDiagram: function(workflowName, wfDiagramXmlModel) {
                var bpmn20Xml = wfDiagramXmlModel.getAttribute("bpmn20Xml");
                var diagramContentElement = this.view.getDiagramContent();

                try {
                    var semantic = new Transformer().transform(bpmn20Xml);

                    this.bpmnDiagram = new Bpmn();
                    this.bpmnDiagram.renderDiagram(semantic, {
                        xid: this.xid,
                        diagramElement : this.xid+"processDiagram_"+this.wfDefinitionId,
                        //width : 800,            // TODO - read from element and set via css
                        //height : 600
                    });                    
                    this.setHighlights(this.highlights);
                    this.setCountBadges(this.countBadges);

                } catch (err) {
                    console.log('Unable to render diagram for workflow definition ' + workflowName + ', reason: ' + err.message)
                    diagramContentElement.setText("Unable to render process diagram");
                }
                this.width = this.getElement().find("svg").find("g").getAttribute("width"); // getting width from the element//right now not using
            },

            setHighlights: function(newHighlights) {
                if (newHighlights && newHighlights != null) {
                    // remove existing highlights
                    if (this.highlights && this.highlights != null) {
                        for (var i = 0; i < this.highlights.length; i++) {
                            var highlight = this.highlights[i];
                            this.bpmnDiagram.annotation(highlight.nodeId).removeClasses([highlight.style]);
                        }
                    }

                    // add new highlights
                    for (var i = 0; i < newHighlights.length; i++) {
                        var highlight = newHighlights[i];
                        this.bpmnDiagram.annotation(highlight.nodeId).addClasses([highlight.style]);
                    }
                    this.highlights = newHighlights;
                }
            },

            setCountBadges: function(newCountBadges) {
                if (newCountBadges && newCountBadges != null) {
                    // remove existing badges
                    if (this.countBadges && this.countBadges != null) {
                        for (var i = 0; i < this.countBadges.length; i++) {
                            var countBadge = this.countBadges[i];
                            // TODO - remove div
                        }
                    }

                    // add new badges
                    for (var i = 0; i < newCountBadges.length; i++) {
                        var countBadge = newCountBadges[i];
                        this.bpmnDiagram.annotation(countBadge.nodeId).
                            addDiv('<p class="badge">' + countBadge.count + '</p>', ['badge-position']);
                    }
                    this.countBadges = newCountBadges;
                }
            }

        });
});