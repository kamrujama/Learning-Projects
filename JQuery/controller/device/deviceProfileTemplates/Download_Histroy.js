define(["knockout", "autho", "koUtil", "constants", "globalFunction", "appEnum"], function (ko, autho, koUtil) {

    var lang = getSysLang();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function downloadHistoryViewModel() {
        var self = this;
        self.observableDownloadHistory = ko.observable();

        self.downloadHistoryTabs = ko.observableArray();

        self.downloadHistoryTabs = koUtil.downloadHistoryTabs;

        var pageName = "downloadHistory";
        var initpagObj = initPageStorageObj(pageName);
        var PageStorage = initpagObj.PageStorage;
        if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
            var downloadHistoryTabChangeFunction = function () {
                var id = '#' + PageStorage[0].selectedVerticalTabName;
                $("#downloadHistoryTabHeader").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $(id).parent().addClass('active');
            }
            setTimeout(downloadHistoryTabChangeFunction, 1000);
            loadelement(PageStorage[0].selectedVerticalTabName, 'device/deviceProfileTemplates');
        } else {
        loadelement('downloadJobForDeviceProfile', 'device/deviceProfileTemplates');
        }
        function loadelement(elementname, controlerId) {
            if (elementname != '') {
                if (!ko.components.isRegistered(elementname)) {
                    generateTemplate(elementname, controlerId);
                }
                self.observableDownloadHistory(elementname);
            }

        }

        self.showDownloadHistory = function (Id) {
            autoRefreshDownloadProgressStop();
            storeVerticalTabInSession('downloadHistory', Id);
            loadelement(Id, 'device/deviceProfileTemplates');
            //if (name == "jobs_data") {
            //    storeVerticalTabInSession('downloadHistory', 'downloadJobForDeviceProfile');
            //    loadelement('downloadJobForDeviceProfile', 'device/deviceProfileTemplates');
            //} else if (name == "details_data") {
            //    storeVerticalTabInSession('downloadHistory', 'downloadDetailForDeviceProfile');
            //    loadelement('downloadDetailForDeviceProfile', 'device/deviceProfileTemplates');
            //}
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