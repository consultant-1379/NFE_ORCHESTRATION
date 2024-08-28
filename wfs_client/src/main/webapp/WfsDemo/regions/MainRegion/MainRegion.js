// Main region. Instantiates main widgets.
//// create tabs in main page. setup those tabs' naming and events. create Layout widgets  and place app widgets to required position in layout widget.
define([
    "jscore/core",
    "../../widgets/WfDefinitions/WfDefinitions",
    "../../widgets/WfInstances/WfInstances",
    "../../widgets/WfUsertasks/WfUsertasks",
    "../../widgets/WfDetails/WfDetails",
    "../../push/WfPush",
    "./MainRegionView",
    "../../widgets/WfProgress/WfProgress",
    "../../widgets/LayoutWidget/LayoutWidget"
], function(core, WfDefinitions, WfInstances, WfUsertasks, WfDetails, WfPush, View, WfProgress, LayoutWidget) {

    return core.Region.extend({

        View: View,
    
        onStart: function() {

            this.regionEventBus1 = new core.EventBus();     //// event buses for different tabs
            this.regionEventBus2 = new core.EventBus();
            this.regionEventBus3 = new core.EventBus();

            this.setupTab();                                //// initial configuration of tabs including click events etc.
//// tab 1 -> layout creation > layout attach to respective tab > instantiate widgets to respective position in layout with widget options
            this.layoutWfDefinition = new LayoutWidget({rows :1, columns : 2, rowHeight: [100], columnWidth: [40,60], name: "eaWfsDemo-mainTabs-contentWfDefinition", overflow: null});   
            this.layoutWfDefinition.attachTo(this.view.getWfDefinitionContent());
            this.instantiateWidget("layoutWfDefinition", "row1-column1", WfDefinitions, {regionEventBus: this.regionEventBus1});
            this.instantiateWidget("layoutWfDefinition", "row1-column2", WfDetails, {regionEventBus: this.regionEventBus1});

//// tab 2 -> layout creation > layout attach to respective tab > instantiate widgets to respective position in layout with widget options
            this.layoutWfActive = new LayoutWidget({rows :2, columns : 2, rowHeight: [60, 40], columnWidth: [40,60], name: "eaWfsDemo-mainTabs-contentWfActive"});   
            this.layoutWfActive.attachTo(this.view.getWfActiveContent());
            this.instantiateWidget("layoutWfActive", "row1-column1", WfInstances, {regionEventBus: this.regionEventBus2, showingProgress: true, showingDiagram: true, filterValueActive: true});
            this.instantiateWidget("layoutWfActive", "row1-column2", WfProgress, {regionEventBus: this.regionEventBus2});
            this.instantiateWidget("layoutWfActive", "row2-column1", WfUsertasks, {regionEventBus: this.regionEventBus2, showingProgress: false, showingDiagram: false});
            this.instantiateWidget("layoutWfActive", "row2-column2", WfDetails, {regionEventBus: this.regionEventBus2});

//// tab 3 -> outer layout creation > Inner layout in second column > layout attach to respective tab > instantiate widgets to respective position in layout with widget options            
            this.layoutWfHistory = new LayoutWidget({rows :1, columns : 2, rowHeight: [100], columnWidth: [40,60], name: "eaWfsDemo-mainTabs-contentWfHistory"}); 
            this.layoutWfHistory2 = new LayoutWidget({rows :2, columns : 1, rowHeight: [50, 50], columnWidth: [100], name: "eaWfsDemo-mainTabs-contentWfHistory-column2"});
            this.layoutWfHistory2.attachTo(this.layoutWfHistory.cell['row1-column2']);  
            this.layoutWfHistory.attachTo(this.view.getWfHistoryContent());
            this.instantiateWidget("layoutWfHistory", "row1-column1", WfInstances, {regionEventBus: this.regionEventBus3, filterValueActive: false});
            this.instantiateWidget("layoutWfHistory2", "row1-column1", WfDetails, {regionEventBus: this.regionEventBus3});
            this.instantiateWidget("layoutWfHistory2", "row2-column1", WfProgress, {regionEventBus: this.regionEventBus3});
                       
            this.changeTab("WfHistory");
            this.changeTab("WfActive"); 

            this.instantiatePushWidget(WfPush, "wfpush");
        },

        setupTab: function() {
            this.previousTab = "WfDefinition";
            this.view.getWfDefinitionTab().addEventHandler("click", function() {
                if (this.previousTab != "WfDefinition") {
                    this.changeTab("WfDefinition");
                }
            }.bind(this));


            this.view.getWfActiveTab().addEventHandler("click", function() {
                if (this.previousTab != "WfActive") {
                    this.changeTab("WfActive");
                }
            }.bind(this));

            this.view.getWfHistoryTab().addEventHandler("click", function() {
                if (this.previousTab != "WfHistory") {
                    this.changeTab("WfHistory");
                }
            }.bind(this));
        },

        changeTab: function(tabName) {
            this.view["get"+this.previousTab+"Tab"]().setModifier("selected", "false");
            this.view["get"+this.previousTab+"Content"]("home").setStyle("display", "none");
            this.view["get"+tabName+"Tab"]().setModifier("selected", "true");
            this.view["get"+tabName+"Content"]("home").setStyle("display", "block");
            this.previousTab = tabName;
        },

        instantiateWidget: function(tabName, element, widget, options) {
            var that = this;
            if(widget == WfProgress)
                options.regionEventBus.subscribe("display-progress", function (progress) { 
                progress[1].attachTo(that[tabName].cell[element]); 
                });
            else {       
                var tempWidget = new widget(options); 
                tempWidget.attachTo(this[tabName].cell[element]);
            }                     
        },        
        
        instantiatePushWidget: function(widget, variableName) {           
            this[variableName] = new widget({regionEventBus: this.regionEventBus});            
        }

    });

});