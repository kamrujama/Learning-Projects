define(["knockout", "koUtil", "autho", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, autho) {

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    var lang = getSysLang();
    var gridSelectedRowArray = new Array();

    return function keyHandleViewModel() {

        self.movedArray = ko.observableArray();
        self.keysData = ko.observableArray();
        self.rightKeyData = ko.observableArray();
        self.allKeysSelected = ko.observable(false);
        self.templateFlag = ko.observable(false);
        self.enableExpiryDays = ko.observable(false);

        var isKeyHandleEditAllowed = false;
        var rowIndexForHighlighted; //highlighted package selection
        var isRightPackagesClick;
        var rowIdForHighlightedForTable;
        var isSelectedPaneFiltered = false; //To check filter applied on Selected Packages Pane
        var selectedRowArrayForSwap = new Array();
        var selectedKeyIds = new Array();
        var renewKeyHandleId = 0;

        $('#saveKeysConfirmationDiv').on('shown.bs.modal', function (e) {
            $('#saveKeys_NO').focus();

        });
        $('#saveKeysConfirmationDiv').keydown(function (e) {
            if ($('#saveKeys_NO').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#saveKeys_YES').focus();
            }
        });

        $('#keysModalHeader').mouseup(function () {
            $("#keysModalContent").draggable({ disabled: true });
        });

        $('#keysModalHeader').mousedown(function () {
            $("#keysModalContent").draggable({ disabled: false });
        });

        checkRights();
        function checkRights() {
            isKeyHandleEditAllowed = autho.checkRightsBYScreen('Key Handle', 'IsModifyAllowed');
        }

        //function for move element in Array
        Array.prototype.moveUp = function (value) {
            var index = this.indexOf(value),
                newPos = index - 1;

            if (index === -1)
                throw new Error("Element not found in array");

            this.splice(index, 1);
            if (index === 0)
                newPos = this.length;
            this.splice(newPos, 0, value);
        };

        Array.prototype.moveDown = function (value) {
            var index = this.indexOf(value),
                newPos = index + 1;

            if (index === -1)
                throw new Error("Element not found in array");

            this.splice(index, 1);
            if (index >= this.length)
                newPos = 0;
            this.splice(newPos, 0, value);
        };

        $("#txtRenewKeys").on('keyup', function () {
            if (parseInt($("#txtRenewKeys").val()) >= parseInt(AppConstants.get("KEY_HANDLES_DAYS_MIN")) && $("#txtRenewKeys").val() <= parseInt(AppConstants.get("KEY_HANDLES_DAYS_MAX"))) {
                enableDisableSaveKeyRenewal(1);
            } else if ($("#txtRenewKeys").val() < parseInt(AppConstants.get("KEY_HANDLES_DAYS_MIN"))) {
                $("#txtRenewKeys").val(parseInt(AppConstants.get("KEY_HANDLES_DAYS_MIN")));
                enableDisableSaveKeyRenewal(1);
            } else if ($("#txtRenewKeys").val() > parseInt(AppConstants.get("KEY_HANDLES_DAYS_MAX"))) {
                $("#txtRenewKeys").val(parseInt(AppConstants.get("KEY_HANDLES_DAYS_MAX")));
                enableDisableSaveKeyRenewal(1);
            }
        })

        self.clearFilter = function (gridID) {
            clearUiGridFilter(gridID);
            $('#' + gridID).jqxGrid('clearselection');
            $("#btnForMoveRight").addClass('disabled');
        }

        self.clearTableFilter = function (tableid) {
            clearCustomFilterInTable(tableid);
            if (isSelectedPaneFiltered) {
                clearSelectedPackagesPane();
                isSelectedPaneFiltered = false;
            }
        }

        self.customFilter = function (element, dataArray) {
            customTableFilter(element, dataArray, callBackOnCustomFilter);
        }

        function callBackOnCustomFilter(isFilterApplied) {
            if (isFilterApplied) {
                isSelectedPaneFiltered = true;
                clearSelectedPackagesPane();
            }
            else {
                if (isSelectedPaneFiltered)
                    clearSelectedPackagesPane();

                isSelectedPaneFiltered = false;
            }
        }

        //Removing checked array and disbleing Up/Down arrows on Filter apply 
        function clearSelectedPackagesPane() {
            self.movedArray().forEach(function (element, index) {
                var id = '#selectedKeychkbox' + index + '';
                $(id)[0].checked = false;
                element.actionSelected = false;
            });
            selectedRowArrayForSwap = [];
            //selectedDownloadsActionsContent = [];
            $("#btnMoveLeft").addClass('disabled');
            $("#btnMoveItemUp").addClass('disabled');
            $("#btnMoveItemDown").addClass('disabled');
        }

        self.selectSelectedKey = function (data, index) {
            $("#btnMoveLeft").removeClass('disabled');
            var id = '#selectedKeychkbox' + index + '';
            if ($(id)[0].checked == true) {
                if (selectedRowArrayForSwap.length > 0) {
                    for (var j = 0; j < selectedRowArrayForSwap.length; j++) {
                        if (selectedRowArrayForSwap[j].Type == AppConstants.get('Assignment_Key')) {
                            if (data.UniqueKeyId == selectedRowArrayForSwap[j].UniqueKeyId) {
                                selectedRowArrayForSwap.splice(j, 1);
                                break;
                            }
                        }
                    }
                }
                data.SelectedArrayIndex = index;
                selectedRowArrayForSwap.push(data);
            } else {
                for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
                    if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
                        if (data.UniqueKeyId == selectedRowArrayForSwap[i].UniqueKeyId) {
                            selectedRowArrayForSwap.splice(i, 1);
                        }
                    }
                }
                if (selectedRowArrayForSwap.length == 0) {
                    $("#btnMoveLeft").addClass('disabled');
                }
                //#Updating changed index into array "selectedRowArrayForSwap"
                var arr = self.movedArray();
                selectedRowArrayForSwap.forEach(function (element) {
                    if (element.Type == AppConstants.get('Assignment_Key')) {
                        element.SelectedArrayIndex = getArrayIndexForKey(arr, 'PackageId', element.PackageId);
                    }
                });
            }

            rowIdForHighlightedForTable = index;
            if (isSelectedPaneFiltered || selectedRowArrayForSwap.length == 0 || (selectedRowArrayForSwap.length == self.movedArray().length)) {
                $("#btnMoveItemUp").addClass('disabled');
                $("#btnMoveItemDown").addClass('disabled');
                return;
            }

            //#Function call:----To Enable/Disble the Up/Down Arrows----
            var lastIndex = self.movedArray().length - 1;
            enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
        }

        self.SelectAllSelectedKeys = function () {
            var selectedpackages = self.movedArray();
            if ($('#selectAllSelectedKeys')[0].checked == true) {
                if (selectedpackages.length > 0) {
                    $("#btnMoveLeft").removeClass('disabled');
                    for (var i = 0; i < selectedpackages.length; i++) {
                        selectedpackages[i].keySelected = true;
                        selectedRowArrayForSwap.push(selectedpackages[i]);
                    }
                }
            } else {
                $("#btnMoveLeft").addClass('disabled');
                selectedRowArrayForSwap = [];
                for (var j = 0; j < selectedpackages.length; j++) {
                    selectedpackages[j].keySelected = false;
                }
            }

            $("#btnMoveItemUp").addClass('disabled');
            $("#btnMoveItemDown").addClass('disabled');
            self.movedArray([]);
            self.movedArray(selectedpackages);
        }

        self.renewKey = function (data, index) {
            renewKeyHandleId = data.Keyhandleid;
            var thresholdDays = parseInt(AppConstants.get("KEY_HANDLES_DAYS_MIN"));
            if (data.EnabledForAutoRenew == true) {
                $("#chkAutoRenew").prop('checked', true);
                self.enableExpiryDays(true);
                enableDisableSaveKeyRenewal(1);
            } else {
                $("#chkAutoRenew").prop('checked', false);
                self.enableExpiryDays(false);
            }
            if (parseInt(data.AutoRenewThreshold) >= parseInt(AppConstants.get("KEY_HANDLES_DAYS_MIN")) && parseInt(data.AutoRenewThreshold) <= parseInt(AppConstants.get("KEY_HANDLES_DAYS_MAX"))) {
                thresholdDays = parseInt(data.AutoRenewThreshold);
            }
            $("#txtRenewKeys").val(thresholdDays);
            $("#modalRenewKeys").modal('show');
        }

        self.onChangeRenewKey = function () {
            if ($("#chkAutoRenew").is(':checked')) {
                self.enableExpiryDays(true);
                parseInt($("#txtRenewKeys").val()) >= parseInt(AppConstants.get("KEY_HANDLES_DAYS_MIN")) ? enableDisableSaveKeyRenewal(1) : enableDisableSaveKeyRenewal(0);
            } else {
                self.enableExpiryDays(false);
                enableDisableSaveKeyRenewal(0);
            }
        }

        self.increaseDays = function () {
            if (self.enableExpiryDays() == true) {
                var days = $("#txtRenewKeys").val();
                if (parseInt(days) < parseInt(AppConstants.get("KEY_HANDLES_DAYS_MAX"))) {
                    $("#txtRenewKeys").val(parseInt(days) + 1);
                    enableDisableSaveKeyRenewal(1);
                }
            }
        }

        self.decreaseDays = function () {
            if (self.enableExpiryDays() == true) {
                var days = $("#txtRenewKeys").val();
                if (parseInt(days) > parseInt(AppConstants.get("KEY_HANDLES_DAYS_MIN"))) {
                    $("#txtRenewKeys").val(parseInt(days) - 1);
                    enableDisableSaveKeyRenewal(1);
                }
            }
        }

        self.saveKeyRenewal = function () {
            var source = _.where(self.movedArray(), { Keyhandleid: renewKeyHandleId });
            if (!_.isEmpty(source) && source.length > 0) {
                source[0].EnabledForAutoRenew = "1";
                source[0].AutoRenewThreshold = parseInt($("#txtRenewKeys").val());
            }
            $('#saveKeysConfirmationDiv').modal('show');
        }

        self.cancelKeyRenewal = function () {
            renewKeyHandleId = 0;
            self.enableExpiryDays(false);
            $("#chkAutoRenew").prop('checked', false);
            $("#txtRenewKeys").val(0);
            enableDisableSaveKeyRenewal(0);
        }

        self.rightKeys = function () {

            var referenceArr = self.movedArray();
            gridSelectedRowArray = new Array();
            var selectedKeyData = getMultiSelectedData('jqxgridAvailableKeys');
            var selectedKeyDataArray = getSelectedUniqueId('jqxgridAvailableKeys');

            //selected Keys array
            if (!_.isEmpty(selectedKeyDataArray) && selectedKeyDataArray.length > 0) {
                for (k = 0; k < selectedKeyDataArray.length; k++) {
                    var selectedkeysource = _.where(selectedKeyData, { UniqueKeyId: selectedKeyDataArray[k] });
                    if (selectedkeysource.length > 0) {
                        var keysData = selectedkeysource[0];
                        keysData.keySelected = false;
                        keysData.IsSelected = false;
                        keysData.Type = AppConstants.get('Assignment_Key');
                        if (!keysData.keyType || keysData.keyType == null || keysData.keyType == undefined) {
                            keysData.keyType = '';
                        }
                        if (!keysData.destination || keysData.destination == null || keysData.destination == undefined) {
                            keysData.destination = '';
                        }
                        keysData.Details = "Name: " + keysData.name + ' , Key Type: ' + keysData.keyType + ' , Destination: ' + keysData.destination;
                        keysData.EnabledForAutoRenew = "0";
                        keysData.AutoRenewThreshold = 0;
                        gridSelectedRowArray.push(keysData);
                    }
                }
            }

            //removing selected keys from Available Keys grid
            if (gridSelectedRowArray.length > 0) {
                totalpackageassignment = gridSelectedRowArray.length + referenceArr.length;
                var iskeysUpdated = false;
                for (var i = 0; i < gridSelectedRowArray.length; i++) {
                    if (gridSelectedRowArray[i] != null) {
                        gridSelectedRowArray[i].keySelected = false;
                        self.movedArray.push(gridSelectedRowArray[i]);
                        if (gridSelectedRowArray[i].Type == AppConstants.get('Assignment_Key')) {
                            var selectedkeysource = _.where(self.keysData(), { UniqueKeyId: gridSelectedRowArray[i].UniqueKeyId });
                            self.keysData.remove(selectedkeysource[0]);
                            iskeysUpdated = true;
                        }
                    }
                }

                //refresh Available Keys grid
                if (iskeysUpdated) {
                    clearMultiSelectedData('jqxgridAvailableKeys');
                    $("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
                    $("#jqxgridAvailableKeys").jqxGrid('clearselection');
                }

                if (self.keysData().length <= 0) {
                    $("#btnForAllMoveright").addClass('disabled');
                }
                $("#btnForMoveRight").addClass('disabled');
                $("#btnAllMoveLeft").removeClass('disabled');

                gridSelectedRowArray = [];
                if (isSelectedPaneFiltered) {
                    clearCustomFilterInTable("SelectedKeysTable");
                    clearSelectedPackagesPane();
                    isSelectedPaneFiltered = false;
                }
                else {
                    //To Enable/Disble the Up/Down Arrows----                    
                    if (selectedRowArrayForSwap.length <= 0 || selectedRowArrayForSwap.length == self.movedArray().length) {
                        $("#btnMoveItemUp").addClass('disabled');
                        $("#btnMoveItemDown").addClass('disabled');
                    } else {
                        var lastIndex = self.movedArray().length - 1;
                        $("#btnMoveItemDown").removeClass('disabled');
                        enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
                    }
                }

                if (isRightPackagesClick == "No") {    //Selection row and State maintain In grid
                    rowIndexForHighlighted = undefined;
                } else {
                    rowIndexForHighlighted = rowIndexForHighlighted;
                }
                selectedHighlightedRowForGrid();  //Selection row and State maintain In grid

                for (var j = 0; j < self.movedArray().length; j++) {
                    var keytooltip = i18n.t('referenceSet_description', { lng: lang }) + ' : ' + self.movedArray()[j].Details;
                    setTooltipForAssignments(j, keytooltip);
                }

                enableSaveKeys(1);
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
        }

        self.leftKeys = function () {

            if (selectedRowArrayForSwap.length > 0) {
                var isKeysUpdated = false;
                for (var i = 0; i < selectedRowArrayForSwap.length; i++) {
                    selectedRowArrayForSwap[i].keySelected = false;
                    selectedRowArrayForSwap[i].isSelected = false;
                    self.movedArray.remove(selectedRowArrayForSwap[i]);
                    if (selectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
                        self.keysData.push(selectedRowArrayForSwap[i]);
                        if (!isKeysDataLoaded) {
                            self.keysData([]);
                            keysGridModel(self.keysData, self.movedArray);
                        }
                        isKeysUpdated = true;
                    }
                    if (selectedRowArrayForSwap[i].Keyhandleid != null)
                        selectedKeyIds.push(selectedRowArrayForSwap[i].Keyhandleid);
                }
                self.allKeysSelected(false);
                selectedRowArrayForSwap = [];
                gridSelectedRowArray = [];

                if (isKeysUpdated) {
                    clearMultiSelectedData('jqxgridAvailableKeys');
                    $("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
                    $("#jqxgridAvailableKeys").jqxGrid('clearselection');
                }

                $("#btnMoveLeft").addClass('disabled');
                $("#btnMoveItemUp").addClass('disabled');
                $("#btnMoveItemDown").addClass('disabled');
                $("#btnForMoveRight").addClass('disabled');
                $("#btnForAllMoveright").removeClass('disabled');
                if (self.movedArray().length == 0) {
                    $("#btnAllMoveLeft").addClass('disabled');
                }

                if (isSelectedPaneFiltered) {
                    clearCustomFilterInTable("SelectedKeysTable");
                    clearSelectedPackagesPane();
                    isSelectedPaneFiltered = false;
                }

                selectedHighlightedRowForGrid();
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
            enableSaveKeys(1);
        }

        self.allRightKeys = function () {
            var keysarray = JSON.parse(JSON.stringify(self.keysData()));
            if (keysarray.length > 0) {
                for (i = 0; i < keysarray.length; i++) {
                    var keysData = keysarray[i];
                    keysData.keySelected = false;
                    keysData.isSelected = false;
                    keysData.Type = AppConstants.get('Assignment_Key');
                    if (!keysData.keyType || keysData.keyType == null || keysData.keyType == undefined) {
                        keysData.keyType = '';
                    }
                    if (!keysData.destination || keysData.destination == null || keysData.destination == undefined) {
                        keysData.destination = '';
                    }
                    keysData.Details = "Name: " + keysData.name + ' , Key type: ' + keysData.keyType + ' , Destination: ' + keysData.destination;
                    keysData.EnabledForAutoRenew = "0";
                    keysData.AutoRenewThreshold = 0;
                    self.movedArray.push(keysData);
                    var selectedsource = _.where(self.keysData(), { UniqueKeyId: keysarray[i].UniqueKeyId });
                    self.keysData.remove(selectedsource[0]);
                }
            }

            clearMultiSelectedData('jqxgridAvailableKeys');
            $("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
            $("#jqxgridAvailableKeys").jqxGrid('clearselection');
            if (self.movedArray().length > 0) {
                $("#btnForMoveRight").addClass('disabled');
                $("#btnForAllMoveright").addClass('disabled');
                $("#btnAllMoveLeft").removeClass('disabled');
            }

            if (isSelectedPaneFiltered) {
                clearCustomFilterInTable("SelectedKeysTable");
                clearSelectedPackagesPane();
                isSelectedPaneFiltered = false;
            }
            enableSaveKeys(1);
            gridSelectedArryForSwap = [];
        }

        self.allLeftKeys = function () {
            var arr = self.movedArray();
            var keysExistInAssignment = false;
            if (arr.length > 0) {
                selectedKeyIds = [];
                for (i = 0; i < arr.length; i++) {
                    arr[i].keySelected = false;
                    arr[i].isSelected = false;
                    if (arr[i].Type == AppConstants.get('Assignment_Key')) {
                        self.keysData.push(arr[i]);
                        keysExistInAssignment = true;
                    }
                    if (arr[i].Keyhandleid != null)
                        selectedKeyIds.push(arr[i].Keyhandleid);
                }
                self.movedArray([]);
            }

            if (!isKeysDataLoaded && keysExistInAssignment) {
                self.keysData([]);
                keysGridModel(self.keysData, self.movedArray);
            } else if (self.keysData().length > 0) {
                clearMultiSelectedData('jqxgridAvailableKeys');
                $("#jqxgridAvailableKeys").jqxGrid('updatebounddata');
                $("#jqxgridAvailableKeys").jqxGrid('clearselection');
            }

            if (isSelectedPaneFiltered) {
                clearCustomFilterInTable("SelectedKeysTable");
                clearSelectedPackagesPane();
                isSelectedPaneFiltered = false;
            }

            $("#btnMoveItemUp").addClass('disabled');
            $("#btnMoveItemDown").addClass('disabled');
            $("#btnMoveLeft").addClass('disabled');
            $("#btnForMoveRight").addClass('disabled');
            $("#btnAllMoveLeft").addClass('disabled');
            $("#btnForAllMoveright").removeClass('disabled');
            enableSaveKeys(1);
            gridSelectedRowArray = [];
            selectedRowArrayForSwap = [];
        }

        self.moveItemsUP = function () {
            if (selectedRowArrayForSwap.length > 0) {
                var arr = self.movedArray();

                //#Sorting the selected array for swap, based on moved array index
                var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

                for (var i = 0; i < sortedselectedRowArrayForSwap.length; i++) {
                    var index = 0;
                    if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
                        index = getArrayIndexForKey(arr, 'UniqueKeyId', sortedselectedRowArrayForSwap[i].UniqueKeyId);
                    }
                    arr.moveUp(arr[index]);
                    self.movedArray(arr);
                }

                //#Updating changed index into array "selectedRowArrayForSwap"
                selectedRowArrayForSwap.forEach(function (element) {
                    if (element.Type == AppConstants.get('Assignment_Key')) {
                        element.SelectedArrayIndex = getArrayIndexForKey(arr, 'UniqueKeyId', element.UniqueKeyId);
                    }
                });

                //#Function call:----To Enable/Disble the Up/Down Arrows----
                var lastIndex = self.movedArray().length - 1;
                enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
            }
            else {
                openAlertpopup(1, 'please_selct_row');
            }
            enableSaveKeys(1);
        }

        self.moveItemsDown = function () {
            if (selectedRowArrayForSwap.length > 0) {
                var arr = self.movedArray();

                //#Sorting the selected array for swap, based on moved array index
                var sortedselectedRowArrayForSwap = _.sortBy(selectedRowArrayForSwap, 'SelectedArrayIndex');

                for (var i = sortedselectedRowArrayForSwap.length - 1; i >= 0; i--) {
                    var index = 0;
                    if (sortedselectedRowArrayForSwap[i].Type == AppConstants.get('Assignment_Key')) {
                        index = getArrayIndexForKey(arr, 'UniqueKeyId', sortedselectedRowArrayForSwap[i].UniqueKeyId);
                    }
                    arr.moveDown(arr[index]);
                    self.movedArray(arr);
                }

                //#Updating changed index into array "selectedRowArrayForSwap"
                selectedRowArrayForSwap.forEach(function (element) {
                    if (element.Type == AppConstants.get('Assignment_Key')) {
                        element.SelectedArrayIndex = getArrayIndexForKey(arr, 'UniqueKeyId', element.UniqueKeyId);
                    }
                });

                //#Function call:----To Enable/Disble the Up/Down Arrows----
                var lastIndex = self.movedArray().length - 1;
                enableDisableUpDownArrows(selectedRowArrayForSwap, lastIndex, "#btnMoveItemUp", "#btnMoveItemDown");
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
            enableSaveKeys(1);
        }

        function setTooltipForAssignments(index, tooltipValue) {
            $("#namespan" + index).prop('title', tooltipValue);
            $("#keytypespan" + index).prop('title', tooltipValue);
            $("#destinationspan" + index).prop('title', tooltipValue);
        }

        function selectedHighlightedRowForGrid() {   //Selection row and State maintain In grid
            var datainformations = $("#jqxgridAvailableKeys").jqxGrid('getdatainformation');
            var rowscounts = datainformations.rowscount;

            if (rowscounts > 0) {
                //rowIndexForHighlighted = rowscounts + 1;
                if (rowIndexForHighlighted == rowscounts || rowIndexForHighlighted == undefined || rowIndexForHighlighted == -1) {
                    // $('#jqxgridAvailableKeys').jqxGrid('selectrow', 0);
                    $('#jqxgridAvailableKeys').jqxGrid('clearselection');
                    gridSelectedDataForSwap = [];
                } else {
                    $('#jqxgridAvailableKeys').jqxGrid('selectrow', rowIndexForHighlighted);

                }

            } else {
                $("#btnForMoveRight").addClass('disabled');
                rowIndexForHighlighted = undefined;
            }
        }

        function enableDisableNavigationButtons(type) {
            if (type == 0) {
                $("#btnForMoveRight").addClass('disabled');
                $("#btnMoveLeft").addClass('disabled');
                $("#btnForAllMoveright").addClass('disabled');
                $("#btnAllMoveLeft").addClass('disabled');
                $("#btnMoveItemUp").addClass('disabled');
                $("#btnMoveItemDown").addClass('disabled');
            } else {
                $("#btnForMoveRight").removeClass('disabled');
                $("#btnMoveLeft").removeClass('disabled');
                $("#btnForAllMoveright").removeClass('disabled');
                $("#btnAllMoveLeft").removeClass('disabled');
                $("#btnMoveItemUp").removeClass('disabled');
                $("#btnMoveItemDown").removeClass('disabled');
            }
        }

        function enableDisableSaveKeyRenewal(type) {
            if (type == 0) {
                $("#btnSaveKeyRenewal").prop('disabled', true);
            } else {
                $("#btnSaveKeyRenewal").removeAttr('disabled');
            }
        }

        function enableSaveKeys(type) {
            if (isKeyHandleEditAllowed) {
                $('#btnSaveKeys').removeAttr('disabled');
                $('#btnCancelKeys').removeAttr('disabled');
            }
        }



        init();
        function init() {
            self.movedArray([]);
            self.keysData([]);
            enableDisableNavigationButtons(0);
            getSelectedKeys(self.keysData, self.movedArray);
        }

        function getSelectedKeys(keysData, movedArray) {
            $("#loadingDiv").show();

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {                        
                        if (data.getKeyProfilesResp) {
                            data.getKeyProfilesResp = $.parseJSON(data.getKeyProfilesResp);
                            movedArray([]);
                            var selectedKeyHandles = data.getKeyProfilesResp.Keys;
                            if (!_.isEmpty(selectedKeyHandles)) {
                                keysArr = [];
                                for (var l = 0; l < selectedKeyHandles.length; l++) {
                                    var keyObj = new Object();
                                    keyObj.keySelected = false;
                                    keyObj.Type = AppConstants.get('Assignment_Key');
                                    var keyType = selectedKeyHandles[l].KeyType;
                                    if (!keyType || keyType == null || keyType == undefined) {
                                        keyType = '';
                                    }
                                    var Destination = selectedKeyHandles[l].Destination;
                                    if (!Destination || Destination == null || Destination == undefined) {
                                        Destination = '';
                                    }
                                    keyObj.Details = "Name: " + selectedKeyHandles[l].Name + ' , Key Type: ' + keyType + ' , Destination: ' + Destination;
                                    keyObj.Keyhandleid = selectedKeyHandles[l].KeyProfileId;
                                    keyObj.UniqueKeyId = selectedKeyHandles[l].VrkCustomerid + '_' + selectedKeyHandles[l].Name;
                                    keyObj.name = selectedKeyHandles[l].Name;
                                    keyObj.keyType = selectedKeyHandles[l].KeyType;
                                    keyObj.destination = selectedKeyHandles[l].Destination;
                                    keyObj.VRKcustomerId = selectedKeyHandles[l].VrkCustomerid;
                                    keyObj.EnabledForAutoRenew = selectedKeyHandles[l].EnabledForAutoRenew;
                                    keyObj.AutoRenewThreshold = selectedKeyHandles[l].AutoRenewThreshold;
                                    keysArr.push(keyObj);
                                }
                                movedArray(keysArr);
                                $("#btnAllMoveLeft").removeClass('disabled');
                            }
                            keysGridModel(keysData, movedArray);
                        }
                    }
                    $("#loadingDiv").hide();
                }
            }

            var method = 'GetKeyProfiles';
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }


        function keysGridModel(keysData, movedArray) {
            $("#loadingDiv").show();
            var customerID = parseInt(customerData[0].CustomerId);

            var callBackfunction = function (result, response) {
                if (result) {
                    if (response.status == AppConstants.get('GET_SUCCESS')) {
                        if (result.data && result.data.length > 0) {
                            var keyslist = result.data;
                            var selectedKeys = _.where(movedArray(), { Type: AppConstants.get('Assignment_Key') });
                            if (keyslist.length > 0) {
                                for (var i = 0; i < keyslist.length; i++) {
                                    keyslist[i].UniqueKeyId = keyslist[i].VRKcustomerId + '_' + keyslist[i].name;
                                    var existKeys = _.where(selectedKeys, { UniqueKeyId: keyslist[i].UniqueKeyId });
                                    if (existKeys && existKeys.length == 0) {
                                        keysData.push(keyslist[i]);
                                    }
                                }
                                $("#btnForAllMoveright").removeClass('disabled');
                                $("#btnForAllMoveright").prop("disabled", false);
                            }
                            KeysGrid(keysData());
                            isKeysDataLoaded = true;
                        } else {
                            keysData([]);
                            KeysGrid(keysData());
                            isKeysDataLoaded = true;
                        }
                    } else {
                        keysData([]);
                        KeysGrid(keysData());
                        isKeysDataLoaded = true;
                    }
                } else {
                    keysData([]);
                    KeysGrid(keysData());
                    isKeysDataLoaded = true;
                }
                $("#loadingDiv").hide();
            }

            var method = 'keyProfiles?customerId=' + customerID;
            var params = null;
            if (keysData().length <= 0) {
                $("#loadingDiv").show();
                ajaxJsonCallWebAPI(method, params, callBackfunction, true, 'GET', true);
            }
        }

        function KeysGrid(KeysData) {
            var gID = "jqxgridAvailableKeys";
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
            window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
            gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
            var source =
            {
                dataType: "observablearray",
                localdata: KeysData,
                dataFields: [
                    { name: 'VRKcustomerId', map: 'VRKcustomerId' },
                    { name: 'name', map: 'name' },
                    { name: 'keyType', map: 'keyType' },
                    { name: 'destination', map: 'destination' },
                    { name: 'UniqueKeyId', map: 'UniqueKeyId' }
                ],
            };
            //Custom filter
            var buildFilterPanel = function (filterPanel, datafield) {
                wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
            }
            var rendered = function (element) {
                enableUiGridFunctions(gID, 'UniqueKeyId', element, gridStorage, false);
                return true;
            }
            var dataAdapter = new $.jqx.dataAdapter(source);

            this.gID = $('#' + gID);
            $("#jqxgridAvailableKeys").jqxGrid(
                {
                    width: "100%",
                    height: (gridHeightFunction(gID, "DevDetail")),
                    editable: true,
                    source: dataAdapter,
                    altRows: true,
                    filterable: true,
                    sortable: true,
                    columnsResize: true,
                    autoshowcolumnsmenubutton: false,
                    pageSize: 1000,
                    autoshowfiltericon: true,
                    enabletooltips: true,
                    autoshowloadelement: false,
                    showsortmenuitems: false,
                    rowsheight: 32,
                    selectionmode: 'singlerow',
                    theme: AppConstants.get('JQX-GRID-THEME'),
                    ready: function () {
                        keysGridWidth = $('#contentjqxgridAvailableKeys').width();
                        if (keysGridWidth < 460) {
                            keysGridWidth = 460;
                        }
                        var datainformations = $("#jqxgridAvailableKeys").jqxGrid('getdatainformation');
                        if (datainformations && datainformations.rowscount == 0) {
                            $("#jqxgridAvailableKeys").find('.jqx-grid-column-header:first').fadeTo('slow', .6);
                            $("#jqxgridAvailableKeys").find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
                        }
                        var selectedTableHeight = gridHeightFunction(gID, "DevDetail");
                        $("#selectedKeysDiv").height(selectedTableHeight);
                    },
                    columns: [
                        {
                            text: '', menu: false, sortable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                            datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                                return '<div style="margin-left:0px;margin-top:0px"><div style="margin-top: 5px;"></div></div>';
                            }, rendered: rendered
                        },
                        {
                            text: i18n.t('key_name', { lng: lang }), dataField: 'name', editable: false, minwidth: 150, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('key_type', { lng: lang }), dataField: 'keyType', editable: false, minwidth: 150,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('key_destination', { lng: lang }), dataField: 'destination', editable: false, minwidth: 100,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        }
                    ]
                });
            getUiGridBiginEdit('jqxgridAvailableKeys', 'UniqueKeyId', gridStorage);
        }

        self.saveKeyChanges = function () {
            if (self.movedArray().length <= 0 && (!_.isEmpty(selectedKeyIds) && selectedKeyIds.length == 0)) {
                openAlertpopup(1, 'please_select_a_key');
                return;
            }
            $('#saveKeysConfirmationDiv').modal('show');
        }

        self.resetKeyConfiguration = function () {
            $("#availableKeysDiv").empty();
            $("#availableKeysDiv").html('<div id ="jqxgridAvailableKeys"></div>');
            init();
        }

        self.cancelKeyChanges = function () {
            $('#saveKeysConfirmationDiv').modal('hide');
        }

        self.setKeyProfiles = function () {            
            $('#saveKeysConfirmationDiv').modal('hide');
            if (renewKeyHandleId > 0) {
                var keySource = _.where(self.movedArray(), { EnabledForAutoRenew: "1" });
            }
            var selectedKeyHandles = new Array();
            var movedArray = renewKeyHandleId > 0 ? keySource : self.movedArray();
            for (i = 0; i < movedArray.length; i++) {
                var KeyObj = new Object();
                KeyObj.VrkCustomerid = movedArray[i].VRKcustomerId;
                KeyObj.Destination = movedArray[i].destination;
                KeyObj.KeyType = movedArray[i].keyType;
                KeyObj.Name = movedArray[i].name;
                KeyObj.Sequence = i + 1;
                KeyObj.EnabledForAutoRenew = movedArray[i].EnabledForAutoRenew;
                KeyObj.AutoRenewThreshold = movedArray[i].AutoRenewThreshold;
                selectedKeyHandles.push(KeyObj);
            }

            var addKeyProfilesReq = new Object();
            addKeyProfilesReq.Keys = selectedKeyHandles;
            addKeyProfilesReq.SelectedKeyIds = renewKeyHandleId > 0 ? [renewKeyHandleId] : selectedKeyIds;

            var callBackfunction = function (data, error) {
                if (data) {
                    $("#modalRenewKeys").modal('hide');
                    self.cancelKeyRenewal();
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'keys_configuration_save_success');
                        selectedKeyIds = [];
                        $("#availableKeysDiv").empty();
                        $("#availableKeysDiv").html('<div id ="jqxgridAvailableKeys"></div>');
                        init();
                    }
                }
            }

            var method = 'AddKeyProfiles';
            var params = '{"token":"' + TOKEN() + '","addKeyProfilesReq":' + JSON.stringify(addKeyProfilesReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        seti18nResourceData(document, resourceStorage);
    }
});