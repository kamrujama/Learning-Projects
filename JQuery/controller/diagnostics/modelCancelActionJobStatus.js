define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    return function modelDeleteContentLibrary() {
     
        //-------------------------------------------------------------FOCUS ON CONFO POP UP-----------------------------------------------        
        $('#btnCancelActionID').focus();
       
        $('#modelActionID').keydown(function (e) {
            if ($('#btnCancelActionID').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnCancelAction_Yes').focus();
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

        var setTabindexLimit = function (x, standardFile, y) {
            console.log(x);
            startIndex = 2;
            lastIndex = x;
            prevLastIndex = y;
            tabLimitInID = standardFile;
        }
        setTabindexLimit(4, "cancelActionID", 3);
        // end tabindex

        var self = this;
        var gID = '';
        if (koUtil.isDeviceProfile()) {
            gID = 'jqxgridActionJobProfile';
        } else {
            gID = 'jqxgridActionJob';
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

        //click on yes button to cancel action job
        self.cancelActionJob = function () {
            var gId;
            if (koUtil.isDeviceProfile()) {
                gId = 'jqxgridActionJobProfile';
            } else {
                gId = 'jqxgridActionJob';
            }

            var selectedJobID = getMultiSelectedData(gId);
            var unSelectedIds = getUnSelectedUniqueId(gId);
            //var columnSortfilterForCancel = koUtil.GlobalColumnFilter;

            cancelSelectedActionStatus(selectedJobID, unSelectedIds, columnSortFilterActionJob, gId, deviceSearchObject)
        }
        seti18nResourceData(document, resourceStorage);
    };

    function cancelSelectedActionStatus(selectedJobID, unSelectedIds, columnSortFilterActionJob, gId, deviceSearchObject) {
        var cancelJobReq = new Object();
        var actionStatus = new Array();
        var Selector = new Object();
        var UnSelectedItemIds = new Array();

        for (var i = 0; i < selectedJobID.length; i++) {
            var eActionJob = new Object();
            eActionJob = selectedJobID[i].JobDevicesId;
            actionStatus.push(eActionJob);
        }
     
        var checkAll = checkAllSelected(gId);

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unSelectedIds;
        } else {
            Selector.SelectedItemIds = actionStatus;
            Selector.UnSelectedItemIds = null;
        }
        cancelJobReq.CallType = ENUM.get("CALLTYPE_NONE");
        if (koUtil.isDeviceProfile() == true)
            cancelJobReq.ColumnSortFilter = columnSortFilterActionJob;
        else
            cancelJobReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        cancelJobReq.DeviceId = null;
        cancelJobReq.DeviceSearch = deviceSearchObject;
        cancelJobReq.JobType = ENUM.get("JOB_TYPE_ACTION");
        cancelJobReq.PackageType = ENUM.get("None");
        cancelJobReq.Selector = Selector;
        if (koUtil.isDeviceProfile() == true)
            cancelJobReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        else
            cancelJobReq.UniqueDeviceId = 0;

        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {            
                    openAlertpopup(0, 'cancellation_request_will_be_processed_for_the_selected_jobs');
                    //gridFilterClear(gId);
                    gridRefreshClearSelection(gId);
                } 
            }
        }

        var method = 'CancelJob';
        var params = '{"token":"' + TOKEN() + '" ,"cancelJobReq":' + JSON.stringify(cancelJobReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
 
});