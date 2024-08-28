// Workflow definitions widget

define([
    "jscore/core",
    "./LayoutWidgetView"
    ], function(core, View) {

       return core.Widget.extend({

            View: View,

            onViewReady: function() {     
//// eg. new LayoutWidget({rows :1, columns : 2, rowHeight: [100], columnWidth: [40,60], name: "eaWfsDemo-mainTabs-contentWfDefinition", overflow: "auto"});                       
                this.rows = (this.options.rows != null) ? this.options.rows : 2;                            //// number of rows (optional). default values can be overridden 
                this.columns = (this.options.columns != null) ? this.options.columns : 2;                   //// number of columns. (optional). default values can be overridden 
                this.name = (this.options.name != null) ? this.options.name+'-' : '';                       //// Unique name to the Layout (optional). so that any element inside Layout can be accessed by name without ambiguity. (useful if your app has more than one Layout widgets)
                this.overflow = (this.options.overflow != null) ? this.options.overflow : null;             //// to enable overflow content from divs. if not specified, it can be set from the stylesheet of parent
                
////// optional default dimensions of layout. if unspecifies, makes row column identical
                this.rowHeight = {};                                                                        //// default height of each row. eg. {25, 75}
                if(this.options.rowHeight != null)                                                          
                    this.rowHeight = this.options.rowHeight;
                else
                    for(var i=0; i< this.rows; i++) { this.rowHeight[i] = (100/this.rows)};                 //// unspecified takes equal devisions

                this.columnWidth = {};                                                                      //// default width of each column. eg. {40, 60}
                if(this.options.columnWidth != null)
                    this.columnWidth = this.options.columnWidth;
                else
                    for(var i=0; i< this.columns; i++) { this.columnWidth[i] = (100/this.columns)};

                this.left = [0];                                                                            //// variable to anchor the divs in left in the beginning
                for(var i=1; i<this.columns; i++)
                    this.left[i] = this.left[i-1] + this.columnWidth[i-1];

                this.top = [0];                                                                             //// variable to anchor the divs in top in the beginning
                for(var i=1; i<this.rows; i++)
                    this.top[i] = this.top[i-1] + this.rowHeight[i-1];
//----------------------------------------------------------------------------
                this.cell = {};
                this.slider = {};
                this.makeLayout();                                                                          //// the function makes initial layout using parameters specified
            },

            makeLayout: function() {
/////////////// create grid blocks of DIVs                 
                for(var r = 1; r <= this.rows; r++){                                                        
                    for(var c = 1; c <= this.columns; c++){
                        var html = '<div class = "'+this.name+'eaLayout-row' + r + '-column' + c + '" draggable="true"></div>';
                        this.cell["row" + r+"-column" + c] = core.Element.parse(html);
                        var style = { 
                                        "height": "" + this.rowHeight[r-1] + '%',
                                        "width": "calc("+ this.columnWidth[c-1] + '% - 20px)',
                                        "vertical-align" : "top",
                                        "position": "absolute",
                                        "left": ""+ this.left[c-1] + '%',
                                        "top": ""+ this.top[r-1] + '%',
                                        "border": "0px solid #ccc",
                                        "margin-right": "20px"
                                    };                        
                        this.cell["row" + r+"-column" + c].setStyle(style);
                        if(this.overflow != null)                                                           //// disable or enable "overflow" properties for all elements
                            this.cell["row" + r+"-column" + c].setStyle("overflow", this.overflow);                        
                        this.getElement().append(this.cell["row" + r+"-column" + c]);                       
                    }
                }

/////////////// create vertical sliders which moves two columns horizontally left right
                for(var v = 1; v <= this.columns-1; v++){
                    var html = '<div class="eaLayout-slider-vert-'+v+'" draggable="true"></div>';
                    this.slider['vert-' + v] = core.Element.parse(html);
                    var style = {   "width": "7px",
                                    "height": "100%",
                                    "position": "absolute",
                                    "top": "0px",
                                    "left": "calc("+ this.left[v] +'% - 15px)',
                                    "cursor": "col-resize",
                                    "border-right": "1px solid #a7a7a7",
                                    "background-color": "#f0f0f0" };
                    this.slider['vert-' + v].setStyle(style);
                    this.getElement().append(this.slider['vert-' + v]);

                    for(var r = 1; r <= this.rows; r++)
/////////////////// function adds sliding functionality to the bar by passing 3 elements. left and right elements and the sliding bar itself                        
                    this.sliderBar(this.cell['row'+r+'-column'+v], this.slider['vert-' + v], this.cell['row'+r+'-column'+(v+1)], "X");      
                }

/////////////// create horizontal sliders which moves two rows vertically up down
                for(var h = 1; h <= this.rows-1; h++){
                    var html = '<div class="eaLayout-slider-horiz-'+h+'" draggable="true"></div>';
                    this.slider['horiz-'+h] = core.Element.parse(html);
                    var style = {   "width": "100%",                                    
                                    "height": "7px",
                                    "position": "absolute",
                                    "top": ""+ this.top[h] +'%',
                                    "left": "0px", 
                                    "cursor": "row-resize",
                                    "border-bottom": "1px solid #a7a7a7",
                                    "background-color": "#f0f0f0" };
                    this.slider['horiz-'+h].setStyle(style);
                    this.getElement().append(this.slider['horiz-'+h]);

                    for(var c = 1; c <= this.columns; c++)
/////////////////// function adds sliding functionality to the bar by passing 3 elements. left and right elements and the sliding bar itself                        
                    this.sliderBar(this.cell['row'+h+'-column'+c], this.slider['horiz-'+h], this.cell['row'+(h+1)+'-column'+c], "Y");       
                }
            },



/////////// function adds sliding functionality to the bar by passing 3 elements. left and right elements and the sliding bar itself. 
/////////// the axis denotes in which axis you want slider to slide. X means horizontal
            sliderBar: function(el1, elSlider, el3, axis) {
            var X;
            var Y;
            var anchor;                                                         //// "left" for horizontal sliding and "top" for vertical
            var dimension;                                                      //// "width" for horizontal sliding and "height" for vertical sliding

            elSlider.addEventHandler("dragstart", function (e) { X = e.originalEvent.screenX; Y = e.originalEvent.screenY;});   //// measures pointers on drag start and will be substarcted from dragEnd value
            elSlider.addEventHandler("dragend", function (e) { 
                X = e.originalEvent.screenX - X;
                Y = e.originalEvent.screenY - Y;

                if(axis == "X") { Y = 0; anchor = "left"; dimension = "width"; }
                else if(axis == "Y") { X = 0; anchor = "top"; dimension = "height"; }

                var dim = el1.getStyle(dimension);
                dim = (parseInt(dim.substr(0, dim.length - 2)) + X + Y).toString() + "px"; //// string to int > add displacement > toString
                el1.setStyle(dimension, dim);
                                                                                            //// get first element position and add its dimensions to get position of Sliding Bar
                dim = parseInt(el1.getStyle(anchor).substr(0, el1.getStyle(anchor).length - 2))  +  parseInt(el1.getStyle(dimension).substr(0, el1.getStyle(dimension).length - 2)) + 10;                
                elSlider.setStyle(anchor, dim.toString() + "px");
                
                dim = dim + 15;
                el3.setStyle(anchor, dim.toString() + "px");                                //// setting anchor position of third element
                
                dim = el3.getStyle(dimension);
                dim = (parseInt(dim.substr(0, dim.length - 2)) - X - Y).toString() + "px"; //// string to int > add displacement > toString
                el3.setStyle(dimension, dim);
                });            
            },

        });
});