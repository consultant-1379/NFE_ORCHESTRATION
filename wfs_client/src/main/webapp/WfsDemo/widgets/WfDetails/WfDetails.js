// Workflow definitions widget

define([
    "jscore/core",
    "../WfDiagram/WfDiagram",
    "./WfDetailsView"
    ], function(core, WfDiagram, View) {

       return core.Widget.extend({

            View: View,

            onViewReady: function() {
                this.regionEventBus = this.options.regionEventBus;
                this.regionEventBus.subscribe("display-element", function (details) {
                    this.doDisplayElement(details);
                }.bind(this));

	            this.previousTab = "DefinitionDiagram";
	            this.view.getDefinitionDiagramTab().addEventHandler("click", function() {
	            	if (this.previousTab != "DefinitionDiagram") {
		                this.changeTab("DefinitionDiagram");
	            	}
	            }.bind(this));

	            this.view.getProgressDiagramTab().addEventHandler("click", function() {
	            	if (this.previousTab != "ProgressDiagram") {
		                this.changeTab("ProgressDiagram");
	            	}
	            }.bind(this));

	            this.view.getUsertaskDiagramTab().addEventHandler("click", function() {
	            	if (this.previousTab != "UsertaskDiagram") {
		                this.changeTab("UsertaskDiagram");
	            	}
	            }.bind(this));

            },

            doDisplayElement: function(details) {
            	var selection = details[0];
            	var diagram = details[1];

            	var content = this.view["get"+selection+"Content"]();
                var children = content.children();
                if (children.length != 0) {
                    children[0].remove();
                }

                diagram.attachTo(content);

           		this.changeTab(selection);
            },
            
	        changeTab: function(tabName) {
	            this.view["get"+this.previousTab+"Tab"]().setModifier("selected", "false");
	            this.view["get"+this.previousTab+"Content"]().setStyle("display", "none");
	            this.view["get"+tabName+"Tab"]().setModifier("selected", "true");
	            this.view["get"+tabName+"Content"]().setStyle("display", "block");
	            this.previousTab = tabName;
	        }

        });
});