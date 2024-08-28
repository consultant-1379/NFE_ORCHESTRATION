// Workflow instances widget.
// Provides a table of workflow instances and can show progress for specific instance

define([
    "jscore/core",
    "widgets/SelectBox",
    "widgets/Pagination",
    "../WfProgress/WfProgress",
    "./WfInstancesTable/WfInstancesTable",
    "./WfInstancesView",
    "wfs/WfInstanceClient",
    "../WfUsertasks/TaskForm/TaskForm"
    ], function(core, SelectBox, Pagination, WfProgress, WfInstancesTable, View, WfInstanceClient, TaskForm) {

       return core.Widget.extend({

            View: View,

            onViewReady: function() {
                this.regionEventBus = this.options.regionEventBus;
                this.refreshButtonVisible = (this.options.refreshButtonVisible != null) ? this.options.refreshButtonVisible : true; //////binary true false
                this.filterValueActive = (this.options.filterValueActive !=null) ? this.options.filterValueActive : true; //////// selection to present desired view
                this.allowPagination = (this.options.allowPagination !=null) ? this.options.allowPagination : false; //////// selection to turn pagination on off//currently off due to some contradiction table row selection
                this.showingProgress = (this.options.showingProgress != null) ? this.options.showingProgress : true; /////////option to show progress diagram 
                this.showingDiagram = (this.options.showingDiagram != null) ? this.options.showingDiagram : true; /////////option to show progress diagram
                 // Register listener to refresh progress based on child work flow exection id.
                 this.regionEventBus.subscribe("progress-refresh", function (refresh) {
                    if (refresh.subProcessId) {
                        this.progressIds.subProcessId = refresh.subProcessId;
                    } else if (refresh.childExecutionId) {
                        this.progressIds.childExecutionId = refresh.childExecutionId;
                        this.progressIds.childDefinitionId = refresh.childDefinitionId; 
                    } else {
                        this.progressIds.workflowInstanceId = refresh.workflowInstanceId;
                        this.progressIds.workflowDefinitionId = refresh.workflowDefinitionId; 
                    }
                 
                    this.hideProgress();
                    this.showProgress(this.progressIds, (refresh.showingDiagram && refresh.showingDiagram === true) ? true : false);
                }.bind(this));

////////////////////////// filterValue variable added for default choice of value from options. by default it shows Active values.
 ////////////// (last 20) feature is disables due to pagination's interference with refresh.

                if(this.filterValueActive == true) 
                    this.filterValue = {name: 'Active', value: {liveView:false, historicView:false}};
                else
                    this.filterValue = {name: 'Historic', value: {liveView:false, historicView:true}};

                this.selectBox = new SelectBox({                   
                  value: this.filterValue,  
                  items: [
                    {name: 'Active', value: {liveView:false, historicView:false}, title: 'View all active workflow instances'},
                    {name: 'Active Live (Last 20)', value: {liveView:true, historicView:false}, title: 'View the 20 most recently started workflow instances'},
                    {name: 'Historic', value: {liveView:false, historicView:true}, title: 'View all completed workflow instances'},
                    {name: 'Historic Live (Last 20)', value: {liveView:true, historicView:true}, title: 'View the 20 most recently completed workflow instances'},
                  ]
                });  

                this.selectBox.attachTo(this.view.getSectionHeadingFilter());
                this.selectBox.addEventHandler("change", function() {
                    this.selectBoxChanged(); 
                }.bind(this));

                this.view.getRefreshButton().addEventHandler("click", function() {
                    this.refreshButtonClicked();
                    this.regionEventBus.publish("instanceTable-refreshed", "refresh");
                }.bind(this));                

                this.view.getRefreshButton().setStyle("visibility", (this.refreshButtonVisible == true) ? "visible" : "hidden"); 

                this.showTable();

            },

/////////// this function is disabled in the last line of showTable() as the showPagination() causes interference with "refresh"              
            selectBoxChanged: function() {
                this.hidePagination();
                this.showTable();
                if (!this.getFilterValue().liveView && this.allowPagination) {
                    this.showPagination();
                }              
            },         

            showTable: function () {
                this.hideTable();
                this.WfInstancesTable = new WfInstancesTable({
                    offset:0, 
                    limit:this.getPageLimit(),
                    sortBy : this.getFilterValue().historicView ? "endTime" : "startTime",
                    sortOrder : "desc",
                    showActive : this.getFilterValue().historicView ? false : true,
                    showCompleted : this.getFilterValue().historicView ? true : false
                });

                // subscribe for push notifications when in live view
                if (this.getFilterValue().liveView) {
                    this.WfInstancesTable.subscribeForPushEvents(this.regionEventBus);
                }

                this.WfInstancesTable.attachTo(this.view.getTableContent());
                if (this.tableContentHeight) {
                    this.view.getTableContent().setStyle("height", "auto");
                }
                this.rowSelectionHandle();                                      ///// added later to handle row selection and de-selection

                this.showExtra("Select instance for progress");
                this.selectBox.disable();                                       //// filter disabled
            },

////////////////////////////////////////// Add handler for instance selected
            rowSelectionHandle: function () {
                this.WfInstancesTable.getEventBus().subscribe("instance-selected", function(ids) { //// catches the row selected event published by WfInstanceTable
                    this.progressIds = ids;                    
                    this.regionEventBus.publish("instance-selected", ids);                          ////////linkage between instance table row selection and corresponding user task row highlight
                    
                    if(this.showingProgress) this.showProgress(ids);
                    if(this.showingDiagram) this.WfProgress.showDiagram();
                }.bind(this));

                this.WfInstancesTable.getEventBus().subscribe("instance-deselected", function(ids) { //// catches the row de-selected event published by WfInstanceTable
                    this.progressIds = ids;

                    this.regionEventBus.publish("instance-deselected", ids);
                    if(this.showingProgress) this.WfProgress.hideDiagram();
                    if(this.showingDiagram) this.hideProgress();
                    this.showExtra("Select instance for progress");
                }.bind(this));
            }, 

            refreshButtonClicked: function() {
                this.showTable();
                if(this.WfProgress != null)
                    this.WfProgress.hideDiagram();                
                this.hideProgress();                
            },
////\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            hideTable: function () {
                if (this.WfInstancesTable != null) {
                    this.tableContentHeight = this.view.getTableContent().getStyle("height");
                    this.WfInstancesTable.destroy();
                    this.WfInstancesTable = null;
                    this.view.getTableContent().setStyle("height", "0px");
                }
            },

            showPagination: function() {
                this.hidePagination();
                // Get total number of workflow instances in order to calculate the required num pages
                WfInstanceClient.getInstancesCount({
                    active: this.getFilterValue().historicView ? false : true,
                    completed: this.getFilterValue().historicView ? true : false,
                    success: function(count) {                                
                        var pages = Math.ceil(count / this.getPageLimit());
                        // Create the pagination widget
                        this.pagination = new Pagination({
                            pages: pages,
                            onPageChange: function(pageNumber) {
                                var pageOffset = (pageNumber - 1) * this.getPageLimit();
                                this.WfInstancesTable.refresh({offset:pageOffset, limit:this.getPageLimit()});
                                //this.rowSelectionHandle({showProgress: true, showDiagram: true}); ///////////////////////////
                            }.bind(this)
                        });
                        this.pagination.attachTo(this.view.getPagination());
                    }.bind(this)
                });
            },

            hidePagination: function() {
                if (this.pagination != null) {
                    this.pagination.destroy();
                    this.pagination = null;
                }
            },

            showProgress: function (ids, showingDiagram) {
                this.hideProgress();
                this.WfProgress = new WfProgress({regionEventBus: this.regionEventBus, ids: ids, 
                                                    showingDiagram: showingDiagram,
                                                    doneCallback: this.progressClosed.bind(this)});

/////////////// most important step. instead of displaying progress in its own div, it publishes the object so that main region can subscribe and place accordingly                
                this.regionEventBus.publish("display-progress", ["progress", this.WfProgress]);

                if ( ids.hasOwnProperty('childExecutionId')) {
                    this.showExtra("Showing progress for child Id: " + ids.childExecutionId.substring(0,8));
                } else {
                    this.showExtra("Showing progress for Id: " + ids.workflowInstanceId.substring(0,8));    
                }
            },

            progressClosed: function() {
                if ( this.progressIds.hasOwnProperty('childExecutionId') || this.progressIds.hasOwnProperty('subProcessId')) {
                    delete this.progressIds.childExecutionId;
                    delete this.progressIds.childDefinitionId;
                    delete this.progressIds.subProcessId;
                    this.hideProgress();
                    this.showProgress(this.progressIds, false);
                } else {
                    this.hideProgress();
                    this.selectBox.enable();
                    this.showTable();  
                    if (!this.getFilterValue().liveView && this.allowPagination) {
                        this.showPagination();
                    }  
                }  
            },

            hideProgress: function () {
                if (this.WfProgress != null) {
                   this.WfProgress.destroy();
                   this.WfProgress = null;
                }
            },

            showExtra: function (text) {
                this.view.getSectionHeadingExtra().setText(text);
            },

            getPageLimit: function() {
                
////////////////\\\\\\\\\\\\\\\\\\\\\\\\\\  eleminating pagination with limit = 500                
                return  this.getFilterValue().liveView ? 20 : 500; // return  this.getFilterValue().liveView ? 20 : 5;
            },

            getFilterValue: function() {
                return this.selectBox.getValue().value;
            }

        });
});