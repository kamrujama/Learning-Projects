define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
      
        //focus on cancel button
        $('#jobStautsView').on('shown.bs.modal', function () {
            $('#btnCancelID').focus();
        })


        $('#jobStautsView').keydown(function (e) {
            if ($('#btnCancelID').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#cancelDownloadID_YesBtn').focus();
            }
        });

        var self = this;
        var gID = '';
        if (koUtil.isDeviceProfile()) {
            gID = 'jqxgridDownloadJobProfil';
        } else {
            gID = 'jqxgridDownloadJob';
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

        //click on yes button to cancel download job
        self.cancelDownloadJob = function (gId) {
            if (koUtil.isDeviceProfile()) {
                gId= 'jqxgridDownloadJobProfil';
            } else {
                gId = 'jqxgridDownloadJob';
            }

            var selectedJobID = getMultiSelectedData(gId);
            var unSelectedIds = getUnSelectedUniqueId(gId);
            cancelSelectedJobStatus(selectedJobID, unSelectedIds, gId, true, deviceSearchObject)
        }

        //click on No-Disable button to cancel download job
        self.cancelNoDownloadJob = function (gId) {
            if (koUtil.isDeviceProfile()) {
                gId = 'jqxgridDownloadJobProfil';
            } else {
                gId = 'jqxgridDownloadJob';
            }

            var selectedJobID = getMultiSelectedData(gId);
            var unSelectedIds = getUnSelectedUniqueId(gId);
            cancelSelectedJobStatus(selectedJobID, unSelectedIds, gId, false, deviceSearchObject)
        }
        seti18nResourceData(document, resourceStorage);
    };  

    function cancelSelectedJobStatus(selectedJobID, unSelectedIds, gId, status, deviceSearchObject) {
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
            CancelJobReq.ColumnSortFilter = columnSortFilterDownloadJob;
        else
            CancelJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        CancelJobReq.DeviceId = null;
        CancelJobReq.DeviceSearch = deviceSearchObject;
        CancelJobReq.JobType = ENUM.get("JOB_TYPE_DOWNLOAD");
        CancelJobReq.PackageType = ENUM.get("Software");
        CancelJobReq.DisableAutoDownloadForDevice = status;
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
        }

        var method = 'CancelJob';
        var params = '{"token":"' + TOKEN() + '" ,"cancelJobReq":' + JSON.stringify(CancelJobReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});