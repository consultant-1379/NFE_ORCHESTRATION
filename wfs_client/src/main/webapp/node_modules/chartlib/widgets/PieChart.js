
/*global define*/
define('chartlib/widgets/ext/PieChartExt',[
    'chartlib/base/d3',
    'chartlib/main'
], function (d3, Drawing) {
    

    return Drawing.extend({
        /*jshint validthis:true*/

        init: function (options) {
            this.attach(options.parent);
            var el = this.getD3Element();

            this.settings = {
                width: 420,
                height: 300,
                padding: 10,
                legendWidth: 120,
                colorPalette: 'eriRainbow',
                animation: {
                    duration: 1000,
                    easeType: 'cubic-in-out'
                },
                labelText: {
                    styles: {
                        'fill': '#333333',
                        'font-size': '1.2rem',
                        'font-weight': 'normal'
                    }
                },
                strokeStyles: {
                    'stroke': '#EEEEEE',
                    'stroke-width': '2px'
                }
            };
            this.settings = this.mergeProperties(this.settings, options.settings);
            this.settings = getSettingsWithRadius.call(this, this.settings);

            // get color palette for charting drawing
            this.colorPalette = this.getColorsPalette(this.settings.colorPalette);

            // setup dataset for reuse
            this.dataset = options.data || {items: []};
            this.itemsLength = this.dataset.items.length;
            this._current = [];

            this.svg = el.append('svg')                     //create the SVG element inside the <element>
                .attr('width', this.settings.width)         //set the width of our visualization
                .attr('height', this.settings.height);      //set the height of our visualization

            this.chart = this.svg.append('g')               //make a group to hold our pie chart
                .attr('transform', 'translate(' + getChartCenterX(this.settings) +
                    ',' + getChartCenterY(this.settings) + ')');    //move the center of the pie chart from 0, 0 to width/2, height/2

            this.arc = d3.svg.arc()                         //this will create <path> elements for us using arc data
                .outerRadius(this.settings.outerRadius)
                .innerRadius(this.settings.innerRadius);

            this.pie = d3.layout.pie()                      //this will create arc data for us given a list of values
                .sort(null)                                 //disable sorting data
                .value(function (d) {
                    return d.value;
                });                                         //we must tell it out to access the value of each element in our data array

            if (this.itemsLength > 0) {
                createSlices.call(this, this.dataset.items);
                createLegend.call(this, this.dataset.items);
            }
        },

        update: function (data) {
            if (!this.slices && !this.legendBlock && data.items.length > 0 || this.itemsLength !== data.items.length) {
                createSlices.call(this, data.items);
                createLegend.call(this, data.items);
            } else {
                this.paths.data(this.pie(data.items));
                this.paths.transition()
                    .ease(this.settings.animation.easeType)
                    .duration(this.settings.animation.duration)
                    .attr('d', this.arc)
                    .attrTween('d', arcTween.bind(this));
            }

            this.dataset = data;
            this.itemsLength = data.items.length;
        },

        redraw: function (settings) {
            this.settings = this.mergeProperties(this.settings, settings);
            this.settings = getSettingsWithRadius(this.settings);

            // get color palette for charting drawing
            this.colorPalette = this.getColorsPalette(this.settings.colorPalette);

            this.resize({
                width: this.settings.width,
                height: this.settings.height
            });

            if (this.slices) {
                this.slices.style(this.settings.strokeStyles);

                this.paths.attr('fill', function (d, i) { return this.colorPalette(i); }.bind(this))
                    .attr('d', this.arc);
            }

            if (this.points) {
                this.points.style('fill', function (d, i) { return this.colorPalette(i); }.bind(this));
            }
        },

        resize: function (sizes) {
            this.settings.width = (sizes.width ? sizes.width : this.settings.width);
            this.settings.height = (sizes.height ? sizes.height : this.settings.height);

            this.settings = getSettingsWithRadius(this.settings);

            this.arc.innerRadius(this.settings.innerRadius)
                .outerRadius(this.settings.outerRadius);

            this.svg.attr('width', this.settings.width)
                .attr('height', this.settings.height);

            this.chart.attr('transform', 'translate(' + getChartCenterX(this.settings) +
                ',' + getChartCenterY(this.settings) + ')');

            if (this.slices) {
                this.slices.selectAll('path').attr('d', this.arc);
                this.slices.selectAll('text').attr('transform', function (d) {   //set the label's origin to the center of the arc
                    //we have to make sure to set these before calling arc.centroid
                    d.innerRadius = this.settings.innerRadius;
                    d.outerRadius = this.settings.outerRadius;
                    return 'translate(' + this.arc.centroid(d) + ')';            //this gives us a pair of coordinates like [50, 50]
                }.bind(this));
            }

            if (this.legendBlock) {
                var legendPosition = getLegendPosition(this.settings);
                this.legend.selectAll('rect')
                    .attr('x', legendPosition);
                this.labels.attr('x', legendPosition + 15);
            }
        }
    });

    /* ++++++++++++++++++++++++++++++++++++++++++ PRIVATE METHODS ++++++++++++++++++++++++++++++++++++++++++ */

    // Store the displayed angles in _current.
    // Then, interpolate from _current to the new angles.
    // During the transition, _current is updated in-place by d3.interpolate.
    function arcTween(a, index) {
        var i = d3.interpolate(this._current[index], a);
        this._current[index] = i(0);
        return function(t) {
            return this.arc(i(t));
        }.bind(this);
    }

    function getSettingsWithRadius (settings) {
        settings.radius = Math.min(settings.width - settings.legendWidth - settings.padding * 2, settings.height) / 2;
        settings.outerRadius = 0;
        settings.innerRadius = settings.radius;
        return settings;
    }

    function getChartCenterX (settings) {
        return (settings.width - settings.legendWidth - settings.padding) / 2;
    }

    function getChartCenterY (settings) {
        return Math.min(settings.width - settings.legendWidth - settings.padding, settings.height) / 2;
    }

    function getLegendPosition (settings) {
        return getChartCenterX(settings) + settings.radius + settings.padding;
    }

    function createSlices (items) {
        if (this.slices) {
            this.slices.remove();
        }
        this.slices = this.chart.selectAll('g.slice')   //this selects all <g> elements with class slice (there aren't any yet)
            .data(this.pie(items))                      //associate the generated pie data (an array of arcs, each having startAngle, endAngle and value properties)
          .enter()                                      //this will create <g> elements for every 'extra' data element that should be associated with a selection. The result is creating a <g> for every object in the data array
            .append('g')                                //create a group to hold each slice (we will have a <path> and a <text> element associated with each slice)
            .attr('class', 'slice')                     //allow us to style things in the slices (like text)
            .style(this.settings.strokeStyles);

        if (this.paths) {
            this.paths.remove();
        }
        this.paths = this.slices.append('path')
            .attr('fill', function (d, i) {
                return this.colorPalette(i);
            }.bind(this))                               //set the color for each slice to be chosen from the color function defined above
            .attr('title', function (d) { return d.value; })
            .attr('d', this.arc)                        //this creates the actual SVG path using the associated data (pie) with the arc drawing function
            .each(function(d, i) { this._current[i] = d; }.bind(this));
    }

    function createLegend (items) {
        if (this.legendBlock) {
            this.legendBlock.remove();
        }
        this.legendBlock = this.svg.append('g');

        if (this.legend) {
            this.legend.remove();
        }
        this.legend = this.legendBlock.selectAll('.legend')
            .data(this.pie(items))
          .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', function(d, i) { return 'translate(0,' + i * 20 + ')'; });

        if (this.points) {
            this.points.remove();
        }
        var legendPosition = getLegendPosition(this.settings);
        this.points = this.legend.append('rect')
            .attr('x', legendPosition)
            .attr('width', 10)
            .attr('height', 10)
            .attr('y', 5)
            .style('fill', function (d, i) { return this.colorPalette(i); }.bind(this))
            .attr('title', function (d) { return d.data.label; });

        if (this.labels) {
            this.labels.remove();
        }
        this.labels = this.legend.append('foreignObject')
            .attr('x', legendPosition + 15)
            .attr('y', 4)
            .attr('width', (this.settings.legendWidth - 15) + 'px')
            .attr('height', '18px');

        this.labels.append('xhtml:div')
            .style({
                'width': (this.settings.legendWidth - 15) + 'px',
                'white-space': 'nowrap',
                'text-overflow': 'ellipsis',
                'overflow': 'hidden',
                'text-align': 'left',
                'font-size': '1.2rem',
                'line-height': '1.2rem'
            })
            .attr('title', function (d) { return d.data.label; })
            .text(function(d) { return d.data.label; });
    }

});
/*global define*/
define('chartlib/widgets/PieChart',[
    'jscore/core',
    './ext/PieChartExt'
], function (core, PieChartExt) {
    

    /**
     * The PieChart class is used to show the relationship of parts to a whole.
     * The PieChart can be instantiated using the constructor PieChart.
     *
     * The following options are accepted:
     *   <ul>
     *       <li>options: an object used to pass settings and/or data for the Pie Chart</li>
     *   </ul>
     *
     * @example
     *   // This options object has default settings for PieChart
     *   options = {
     *     settings: {
     *       width: 420,
     *       height: 300,
     *       padding: 10,
     *       legendWidth: 120,
     *       colorPalette: 'eriRainbow',
     *       animation: {
     *         duration: 1000,
     *         easeType: 'cubic-in-out'
     *       },
     *       labelText: {
     *         styles: {
     *           'fill': '#333333',
     *           'font-size': '1.2rem',
     *           'font-weight': 'normal'
     *         }
     *       },
     *       strokeStyles: {
     *         'stroke': '#EEEEEE',
     *         'stroke-width': '2px'
     *       }
     *     },
     *     data: {
     *       items: [
     *         {label: "one", value: 10},
     *         {label: "two", value: 20},
     *         {label: "three", value: 50},
     *         {label: "four", value: 30}
     *       ]
     *     }
     *   };
     *   var pieChart = new PieChart(options);
     *
     * @class PieChart
     */
    return core.Widget.extend({

        /**
         * The init method is automatically called by the constructor when using the "new" operator. If an object with
         * key/value pairs was passed into the constructor then the options variable will have those key/value pairs.
         *
         * The following options are accepted:
         *   <ul>
         *       <li>options: an object used to pass settings and/or data for the Pie Chart</li>
         *   </ul>
         *
         * @method init
         * @param {Object} options
         * @private
         */
        init: function (options) {
            this.options = options || {};
        },

        /**
         * Overrides method from widget.
         * Executes every time, when added back to the screen.
         *
         * @method onViewReady
         * @private
         */
        onViewReady: function () {
            this.pie = new PieChartExt({
                parent: this.getElement(),
                settings: this.options.settings,
                data: this.options.data
            });
        },

        /**
         * Updates Pie Chart with new data.
         *
         * @method update
         * @param {Object} data
         * @example
         *   data = {
         *     items : [
         *       {label: "one", value: 20},
         *       {label: "two", value: 40},
         *       {label: "three", value: 30},
         *       {label: "four", value: 10}
         *     ]
         *   }
         */
        update: function (data) {
            this.pie.update(data);
        },

        /**
         * Redraws the Pie chart if settings is changed for it.
         *
         * @method redraw
         * @param {Object} settings Contains settings values.
         * @example
         *   settings: {
         *     width: 320,
         *     height: 200,
         *     padding: 15,
         *     legendWidth: 100,
         *     colorPalette: 'eriRedTints',
         *     animation: {
         *       duration: 500,
         *       easeType: 'cubic-in-out'
         *     },
         *     labelText: {
         *       styles: {
         *         'fill': '#666666',
         *         'font-size': '1rem',
         *         'font-weight': 'normal'
         *       }
         *     },
         *     strokeStyles: {
         *       'stroke': '#F4F4F4',
         *       'stroke-width': '1px'
         *     }
         *   }
         */
        redraw: function (settings) {
            this.pie.redraw(settings);
        },

        /**
         * Resizes the Pie chart after resize is made. This method should be called in window.resize() method.
         *
         * @method resize
         * @param {Object} sizes Contains two values: width and height.
         * @example
         *   sizes = {
         *     width: 300,
         *     height: 200
         *   }
         */
        resize: function (sizes) {
            this.pie.resize(sizes);
        }

        /**
         * Adds the PieChart's element to the new parent element.
         *
         * @method attachTo
         * @param {Element} parent
         */

        /**
         * Places the detached PieChart back into the defined parent element.
         *
         * @method attach
         */

        /**
         * Removes the PieChart from the parent element, but does not destroy the PieChart.
         * DOM events will still work when PieChart is attached back.
         *
         * @method detach
         */

        /**
         * Removes the PieChart root Element from the DOM.
         *
         * @method destroy
         */

    });
});