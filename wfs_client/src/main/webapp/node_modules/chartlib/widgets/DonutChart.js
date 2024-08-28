
/*global define*/
define('chartlib/widgets/ext/DonutChartExt',[
    'chartlib/base/d3',
    'chartlib/main'
], function (d3, Drawing) {
    

    return Drawing.extend({
        /*jshint validthis:true*/

        init: function (options) {
            this.attach(options.parent);
            var el = this.getD3Element();

            this.settings = {
                width: 300,
                height: 150,
                thickness: 30,
                legendWidth: 120,
                padding: 10,
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
                centerText: {
                    styles: {
                        'fill': '#333333',
                        'font-size': '5rem',
                        'font-weight': 'normal',
                        'font-family': 'EricssonCapitalTT'
                    },
                    heightTransform: 15
                },
                colorPalette: 'eriRainbow'
            };
            this.settings = this.mergeProperties(this.settings, options.settings);
            this.settings = getSettingsWithRadius.call(this, this.settings);

            // get color palette for charting drawing
            this.colorPalette = this.getColorsPalette(this.settings.colorPalette);

            this.dataset = options.data || {items: []};
            this.itemsLength = this.dataset.items.length;
            this._current = [];

            this.svg = el.append('svg')                         //create the SVG element inside the <element>
                .attr('width', this.settings.width)             //set the width of our visualization
                .attr('height', this.settings.height);          //set the height of our visualization

            this.chart = this.svg.append('g')                   //make a group to hold our donut chart
                .attr('transform', 'translate(' + getChartCenterX(this.settings) +
                    ',' + getChartCenterY(this.settings) + ')'); //move the center of the donut chart from 0, 0 to width/2, height/2

            this.arc = d3.svg.arc()                             //this will create <path> elements for us using arc data
                .innerRadius(this.settings.innerRadius)
                .outerRadius(this.settings.outerRadius);

            this.pie = d3.layout.pie()                          //create simple pie without any data
                .sort(null)                                     //disable sorting data
                .value(function (d) {
                    return d.value;
                });                                             //we must tell it out to access the value of each element in our data array

            if (this.settings.centerText) {
                this.text = this.chart.append('text')               //this will create text, which will be placed in the center of the chart
                    .attr('text-anchor', 'middle')                  //center the text on it's origin
                    .style(this.settings.centerText.styles)
                    .attr('transform', 'translate(0, ' + this.settings.centerText.heightTransform + ')');

                if (this.dataset.centerText) {
                    this.text.text(this.dataset.centerText);
                }
            }

            if (this.itemsLength > 0) {
                createArcs.call(this, this.dataset.items);
                createLegend.call(this, this.dataset.items);
            }
        },

        update: function(data) {
            if (!this.arcs && data.items.length > 0 || this.itemsLength !== data.items.length ) {
                createArcs.call(this, data.items);
                createLegend.call(this, data.items);
            } else {
                this.arcs.data(this.pie(data.items));
                this.arcs.transition()
                    .ease(this.settings.animation.easeType)
                    .duration(this.settings.animation.duration)
                    .attr('d', this.arc)
                    .attrTween('d', arcTween.bind(this));
            }

            if (data.centerText && this.text) {
                this.text.text(data.centerText);
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

            if (this.settings.centerText) {
                if (!this.text) {
                    this.text = this.chart.append('text')               //this will create text, which will be placed in the center of the chart
                        .attr('text-anchor', 'middle')                  //center the text on it's origin
                        .style(this.settings.centerText.styles)
                        .attr('transform', 'translate(0, ' + this.settings.centerText.heightTransform + ')');

                    if (this.dataset.centerText) {
                        this.text.text(this.dataset.centerText);
                    }
                } else {
                    this.text.attr('transform', 'translate(0, ' + this.settings.centerText.heightTransform + ')');
                }
            } else if (this.text) {
                this.text.remove();
                delete this.text;
            }

            if (this.arcs) {
                this.arcs.attr('fill', function(d, i) { return this.colorPalette(i); }.bind(this) )
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

            this.svg.attr('width', this.settings.width)
                .attr('height', this.settings.height);

            this.chart.attr('transform', 'translate(' + getChartCenterX(this.settings) +
                ',' + getChartCenterY(this.settings) + ')');

            this.arc.innerRadius(this.settings.innerRadius)
                .outerRadius(this.settings.outerRadius);

            if (this.arcs) {
                this.arcs.attr('d', this.arc);
            }

            if (this.legendBlock) {
                var legendPosition = getLegendPosition(this.settings);
                this.legend.selectAll('rect').attr('x', legendPosition);
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
        settings.innerRadius = settings.radius - settings.thickness;
        settings.outerRadius = settings.radius;
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

    function createArcs (items) {
        if (this.arcs) {
            this.arcs.remove();
        }
        this.arcs = this.chart.selectAll('path')
            .data(this.pie(items))                 //associate our data with the document
          .enter().append('path')
            .attr('fill', function(d, i) { return this.colorPalette(i); }.bind(this) )
            .attr('title', function (d) { return d.value; })
            .attr('d', this.arc)
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
define('chartlib/widgets/DonutChart',[
    'jscore/core',
    './ext/DonutChartExt'
], function (core, DonutChartExt) {
    

    /**
     * The DonutChart class is used to show the relationship of parts to a whole.
     * The DonutChart can be instantiated using the constructor DonutChart.
     *
     * The following options are accepted:
     *   <ul>
     *       <li>options: an object used to pass settings and/or data for the Donut Chart</li>
     *   </ul>
     *
     * @example
     *   // This options object has default settings for DonutChart
     *   options = {
     *     settings: {
     *       width: 150,
     *       height: 150,
     *       thickness: 30,
     *       legendWidth: 120,
     *       padding: 10,
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
     *       centerText: {
     *         styles: {
     *           'fill': '#333333',
     *           'font-size': '5rem',
     *           'font-weight': 'normal',
     *           'font-family': 'EricssonCapitalTT'
     *         },
     *         heightTransform: 15
     *       },
     *       colorPalette: 'eriRainbow'
     *     },
     *     data: {
     *       items: [
     *         {label: "one", value: 35},
     *         {label: "two", value: 65}
     *       ],
     *       centerText: 'D'
     *     }
     *   };
     *   var donutChart = new DonutChart(options);
     *
     * @class DonutChart
     */
    return core.Widget.extend({

        /**
         * The init method is automatically called by the constructor when using the "new" operator. If an object with
         * key/value pairs was passed into the constructor then the options variable will have those key/value pairs.
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
            this.donut = new DonutChartExt({
                parent: this.getElement(),
                settings: this.options.settings,
                data: this.options.data
            });
        },

        /**
         * Updates Donut Chart with new data.
         *
         * The following options are accepted:
         *   <ul>
         *       <li>cells: an array used to update data in the Donut chart.</li>
         *       <li>centerText: an object used to change data in the center of the Donut chart. Could have two params: "text" and "fill".</li>
         *   </ul>
         *
         * @method update
         * @param {Object} data
         * @example
         *   data = {
         *     items: [
         *       {label: "one", value: 30},
         *       {label: "two", value: 70}
         *     ],
         *     centerText: "C"
         *   }
         */
        update: function (data) {
            this.donut.update(data);
        },

        /**
         * Redraws the Donut chart if settings is changed for it.
         *
         * @method redraw
         * @param {Object} settings Contains settings values.
         * @example
         *   settings = {
         *     width: 200,
         *     height: 200,
         *     thickness: 30,
         *     padding: 20,
         *     centerText: {
         *       styles: {
         *         'fill': '#666666',
         *         'font-size': '3rem',
         *         'font-weight': 'bold'
         *       },
         *       heightTransform: 10
         *     },
         *     colorPalette: 'eriRedTints'
         *   }
         */
        redraw: function (settings) {
            this.donut.redraw(settings);
        },

        /**
         * Resizes the Donut chart after resize is made. This method should be called in window.resize() method.
         *
         * @method resize
         * @param {Object} sizes Contains two properties: width and height.
         * @example
         *   sizes = {
         *     width: 300,
         *     height: 200
         *   }
         */
        resize: function (sizes) {
            this.donut.resize(sizes);
        }

        /**
         * Adds the DonutChart's element to the new parent element.
         *
         * @method attachTo
         * @param {Element} parent
         */

        /**
         * Places the detached DonutChart back into the defined parent element.
         *
         * @method attach
         */

        /**
         * Removes the DonutChart from the parent element, but does not destroy the DonutChart.
         * DOM events will still work when DonutChart is attached back.
         *
         * @method detach
         */

        /**
         * Removes the DonutChart root Element from the DOM.
         *
         * @method destroy
         */

    });

});