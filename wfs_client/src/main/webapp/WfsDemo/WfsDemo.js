// WorkflowService demo UI

define([
	'jscore/core',
	"./regions/MainRegion/MainRegion"
	], function (core, MainRegion) {

		return core.App.extend({

			onStart: function (parent) {
				this.MainRegion = new MainRegion({context: this.getContext()});
				this.MainRegion.start(this.getElement());
			}
		});

	});
