define('wfs/WfDefinitionClient',[
    'jscore/core',
    "jscore/ext/mvp",
    'jscore/ext/net',
    "wfs/WfClientCommon",
], function(core, mvp, net, WfClientCommon) {
    
    /**
     * The wfs.WfDefinitionClient package provides WorkflowService workflow definition functionality for apps.
     *
     * TODO: unit + acceptance tests
     *
     * @class wfs.WfDefinitionClient
     */
    var WfDefinitionClient = {};

    /**
     * Get all workflow definitions.
     * The options object must provide "success" callback and may also provide "error" callback.
     * "success" callback passes a wfDefinitionCollection object containing wfDefinitionModel's.
     * A wfDefinitionModel contains the following attributes: 
     *  "id", "name", "key", "version", "description"
     * Options can receive "latest" which if true causes only latest versions to be retrieved.
     * Options can also receive "sortBy" and "sortOrder". Valid values for "sortBy" are "name".
     * Valid values for "sortOrder" are "asc", "desc".
     *
     * TODO: pagination
     *
     * @method getAllDefinitions
     * @param options
     * @return {mvp.Collection} collection
     */
	WfDefinitionClient.getAllDefinitions = function(options) {
		options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        // Build URL
		var url = "/engine-rest/engine/default/process-definition";

        var numQueryParams = 0;

        // option: 'latest'
        if (options.latest != null) {
            url += "?latest=" + (options.latest ? "true" : "false");
            numQueryParams++;
        }

        // options: 'sortBy', 'sortOrder'
        if (options.sortBy != null) {
            if (["name"].indexOf(options.sortBy) == -1) {
                throw new Error("Invalid sortBy value: " + sortBy);
            }
            url += (numQueryParams > 0 ? "&" : "?") + "sortBy=" + options.sortBy;
            if (options.sortOrder != null) {
                if (["asc", "desc"].indexOf(options.sortOrder) == -1) {
                    throw new Error("Invalid sortOrder value: " + sortOrder);
                }
                url += "&sortOrder=" + options.sortOrder;
            }
        }

        // Retrieve collection from server
        var serverCollection = new mvp.Collection([], {url: url});
        serverCollection.fetch({
            success: function(serverCollection) {
                // TODO - if possible remove this conversion when implement own REST API
                // Build collection to return
                var wfDefinitionCollection = new mvp.Collection();
                serverCollection.each(function(serverModel) {
                    var wfDefinitionModel = new mvp.Model();
                    wfDefinitionModel.setAttribute("id", serverModel.getAttribute("id"));
                    wfDefinitionModel.setAttribute("name", serverModel.getAttribute("name"));
                    wfDefinitionModel.setAttribute("key", serverModel.getAttribute("key"));
                    wfDefinitionModel.setAttribute("version", serverModel.getAttribute("version"));
                    wfDefinitionModel.setAttribute("description", serverModel.getAttribute("description"));
                    wfDefinitionCollection.addModel(wfDefinitionModel);
                });
				options.success.call(this, wfDefinitionCollection);
			},
            error: function(errorThrown) {
            	if (options.error) {
					options.error.call(this, errorThrown);
            	}
            }
        });
    };

    /**
     * Get workflow instance start form model.
     * The options object must provide "wfDefinitionId".
     * The options object must provide "success" callback and may also provide "error" callback.
     * If a start form is defined for the workflow definition "success" callback passes a wfStartFormModel object
     * which contains the following attributes: 
     *  "formInfo", "submitText", "cancelText", "controlGroups"
     * If no start form is defined for the workflow definition "success" callback passes 'null'.
     *
     * @method getStartFormModelById
     * @param options
     * @return {mvp.Model} model
     */
    WfDefinitionClient.getStartFormModelById = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.wfDefinitionId == null || options.wfDefinitionId == "") {
            throw new Error("wfDefinitionId missing");
        }

        // Build URL
        var url = "/engine-rest/engine/default/process-definition/" + options.wfDefinitionId + "/startForm";

        // Retrieve form key from server
        var wfStartFormKey = new mvp.Model([], {url: url});
        wfStartFormKey.fetch({
            success: function(formKeyModel) {
                if (formKeyModel.getAttribute("key") == null) {     // form optional
                    options.success.call(this, null);
                } 
                else {
                    try {
                        // Retrieve form model from server
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

                                // check form modelType match
                                if (formData.modelType != formInfo.modelType) {
                                    handleError(options, "Form modelType mismatch, " + formData.modelType + "!=" + formInfo.modelType);
                                }

                                var wfStartFormModel = new mvp.Model();
                                wfStartFormModel.setAttribute("formInfo", formInfo);
                                wfStartFormModel.setAttribute("submitText", formData.submitText);
                                wfStartFormModel.setAttribute("cancelText", formData.cancelText);
                                wfStartFormModel.setAttribute("controlGroups", formData.controlGroups);
                                options.success.call(this, wfStartFormModel);
                            },
                            error: function(err) {
                                handleError(options, "Error retrieving form: " + formUrl + ". " + err);
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
            console.log(err);       // TODO - recommended UI SDK logging ?
        }
    };
    
    /**
     * Get workflow structure.
     * The options object must provide "wfDefinitionId".
     * The options object must provide "success" callback and may also provide "error" callback.
     * The "success" callback passes a wfStructureModel object which contains the following attributes: 
     *  "id", "branches", "nonBranches"
     *
     * @method getStructure
     * @param options
     * @return {mvp.Model} model
     */
    WfDefinitionClient.getStructure = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.wfDefinitionId == null || options.wfDefinitionId == "") {
            throw new Error("wfDefinitionId missing");
        }

        // Build URL
        var url = "/WorkflowService/oss/rest/services/wfs/default/definitions/" + options.wfDefinitionId + "/structure";

        // Retrieve structure from server
        var wfStructureModel = new mvp.Model([], {url: url});
        wfStructureModel.fetch({
            success: function(wfStructureModel) {
               options.success.call(this, wfStructureModel);
            },
            error: function(err) {
                if (options.error) {
                    options.error.call(this, err);
                }
                console.log(err);       // TODO - recommended UI SDK logging ?
            }
        });
    };
    
    /**
     * Get workflow XML.
     * The options object must provide "wfDefinitionId".
     * The options object must provide "success" callback and may also provide "error" callback.
     * The "success" callback passes a wfDiagramXmlModel object which contains the following attributes: 
     *  "id", "bpmn20Xml"
     *
     * @method getWfDiagramXml
     * @param options
     * @return {mvp.Model} model
     */
    WfDefinitionClient.getWfDiagramXml = function(options) {
        options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.wfDefinitionId == null || options.wfDefinitionId == "") {
            throw new Error("wfDefinitionId missing");;
        }

        // Build URL
        var url = "/engine-rest/engine/default/process-definition/" + options.wfDefinitionId + "/xml"

        // Retrieve diagram xml from server
        var wfDiagramXmlModel = new mvp.Model([], {url: url});
        wfDiagramXmlModel.fetch({
            success: function(wfDiagramXmlModel) {
               options.success.call(this, wfDiagramXmlModel);
            },
            error: function(err) {
                if (options.error) {
                    options.error.call(this, err);
                }
                console.log(err);       // TODO - recommended UI SDK logging ?
            }
        });
    };

	return WfDefinitionClient;
});    
