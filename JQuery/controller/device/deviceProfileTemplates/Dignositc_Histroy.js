define(["knockout", "autho", "koUtil", "constants", "globalFunction", "appEnum"], function (ko, autho, koUtil) {

    var lang = getSysLang();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function dignosticHistoryViewModel() {

        var self = this;
        self.observableDiagnosticHistory = ko.observable();
        self.diagnosticHistoryTabs = ko.observableArray();
        self.diagnosticHistoryTabs = koUtil.diagnosticHistoryTabs;

        var pageName = "diagnosticHistory";
        var initpagObj = initPageStorageObj(pageName);
        var PageStorage = initpagObj.PageStorage;
        if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
            var diagnosticHistoryTabChangeFunction = function () {
                var id = '#' + PageStorage[0].selectedVerticalTabName;
                $("#diagnosticHistoryTabHeader").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $(id).parent().addClass('active');
            }
            setTimeout(diagnosticHistoryTabChangeFunction, 1000);
            loadelement(PageStorage[0].selectedVerticalTabName, 'device/deviceProfileTemplates');
        } else {
        loadelement('actionStatusForDeviceProfile', 'device/deviceProfileTemplates');
        }

        function loadelement(elementname, controlerId) {
            if (elementname != '') {
                if (!ko.components.isRegistered(elementname)) {
                    generateTemplate(elementname, controlerId);
                }
                self.observableDiagnosticHistory(elementname);
            }

        }

        self.showDiagnosticHistory = function (Id) {
            storeVerticalTabInSession('diagnosticHistory', Id);
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