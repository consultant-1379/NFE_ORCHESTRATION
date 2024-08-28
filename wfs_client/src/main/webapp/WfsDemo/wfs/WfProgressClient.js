define('wfs/WfProgressClient',[
    'jscore/core',
    "jscore/ext/mvp",
    'jscore/ext/net'    
], function(core, mvp, net) {
    
    /**
     * The wfs.WfProgressClient package provides WorkflowService workflow progress functionality for apps.
     *
     * TODO: unit + acceptance tests
     *
     * @class wfs.WfProgressClient
     */
    var WfProgressClient = {};

    /**
     * Get progress for a workflow instance.
     * The options object must provide "wfInstanceId".
     * The options object must provide "success" callback and may also provide "error" callback.
     * "success" callback passes a wfProgressModel.
     * A wfProgressModel contains the following attributes: 
     *  "instanceId", "nodeProgresses"
     *
     * @method getProgress
     * @param options
     * @return {mvp.Model} model
     */
	WfProgressClient.getProgress = function(options) {
		options = options || {};

        if (options.success == null) {
            throw new Error("success callback missing");
        }

        if (options.wfInstanceId == null || options.wfInstanceId == "") {
            throw new Error("wfInstanceId missing");
        }

        // Build URL
		var url = "/WorkflowService/oss/rest/services/wfs/default/progresses/" + options.wfInstanceId;

        // Retrieve progress from server
        net.ajax({
            url: url,
            type: "GET",
            dataType: "json",
            success: function(data) {
                // Build model to return
                var wfProgressModel = new mvp.Model();
                wfProgressModel.setAttribute("instanceId", data.instanceId);
                wfProgressModel.setAttribute("nodeProgresses", data.nodeProgresses);
                options.success.call(this, wfProgressModel);
            },
            error: function(errorThrown) {
                if (options.error) {
                    options.error.call(this, errorThrown);
                }
            }
        });

    };
    
	return WfProgressClient;
});    
