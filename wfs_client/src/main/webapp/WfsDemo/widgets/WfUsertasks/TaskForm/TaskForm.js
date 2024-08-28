// Usertask form widget

define([
    "jscore/core",
    "wfs/WfUsertaskClient",
    "wfs/WfInstanceClient",
    "../../WfForm/WfForm",
    "../../ErrorDialog/ErrorDialog",
    "./TaskFormView"
    ], function(core, WfUsertaskClient, WfInstanceClient, WfForm, ErrorDialog, View) {

       return core.Widget.extend({

            view: function() {
                // expose 'taskName' for handlebars
                var taskName = this.options.wfUsertaskModel.getAttribute("name");
                return new View({taskname: taskName});
             },

            onViewReady: function() {
                this.wfUsertaskModel = this.options.wfUsertaskModel;
                this.taskHandledCallback = this.options.taskHandledCallback;
                this.usertaskId = this.options.wfUsertaskModel.getAttribute("id");
                this.usertaskName = this.wfUsertaskModel.getAttribute("name");
                this.workflowInstanceId = this.options.wfUsertaskModel.getAttribute("workflowInstanceId");

            	// [TODO - claim task]

                this.getAndRenderForm();
                if (this.options.minHeight) {
                    this.getElement().setStyle("min-height", this.options.minHeight);
                }
            },

            getAndRenderForm: function(usertaskId, workflowInstanceId) {
                // Get and render form - note form is optional
                WfUsertaskClient.getFormModelByUsertaskId({
                    usertaskId: this.usertaskId,
                    success: function(wfUsertaskFormModel) {
                        // Add 'standard' cancel and submit buttons and handlers
                        var cancelButton = this.view.getCancelButton();
                        cancelButton.addEventHandler("click", function() {
                            this.handleCancel();
                        }.bind(this));

                        var submitButton = this.view.getSubmitButton();
                        submitButton.addEventHandler("click", function() {
                            this.handleSubmit(wfUsertaskFormModel);
                        }.bind(this));

                        if (wfUsertaskFormModel != null) {  // form is optional
                            // Override default button texts if defined in form model
                            if (wfUsertaskFormModel.getAttribute("cancelText") != null) {
                                cancelButton.setText(wfUsertaskFormModel.getAttribute("cancelText"));
                            }
                            if (wfUsertaskFormModel.getAttribute("submitText") != null) {
                                submitButton.setText(wfUsertaskFormModel.getAttribute("submitText"));
                            }
                            this.getVariablesAndRenderForm(wfUsertaskFormModel);
                        }

                    }.bind(this),
                    error: // WfUsertaskClient.getFormModelByUsertaskId
                        function(msg) {
                            this.handleError("Unable to retrieve form for \"" + this.usertaskName + "\"", [msg]);
                    }.bind(this)
                });
            },

            getVariablesAndRenderForm: function(wfUsertaskFormModel) {
                // Get variables for workflow instance and use in form creation
                WfInstanceClient.getVariables({
                    wfInstanceId: this.workflowInstanceId,
                    success: function(wfVariableCollection) {
                        try {
                            // Create and append form
                            this.form = new WfForm({formModel: wfUsertaskFormModel, variableCollection: wfVariableCollection});
                            this.form.attachTo(this.view.getFormContent());             
                        }
                        catch (err) {
                            this.handleError("Unable to build form for " + this.usertaskName, [err]);        
                        }
                    }.bind(this),
                    error: // WfInstanceClient.getVariables
                        function(msg) {
                            this.handleError("Unable to retrieve variables for \"" + this.usertaskName + "\"", [msg]);
                    }.bind(this)
                });
            },
//////////////////////////////////// for testing, not used. it adds location maps to the form
            showMap: function() {
                
                var maps = {"EPG": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d608639.5237634394!2d-7.900877228572618!3d53.42380099321005!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x485c4979c808ca15%3A0x4d1f49710c177939!2sGarrycastle+Cottages!5e0!3m2!1sen!2sie!4v1399382552460",
                            "PGW": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d609379.7002018099!2d-7.831164160156298!3d53.37208086506881!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4867094acc51a4ed%3A0x977d48b6e6b2197f!2sEricsson!5e0!3m2!1sen!2sie!4v1399385721197",
                            "GW": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d612785.8806186015!2d-7.581850087768572!3d53.33623216625395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x485b5e98212e5873%3A0xca7febf3aac3fc2d!2sUniversity+of+Limerick!5e0!3m2!1sen!2sie!4v1399386001969"
                            }

                var selectBox = this.form.controlWidgets[0].libWidget;
                if(selectBox != null) {
                    var val = selectBox.getValue().name;
                    if(maps[val] == null) 
                        this.view.getInfoPanel().setStyle("height", "0px");
                    else
                        this.view.getInfoPanel().setStyle("height", "450px");
                    this.view.getInfoPanel().setAttribute('src', maps[val]); 

                    var that = this;
                    selectBox.addEventHandler("change", function() { 
                        val = selectBox.getValue().name;
                        if(maps[val] == null) 
                            that.view.getInfoPanel().setStyle("height", "0px");
                        else
                            that.view.getInfoPanel().setStyle("height", "450px");
                        that.view.getInfoPanel().setAttribute('src', maps[val]);
                    });  
                }             
            },
///\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
            handleSubmit: function(wfUsertaskFormModel) {
                // Get variables from form
                var variables = this.form.getVariables();

                if(variables == null)
                        return;                                     ///// exiting the function as validation fails
                // complete task
                WfUsertaskClient.completeUsertaskById({
                    usertaskId: this.usertaskId,
                    variables: variables,
                    success: function() {
                        this.taskHandledCallback(true); // something changed
                    }.bind(this),
                    error: function(msg) {
                        this.handleError("Unable to complete task  \"" + this.usertaskName + "\"", [msg]);
                    }.bind(this)
                });
            },

            handleCancel: function() {
            	// [TODO - release task]
            	this.taskHandledCallback(false);       // nothing changed
            },

            handleError: function(title, messages) {
                // Build displayable message
                var message = " ";
                if (messages != null && messages.length > 0) {
                    for (var i = 0; i < messages.length; i++) {
                        message += messages[i] + " ";
                    }
                }

                new ErrorDialog({title: title, message: message});
                this.taskHandledCallback(false);
            }

        });
});