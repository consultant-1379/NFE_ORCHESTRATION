define([
    "jscore/core",
    "text!./TaskProgressCell.html",
    "styles!./TaskProgressCell.less"
    ], function(core, template, style) {

        return core.View.extend({

            getTemplate: function() {
                return template;
            },

            getStyle: function() {
                return style;
            },

            getProgress: function() {
                return this.getElement().find(".eaWfsDemo-TaskTable-TaskProgressCell-progress");
            },

            setProgress: function(widthPercent, widgetSize) {
                
                width = widthPercent*widgetSize/100;
                this.getProgress().setAttribute("style", "width:"+ width +"px;");
                this.getUnfinished().setAttribute("style", "width:" + (widgetSize - width) +"px;");
                if(widthPercent>50) {this.getProgress().setText(widthPercent + "%");}
                else {this.getUnfinished().setText(widthPercent + "%");}

            },
            getUnfinished: function() {
                return this.getElement().find(".eaWfsDemo-TaskTable-TaskProgressCell-unfinished");
            }

            
            
        });

    });