define([
    "widgets/table/Cell"
], function(Cell) {

    return Cell.extend({

        setValue: function(value) {
            if (value === null) {
                this.getElement().setText("");
            } else {
                this.getElement().setText(value);
            }
        }

    });

});