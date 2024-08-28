define('wfs/WfInstanceClient',[
    'jscore/core',
    "jscore/ext/mvp",
    'jscore/ext/net'    
], function(core, mvp, net) {
    
    /**
     * The wfs.WfInstanceClient package provides WorkflowService workflow instance functionality for apps.
     *
     * TODO: unit + acceptance tests
     *
     * @class wfs.WfInstanceClient
     */
    var WfInstanceClient = {};


    /**
     * Gets all workflow instances that satify the supplied filter parameters.
     *
     * The following options are accepted:
     *   <ul>
     *       <li>success: success callback which is a mandatory option. Receives wfInstanceCollection containing wfInstanceModel's as an argument.
     *                    A wfInstanceModel contains the following attributes: "id", "definitionId", "startTime" and "endTime".
     *       </li>
     *       <li>error: error callback. Receives the response as an argument./li>
     *       <li>sortBy: valid values are "startTime" or "endTime"./li>
     *       <li>sortOrder: valid values for "sortOrder" are "asc" or"desc"/li>
     *       <li>offset: pagination of results. Specifies the index of the first result to return./li>
     *       <li>limit: pagination of results. Specifies the max number of results to return/li>
     *       <li>completed: only include completed workflow instances. Valid values are "true" or "false"./li>
     *       <li>active: only include active workflow instances. Valid values are "true" or "false"./li>
     *   </ul>  
     *
     * @method getInstances
     * @param options
     * @return
     */
    WfInstanceClient.getInstances = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        // Build URL
        var url = "/engine-rest/engine/default/history/process-instance?";

        // options: 'sortBy', 'sortOrder'
        if (options.sortBy != null) {
            if (["startTime", "endTime"].indexOf(options.sortBy) == -1) {
                throw new Error("Invalid sortBy value: " + sortBy);
            }
            url += "sortBy=" + options.sortBy;
            if (options.sortOrder != null) {
                if (["asc", "desc"].indexOf(options.sortOrder) == -1) {
                    throw new Error("Invalid sortOrder value: " + sortOrder);
                }
                url += "&sortOrder=" + options.sortOrder;
            }
        }

        // paging, index of first result to return
        if (options.offset != null) {
            url += "&firstResult=" + options.offset;
        }

        // paging, limits the number of results
        if (options.limit != null) {
            url += "&maxResults=" + options.limit;
        }

        
        if (options.completed != null) {
            url += "&finished=" + options.completed;
        }

        if (options.active != null) {
            url += "&unfinished=" + options.active;
        }

        // Retrieve collection from server
        var serverCollection = new mvp.Collection([], {url: url});
        serverCollection.fetch({
            success: function(serverCollection) {
                // TODO - if possible remove this conversion when implement own REST API
                // Build collection to return
                var wfInstanceCollection = new mvp.Collection();
                serverCollection.each(function(serverModel) {
                    var wfInstanceModel = new mvp.Model();
                    wfInstanceModel.setAttribute("id", serverModel.getAttribute("id"));
                    wfInstanceModel.setAttribute("definitionId", serverModel.getAttribute("processDefinitionId"));
                    wfInstanceModel.setAttribute("startTime", serverModel.getAttribute("startTime"));
                    wfInstanceModel.setAttribute("endTime", serverModel.getAttribute("endTime"));
                    wfInstanceModel.setAttribute("superProcessInstanceId", serverModel.getAttribute("superProcessInstanceId")); ///////////newly added (already existing in the JSON)
                    wfInstanceCollection.addModel(wfInstanceModel);
                });
                options.success.call(this, wfInstanceCollection);
            },
            error: function(errorThrown) {
                if (options.error) {
                    options.error.call(this, errorThrown);
                }
            }
        });

    };



    /**
     * Gets number of workflow instances that satisfy the supplied filter parameters.
     *
     * The following options are accepted:
     *   <ul>
     *       <li>success: success callback which is a mandatory option. Receives the workflow instance count as an argument./li>
     *       <li>error: error callback. Receives the response as an argument./li>
     *       <li>completed: only include completed workflow instances. Valid values are "true" or "false"./li>
     *       <li>active: only include active workflow instances. Valid values are "true" or "false"./li>
     *   </ul>   
     *
     * @method getInstancesCount
     * @param options
     * @return 
     */
    WfInstanceClient.getInstancesCount = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        // Build URL
        var url = "/engine-rest/engine/default/history/process-instance/count?";

        if (options.completed != null) {
            url += "&finished=" + options.completed;
        }

        if (options.active != null) {
            url += "&unfinished=" + options.active;
        }

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
     * Get workflow instance variables.
     * The options object must provide "wfInstanceId".
     * The options object must provide "success" callback and may also provide "error" callback.
     * "success" callback passes a wfVariableCollection object containing wfInstanceModel's.
     * A wfInstanceModel contains the following attributes: 
     *  "name"", "type", "value"
     *
     * TODO: pagination
     *
     * @method getAllInstances
     * @param options
     * @return {mvp.Collection} collection
     */
    WfInstanceClient.getVariables = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.wfInstanceId == null || options.wfInstanceId == "") {
            throw new Error("wfInstanceId missing");
        }

        // Build URL
        var url = "/engine-rest/engine/default/process-instance/" + options.wfInstanceId + "/variables";

        // Retrieve variables from server
        // TODO - change to mvp collection fetch when own rest api implemented
        net.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data) {
                // TODO - if possible remove this conversion when implement own REST API
                // Build collection to return
                var wfVariableCollection = new mvp.Collection();
                if (data != null) {
                    for (var name in data) {
                        var wfVariableModel = new mvp.Model();
                        wfVariableModel.setAttribute("name", name);
                        wfVariableModel.setAttribute("type", data[name].type);
                        wfVariableModel.setAttribute("value", data[name].value);
                        wfVariableCollection.addModel(wfVariableModel);
                    }
                }
                options.success.call(this, wfVariableCollection);
            },
            error: function(errorThrown) {
                if (options.error) {
                    options.error.call(this, errorThrown);
                }
            }
        });

    };
    
    /**
     * Start workflow instance.
     * The options object must provide "wfDefinitionId", and may optionally provide "variables".
     * The options object must provide "success" callback and may also provide "error" callback.
     * "success" callback passes a Model with following attributes: "workflowInstanceId" 
     *
     * @method startInstanceById
     * @param options
     * @return {mvp.Model} model
     */
    WfInstanceClient.startInstanceById = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.wfDefinitionId == null || options.wfDefinitionId == "") {
            throw new Error("wfDefinitionId missing");
        }

        // Build URL
        var url = "/engine-rest/engine/default/process-definition/" + options.wfDefinitionId + "/start"
        var data = { variables: options.variables };
        // Using net.ajax for POST
        net.ajax({
            url: url,
            type: "POST",
            data: JSON.stringify(data),
            dataType: "json",
            contentType: "application/json;charset=UTF-8",
            processData: false,
            success: function(serverData) {
                // Build model to return
                var model = new mvp.Model();
                if (serverData != null) {
                    model.setAttribute("workflowInstanceId", serverData.id);
                }
                options.success.call(this, model);
            },
            error: function(errorThrown) {
                if (options.error) {
                    options.error.call(this, errorThrown);
                }
            }
        });
    };
    
    return WfInstanceClient;
});    
