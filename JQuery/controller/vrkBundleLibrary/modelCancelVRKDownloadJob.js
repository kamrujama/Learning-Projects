define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
        
        //focus on cancel button
        $('#jobStautsView').on('shown.bs.modal', function () {
            $('#btnCancelID').focus();
        })

        // focus on next tab index 
        lastIndex = 4;
        prevLastIndex = 3;
        $(document).keydown(function (e) {
            if (e.keyCode == 9) {
                var thisTab = +$(":focus").prop("tabindex") + 1;

                if (e.shiftKey) {
                    if (thisTab == prevLastIndex) {
                        $("#" + tabLimitInID).find('[tabindex=' + prevLastIndex + ']').focus();
                        return false;
                    }
                } else {
                    if (thisTab == lastIndex) {
                        $("#" + tabLimitInID).find('[tabindex=' + startIndex + ']').focus();
                        return false;
                    }
                }
            }
        });

        var setTabindexLimit = function (x, standardFile, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            tabLimitInID = standardFile;
        }
        setTabindexLimit(4, "cancelDownloadID", 3);
        // end tabindex

        var self = this;
        var gID = '';
        if (koUtil.isDeviceProfile()) {
            gID = 'jqxGridvrkDownloadJobForDeviceProfile';
        } else {
            gID = 'jqxgridVRKDownloadJob';
        }

        var deviceSearchObject = new Object();
        var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
        if (!_.isEmpty(adStorage) && adStorage.length > 0) {
            if (adStorage[0].adSearchObj) {
                deviceSearchObject = adStorage[0].adSearchObj;
            } else {
                deviceSearchObject = null;
            }
        }

        //Draggable popup
        $("#draggCanelDownloadID").draggable();

        //click on yes button to cancel download job
        self.cancelDownloadJob = function (gId) {
            if (koUtil.isDeviceProfile()) {
                gId = 'jqxGridvrkDownloadJobForDeviceProfile';
            } else {
                gId = 'jqxgridVRKDownloadJob';
            }
            var selectedJobID = getMultiSelectedData(gId);
            var unSelectedIds = getUnSelectedUniqueId(gId);
            cancelSelectedJobStatus(selectedJobID, unSelectedIds, gId, deviceSearchObject)
        }
        seti18nResourceData(document, resourceStorage);
    };  

    function cancelSelectedJobStatus(selectedJobID, unSelectedIds, gId, deviceSearchObject) {
        var CancelJobReq = new Object();
        var jobStatus = new Array();
        var Selector = new Object();
        var UnSelectedItemIds = new Array();

        for (var i = 0; i < selectedJobID.length; i++) {
            var eDownloadJob = new Object();
            eDownloadJob = selectedJobID[i].JobDevicesId;
            jobStatus.push(eDownloadJob);
        }
       
        var checkAll = checkAllSelected(gId);

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unSelectedIds;
        } else {
            Selector.SelectedItemIds = jobStatus;
            Selector.UnSelectedItemIds = null;
        }

        CancelJobReq.CallType = ENUM.get("CALLTYPE_NONE");
        if (koUtil.isDeviceProfile() == true)
            CancelJobReq.ColumnSortFilter = columnSortFilterVRKDownloadJob;
        else
            CancelJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        CancelJobReq.DeviceId = null;
        CancelJobReq.DeviceSearch = deviceSearchObject;
        CancelJobReq.JobType = ENUM.get("JOB_TYPE_DOWNLOAD");
        CancelJobReq.PackageType = ENUM.get("VRKPayLoad");
        CancelJobReq.Selector = Selector;
        if (koUtil.isDeviceProfile() == true)
            CancelJobReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        else
            CancelJobReq.UniqueDeviceId = 0;

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {  
                    openAlertpopup(0, 'cancellation_request_will_be_processed_for_the_selected_jobs');
                    gridRefreshClearSelection(gId);
                } 
            }
            $("#loadingDiv").hide();
        }

        var method = 'CancelJob';
        var params = '{"token":"' + TOKEN() + '" ,"cancelJobReq":' + JSON.stringify(CancelJobReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});