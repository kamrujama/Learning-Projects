define(["knockout", "sammy.min", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, Sammy, koUtil) {

    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function DeviceSearchdViewModel() {
       
        var self = this;
        setMenuSelection();
        seti18nResourceData(document, resourceStorage);
    };
});