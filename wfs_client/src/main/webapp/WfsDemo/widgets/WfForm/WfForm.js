// Workflow form widget

define([
    "jscore/core",
    "widgets/SelectBox",
    "widgets/DatePicker",
    "widgets/TimePicker",
    "widgets/Spinner",
    "./WfFormView"
    ], function(core, SelectBox, DatePicker, TimePicker, Spinner, View) {

    return core.Widget.extend({

        View: View,

        onViewReady: function() {
            this.formModel = this.options.formModel;
            this.variableCollection = this.options.variableCollection;

            // Validate form
            this.validateForm();

            // Create keyable variables
            this.createVariables();
            
            // Build HTML - table
            var html = "<form>";
            html += "<table>";

            // Build table rows and widgets based on formModel controlGroups
            this.controlWidgets = [];
            var controlGroups = this.formModel.getAttribute("controlGroups");
            for (var i = 0; i < controlGroups.length; i++) {
                var controlGroup = controlGroups[i].controlGroup;
                html += "<tr>";
                var required = ""; ///// to insert asterisk with required field 
                if((typeof controlGroup.controls[0].variable.required != 'undefined') && controlGroup.controls[0].variable.required == true)
                    required = "*";
                // Label
                html += "<td>";
                html += "<label class='ebLabel'>" + controlGroup.label + required + "</label";
                html += "</td>";

                // Create html for widgets and the widgets themselves.
                // Note there can be more than one widget per 'label', though typically there will be just one.
                var widgetGroup = this.createWidgetGroup(controlGroup);
                for (var j = 0; j < widgetGroup.widgets.length; j++) {
                    this.controlWidgets.push(widgetGroup.widgets[j]);
                }
                html += widgetGroup.html;

                html += "<td>";
                html += "<table><tr>";
                html += "</tr></table>";
                html += "</td>";
                html += "</tr>";
            }
            html += "</table>";
            html += "</form>";

            // Create form element from html
            this.formElement = core.Element.parse(html);

            // Append widgets to form element
            for (var i = 0; i < this.controlWidgets.length; i++) {
                var controlWidget = this.controlWidgets[i];
                if (controlWidget.libWidget != null) {
                    this.formElement.find("."+controlWidget.name).append(controlWidget.libWidget.getElement());
                }
            }

            // Append form element to the view
            this.view.getFormContent().append(this.formElement);
        },

        // Create values array from either 'instance' or 'local'
        getValues: function(control) {
            var values = [];
            var initialValue = control.initialValue;
            if (initialValue != null) {
                if (initialValue.source === "instance") {
                    values.push(this.variables[control.variable.name].value);
                }
                else if (initialValue.source === "local") {
                    if (initialValue.value != null) {
                        values.push(initialValue.value);
                    }
                }
            }
            return values;
        },

        createWidgetGroup: function(controlGroup) {
            var widgetGroup = null;

            if (controlGroup.type === "text") {
                groupWidgets = this.createTextWidgetGroup(controlGroup);
            }
            else if (controlGroup.type === "textarea") {
                groupWidgets = this.createTextareaWidgetGroup(controlGroup);
            }
            else if (controlGroup.type === "select") {
                groupWidgets = this.createSelectWidgetGroup(controlGroup);
            }
            else if (controlGroup.type === "check") {
                groupWidgets = this.createCheckWidgetGroup(controlGroup);
            }
            else if (controlGroup.type === "radio") {
                groupWidgets = this.createRadioWidgetGroup(controlGroup);
            }
            else if (controlGroup.type === "date") {
                groupWidgets = this.createDateWidgetGroup(controlGroup);
            }
            else if (controlGroup.type === "time") {
                groupWidgets = this.createTimeWidgetGroup(controlGroup);
            }
            else if (controlGroup.type === "spinner") {
                groupWidgets = this.createSpinnerWidgetGroup(controlGroup);
            }

            return groupWidgets;
        },

        createTextWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];

                var values = this.getValues(control);
                var value = (values != null && values.length > 0) ? values[0] : null;
                var style = "ebInput ebInput_longW";
                if (control.variable.readonly) {
                    style += " ebInput_disabled";
                }

                var required = (typeof control.variable.required == 'undefined') ? false : control.variable.required;   ///// grab the value of required from the form data
                var title = (typeof control.variable.title == 'undefined') ? "" : control.variable.title;               ///// grab the value of tooltip from the form data    

                html = "<td>";
                html += "<input type='text' class='" + style + " " + control.variable.name + "' id='" + control.variable.name + "' name='" + control.variable.name + 
                            "' value='" + (value != null ? value : "") + "' required = " + required + " title = '" + title + "'>"; 
///// "required" field newly added in html to be added in element. that will be catched later in getControlWidgetValue function. if need to enable this for other controls, do this for other
                html += "</td>";
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: null});
            }
            return {widgets: widgets, html: html};
        },

        createTextareaWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];

                var values = this.getValues(control);
                var value = (values != null && values.length > 0) ? values[0] : null;
                var style = "ebTextArea ebTextArea_longW";
                if (control.variable.readonly) {
                    style += " ebInput_disabled";
                }
                var title = (typeof control.variable.title == 'undefined') ? "" : control.variable.title;               ///// grab the value of tooltip from the form data 

                html += "<td>";
                html += "<textarea class='" + style + " " + control.variable.name + "' id='" + control.variable.name + "' name='" + control.variable.name + " title = '" + title + "'>"; 
                html += (value != null ? value : "");
                html += "</textarea>";
                html += "</td>";
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: null});
            }
            return {widgets: widgets, html: html};
        },

        createSelectWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];
                control.type = controlGroup.type;

                var title = (typeof control.variable.title == 'undefined') ? "" : control.variable.title;               ///// grab the value of tooltip from the form data 

                html += "<td class='" + control.variable.name + "' title = '" + title + "'>";
                var value = null;
                var items = [];
                if (control.initialValue.source === "local") {
                    for (var i = 0; i < control.initialValue.values.length; i++) {
                        items.push({name:control.initialValue.values[i]});
                    }
                    if (items.length > 0) {
                        value = items[0];
                    }
                }
                libWidget = new SelectBox({
                    value: value,
                    items: items,
                    modifiers:[{name:"smallW"}]
                });
                html += "</td>";
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: libWidget});
            }
            return {widgets: widgets, html: html};
        },

        createCheckWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            html += "<td>";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];
                control.type = controlGroup.type;

                var values = this.getValues(control);
                var value = (values != null && values.length > 0) ? values[0] : null;
                var style = "ebCheckbox";
                if (control.variable.readonly) {
                    style += " ebInput_disabled";
                }
                html += "<label><input type='checkbox' class='" + style + " " + control.variable.name + "' id='" + control.variable.name + "' name='" + control.variable.name + "'" +
                            ((value != null && value == true) ? " checked" : "") + "/>" +
                            "<span class='ebCheckbox-inputStatus'></span><span class='ebCheckbox-label eaWfsDemo-WfForm-checkbox-label'>" + control.variable.name + "</span></label>";                
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: null});
            }
            html += "</td>";
            return {widgets: widgets, html: html};
        },

        createRadioWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            html += "<td>";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];
                control.type = controlGroup.type;

                var values = this.getValues(control);
                var value = (values != null && values.length > 0) ? values[0] : null;
                var style = "ebRadioBtn";
                if (control.variable.readonly) {
                    style += " ebInput_disabled";
                }
                html += "<label><input type='radio' class='" + style + " " + control.variable.name + "' id='" + control.variable.name + "' name='" + controlGroup.name + "'" +
                            ((value != null && value == true) ? " checked" : "") + "/>" +
                            "<span class='ebRadioBtn-inputStatus'></span><span class='ebRadioBtn-label eaWfsDemo-WfForm-radio-label'>" + control.variable.name + "</span></label>";
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: null});
            }
            html += "</td>";
            return {widgets: widgets, html: html};
        },

        createDateWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];
                control.type = controlGroup.type;

                html += "<td class='" + control.variable.name + "'>";
                libWidget = new DatePicker({});
                html += "</td>";
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: libWidget});
            }
            return {widgets: widgets, html: html};
        },

        createTimeWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];
                control.type = controlGroup.type;

                html += "<td class='" + control.variable.name + "'>";
                libWidget = new TimePicker({});
                html += "</td>";
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: libWidget});
            }
            return {widgets: widgets, html: html};
        },

        createSpinnerWidgetGroup: function(controlGroup) {
            var controls = controlGroup.controls;

            var widgets = [];
            var html = "";
            for (var i = 0; i < controls.length; i++) {
                control = controls[i];
                control.type = controlGroup.type;

                var values = this.getValues(control);
                var value = (values != null && values.length > 0) ? values[0] : null;

                html += "<td class='" + control.variable.name + "'>";
                libWidget = new Spinner({ value: value});
                html += "</td>";
                widgets.push({name: control.variable.name, type: controlGroup.type, libWidget: libWidget});
            }
            return {widgets: widgets, html: html};
        },

        createVariables: function() {
            this.variables = new Object(null);
            if (this.variableCollection != null) {
                this.variableCollection.each(function(variableModel) {
                    this.variables[variableModel.getAttribute("name")] = {
                        name: variableModel.getAttribute("name"),
                        type: variableModel.getAttribute("type"),
                        value: variableModel.getAttribute("value")
                    }
                }.bind(this));
            }
        },

        validateForm: function() {
            // Check valid form format and model
            var formInfo = this.formModel.getAttribute("formInfo");
            if (formInfo.format != "json" || formInfo.modelType != "model1") {
                throw "Invalid form format:modelType: " + formInfo.format + ":" + formInfo.modelType + ". Supported: json:model1";
            }

            // TODO
        },

        getControlWidgetValue: function(controlWidget) {
            var value = null;
            var required = null;
            var element = this.formElement.find("."+controlWidget.name);

            if (controlWidget.type === "text") {
                value = element.element.value;
                required = element.element.required; /////newly added
            }
            if (controlWidget.type === "textarea") {
                value = element.element.value;
            }
            else if (controlWidget.type === "select") {
                value = controlWidget.libWidget.getValue().name;
            }
            else if (controlWidget.type === "check") {
                value = element.element.checked;
            }
            else if (controlWidget.type === "radio") {
                value = element.element.checked;
            }
            else if (controlWidget.type === "date") {
                value = controlWidget.libWidget.getValue();
            }
            else if (controlWidget.type === "time") {
                var widgetValue = controlWidget.libWidget.getValue();
                value = widgetValue.hours + ":" + widgetValue.minutes + ":" + widgetValue.seconds;
            }
            else if (controlWidget.type === "spinner") {
                value = controlWidget.libWidget.getValue();
            }

            return {value: value, required: required} ;
        },

        getVariables: function() {
            var variables = Object.create(null);
            var requiredVariables = "";
            for (var i = 0; i < this.controlWidgets.length; i++) {
                var controlWidget = this.controlWidgets[i];
                variables[controlWidget.name] = this.getControlWidgetValue(controlWidget);
                if(variables[controlWidget.name].required && variables[controlWidget.name].value == "")
                    requiredVariables = requiredVariables + controlWidget.name + ", ";
            }
            if(requiredVariables != ""){
                alert(requiredVariables + " required !!!");
            }
            else
                return variables;
        }

    });

});