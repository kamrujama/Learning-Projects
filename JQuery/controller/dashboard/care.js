define(["knockout", "advancedSearchUtil"], function (ko, ADSearchUtil) {

    return function getFrameSource() {
        ADSearchUtil.AdScreenName = 'careDashboard';

        mainMenuSetSelection("care");
        removeSetMenuSelection("care");
        seti18nResourceData(document, resourceStorage);
        loadCareDashboard();

        function loadCareDashboard() {
            var gridv = gridHeightFunction("iframeDiv", null);
            $("#iframeDiv").attr('src', "./VHQDeviceProfile/#/verifonecare");
            $("#iframeDiv").attr('height', gridv);
        }
    }
}); 