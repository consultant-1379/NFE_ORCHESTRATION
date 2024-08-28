// Workflow definitions widget

define([
    "jscore/core",
    "./WfDefinitionsTable/WfDefinitionsTable",
    "./CreateWfInstanceForm/CreateWfInstanceForm",
    "../WfDiagram/WfDiagram",
    "./WfDefinitionsView"
    ], function(core, WfDefinitionsTable, CreateWfInstanceForm, WfDiagram, View) {

       return core.Widget.extend({

            View: View,

            onViewReady: function() {
                this.regionEventBus = this.options.regionEventBus;

                // TODO: 'something-changed' is a hack/workaround for lack of UI push, and will be removed when UI push supported.
                this.regionEventBus.subscribe("something-changed", function (whatChanged) {
                    // nothing to do for now
                }.bind(this));

                // Set up filter, default is show latest versions only
                this.currentFilterShowAll = false;
                this.view.getFilterLink().setText("All versions");
                this.view.getFilterLink().addEventHandler("click", function() {
                    this.filterLinkClicked();
                }.bind(this));

/////////////////////////// 
                 this.view.getRefressButton().addEventHandler("click", function() {
                    this.refreshButtonClicked();
                }.bind(this));
                            
                this.CreateWfInstanceForm = null;

                this.showTable()
            },
///////////////////////////////// added later to provide refresh functionality
            refreshButtonClicked: function() {
                this.hideTable();
                this.showTable();
                this.bpmnDiagram.destroy();
            },

            filterLinkClicked: function() {
                // Toggle filter
                this.currentFilterShowAll = !this.currentFilterShowAll;
                if (this.currentFilterShowAll) {
                    this.view.getFilterLink().setText("Latest version");
                } else {
                    this.view.getFilterLink().setText("All versions");
                }

                // Redisplay table
                this.hideTable();
                this.showTable();
            },
            
            showTable: function() {
                this.hideTable();

                // Build and display table
                this.WfDefinitionsTable = new WfDefinitionsTable({showAllVersions: this.currentFilterShowAll});
                this.WfDefinitionsTable.attachTo(this.view.getTableContent());
                if (this.tableContentHeight) {
                    this.view.getTableContent().setStyle("height", this.tableContentHeight);
                }

                // Add handler for 'create instance' table action
                this.WfDefinitionsTable.getEventBus().subscribe("createinstance", function(wfDefinitionModel) {
                    this.createInstance(wfDefinitionModel);
                }.bind(this));

                // Add handler for 'show diagram' table action
                this.WfDefinitionsTable.getEventBus().subscribe("showdiagram", function(wfDefinitionModel) {
                    this.bpmnDiagram = new WfDiagram({  xid: "def-",
                                                        wfDefinitionId: wfDefinitionModel.getAttribute("id"),
                                                        wfName: wfDefinitionModel.getAttribute("name") });
                    this.regionEventBus.publish("display-element", ["DefinitionDiagram", this.bpmnDiagram]);
                }.bind(this));
            },

            hideTable: function() {
                if (this.WfDefinitionsTable != null) {
                    this.tableContentHeight = this.view.getTableContent().getStyle("height");
                    this.WfDefinitionsTable.destroy();
                    this.WfDefinitionsTable = null;
                    this.view.getTableContent().setStyle("height", "0px");
                }
            },

            showCreateInstanceForm: function(wfDefinitionModel) {
                this.hideCreateInstanceForm();
                // Build and show 'create instance' form
                this.CreateWfInstanceForm = new CreateWfInstanceForm({minHeight: this.tableContentHeight, wfDefinitionModel:wfDefinitionModel, createHandledCallback:this.createHandledCallback.bind(this)});
                this.CreateWfInstanceForm.attachTo(this.view.getFormContent());
            },

            hideCreateInstanceForm: function() {
                if (this.CreateWfInstanceForm != null) {
                    this.CreateWfInstanceForm.destroy();
                }
                this.CreateWfInstanceForm = null;
            },

            createInstance: function(wfDefinitionModel) {
                this.hideTable();
                this.showCreateInstanceForm(wfDefinitionModel);
            },

            createHandledCallback: function(somethingChanged) {
                this.hideCreateInstanceForm();
                if(this.bpmnDiagram) this.bpmnDiagram.destroy();
                this.showTable();
                if (somethingChanged == true) {
                    setTimeout(function() {
                        this.regionEventBus.publish("something-changed", "wfinstances");
                    }.bind(this), 2000);
                }
            }

        });
});