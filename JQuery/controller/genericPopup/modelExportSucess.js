define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    
    return function exportSucessModel() {

        var self = this;
        seti18nResourceData(document, resourceStorage);
    };
});