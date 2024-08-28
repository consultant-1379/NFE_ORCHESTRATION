
/*global define*/
define('jscore/ext/locationController',[
    '../core'
], function (core) {
    

    function guidGenerator() {
        /**
         * @method S4
         * @private
         * @return {String}
         * */
        function S4() {
            /*jshint bitwise: false */
            return  (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }

        return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4() + "-" + new Date().getTime());
    }

    /**
     * LocationController is a utility object that manages events based on the hash value of the URL.
     *
     * @class ext.LocationController
     */
    function LocationController(options) {
        this.handlers = {};
        this.options = options;
        this._preventListeners = false;
        this.init.apply(this, arguments);
        if (options && options.namespace) {
            this.namespace = options.namespace;
        }
    }

    LocationController.prototype = {

        /**
         * If defined, location listeners will not execute their handlers unless the hash starts with this namespace, and the hash variable in the callback function will not have the namespace included.
         *
         * @property namespace
         * @type String
         */
    
        /**
         * If extending the LocationController, you can override this function, which is automatically called when the extended LocationController is instantiated.
         *
         * @method init
         * @param {Object} options
         *
         * @example
         * init: function(options) {
         *     // some initialisation here
         * }
         */
        init: function(options) {
        },
    
        /**
         * Gets the string after the hash value in the URL.
         *
         * @method getLocation
         * @return {String} location
         *
         * @example
         *    lc.getLocation();
         */
        getLocation: function () {
            return window.location.hash.split('#')[1] || '';
        },
        
        /**
         * Gets the string after the hash value after the namespace in the URL. If the namespace was set to "MyNamespace", and the current hash value in the url is "#MyNamespace/somePage/1", then this function will return "somePage/1".
         *
         * @method getNamespaceLocation
         * @return {String} location
         *
         * @example
         *    lc.getNamespaceLocation();
         */
        getNamespaceLocation: function() {
            var location = this.getLocation();
            if (this.namespace) {
                location = location.substring(this.namespace.length + 1);
            }
            return location;
        },

        /**
         * Sets the string after the hash in the URL. If preventListeners is true, Location Listeners will not trigger when the hash is set.
         *
         * @method setLocation
         * @param {String} location
         * @param {Boolean} preventListeners
         * @example
         *    lc.setLocation("some/location");
         */
        setLocation: function (location, preventListeners) {
            if (preventListeners) {
                this._preventListeners = true;
            } else {
                this._preventListeners = false;
            }
            window.location.hash = location;
        },
        
        /**
         * Sets the string after the namespace in the hash in the URL. If the namespace was set to "MyNamespace", and the parameter was "somePage/1", then the hash value in the url will be set to "#MyNamespace/somePage/1". If preventListeners is true, Location Listeners will not trigger when the hash is set.
         *
         * @method setNamespaceLocation
         * @param {String} location
         * @param {Boolean} preventListeners
         *
         * @example
         *    lc.setNamespaceLocation("some/location");
         */
        setNamespaceLocation: function(location, preventListeners) {
            if (this.namespace) {
                location = this.namespace + "/" + location;
            }
            this.setLocation(location, preventListeners);
        },

        /**
         * Adds an event handler that executes when the URL hash value changes. The hash value is equal to the string after the hash in the URL. If a namespace was specified in the constructor or as a property, then the hash value will be equal to the string after the slash after the namespace.
         *
         * @method addLocationListener
         * @param {Function} fn
         * @param {Object} [context]
         * @return {String} id
         * @example
         * lc.addLocationListener(function(hash) {
         *     if (hash == "some/location") {
         *         console.log("url is set to some/location");
         *     }
         * });
         */
        addLocationListener: function (fn, context) {
            var id = guidGenerator();
            this.handlers[id] = context ? fn.bind(context) : fn;
            return id;
        },

        /**
         * Removes an event handler previously added by addLocationListener.
         *
         * @method removeLocationListener
         * @param {String} id
         */
        removeLocationListener: function (id) {
            delete this.handlers[id];
        },

        /**
         * Starts listening for changes to the hash value in the URL. It will also check the hash immediately and execute existing handlers.
         *
         * @method start
         * @example
         *    lc.start();
         */
        start: function () {
            this._execHandlers();
            this._startListening();
        },
        _execHandlers: function () {
            if (!this._preventListeners) {
                 var hash = this.getLocation();
                if (hash === this.currentUrl) return;
                this.currentUrl = hash;
                var regExp = new RegExp("^"+this.namespace, "i");
                if ((this.namespace && regExp.test(hash)) ||
                    !this.namespace) {
                    if (this.namespace) {
                        hash = hash.substring(this.namespace.length + 1);
                    }
                    for (var key in this.handlers) {
                        if (this.handlers.hasOwnProperty(key)) {
                            this.handlers[key](hash);
                        }
                    }
                }
            } else {
                this._preventListeners = false;
            }
           
        },
        _startListening: function () {
            this.listener = this._execHandlers.bind(this);
            window.addEventListener("hashchange", this.listener);
        },

        /**
         * Stops listening for changes to the hash value in the URL.
         *
         * @method stop
         */
        stop: function () {
            delete this.currentUrl;
            window.removeEventListener('hashchange', this.listener);
        }
    };
    
    /**
     * To create a LocationController child class call extend providing the class definition.
     *
     * @method extend
     * @static
     * @param {Object} definition
     * @return {LocationController} locationController
     *
     * @example
     * LocationController.extend({
	 *     init: function() {
	 *         console.log("Hello LocationController!");
	 *     }
	 * });
     */
    LocationController.extend = core.extend;
    return LocationController;
});
