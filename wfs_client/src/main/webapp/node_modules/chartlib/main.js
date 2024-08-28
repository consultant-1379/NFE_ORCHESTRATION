/*global define*/
define([
    'chartlib/base/d3',
    'jscore/core'
], function (d3, core) {
    

    function Drawing(options) {
        this.options = options;
        this.init.apply(this, arguments);
    }

    Drawing.prototype = {

        colorPaletteMap: {
            'eriRainbow':        ['#953882', '#e94d47', '#f3a133', '#fbc933', '#a1c845', '#33817f', '#33badd', '#cccccc', '#999999', '#333333'],
            'eriPurpleTints':    ['#7b0663', '#881f73', '#953882', '#a35192', '#b06aa1', '#bd83b1', '#ca9bc1', '#d7b4d0', '#e5cde0', '#f2e6ef'],
            'eriRedTints':       ['#e32119', '#e63730', '#e94d47', '#eb645e', '#ee7a75', '#f1908c', '#f4a6a3', '#f7bcba', '#f9d3d1', '#fce9e8'],
            'eriOrangeTints':    ['#f08a00', '#f29619', '#f3a133', '#f5ad4d', '#f6b966', '#f8c580', '#f9d099', '#fbdcb3', '#fce8cc', '#fef3e6'],
            'eriYellowTints':    ['#fabb00', '#fbc219', '#fbc933', '#fccf4d', '#fcd666', '#fddd80', '#fde499', '#feebb3', '#fef1cc', '#fff8e6'],
            'eriGreenTints':     ['#89ba17', '#95c12e', '#a1c845', '#accf5d', '#b8d674', '#c4dd8b', '#d0e3a2', '#dceab9', '#e7f1d1', '#f3f8e8'],
            'eriDarkGreenTints': ['#00625f', '#19726f', '#33817f', '#4d918f', '#66a19f', '#80b1af', '#99c0bf', '#b3d0cf', '#cce0df', '#e6efef'],
            'eriPaleBlueTints':  ['#00a9d4', '#19b2d8', '#33badd', '#4dc3e1', '#66cbe5', '#80d4ea', '#99ddee', '#b3e5f2', '#cceef6', '#e6f6fb'],
            'eriBlackTints':     ['#000000', '#191919', '#333333', '#4d4d4d', '#666666', '#808080', '#999999', '#b3b3b3', '#cccccc', '#e6e6e6'],
            'eriGreyTints':      ['#333333', '#474747', '#5c5c5c', '#707070', '#858585', '#999999', '#adadad', '#c2c2c2', '#d6d6d6', '#ebebeb'],
            'eriDarkBlueTints':  ['#00285e', '#193e6e', '#33537e', '#4d698e', '#667e9e', '#8094af', '#99a9bf', '#b3bfcf', '#ccd4df', '#e6eaef']
        },

        init: function () {
        },

        attach: function (element) {
            this.element = element;
            this.__d3__ = d3.select(this.element._getHTMLElement());
        },

        getD3Element: function () {
            return this.__d3__;
        },

        /**
         * Recursively merge properties of two objects
         *
         * @method mergeProperties
         * @param defaultProps
         * @param objectProps
         * @returns {object} Merged object
         */
        mergeProperties: function (defaultProps, objectProps) {
            for (var prop in objectProps) {
                if (objectProps.hasOwnProperty(prop)) {
                    try {
                        // Property in destination object set; update its value.
                        if (objectProps[prop].constructor === Object) {
                            defaultProps[prop] = this.mergeProperties(defaultProps[prop], objectProps[prop]);
                        } else {
                            defaultProps[prop] = objectProps[prop];
                        }
                    } catch (e) {
                        // Property in destination object not set; create it and set its value.
                        defaultProps[prop] = objectProps[prop];
                    }
                }
            }

            return defaultProps;
        },

        /**
         * Returns color palette
         *
         * @method getColorsPalette
         * @param {Array|string} colorPalette
         */
        getColorsPalette: function (colorPalette) {
            if (typeof(colorPalette) === 'string' || colorPalette instanceof String) {
                if (this.colorPaletteMap[colorPalette]) {
                    return d3.scale.ordinal().range(this.colorPaletteMap[colorPalette]);
                } else {
                    return d3.scale[colorPalette]();
                }
            } else {
                return d3.scale.ordinal().range(colorPalette);
            }
        }
    };

    Drawing.extend = core.extend;

    return Drawing;

});