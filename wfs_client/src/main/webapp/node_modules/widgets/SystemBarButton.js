/*global define*/
define([
    'jscore/core',
    './SystemBarButtonView'
], function (core, View) {
    

    return core.Widget.extend({

        View: View,

        onViewReady: function (options) {
            this.options = options;
            this.setCaption(this.options.caption || 'Default');
            if (this.options.image) {
                this.setImage(this.options.image);
            }

            if (this.options.url) {
                this.setUrl(this.options.url);
            }

            if (this.options.action) {
                this.addEventHandler('click', this.options.action);
            }

            this.view.getLink().addEventHandler('click', function (e) {
                this.trigger('click', e);
            }, this);
        },

        setCaption: function (text) {
            this.view.getLink().setText(text);
        },

        setImage: function (pathToImg) {
            this.view.getLink().setStyle('background-image', 'url("'+pathToImg+'")');
        },

        setUrl: function (url) {
            this.view.getLink().setAttribute('href', url);
        }
    });
});
