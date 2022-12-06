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
        var nestedRoutePath = getRouteUrl();

        if (nestedRoutePath[3] == 'downloads') {
            $("#headblanckSchedule").text(i18n.t('schedule', { lng: lang }));
        } else if (nestedRoutePath[3] == 'manageContents') {
            $("#headblanckSchedule").text(i18n.t('scheduleDelivery', { lng: lang }));
        } else if (nestedRoutePath[3] == 'diagnostics') {
            $("#headblanckSchedule").text(i18n.t('scheduleActions', { lng: lang }));
        }
        openAlertpopup(1, 'schedul_permission');
        setMenuSelection();
        seti18nResourceData(document, resourceStorage);
    };
});