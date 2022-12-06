define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var columnSortFilterforApplicationParaTemplate = ko.observable();
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelViewApplicatonsParameterTemplate() {
        var self = this;

        //Draggable function
        $('#mdlApplicationHeader').mouseup(function () {
            $("#mdlApplicationDefn").draggable({ disabled: true });
        });

        $('#mdlApplicationHeader').mousedown(function () {
            $("#mdlApplicationDefn").draggable({ disabled: false });
        });
        /////////
    }
   
});