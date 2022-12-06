isContentHistory = false;
define(["knockout", "autho", "koUtil", "constants", "globalFunction", "appEnum"], function (ko, autho, koUtil) {

    var lang = getSysLang();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    return function contentHistoryViewModel() {

        var self = this;
        self.observableContentHistory = ko.observable();
        self.contentHistoryTabs = ko.observableArray();
        self.contentHistoryTabs = koUtil.contentHistoryTabs;

        var pageName = "contentHistory";
        var initpagObj = initPageStorageObj(pageName);
        var PageStorage = initpagObj.PageStorage;
        if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
            var contentHistoryTabChangeFunction = function () {
                var id = '#' + PageStorage[0].selectedVerticalTabName;
                $("#contentHistoryTabHeader").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $(id).parent().addClass('active');
            }
            setTimeout(contentHistoryTabChangeFunction, 1000);
            loadelement(PageStorage[0].selectedVerticalTabName, 'device/deviceProfileTemplates');
        } else {
            loadelement('contentJobStatusReportForDeviceProfile', 'device/deviceProfileTemplates');
        }

        if (isContentHistory == true) {
            loadelement('contentDetailedStatusReportForDeviceProfile', 'device/deviceProfileTemplates');
            $("#detailContentActive").addClass('active');
            $("#jobContentActive").removeClass('active');
        } else {
            loadelement('contentJobStatusReportForDeviceProfile', 'device/deviceProfileTemplates');
            $("#jobContentActive").addClass('active');
            $("#detailContentActive").removeClass('active');
        }

        function loadelement(elementname, controlerId) {
            if (elementname != '') {
                if (!ko.components.isRegistered(elementname)) {
                    generateTemplate(elementname, controlerId);
                }
                self.observableContentHistory(elementname);
            }

        }

        self.showContentHistory = function (Id) {
            storeVerticalTabInSession('contentHistory', Id);
            loadelement(Id, 'device/deviceProfileTemplates');
            if (Id == "contentJobStatusReportForDeviceProfile") {
                isContentHistory = false;
            } else if (Id == "contentDetailedStatusReportForDeviceProfile") {
                isContentHistory = true;
            }
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