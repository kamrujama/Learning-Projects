define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {   

        //focus on cancel button
        $('#contentModelID').on('shown.bs.modal', function () {
            $('#btnCancelContentID').focus();
        })


        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#contentModelID').on('shown.bs.modal', function (e) {
            $('#btnStandardFileNo').focus();

        });
        $('#contentModelID').keydown(function (e) {
            if ($('#btnCancelContentID').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#canceljobYesBtn').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------
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

        var setTabindexLimit = function (x, cancelContent, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            tabLimitInID = cancelContent;
        }
        setTabindexLimit(4, "confirmationCancelID", 3);
        // end tabindex

        var self = this;
        var gID = '';
        if (koUtil.isDeviceProfile()) {
            gID = 'jqxgridContentJobStatusProfile';
        } else {
            gID = 'jqxgridContentJob';
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

        //click on yes button to cancel content job
        self.cancelContentJob = function (gId) {
            
            if (koUtil.isDeviceProfile()) {
                gId = 'jqxgridContentJobStatusProfile';
            } else {
                gId = 'jqxgridContentJob';
            }
            var selectedJobID = getMultiSelectedData(gId);
            var unSelectedIds = getUnSelectedUniqueId(gId);
            cancelSelectedJobStatus(selectedJobID, unSelectedIds, gId, deviceSearchObject);
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
            CancelJobReq.ColumnSortFilter = columnSortFilterContentJob;
        else
            CancelJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        CancelJobReq.DeviceId = null;
        CancelJobReq.DeviceSearch = deviceSearchObject;
        CancelJobReq.JobType = ENUM.get("JOB_TYPE_DOWNLOAD");
        CancelJobReq.PackageType = ENUM.get("Content");
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