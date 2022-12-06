define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, ADSearchUtil) {
    var lang = getSysLang();

    return function getModelCloseAlert() {
     

        //focus on first textbox
        $('#alertModel').on('shown.bs.modal', function () {
            $('#addNotes').focus();
        })

        $('#alertModel').keydown(function (e) {
            if ($('#closeAlert_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#closeAlert_CloseBtn').focus();
            }
        });

        var self = this;

        //Draggable function
        $('#mdlCloseAlertHeader').mouseup(function () {
            $("#mdlCloseAlert").draggable({ disabled: true });
        });

        $('#mdlCloseAlertHeader').mousedown(function () {
            $("#mdlCloseAlert").draggable({ disabled: false });
        });
        ////////////////
      
        var gridId = globalVariableForSetAlerts.push;

        self.gridId = gridId;

        self.closeAlerts = function (alertModelComponent, gId) {
            var setAlertReq = new Object();
            var deviceAlerts = new Array();
            var unSelectedItemIds = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);

            if (checkAll == 1) {
                UnSelectedItemIds = unSelectedItemIds;
                deviceAlerts = null;
            }
            else {
                for (var i = 0; i < globalVariableForSetAlerts.length; i++) {
                    UnSelectedItemIds = null;
                    var eDeviceAlert = new Object();
                    eDeviceAlert.DeviceAlertId = globalVariableForSetAlerts[i].DeviceAlertId;
                    eDeviceAlert.Notes = $("#addNotes").val();
                    eDeviceAlert.Status = 1;
                    eDeviceAlert.UniqueDeviceId = globalVariableForSetAlerts[i].UniqueDeviceId;
                    deviceAlerts.push(eDeviceAlert);
                }
            }

            setAlertReq.AlertTypeId = 0;
            setAlertReq.CallType = ENUM.get("CALLTYPE_NONE");
            setAlertReq.DeviceId = null;
            setAlertReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
            setAlertReq.UnSelectedItemIds = UnSelectedItemIds;
            setAlertReq.Notes = $("#addNotes").val();
            setAlertReq.Status = "Closed";
            if (ADSearchUtil.AdScreenName == 'deviceProfile') {
                setAlertReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
            } else {
                setAlertReq.UniqueDeviceId = 0;
            }
            setAlertReq.IsClosedOn = true;
            setAlertReq.DeviceAlerts = deviceAlerts;
            setAlertReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

            var callbackFunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        $('#alertModel').modal('hide');
                        //gridFilterClear(gridId);
                        fixeddatechecKInternal = '';
                        gridClearFlag = 1;
                        pagechange = 1;

                        var gridStorageArr = new Array();
                        var gridStorageObj = new Object();
                        gridStorageObj.checkAllFlag = 0;
                        gridStorageObj.counter = 0;
                        gridStorageObj.filterflage = 0;
                        gridStorageObj.selectedDataArr = [];
                        gridStorageObj.unSelectedDataArr = [];
                        gridStorageObj.singlerowData = [];
                        gridStorageObj.multiRowData = [];
                        gridStorageObj.TotalSelectionCount = null;
                        gridStorageObj.highlightedRow = null;
                        gridStorageObj.highlightedPage = null;

                        gridStorageArr.push(gridStorageObj);
                        var gridStorage = JSON.stringify(gridStorageArr);
                        window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);

                        gridRefreshClearSelection(gridId);
                        //setTimeout(applyDefaultFilter, 5000);
                        openAlertpopup(0, 'alert_changes_saved_successfully');
                        alertModelComponent('unloadTemplate');             
                    } 
                }
            }

            var method = 'SetAlert';
            var params = '{"token":"' + TOKEN() + '" ,"setAlertReq":' + JSON.stringify(setAlertReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }

        //function applyDefaultFilter() {
        //    var DateObj = Object();
        //    CallType = ENUM.get("CALLTYPE_WEEK");
        //    DateObj.ColumnType = 'Date';
        //    DateObj.FilterDays = 0;
        //    var fromDate = moment().subtract('days', 6);
        //    DateObj.FilterValue = moment(fromDate).format('MM/DD/YYYY');
        //    DateObj.FilterValueOptional = moment().format('MM/DD/YYYY');
        //    DateObj.IsFixedDateRange = true;
        //    var dateArr = new Array();
        //    dateArr.push(DateObj);

        //    var filtergroup = new $.jqx.filter();
        //    var filter_or_operator = 1;
        //    var filtervalue = dateArr;
        //    var filtercondition = 'contains';
        //    var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        //    filtergroup.addfilter(filter_or_operator, filter);
        //    // add the filters.
        //    $("#" + gridId).jqxGrid('addfilter', 'EventReceivedDate', filtergroup);
        //    // apply the filters.
        //    $("#" + gridId).jqxGrid('applyfilters');
        //}

        seti18nResourceData(document, resourceStorage);
    }
});