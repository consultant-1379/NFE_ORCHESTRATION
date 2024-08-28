define('wfs/WfUsertaskClient',[
    'jscore/core',
    "jscore/ext/mvp",
    "jscore/ext/net",
    "wfs/WfClientCommon"
], function(core, mvp, net, WfClientCommon) {
    
    /**
     * The wfs.WfUsertaskClient package provides WorkflowService workflow usertask functionality for apps.
     *
     * TODO: unit + acceptance tests
     *
     * @class wfs.WfUsertaskClient
     */
    var WfUsertaskClient = {};

   /**
     * Gets all workflow usertasks that satify the supplied filter parameters.
     *
     * The following options are accepted:
     *   <ul>
     *       <li>success: success callback which is a mandatory option. Receives wfUsertaskCollection containing wfUsertaskModel's as an argument.
     *                    A wfUsertaskModel contains the following attributes: 
     *                    "id", "definitionId", "name", "created", "workflowDefinitionId", "workflowInstanceId"
     *       </li>
     *       <li>error: error callback. Receives the response as an argument./li>
     *       <li>sortBy: valid values are "created" or "name"./li>
     *       <li>sortOrder: valid values for "sortOrder" are "asc" or"desc"/li>
     *       <li>offset: pagination of results. Specifies the index of the first result to return./li>
     *       <li>limit: pagination of results. Specifies the max number of results to return/li>
     *   </ul>  
     *
     * @method getAllUsertasks
     * @param options
     * @return
     */
    WfUsertaskClient.getUsertasks = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        // Build URL
        var url = "/WorkflowService/oss/rest/services/wfs/default/usertasks";

        // options: 'sortBy', 'sortOrder'
        if (options.sortBy != null) {
            if (["name", "created"].indexOf(options.sortBy) == -1) {
                throw new Error("Invalid sortBy value: " + sortBy);
            }
            url += "?orderBy=" + options.sortBy;
            if (options.sortOrder != null) {
                if (["asc", "desc"].indexOf(options.sortOrder) == -1) {
                    throw new Error("Invalid sortOrder value: " + sortOrder);
                }
                url += "&order=" + options.sortOrder;
            }
        }

        // paging, index of first result to return
        if (options.offset != null) {
            url += "&offset=" + options.offset;
        }

        // paging, limits the number of results
        if (options.limit != null) {
            url += "&limit=" + options.limit;
        }

        // Retrieve collection from server
        var serverCollection = new mvp.Collection([], {url: url});
        serverCollection.fetch({
            success: function(wfUsertaskCollection) {
                options.success.call(this, wfUsertaskCollection);
            },
            error: function(model, response, options) {
                if (options.error) {
                    options.error.call(this, response);
                }
            }
        });

    };
    

    /**
     * Gets number of usertasks that satisfy the supplied filter parameters.
     *
     * The following options are accepted:
     *   <ul>
     *       <li>success: success callback which is a mandatory option. Receives the usertask count as an argument./li>
     *       <li>error: error callback. Receives the response as an argument./li>
     *   </ul>   
     *
     * @method getUsertasksCount
     * @param options
     * @return 
     */
    WfUsertaskClient.getUsertasksCount = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        // Build URL
        var url = "/WorkflowService/oss/rest/services/wfs/default/usertasks/count";

        // Retrieve collection from server
        var serverCollection = new mvp.Collection([], {url: url});
        serverCollection.fetch({
            success: function(data) {
                var count = data._collection.models[0].getAttribute("count");
                options.success.call(this, count);
            },
            error: function(model, response, options) {
                if (options.error) {
                    options.error.call(this, response);
                }
            }
        });
    };
    
    /**
     * Get usertask form model.
     * The options object must provide "usertaskId".
     * The options object must provide "success" callback and may also provide "error" callback.
     * If a form is defined for the usertask the "success" callback passes a wfUsertaskFormModel object
     * which contains the following attributes: 
     *  "formInfo", "submitText", "cancelText", "controlGroups"
     * If no usertask form is defined for the usertask the "success" callback passes 'null'.
     *
     * @method getFormModelByUsertaskId
     * @param options
     * @return {mvp.Model} model
     */
    WfUsertaskClient.getFormModelByUsertaskId = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.usertaskId == null || options.usertaskId == "") {
            throw new Error("usertaskId missing");
        }

        // Build URL
        var url = "/engine-rest/engine/default/task/" + options.usertaskId + "/form";

        // Retrieve form key from server
        var wfUsertaskFormKey = new mvp.Model([], {url: url});
        wfUsertaskFormKey.fetch({
            success: function(formKeyModel) {
                if (formKeyModel.getAttribute("key") == null) {  // form optional
                    options.success.call(this, null);
                }
                else {                  // Retrieve form model from server
                    try {
                        var formContextPath = formKeyModel.getAttribute("contextPath");
                        var formKey = formKeyModel.getAttribute("key");
                        var formInfo = WfClientCommon.extractFormInfo(formKey);
                        var formUrl = formContextPath + "/" + formInfo.path;
                        net.ajax({
                            url: formUrl,
                            type: "GET",
                            dataType: formInfo.format,
                            success: function(formData) {
                                // TODO - if possible remove this conversion when implement own REST API
                                // Build model to return
                                var wfUsertaskFormModel = new mvp.Model();

                                // check form modelType match
                                if (formData.modelType != formInfo.modelType) {
                                    handleError(options, "Form modelType mismatch, " + formData.modelType + "!=" + formInfo.modelType);
                                }

                                wfUsertaskFormModel.setAttribute("formInfo", formInfo);
                                wfUsertaskFormModel.setAttribute("submitText", formData.submitText);
                                wfUsertaskFormModel.setAttribute("cancelText", formData.cancelText);
                                wfUsertaskFormModel.setAttribute("controlGroups", formData.controlGroups);
                                options.success.call(this, wfUsertaskFormModel);
                            },
                            error: function(err) {
                                handleError(options, err);
                            }
                        });
                    }
                    catch (err) {
                        handleError(options, err);
                    }
                }
            },
            error: function(err) {
                handleError(options, err);
            }
        });

        var handleError = function(options, err) {
            if (options.error) {
                options.error.call(this, err);
            }
            console.log(err);
        }
    };
    
    /**
     * Start workflow instance.
     * The options object must provide "usertaskId", and may optionally provide "variables".
     * The options object must provide "success" callback and may also provide "error" callback.
     * "success" callback passes nothing
     *
     * @method completeUsertaskById
     * @param options
     * @return none
     */
    WfUsertaskClient.completeUsertaskById = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.usertaskId == null || options.usertaskId == "") {
            throw new Error("usertaskId missing");
        }

        // Build URL
        var url = "/engine-rest/engine/default/task/" + options.usertaskId + "/complete";
        
        var data = { variables: options.variables };
        net.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json;charset=UTF-8",
            processData: false,
            success: function() {
                options.success.call(this);
            },
            error: function(errorThrown) {
                if (options.error) {
                    options.error.call(this, errorThrown);
                }
            }
        });
    };
    
	return WfUsertaskClient;
});    
