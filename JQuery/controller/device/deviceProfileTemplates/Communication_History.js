define(["knockout", "autho", "koUtil", "constants", "globalFunction", "appEnum"], function (ko, autho, koUtil) {

    var lang = getSysLang();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function communicationHistoryViewModel() {

        var self = this;
        self.observableCommunicationHistory = ko.observable();
        self.communicationHistoryTabs = ko.observableArray();
        self.communicationHistoryTabs = koUtil.communicationHistoryTabs;

        var pageName = "communicationHistory";
        var initpagObj = initPageStorageObj(pageName);
        var PageStorage = initpagObj.PageStorage;
        if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
            var communicationHistoryTabChangeFunction = function () {
                var id = '#' + PageStorage[0].selectedVerticalTabName;
                $("#communicationHistoryTabHeader").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $(id).parent().addClass('active');
            }
            setTimeout(communicationHistoryTabChangeFunction, 1000);
            loadelement(PageStorage[0].selectedVerticalTabName, 'device/deviceProfileTemplates');
        } else {
            loadelement('communicationHistoryForDeviceProfile', 'device/deviceProfileTemplates');
        }
        function loadelement(elementname, controlerId) {
            if (elementname != '') {
                if (!ko.components.isRegistered(elementname)) {
                    generateTemplate(elementname, controlerId);
                }
                self.observableCommunicationHistory(elementname);
            }

        }

        self.showCommunicationHistory = function (Id) {
            storeVerticalTabInSession('communicationHistory', Id);
            loadelement(Id, 'device/deviceProfileTemplates');
        }

    };
    
    function generateTemplate(tempname, controlerId) {
        //new template code
        var htmlName = '../template/' + controlerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controlerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }

        });
        // end new template code
    }
});