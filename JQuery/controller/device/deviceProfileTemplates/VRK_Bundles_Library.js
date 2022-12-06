define(["knockout", "autho", "koUtil", "constants", "globalFunction", "appEnum"], function (ko, autho, koUtil) {

    var lang = getSysLang();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function vrkBundleLibraryViewModel() {

        var self = this;
        self.observableVRKBundleLibrary = ko.observable();
        self.vrkBundlesLibraryTabs = ko.observableArray();
        self.vrkBundlesLibraryTabs = koUtil.vrkBundlesLibraryTabs;

        var pageName = "vrkBundlesLibrary";
        var initpagObj = initPageStorageObj(pageName);
        var PageStorage = initpagObj.PageStorage;
        if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
            var vrkBundlesLibraryTabChangeFunction = function () {
                var id = '#' + PageStorage[0].selectedVerticalTabName;
                $("#vrkBundlesLibraryTabHeader").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $(id).parent().addClass('active');
            }
            setTimeout(vrkBundlesLibraryTabChangeFunction, 1000);
            loadelement(PageStorage[0].selectedVerticalTabName, 'device/deviceProfileTemplates');
        } else {
            loadelement('vrkDownloadJobForDeviceProfile', 'device/deviceProfileTemplates');
        }

        function loadelement(elementname, controlerId) {
            if (elementname != '') {
                if (!ko.components.isRegistered(elementname)) {
                    generateTemplate(elementname, controlerId);
                }
                self.observableVRKBundleLibrary(elementname);
            }

        }

        self.showVRKBundleLibrary = function (Id) {
            storeVerticalTabInSession('vrkBundlesLibrary', Id);
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