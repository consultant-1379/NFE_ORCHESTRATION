
/*global define*/
define('chartlib/widgets/ext/BarChartExt',[
    'chartlib/base/d3',
    'chartlib/main'
], function (d3, Drawing) {
    

    return Drawing.extend({

        init: function (options) {
            this.attach(options.parent);
            var el = this.getD3Element();

            this.settings = {
                w: 500,                          // width
                h: 150,                          // height
                color: 'category20c',
                data: []
            };
            this.settings = this.mergeProperties(this.settings, options.settings);
            this.color = this.getColorsPalette(this.settings.color);

            this.x = d3.scale.ordinal()
                .domain(d3.range(this.settings.data.length))
                .rangeRoundBands([0, this.settings.w], 0.1);

            this.y = d3.scale.linear()
                .rangeRound([this.settings.h, 0]);

            var svg = el.append('svg:svg')
                .attr('width', this.settings.w)
                .attr('height', this.settings.h);

            var gObj = svg.append('g')
                .attr('transform', 'translate(0, 0)');

            var states = gObj.selectAll('.state')
                .data(this.settings.data)
              .enter().append('g')
                .attr('class', 'state')
                .attr('width', this.x.rangeBand())
                .attr('transform', function(d, i) { return 'translate(' + this.x(i) + ',0)';}.bind(this));

            states.selectAll('rect')
                .data(function(d) { return d.bars; })
              .enter().append('rect')
                .attr('width', this.x.rangeBand())
                .attr('y', function(d) { return this.y(d.y1);}.bind(this))
                .attr('height', function(d) { return this.y(d.y0) - this.y(d.y1);}.bind(this))
                .style('fill', function(d) { return d.color; })
              .append('svg:title')
                .text(function (d) {return d.value;});
        },

        updateX: function (dataLength) {
            this.x = d3.scale.ordinal()
                .domain(d3.range(dataLength))
                .rangeRoundBands([0, this.settings.w], 0.1);
        },

        update: function(data) {
            var el = this.getD3Element();
            var svg = el.select('svg');
            svg.select('g').remove();

            var g = svg.append('g')
                .attr('transform', 'translate(0, 0)');

            var states = g.selectAll('.state')
                .data(data)
              .enter().append('g')
                .attr('class', 'state')
                .attr('width', this.x.rangeBand())
                .attr('transform', function(d, i) { return 'translate(' + this.x(i) + ',0)';}.bind(this));

            // d.bars should be defined in data array
            states.selectAll('rect')
                .data(function(d) { return d.bars; })
              .enter().append('rect')
                .attr('width', this.x.rangeBand())
                .attr('y', function(d) { return this.y(d.y1);}.bind(this))
                .attr('height', function(d) { return this.y(d.y0) - this.y(d.y1); }.bind(this))
                .style('fill', function(d) { return d.color; })
              .append('svg:title')
                .text(function (d) {return d.value;});
        },

        getBarHeight: function () {
            return this.settings.h;
        },

        getBarWidth: function () {
            return this.settings.w;
        },

        getColoredBars: function (values, normValues) {
            var y0 = 0;
            var bars = this.color.range().map(function(color, i) {
                return { color: color, y0: y0, y1: y0 += +normValues[i], value: values[i] };
            });
            bars.forEach(function(d) { d.y0 /= y0; d.y1 /= y0; });
            return bars;
        }
    });

});
/*global define*/
define('chartlib/widgets/BarChart',[
    'jscore/core',
    './ext/BarChartExt'
], function (core, BarChartExt) {
    

    return core.Widget.extend({

        /**
         * The init method is automatically called by the constructor when using the "new" operator. If an object with
         * key/value pairs was passed into the constructor then the options variable will have those key/value pairs.
         *
         * The following options are accepted:
         *   <ul>
         *       <li>settings: an object used to pass settings/options for the Bar Chart</li>
         *       <li>data: an array used to pass data for the Bar Chart</li>
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
            // just create empty bar chart. Need to update x values, when we will get data
            this.barChart = new BarChartExt({
                parent: this.getElement(),
                settings: this.options.settings
            });

            if (this.options.data) {
                this.updateBarX(this.options.data.length);
                this.update(this.options.data);
            }
        },

        /**
         * Executes to change bars count. Should be called only if bars count is changed.
         *
         * @param {int} dataLength
         */
        updateBarX: function (dataLength) {
            this.barChart.updateX(dataLength);
        },

        /**
         * Updates the data which are shown in the chart
         *
         * @param {Array} data
         */
        update: function (data) {
            this.barChart.update(data);
        },

        /**
         * Returns chart height
         *
         * @returns {int}
         */
        getChartHeight: function () {
            return this.barChart.getBarHeight();
        },

        /**
         * Returns chart height
         *
         * @returns {int}
         */
        getChartWidth: function () {
            return this.barChart.getBarWidth();
        },

        /**
         * Returns array of colored bars
         *
         * @param {Array} values Real data
         * @param {Array} normValues Normalised data related to chart height
         * @returns {Array}
         */
        getColoredBars: function (values, normValues) {
            return this.barChart.getColoredBars(values, normValues);
        }

    });

});