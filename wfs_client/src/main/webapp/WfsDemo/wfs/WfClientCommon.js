define('wfs/WfClientCommon', [], function(WfClientCommon) {

    /**
     * The wfs.WfClientCommon package provides common functions for WorkflowService client library.
     *
     * TODO: unit + acceptance tests
     *
     * @class wfs.WfClientCommon
     */
    var WfClientCommon = {};

    WfClientCommon.extractFormInfo = function(formKey) {
        // expected format - example: "embedded:app:json:model1:/some/path/MyForm.json

        var parts = formKey.split(':');
        if (parts.length != 5) {
            throw new Error("Invalid form key: " + formKey + ", only " + parts.length + " parts");
        }

        if (parts[0] != "embedded" && parts[1] != "app") {
            throw new Error("Invalid form key: " + formKey + ", missing expected prefix: embedded:app");
        }

        var formInfo = { format: parts[2], modelType: parts[3], path: parts[4]};

        return formInfo;
    }

    return WfClientCommon;

});