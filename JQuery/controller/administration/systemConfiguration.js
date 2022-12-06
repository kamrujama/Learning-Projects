var thatSysConfig = this;
var configIdActual = '';
var editFlag = false;
var rowindexGlobEndedit = '';
var rowIndexStartEdit = '';
var categoryGlob = '';
var changesFlg = '';
var defaultVal = '';
var prevConfigValueDisp = '';
this.editrowSystemConfig = -1;
var supportflagDeviceAttr = '';
var isEditRetval;
var originalDataForSysConfiguration = [];
var prevRow;
var currentRow;
var isSysConfoOpen = 0;
var staggeringConfiguration = '';
$("#informationPopupSysConfo").modal('hide');

define(["knockout", "autho", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "chosen", "appEnum", "AppConstants"], function (ko, autho, koUtil) {
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });
    dataForMAnyGridArray = new Array();
    backupArr = new Array();
    synchronisatioClockFlagresp = new Object();
    checkchange = '';
    checkchangeBackup = '';
    changesFlg == '';
    isSysConfoOpen = 1;


    var prevRow;
    var currentRow;

    return function systemConfigurationViewModel() {

        var ispageload = 0;
        var self = this;
        var prevRow;
        var currentRow;
        rowIndexStartEdit = '';

        $("#informationPopupSysConfo").modal('hide');


        $('#customFieldEditBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#customFieldEditBtn').click();
            }
        });

        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            isEditRetval = retval;
            return retval;
        }

        self.clearfilter = function (gridId) {
            clearUiGridFilter(gridId);
        }

        self.deviceAtt = ko.observableArray(dataForMAnyGridArray);// Observable array for adevice Attribute
        self.isGridVisible = ko.observable(false);//Grid Hide show According to selection  
        self.isClockVisible = ko.observable(false);
        self.isDeviceProfileStaggeringVisible = ko.observable(false);
        self.ConfigName = ko.observable();
        self.ConfigValue = ko.observable();
        self.deviceArrEditBtn = ko.observable(false);///for Disable Device Attribute Button
        self.synchronisatioClockFlag = ko.observable();
        self.checkClock = ko.observable();
        self.deviceProfileInterval = ko.observable('');

        supportflagDeviceAttr = 0;

        self.showTrueclock = function () {
            checkchange = 'change';
            return true;
        }
        self.showFalseclock = function () {
            checkchange = 'change';
            return true;
        }

        //------------------------------------------------------SEQUENCE OF BUTTON AND FOCUS RELATED CHANGES--------------------------------------------------------------
        $('#deviveAttrConfirmation').keydown(function (e) {
            if ($('#deviveAttrConfirmationNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deviveAttrConfirmationYes').focus();
            }
        });

        //focus on first btn
        $('#deviveAttrConfirmation').on('shown.bs.modal', function () {     ///For Device Attribute Screen  
            $('#deviveAttrConfirmationNo').focus();
        })

        $('#informationPopupSysConfo').on('shown.bs.modal', function (e) {
            $('#okBtnNoChangesIngrid').focus();

        });


        $('#gridChnagesConfo').keydown(function (e) {
            if ($('#gridChnagesConfo_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#gridChnagesConfo_Yes').focus();
            }
        });

        $('#gridChnagesConfo').on('shown.bs.modal', function (e) {
            $('#gridChnagesConfo_No').focus();

        });


        $('#restoreConfo').keydown(function (e) {
            if ($('#restoreConfoNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#restoreConfo_Yes').focus();
            }
        });

        $('#restoreConfo').on('shown.bs.modal', function () {   ///For Restore
            $('#restoreConfoNo').focus();
        })

        $('#saveChangesSyatemConfig').keydown(function (e) {
            if ($('#saveChangeSysConfo_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#saveChangeSysConfoYes').focus();
            }
        });


        $('#synchroClockConfirmation').keydown(function (e) {
            if ($('#synchroClockConfirmationNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#synchroClockConfirmation_Yes').focus();
            }
        });


        $('#synchroClockConfirmation').on('shown.bs.modal', function () {   ///For Clock Synchronisation
            $('#synchroClockConfirmationNo').focus();
        })




        $('#restoreConfo_Yes').keydown(function (e) {
            if (e.keyCode == 13) {

                self.systemRestoreSave();
            }
        });

        $('#restoreConfoNo').keydown(function (e) {
            if (e.keyCode == 13) {
                self.systemRestoreCancel();
            }
        });


        //------------------------------------------------------------------------END----------------------------------------------------------------------------


        var config = {
            '.chosen-select': {},
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: "95%" }
        }

        for (var selector in config) {
            $(selector).chosen(config[selector]);
        }
        //Chosen dropdown
        ko.bindingHandlers.chosen = {
            init: function (element) {
                ko.bindingHandlers.options.init(element);
                $(element).chosen({ disable_search_threshold: 10 });
            },
            update: function (element, valueAccessor, allBindings) {
                ko.bindingHandlers.options.update(element, valueAccessor, allBindings);
                $(element).trigger('chosen:updated');
            }
        };

        setMenuSelection();

        self.categoryNameList = ko.observableArray();// obseravable array for dropdown list
        self.observableModelPopup = ko.observable();
        self.customField = ko.observable(false);
        GetAllSystemConfigurationCategoriesReq(self.categoryNameList);  //call for dropdown

        self.onChangeFileNameEdit = function () {   // Onchange of Dropdown respective screen wiil automatically displayed

            changesFlg = 0;

            if (supportflagDeviceAttr == 1) {
                for (var k = 0; k < backupArr.length; k++) {
                    if (backupArr[k].ConfigValue != $("#configValue" + k).val()) {
                        changesFlg = 1;
                    }
                };
            }

            if (checkchangeBackup == checkchange) {

            } else {
                if (cflag == 1) {

                } else {
                    $("#synchroClockConfirmation").modal('show');
                    $("#clockChangesConfo").text(i18n.t('set_ReferenceSet', { lng: lang }));
                    $("#categoryName").prop('optionsText', "SetClock");
                    return;
                }
            }

            if (changesFlg == '') {

            } else if (changesFlg == 1) {
                $("#deviveAttrConfirmation").modal('show');
                $("#deviceAttrConfo").text(i18n.t('Do you want to save the changes?', { lng: lang }));
                return;
            }

            if (gridChangesOnclickDropdown() == true) {
                $("#gridChnagesConfo").modal('show');
                return;
            } else if (gridChangesOnclickDropdown() == 'blank') {
                thatSysConfig.editrowSystemConfig = prevRow;
                $("#jqxgridSystemConfiguration").jqxGrid('setcellvalue', rowIndexStartEdit, 'ConfigValue', '');
                $("#informationPopupSysConfo").modal('show');
                $("#InfoMessageBlank").text(i18n.t('value_should_not_be_blank', { lng: lang }));
                $("#InfoMessageModify").hide();
                $("#InfoMessageBlank").show();
                categoryDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'Category');
                $('#categoryName').val(categoryDisp).prop("selected", "selected");
                $('#categoryName').trigger('chosen:updated');
                return;
            } else {
                $("#gridChnagesConfo").modal('hide');
            }

            self.customField(true);
            var dispValue = "";
            var category = "";

            if (ispageload == 0) {
                var pageName = "SysConfig";
                var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
                if (PageStorage) {
                    if (PageStorage[0].SysConfig != '') {
                        dispValue = PageStorage[0].SysConfig;
                    }
                } else {
                    $('#categoryName').val('System').prop("selected", "selected");
                    $('#categoryName').trigger('chosen:updated');
                    dispValue = $("#categoryName").val();
                }
                ispageload = 1;
            } else {
                ispageload = 1;
                dispValue = $("#categoryName").val();
                var pageName = "SysConfig";
                var InitPageStorage = initPageStorageObj(pageName);
                var PageStorage = InitPageStorage.PageStorage;
                if (PageStorage) {

                    PageStorage[0].SysConfig = dispValue;
                    var updatedPageStorage = JSON.stringify(PageStorage);
                    window.sessionStorage.setItem(pageName + 'PageStorage', updatedPageStorage);
                }
            }

            $("#mainPageBody").removeClass('modal-open-appendon');

            if (dispValue == "DeviceCustomAttributeLabel") {
                category = 'DeviceCustomAttributeLabel';
                self.customField(true);
                self.isGridVisible(false);
                self.isClockVisible(false);
                self.isDeviceProfileStaggeringVisible(false);
                allGridRequest(category, dataForMAnyGridArray, '1', self.deviceAtt);
            } else if (dispValue == "Mails") {
                category = 'Mails';
                self.customField(false);
                self.isGridVisible(true);
                self.isClockVisible(false);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(false);
                allGridRequest(category, dataForMAnyGridArray);
                $("#mainPageBody").addClass('modal-open-appendon');
            } else if (dispValue == "Scheduler") {
                category = 'Scheduler';
                self.customField(false);
                self.isGridVisible(true);
                self.isClockVisible(false);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(false);
                allGridRequest(category, dataForMAnyGridArray);
                $("#mainPageBody").addClass('modal-open-appendon');
            }
            else if (dispValue == "Schedules and Timers") {
                category = 'Schedules and Timers';
                self.customField(false);
                self.isGridVisible(true);
                self.isClockVisible(false);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(false);
                allGridRequest(category, dataForMAnyGridArray);
                $("#mainPageBody").addClass('modal-open-appendon');

            } else if (dispValue == "Security") {
                category = 'Security';
                self.customField(false);
                self.isGridVisible(true);
                self.isClockVisible(false);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(false);
                allGridRequest(category, dataForMAnyGridArray);
                $("#mainPageBody").addClass('modal-open-appendon');
            } else if (dispValue == "SetClock") {

                self.customField(false);
                self.isGridVisible(false);
                self.isClockVisible(true);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(false);
                setClockDeviceReq(self.synchronisatioClockFlag, self.checkClock);
                $('#categoryName').val(dispValue).prop("selected", "selected");
                $('#categoryName').trigger('chosen:updated');
            } else if (dispValue == "Performance") {
                self.customField(false);
                self.isGridVisible(false);
                self.isClockVisible(false);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(true);
                $('#categoryName').val(dispValue).prop("selected", "selected");
                $('#categoryName').trigger('chosen:updated');
                getPerformenceSystemConfiguration();
            } else if (dispValue == "System") {
                category = 'System';
                self.customField(false);
                self.isGridVisible(true);
                self.isClockVisible(false);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(false);
                allGridRequest(category, dataForMAnyGridArray);
                $("#mainPageBody").addClass('modal-open-appendon');
            }else if (dispValue == "SafetyNets") {
                category = 'SafetyNets';
                self.customField(false);
                self.isGridVisible(true);
                self.isClockVisible(false);
                self.deviceArrEditBtn(false);
                self.isDeviceProfileStaggeringVisible(false);
                allGridRequest(category, dataForMAnyGridArray);
                $("#mainPageBody").addClass('modal-open-appendon');
      		}
			else if (dispValue == "Setup") {
                    category = 'Setup';
                    self.customField(false);
                    self.isGridVisible(true);
                    self.isClockVisible(false);
                    self.deviceArrEditBtn(false);
                    self.isDeviceProfileStaggeringVisible(false);
                    allGridRequest(category, dataForMAnyGridArray);
                    $("#mainPageBody").addClass('modal-open-appendon');
      		} else if (dispValue == "Content") {
                    category = 'Content';
                    self.customField(false);
                    self.isGridVisible(true);
                    self.isClockVisible(false);
                    self.deviceArrEditBtn(false);
                    self.isDeviceProfileStaggeringVisible(false);
                    allGridRequest(category, dataForMAnyGridArray);
                    $("#mainPageBody").addClass('modal-open-appendon');
      		}
        }

        self.customField(false);
        // unload template
        self.unloadTempPopup = function (popupName, gId, flag) {
            if (flag == 1) {
                self.observableModelPopupViewModel(popupName);
            } else {
                self.observableModelPopup(popupName);
                $('#viewSetClockScreenModel').modal('hide');

            }
		};

        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);

            if (popupName == "saveChangesSyatemConfig") {
                loadelement(popupName, 'administration');
                $('#viewSetClockScreenModel').modal('show');
            }
        }

        self.hideSysConfo = function () {
            $("#informationPopupSysConfo").modal('hide');
            thatSysConfig.editrowSystemConfig = rowIndexStartEdit;
            $("#jqxgridSystemConfiguration").jqxGrid('begincelledit', rowIndexStartEdit, "ConfigValue");

        }

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
        setTabindexLimit(4, "deviveAttrConfirmation", 3);//For Device Attribute Screen Call setTabindexLimit function 
        setTabindexLimit(4, "synchroClockConfirmationNo", 3);//For Device Attribute Screen Call setTabindexLimit function 
        setTabindexLimit(4, "restoreConfo", 3);//For Device Attribute Screen Call setTabindexLimit function 
        // end tabindex

        //Onclick of Edit button in device Attribute 
        self.editDeviceAttr = function () {
            supportflagDeviceAttr = 1;
            self.deviceArrEditBtn(true);
            var content = document.querySelectorAll('#deviceAttrTableData');   ///Length of table body
            for (var i = 0; i < backupArr.length; i++) {
                $("#configValue" + i).prop('disabled', false)
            }
        }

        self.cancel = function () {
            self.deviceArrEditBtn(false);
            var content = document.querySelectorAll('#deviceAttrTableData');
            for (var i = 0; i < backupArr.length; i++) {
                $("#configValue" + i).val(backupArr[i].ConfigValue);
                $("#configValue" + i).prop('disabled', true);
            }
        }
        //device Attribute Save
        self.deviceAttSave = function () {

            var changesFlg = 0;
            var changesFlgEmpty = 0;
            var genericConfigurations = new Array();
            for (var i = 0; i < backupArr.length; i++) {
                if (backupArr[i].ConfigValue != $("#configValue" + i).val()) {
                    changesFlg = 1;
                    var EGenericConfigurations = new Object();
                    EGenericConfigurations.ConfigName = $("#lable" + i).text();
                    EGenericConfigurations.ConfigId = $("#spanID" + i).text();
                    EGenericConfigurations.ConfigValue = $("#configValue" + i).val().replace(/(^[\s]+|[\s]+$)/g, '');
                    genericConfigurations.push(EGenericConfigurations);
                } else if (backupArr[i].ConfigValue == $("#configValue" + i).val()) {
                    self.deviceArrEditBtn(false);
                    var content = document.querySelectorAll('#deviceAttrTableData');

                    $("#configValue" + i).val(backupArr[i].ConfigValue);
                    //  $("#configValue" + i).prop('disabled', true);
                }
                $("#configValue" + i).prop('disabled', true);
            }
            for (var i = 0; i < backupArr.length; i++) {
                if ($("#configValue" + i).val().trim() == '') {
                    changesFlgEmpty++;

                }

            }
            if (changesFlgEmpty == backupArr.length) {
                openAlertpopup(1, 'blank_values_for_custom_fields_are_not_allowed');
                changesFlgEmpty = 0;
            } else {
                if (changesFlg == 1) {
                    var category = 'DeviceCustomAttributeLabel';
                    edit_DeviceAttribute(genericConfigurations, self.deviceArrEditBtn, dataForMAnyGridArray, category, self.deviceAtt);
                    var changesFlgEmpty = 0;
                } else {
                    return;
                }
            }
        }


        self.cancelDeviceAtrr = function () {
            self.deviceArrEditBtn(false);
            changesFlg = 0;
            $('#categoryName').val("System").prop("selected", "selected");
            $('#categoryName').trigger('chosen:updated');
            allGridRequest('System', dataForMAnyGridArray, '1', self.deviceAtt);
        }

        self.deviceAttrChanges = function () {
            self.deviceAttSave();
        }

        //open popup
        self.templateFlag = ko.observable(false);
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        var cflag = 1;
        $(":input[type='radio']").on("change", function () {
            cflag = 0;
            return;
        });

        self.clockSynSaveBtn = function () {
            var synClock = $('input[name="inlineRadioOptions"]:checked').val();
            if (koUtil.sysClockFlag == synClock) {

            } else {
                $("#synchroClockConfirmation").modal('show');
                $("#clockChangesConfo").text(i18n.t('set_ReferenceSet', { lng: lang }));
            }
        }
        self.clockConfoSaveBtn = function () {
            var synClock = $('input[name="inlineRadioOptions"]:checked').val();
            clockSynchronisation(synClock, self.checkClock);
        }
        self.cancelClockConfirmation = function () {
            $('#categoryName').val("SetClock").prop("selected", "selected");
            $('#categoryName').trigger('chosen:updated');
            setClockDeviceReq(self.synchronisatioClockFlag, self.checkClock);
        }

        $("#jqxgridSystemConfiguration").on("cellclick", function (event, row) {
            var args = event.args;
            rowindexGlobEndedit = event.args.rowindex;
            return;
        });

        self.systemConfigurationChanges = function () {

            updateSystemConfiguration(true, rowindexGlobEndedit, event, null);
            return;
        }

        self.cancelConfigValueChanges = function () {
            var categorySend = categoryGlob;
            allGridRequest(categorySend, dataForMAnyGridArray);
        }
        self.systemRestoreSave = function () {
            $("#restoreConfo").modal('hide');
            $("#jqxgridSystemConfiguration").jqxGrid('endrowedit', rowindexGlobEndedit);

            categoryDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowindexGlobEndedit, 'Category');


            var data = $("#jqxgridSystemConfiguration").jqxGrid('getrowdata', rowindexGlobEndedit);

            var configId = data.ConfigId;
            var configName = data.ConfigName;
            var isRestoreDisp = true;
            var defaultValue = data.DefaultValue;
            setSystemConfiguration(categoryDisp, configName, defaultValue, configId, isRestoreDisp);
        }
        self.systemRestoreCancel = function () {
            $("#restoreConfo").modal('hide');
            $("#jqxgridSystemConfiguration").jqxGrid('setcellvalue', rowindexGlobEndedit, 'ConfigValue', originalDataForSysConfiguration[rowindexGlobEndedit].ConfigValue);
            //  categoryDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowindexGlobEndedit, 'Category');
            //allGridRequest(categoryDisp, dataForMAnyGridArray);
            $("#jqxgridSystemConfiguration").jqxGrid('refresh');
            rowIndexStartEdit = '';
        }

        $('#gridChnagesConfo').on('keydown', function (e) {     ///For Device Attribute Screen  
            // $('#deviveAttrConfirmationNo').focus();

            if (e.keyCode == 27) {

                self.gridChnagesConfo_Cancel();
            }
        })



        $('#gridChnagesConfo_Yes').on('keydown', function (e) {
            if (e.keyCode == 13) {

                self.gridChnagesConfo_Save();
            }
        })
        $('#gridChnagesConfo_No').on('keydown', function (e) {
            if (e.keyCode == 13) {

                self.gridChnagesConfo_Cancel();
            }
        })


        //// Grid Changes Cancelo Button Click
        self.gridChnagesConfo_Cancel = function () {
            thatSysConfig.editrowSystemConfig = -1;
            $("#jqxgridSystemConfiguration").jqxGrid('setcellvalue', rowIndexStartEdit, 'ConfigValue', originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue);
            // configval=originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue;
            // $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
            categoryDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'Category');
            //allGridRequest(categoryDisp, dataForMAnyGridArray);
            thatSysConfig.editrowSystemConfig = -1;
            $("#jqxgridSystemConfiguration").jqxGrid('refresh');
            $('#gridChnagesConfo').modal('hide');
            $('#categoryName').val(categoryDisp).prop("selected", "selected");
            $('#categoryName').trigger('chosen:updated');
            rowIndexStartEdit = '';
        }

        self.gridChnagesConfo_Save = function (row) {
            $('#gridChnagesConfo').modal('hide');
            $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
            categoryDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'Category');
            configValue = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
            configName = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigName');
            configId = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigId');
            setSystemConfiguration(categoryDisp, configName, configValue, configId, false);
        }

        //-------------Onclick Of Html body component of System Confinguration  Edit mode as it is we are checking button status on button  we gave cell edit mode for click of html body
        $("#systemConfiguarationBody").click(function (e) {
            if (thatSysConfig.editrowSystemConfig >= 0) {
                $("#jqxgridSystemConfiguration").jqxGrid('begincelledit', thatSysConfig.editrowSystemConfig, "ConfigValue");
            }

        });
        $("#systemConfiguaration_path").click(function (e) {
            if (thatSysConfig.editrowSystemConfig >= 0) {
                $("#jqxgridSystemConfiguration").jqxGrid('begincelledit', thatSysConfig.editrowSystemConfig, "ConfigValue");
            }

        });
        $("#systemConfiguration_Header").click(function (e) {
            if (thatSysConfig.editrowSystemConfig >= 0) {
                $("#jqxgridSystemConfiguration").jqxGrid('begincelledit', thatSysConfig.editrowSystemConfig, "ConfigValue");
            }

        });
        //--------------------------------------------------------------------------------------------------

        $("#forSysConfoEditCheckContainerFluid").click(function () {

            if (thatSysConfig.editrowSystemConfig >= 0 && isSysConfoOpen == 1) {
                $("#jqxgridSystemConfiguration").jqxGrid('begincelledit', thatSysConfig.editrowSystemConfig, "ConfigValue");
            }
        });
        $("#maindiv").click(function () {
            if (thatSysConfig.editrowSystemConfig >= 0 && isSysConfoOpen == 1) {
                $("#jqxgridSystemConfiguration").jqxGrid('begincelledit', thatSysConfig.editrowSystemConfig, "ConfigValue");
            }
        });

        $("#chkDefaultSetting").on('change', function () {
            if ($("#chkDefaultSetting").is(':checked')) {
                if ($("#recurrenceDiv").hasClass('disabled')) {
                    $("#recurrenceDiv").removeClass('disabled');
                }
                enableSaveForDeviceProfileStaggering();
            } else {
                $("#recurrenceDiv").addClass('disabled');
                $("#btnSaveConfig").prop('disabled', false);
            }

        });

        $("#timeStartHour").on('keyup', function () {
            if ($("#timeStartHour").val() >= parseInt(0) && $("#timeStartHour").val() <= parseInt(23)) {
                return true;
            } else if ($("#timeStartHour").val() < parseInt(0)) {
                $("#timeStartHour").val(parseInt(0));
            } else if ($("#timeStartHour").val() > parseInt(23)) {
                $("#timeStartHour").val(parseInt(23));
            }
            enableSaveForDeviceProfileStaggering();
        });

        $("#timeEndHour").on('keyup', function () {
            if ($("#timeEndHour").val() >= parseInt(0) && $("#timeEndHour").val() <= parseInt(23)) {
                return true;
            } else if ($("#timeEndHour").val() < parseInt(0)) {
                $("#timeEndHour").val(parseInt(0));
            } else if ($("#timeEndHour").val() > parseInt(23)) {
                $("#timeEndHour").val(parseInt(23));
            }
            enableSaveForDeviceProfileStaggering()
        });

        $("#timeStartMinute").on('keyup', function () {
            if ($("#timeStartMinute").val() >= parseInt(0) && $("#timeStartMinute").val() <= parseInt(59)) {
                return true;
            } else if ($("#timeStartMinute").val() < parseInt(0)) {
                $("#timeStartMinute").val(parseInt(0));
            } else if ($("#timeStartMinute").val() > parseInt(59)) {
                $("#timeStartMinute").val(parseInt(59));
            }
            enableSaveForDeviceProfileStaggering();
        });

        $("#timeEndMinute").on('keyup', function () {
            if ($("#timeEndMinute").val() >= parseInt(0) && $("#timeEndMinute").val() <= parseInt(59)) {
                return true;
            } else if ($("#timeEndMinute").val() < parseInt(0)) {
                $("#timeEndMinute").val(parseInt(0));
            } else if ($("#timeEndMinute").val() > parseInt(59)) {
                $("#timeEndMinute").val(parseInt(59));
            }
            enableSaveForDeviceProfileStaggering();
        });

        self.increaseStartHour = function () {
            var startHour = parseInt($("#timeStartHour").val());
            if (startHour < 23) {
                $("#timeStartHour").val(startHour + 1);
            }
            enableSaveForDeviceProfileStaggering();
        }

        self.decreaseStartHour = function () {
            var startHour = parseInt($("#timeStartHour").val());
            if (startHour > 0) {
                $("#timeStartHour").val(startHour - 1);
            }
            enableSaveForDeviceProfileStaggering();
        }

        self.increaseStartMinute = function () {
            var startMinute = parseInt($("#timeStartMinute").val());
            if (startMinute < 59) {
                $("#timeStartMinute").val(startMinute + 1);
            }
            enableSaveForDeviceProfileStaggering();
        }

        self.decreaseStartMinute = function () {
            var startMinute = parseInt($("#timeStartMinute").val());
            if (startMinute > 0) {
                $("#timeStartMinute").val(startMinute - 1);
            }
            enableSaveForDeviceProfileStaggering();
        }

        self.increaseEndHour = function () {
            var endHour = parseInt($("#timeEndHour").val());
            if (endHour < 23) {
                $("#timeEndHour").val(endHour + 1);
            }
            enableSaveForDeviceProfileStaggering();
        }

        self.decreaseEndHour = function () {
            var endHour = parseInt($("#timeEndHour").val());
            if (endHour > 0) {
                $("#timeEndHour").val(endHour - 1);
            }
            enableSaveForDeviceProfileStaggering();
        }

        self.increaseEndMinute = function () {
            var endMinute = parseInt($("#timeEndMinute").val());
            if (endMinute < 59) {
                $("#timeEndMinute").val(endMinute + 1);
            }
            enableSaveForDeviceProfileStaggering();
        }

        self.decreaseEndMinute = function () {
            var endMinute = parseInt($("#timeEndMinute").val());
            if (endMinute > 0) {
                $("#timeEndMinute").val(endMinute - 1);
            }

            enableSaveForDeviceProfileStaggering();
        }
        self.validateNumber = function () {
            enableSaveForDeviceProfileStaggering();
        }

        function enableSaveForDeviceProfileStaggering() {
            var startHour = parseInt($("#timeStartHour").val());
            var endHour = parseInt($("#timeEndHour").val());
            var startMinute = parseInt($("#timeStartMinute").val());
            var endMinute = parseInt($("#timeEndMinute").val());

            var interval = self.deviceProfileInterval();
            if (interval.startHour != startHour || interval.endHour != endHour || interval.startMinute != startMinute || interval.endMinute != endMinute) {
                $("#btnSaveConfig").prop('disabled', false);
            } else {
                $("#btnSaveConfig").prop('disabled', true);
            }

        }

        self.saveConfiguration = function () {
            if (!$("#chkDefaultSetting").is(':checked')) {
                $('#deviceProfileDailyRecurrenceJob').modal('show');
            } else {
                self.saveDeviceStaggeringConfiguration();
            }
        }

        self.saveDeviceStaggeringConfiguration = function () {
            var startHour = parseInt($("#timeStartHour").val());
            var startMinute = parseInt($("#timeStartMinute").val());
            var endHour = parseInt($("#timeEndHour").val());
            var endMinute = parseInt($("#timeEndMinute").val());

            var startTime = startHour + ":" + startMinute;
            var endTime = endHour + ":" + endMinute;

            if ($("#chkDefaultSetting").is(':checked')) {

                var regex = new RegExp("^[0-9]*$");
                if ((!regex.test($("#timeStartHour").val())) || (!regex.test($("#timeStartMinute").val())) || (!regex.test($("#timeEndHour").val())) || (!regex.test($("#timeEndMinute").val()))) {
                    openAlertpopup(1, 'invalid_input_format');
                    return;
                }

                if (startHour == endHour) {
                    if (startMinute > endMinute) {
                        openAlertpopup(1, 'start_time_cannot_be_greater_than_end_time');
                        return;
                    }
                    if (startMinute == endMinute) {
                        openAlertpopup(1, 'start_time_cannot_be_equal_to_end_time');
                        return;
                    }
                } else if (startHour > endHour) {
                    openAlertpopup(1, 'start_time_cannot_be_greater_than_end_time');
                    return;
                }
            }
            setDeviceProfileInterval(startTime, endTime, staggeringConfiguration);
        }

        self.resetConfiguration = function () {
            $("#timeStartHour").val('00');
            $("#timeStartMinute").val('00');
            $("#timeEndHour").val('02');
            $("#timeEndMinute").val('00');
            $("#btnSaveConfig").prop('disabled', true);
            getDeviceProfileInterval(self.IsDeviceProfileCollectionStaggering(), self.deviceProfileInterval());
        }

        self.cancelStaggeringConfiguration = function () {
            if (!$("#chkDefaultSetting").is(':checked')) {
                $("#chkDefaultSetting").prop("checked", true);
                if ($("#recurrenceDiv").hasClass('disabled')) {
                    $("#recurrenceDiv").removeClass('disabled');
                }
            }
        }

        function getDeviceProfileInterval(staggeringConfiguration, deviceProfileInterval) {
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.getDeviceProfileIntervalResp) {
                            data.getDeviceProfileIntervalResp = $.parseJSON(data.getDeviceProfileIntervalResp);

                            if (parseInt((staggeringConfiguration.ConfigValue)) > 0) {
                                var startTime = data.getDeviceProfileIntervalResp.StartTime;
                                var endTime = data.getDeviceProfileIntervalResp.EndTime;
                                var startHour = startTime.split(":");
                                var endHour = endTime.split(":");

                                $("#chkDefaultSetting").prop("checked", true);
                                if ($("#recurrenceDiv").hasClass('disabled')) {
                                    $("#recurrenceDiv").removeClass('disabled');
                                }
                                var profileIntervals = {};
                                profileIntervals.startHour = startHour[0];
                                profileIntervals.startMinute = startHour[1];
                                profileIntervals.endHour = endHour[0];
                                profileIntervals.endMinute = endHour[1];
                                self.deviceProfileInterval(profileIntervals);

                                $("#timeStartHour").val(startHour[0]);
                                $("#timeStartMinute").val(startHour[1]);
                                $("#timeEndHour").val(endHour[0]);
                                $("#timeEndMinute").val(endHour[1]);
                            } else {
                                $("#recurrenceDiv").addClass('disabled');
                            }
                        }

                    }
                }
            }
            var params = '{"token":"' + TOKEN() + '"}';
            ajaxJsonCall('GetDeviceProfileInterval', params, callbackFunction, true, 'POST', true);
        }

        function getPerformenceSystemConfiguration() {
            var params = {};
            params.category = AppConstants.get('PERFORMANCE');
            params.token = TOKEN();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.systemConfigurations) {
                            deviceProfileCollectionStaggering = $.parseJSON(data.systemConfigurations);
                            var source = _.where(deviceProfileCollectionStaggering, { ConfigName: AppConstants.get('DEVICE_PROFILE_COLLECTION_STAGGERING') });
                            if (!_.isEmpty(source)) {
                                staggeringConfiguration = source[0];
                                getDeviceProfileInterval(staggeringConfiguration);
                            }
                        }

                    }
                }
            }
            ajaxJsonCall('GetSystemConfigurationListByCategory', JSON.stringify(params), callbackFunction, true, 'POST', true);
        }

        function setDeviceProfileInterval(startTime, endTime, staggeringObj) {
            var setDeviceProfileIntervalReq = new Object();
            setDeviceProfileIntervalReq.StartTime = $("#chkDefaultSetting").is(':checked') ? startTime : '00:00';
            setDeviceProfileIntervalReq.EndTime = $("#chkDefaultSetting").is(':checked') ? endTime : '00:00';
            setDeviceProfileIntervalReq.IsDeviceProfileCollectionStaggering = $("#chkDefaultSetting").is(':checked') ? true : false;

            var staggeringValue = (setDeviceProfileIntervalReq.IsDeviceProfileCollectionStaggering ? 1 : 0).toString();
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        setSystemConfiguration(staggeringObj.Category, staggeringObj.ConfigName, staggeringValue, staggeringObj.ConfigId, false);
                        $("#btnSaveConfig").prop('disabled', true);
                        if (!$("#chkDefaultSetting").is(':checked')) {
                            $("#recurrenceDiv").addClass('disabled');
                            $("#timeStartHour").val('00');
                            $("#timeStartMinute").val('00');
                            $("#timeEndHour").val('02');
                            $("#timeEndMinute").val('00');
                        }
                    }
                    else if (data.responseStatus.StatusCode == AppConstants.get('DEVICEPROFILECOLLECTION_JOB_ALREADY_EXIST')) {
                        openAlertpopup(1, 'device_profile_collection_job_already_exist');
                    }
                }
            }
            var params = '{"token":"' + TOKEN() + '","setDeviceProfileIntervalReq":' + JSON.stringify(setDeviceProfileIntervalReq) + '}';
            ajaxJsonCall('SetDeviceProfileInterval', params, callbackFunction, true, 'POST', true);
        }

        seti18nResourceData(document, resourceStorage);
    }


    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: ViewName },
            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }


    //--------------------------------CHANGES IN CLOCK SETTING-------------------------------------------------
    function clockSynchronisation(clockSynYes, checkClock) {
        $('.all-disabled').show();
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'changes_successfully_saved');
                    $('#categoryName').val("SetClock").prop("selected", "selected");
                    $('#categoryName').trigger('chosen:updated');
                    koUtil.sysClockFlag = clockSynYes;
                    setClockDeviceReq(clockSynYes, checkClock);
                    $('.all-disabled').hide();
                }
            }
        }

        var params = '{"token":"' + TOKEN() + '","setClockSynchronizeFlag":"' + clockSynYes + '"}';
        ajaxJsonCall('SetSynchronizeDeviceClockFlag', params, callbackFunction, true, 'POST', true);

    }

    //Callback function for Set Clock ----------------------------------------------------------
    function setClockDeviceReq(synchronisatioClockFlag, checkClock) {
        checkchangeBackup = '';
        checkchange = '';
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.clockSynchroniseFlag)
                        data.clockSynchroniseFlag = $.parseJSON(data.clockSynchroniseFlag);

                    synchronisatioClockFlag = data.clockSynchroniseFlag;
                    checkchangeBackup = data.clockSynchroniseFlag;
                    checkchange = data.clockSynchroniseFlag;

                    if (data.clockSynchroniseFlag == true) {
                        checkClock('true');
                        koUtil.sysClockFlag = 'true';
                    } else {
                        checkClock('false');
                        koUtil.sysClockFlag = 'false';
                    }
                }
            }
        }
        var params = '{"token":"' + TOKEN() + '"}';
        ajaxJsonCall('GetSynchronizeDeviceClockFlag', params, callbackFunction, true, 'POST', true);
    }
    //Handleing Esc on Information modal pop up
    //----------------------------------------------------------------------------
});

function jqxAllGgidInOne(params, gID) {

    //calculate height of grid
    var gridheight = $(window).height();
    var percentValue;
    if (gridheight > 630) {
        percentValue = (20 / 100) * gridheight;
        gridheight = gridheight - 150;
        gridheight = gridheight - percentValue + 'px';
    } else {
        gridheight = '400px';
    }
    ////////////////
    var source =
    {
        datatype: "json",
        datafields: [
            { name: 'ConfigName', type: 'string' },
            { name: 'DisplayConfigName', type: 'string' },
            { name: 'ConfigValue', type: 'string' },
            { name: 'Description', type: 'string' },
            { name: 'ConfigId', type: 'number' },
            { name: 'ControlType', type: 'string' },
            { name: 'ControlValues', type: 'custom' },
            { name: 'Category', type: 'string' },
            { name: 'DefaultValue', type: 'string' },
            { name: 'MinValue', type: 'number' },
            { name: 'MaxValue', type: 'number' }
        ],
        root: 'systemConfigurations',
        type: "POST",
        data: params,
        url: AppConstants.get('API_URL') + "/GetSystemConfigurationListByCategory",
        contentType: 'application/json',
    };
    var dataAdapter = new $.jqx.dataAdapter(source, {
        formatData: function (data) {
            $('#' + gID).jqxGrid('clear');
            $("#loadingDiv").show();
            $('.all-disabled').show();
            data = JSON.stringify(params);
            return data;
        },
        downloadComplete: function (data, status, xhr) {
            $("#loadingDiv").hide();

            if (data.systemConfigurations) {
                originalDataForSysConfiguration = data.systemConfigurations = $.parseJSON(data.systemConfigurations);
            } else {
                data.systemConfigurations = [];
            }
            $('.all-disabled').hide();
        },
        loadError: function (jqXHR, status, error) {
            $('.all-disabled').hide();
        }

    });
    var editFlag = false;

    //Create Editor type on value of backend -------------------------------------CREATE-EDITOR-ACCORDING-VALUE-----------------------------------------
    var createGridEditor = function (row, cellValue, editor, cellText, width, height, category) {
        var data = $("#" + gID).jqxGrid('getrowdata', row);
        controlTypeForval = $("#" + gID).jqxGrid('getcellvalue', row, 'ControlType').toLowerCase();
        ConfigValue = $("#" + gID).jqxGrid('getcellvalue', row, 'ConfigValue');
        minValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MinValue');
        maxValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MaxValue');
        prevRow = row;
        configIdActual = data.ConfigId;      //global varible For Change

        if (controlTypeForval === AppConstants.get('CONTROL_NUMERIC')) {
            editor.jqxNumberInput({ decimal: parseInt(cellValue), decimalDigits: 0, inputMode: 'simple', min: minValue, max: maxValue, width: '195px', height: '30px', spinButtons: true });
            editor.jqxNumberInput('focus');
            editor.css({ 'border-color': '#ddd' });

            editor.on('change', function (event) {
                editFlag = true;
                selectedValueAutoClose = event.args.item;
            });

        } else if (controlTypeForval === AppConstants.get('CONTROL_COMBO')) {
            var valArr = data.ControlValues.split(',');

            editor.jqxDropDownList({ autoDropDownHeight: true, width: width, height: height, source: (valArr) });

            editor.on('change', function (event) {
                editFlag = true;

                if (cellValue != editor.val()) {
                }
                var rowIndex = event.args.rowindex;
            });
        }
        else if (controlTypeForval === AppConstants.get('CONTROL_TIMECONTROL')) {
            var element = $('<div id="menuwrap" style="padding-top:1px;"><input class="datepicker" id="timertxt"  style="width: 195px; height: 30px;" type="text"></div>');
            editor.append(element);
            $('#timertxt').timepicker({
                setTime: cellValue,
                defaultTime: cellValue,
                minuteStep: 1,
                format: 'HH:ii p',
                autoclose: true,
                disableFocus: true,
                collapse: true
            });

            var timeDateTextBoxId = new Array();
        } else if (controlTypeForval === AppConstants.get('CONTROL_TEXTBOX')) {
            cellValue = cellValue.replace(/\"/g, "&quot;").replace(/\</g, "&lt;").replace(/\>/g, "&gt;");
            var element = $('<div style="padding-top:1px;"><input type="text" id="txtTextbox" style="width: 198px; height: 30px;margin-left:4px;" value="' + cellValue + '"/></div>');
            editor.append(element);
            $('#txtTextbox').focusout(function () {
                var str = $('#txtTextbox').val();
                var filter = /[()]/gi;
                if (filter.test(str)) {
                    openAlertpopup(2, 'invalid_input');
                    $('#txtTextbox').val(cellValue);
                } else {
                    return true;
                }
            })
        }
    }

    //define editor type -----------------------------------DEFINE-EDITOR-------------
    var initGridEditor = function (row, cellValue, editor, cellText, width, height, category) {
        // set the editor's current value. The callback is called each time the editor is displayed.
        prevRow = row;
        controlTypeForval = $("#" + gID).jqxGrid('getcellvalue', row, 'ControlType').toLowerCase();
        var rowindex = $("#" + gID).jqxGrid('getselectedrowindex');
        minValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MinValue');
        maxValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MaxValue');

        if (controlTypeForval == AppConstants.get('CONTROL_NUMERIC')) {
            editor.jqxNumberInput({ min: minValue, max: maxValue, decimal: parseInt(cellValue) });
        }
        else if (controlTypeForval == AppConstants.get('CONTROL_COMBO')) {
            editor.jqxDropDownList('selectItem', cellValue);
        } else if (controlTypeForval == AppConstants.get('CONTROL_TEXTBOX')) {
            var inputHTMLElement = editor.find("input");

            inputHTMLElement.focus();
        } else if (controlTypeForval === AppConstants.get('CONTROL_TIMECONTROL')) {
            var timeConfigVal = '';
            var inputHTMLElementTime = editor.find("#timertxt");

        }

        ///DropDownClose
        $('#jqxScrollThumbverticalScrollBarjqxgridSystemConfiguration,#jqxScrollBtnUpverticalScrollBarjqxgridSystemConfiguration,#jqxScrollBtnDownverticalScrollBarjqxgridSystemConfiguration').on('click', function () {
            $(editor).jqxDropDownList('close');
        });

    }

    //return editor with value--------------------------------RETURN-EDITOR-VALUE-------------
    var gridEditorValueDropdown = function (row, cellValue, editor, category) {
        thatSysConfig.editrowSystemConfig = -1;     
        controlTypeForval = $("#" + gID).jqxGrid('getcellvalue', row, 'ControlType').toLowerCase();

        if (controlTypeForval == AppConstants.get('CONTROL_TEXTBOX')) {
            var inputHTMLElement = editor.find("input");
            if (inputHTMLElement.val() == "") {
                return inputHTMLElement.val().trim();
            } else {
                return inputHTMLElement.val().trim();
            }
        } else if (controlTypeForval == AppConstants.get('CONTROL_TIMECONTROL')) {
            var inputHTMLElementTime = editor.find("#timertxt");


            return inputHTMLElementTime.val();
        } else if (controlTypeForval == AppConstants.get('CONTROL_NUMERIC')) {
            minValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MinValue');
            maxValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MaxValue');
            if (editor.val() > maxValue) {
                editor.jqxNumberInput('setDecimal', maxValue);
                return editor.val();
            }
            if (editor.val() < minValue) {
                editor.jqxNumberInput('setDecimal', minValue);
                return editor.val();
            }
            if (editor.val() == "NaN") {
                editor.jqxNumberInput('setDecimal', minValue);
                return editor.val();
            }
        } else {
            return editor.val();
        }

        return editor.val();
    }
    var buildFilterPanel = function (filterPanel, datafield) {
        wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
    }
    // create jqxgrid.
    $("#" + gID).jqxGrid(
        {
            height: gridHeightFunction(gID, "40"),
            width: "100%",
            source: dataAdapter,
            selectionmode: 'none',
            theme: AppConstants.get('JQX-GRID-THEME'),
            columnsResize: true,
            enabletooltips: true,
            editmode: 'selectedrow',
            rowsheight: 32,
            filterable: true,
            editable: true,
            sortable: true,
            altrows: true,
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            handlekeyboardnavigation: function (event) {
                var key = event.charCode ? event.charCode : event.keyCode ? event.keyCode : 0;
                if (key == 13) {
                    return true;
                }
                else if (key == 27) {
                    return true;
                }
            },
            columns: [
                {
                    text: 'Config Name', dataField: 'DisplayConfigName', minwidth: 120, editable: false, filterable: true, cellsrenderer: configNameRenderer, filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },

                {
                    text: 'Config Value', dataField: 'ConfigValue', minwidth: 200, enabletooltips: false, filterable: true, columntype: 'custom', createeditor: createGridEditor, initeditor: initGridEditor, geteditorvalue: gridEditorValueDropdown,
                    cellvaluechanging: function (row, datafield, columntype, oldvalue, newvalue) {
                        return newvalue;
                    }, cellsrenderer: configvalueRenderer, filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: 'Description', dataField: 'Description', minwidth: 120, editable: false, filterable: true, cellsrenderer: descriptionRenderer, filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                { text: 'Control Values', dataField: 'ControlValues', menu: false, sortable: false, filterable: false, hidden: true, editable: false, },
                {
                    text: i18n.t('actions_alert', { lng: lang }), align: "center", cellsalign: 'center', editable: false, resizable: false, sortable: false, enabletooltips: false, filterable: false, menu: false, minwidth: 80, cellsrenderer: function (row, column, value) {
                        var eventName = "onclick";
                        var testHtmlEditisEditRetval = "<a " + eventName + "='editSystemConfiguration(" + row + ", event,1)'   disabled='true' class='btn disabled' style='color: #000000; margin-left: 43%; left: -15px; margin-top: 7px;  position: relative;' href='javascript:;'title='Edit'><i class='icon-pencil' ></i></a>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'   disabled='true' class='btn disabled' style='color: #000000; margin-top: 7px;position: relative;' href='javascript:;' title='Restore'><i class='iconImg restoreDefault'></i></a>";
                        var testHtmlSave = "<a " + eventName + "='updateSystemConfiguration(false," + row + ", event,1)'  class='btn btn-xs btn-default' tabindex='-1' style='color: #000000; margin-left: 43%; left: -15px; margin-top: 7px;  position: relative;' href='javascript:;'title='Save'><i class='icon-checkmark'></i></a><span style='color: #000000;  position: relative;'></span>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'  class='btn btn-xs btn-default'  style='color: #000000; margin-top: 7px; position: relative;' href='javascript:;' title='Restore'><div class='iconImg restoreDefault'></div></a>";
                        var simpleEdit = "<a " + eventName + "='editSystemConfiguration(" + row + ", event,1)'  class='btn btn-xs btn-default' tabindex='-1' style='color: #000000; margin-left: 43%; left: -15px; margin-top: 7px;  position: relative;' href='javascript:;'title='Edit'><i class='icon-pencil' ></i></a>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)' class='btn btn-xs btn-default'  tabindex='-1' style='color: #000000; position: relative; margin-top: 7px;' href='javascript:;' title='Restore'><div class='iconImg restoreDefault'></div></a>";
                        if (isEditRetval == false) {
                            // return "<a " + eventName + "='editSystemConfiguration(" + row + ", event,1)'   disabled='true' class='btn disabled' style='color: inherit; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;'title='Edit'><i class='icon-pencil' ></i></a>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'   disabled='true' class='btn disabled' style='color: inherit;top: 7px; position: relative;' href='javascript:;' title='Restore'><i class='icon-restoredefault'></i></a>";
                            return '<div id="divEdit" style="height: 31px;" onClick="actionColclick(' + row + ')">' + testHtmlEditisEditRetval + '</div>'
                        }
                        if (row === thatSysConfig.editrowSystemConfig) {
                            // return "<a " + eventName + "='updateSystemConfiguration(false," + row + ", event,1)'  class='btn btn-xs btn-default' style='color: blue; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;'title='Save'><i class='icon-checkmark'></i></a><span style='color: inherit;  position: relative;'></span>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'  class='btn btn-xs btn-default' style='color: inherit;top: 7px; position: relative;' href='javascript:;' title='Restore'><i class='icon-restoredefault'></i></a>";
                            return '<div id="divSave" style="height: 31px;" onClick="actionColclick(' + row + ')">' + testHtmlSave + '</div>'
                        }
                        // return "<a " + eventName + "='editSystemConfiguration(" + row + ", event,1)'  class='btn btn-xs btn-default' style='color: inherit; margin-left: 50%; left: -15px;  position: relative;' href='javascript:;'title='Edit'><i class='icon-pencil' ></i></a>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'  class='btn btn-xs btn-default' style='color: inherit; position: relative;' href='javascript:;' title='Restore'><i class='icon-restoredefault'></i></a>";
                        return '<div id="divEdit" style="height: 31px;" onClick="actionColclick(' + row + ')">' + simpleEdit + '</div>'
                    }
                }
            ],
        });
}
//------------------GETTING DOPDOWN VALUES-----------------------------
// callback function for getting dropdown values
function GetAllSystemConfigurationCategoriesReq(categoryNameList) {
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                if (data.categories)
                    data.categories = $.parseJSON(data.categories);
                data.categories = mapObjectToArray(data.categories);
                categoryNameList(data.categories);
            }
        }
    }
    var params = '{"token":"' + TOKEN() + '"}';
    ajaxJsonCall('GetAllSystemConfigurationCategories', params, callbackFunction, true, 'POST', true);
}
//---------------------------------------------ALL- GIRD-CALL-AT TIME--------------------------------------
// Callback function for for all dropdown values
function allGridRequest(categorydisp, dataForMAnyGridArray, operationFlag, deviceAtt) {
    $('.all-disabled').show();
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                if (operationFlag == 1) {
                    changesFlg == '';
                    if (data.genericConfigurations)
                        data.genericConfigurations = $.parseJSON(data.genericConfigurations);

                    dataForMAnyGridArray = data.genericConfigurations;
                    backupArr = data.genericConfigurations;
                    for (var k = 0; k < dataForMAnyGridArray.length; k++) {
                        dataForMAnyGridArray[k]["CustomField"] = "Custom field" + " " + (k + 1);
                    }
                    deviceAtt(dataForMAnyGridArray);
                    for (var i = 0; i < backupArr.length; i++) {
                        $("#configValue" + i).val(backupArr[i].ConfigValue);
                    }

                } else {
                    dataForMAnyGridArray = data.systemConfigurations;
                }
                $('#categoryName').val(categorydisp).prop("selected", "selected");
                $('#categoryName').trigger('chosen:updated');
                $('.all-disabled').hide();
            }
        }
    }
    var params = '{"token":"' + TOKEN() + '","category":"' + categorydisp + '"}';
    if (operationFlag == '1') {
        ajaxJsonCall('GetConfigurationValues', params, callbackFunction, true, 'POST', true);
    } else {
        var objparam = new Object();
        objparam.token = TOKEN();
        objparam.category = categorydisp;
        $('#jqxgridSystemConfiguration').jqxGrid('clear');
        thatSysConfig.editrowSystemConfig = -1;
        jqxAllGgidInOne(objparam, 'jqxgridSystemConfiguration');
    }

    $('#categoryName').val(categorydisp).prop("selected", "selected");
    $('#categoryName').trigger('chosen:updated');
}

//EditAttRibute Device---------------------------EDIT DEVICE ATTRIBUTE CALL-----------------------------

function edit_DeviceAttribute(genericConfigurations, deviceArrEditBtn, dataForMAnyGridArray, category, deviceAtt) {
    deviceArrEditBtn(false);
    supportflagDeviceAttr = '';
    $('.all-disabled').show();
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                openAlertpopup(0, 'changes_successfully_saved');
                var category = 'DeviceCustomAttributeLabel';
                allGridRequest(category, dataForMAnyGridArray, '1', deviceAtt);
                $('.all-disabled').hide();
            }
        }
    }
    var params = '{"token":"' + TOKEN() + '","genericConfigurations":' + JSON.stringify(genericConfigurations) + '}';
    ajaxJsonCall('SetConfigurationValues', params, callbackFunction, true, 'POST', true);
}

//Edit alert----------------------ONCLICK OF EDIT BUTTON--------------------------------
function editSystemConfiguration(row, event, isGridCellEdit) {

    currentRow = row;
    $("#jqxgridSystemConfiguration").jqxGrid('endrowedit', prevRow);
    var prevConfigValueDispEmptyCheck = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', prevRow, 'ConfigValue');

    if (prevConfigValueDispEmptyCheck == "" && prevRow != currentRow) {
        $("#jqxgridSystemConfiguration").jqxGrid('beginrowedit', prevRow);
        thatSysConfig.editrowSystemConfig = prevRow;

    } else if (prevConfigValueDispEmptyCheck !== null && (prevConfigValueDispEmptyCheck != originalDataForSysConfiguration[prevRow].ConfigValue && prevRow != currentRow)) {
        ////  var r = confirm("Are You Sure You Want to save the Chnages");
        //  if (r == true) {
        //      x = "You pressed OK!";
        //   // $('#jqxgridSystemConfiguration').jqxGrid('clear');
        //     $("#jqxgridSystemConfiguration").jqxGrid('endrowedit', prevRow);
        //      // originalDataForSysConfiguration[prevRow].ConfigValue = prevConfigValueDispEmptyCheck;//call back
        //     $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', prevRow, "ConfigValue");
        //  } else {
        //      x = "You pressed Cancel!";
        //      thatSysConfig.editrowSystemConfig = -1;
        //      $("#jqxgridSystemConfiguration").jqxGrid('setcellvalue', prevRow, 'ConfigValue', originalDataForSysConfiguration[prevRow].ConfigValue);
        //      $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', prevRow, "ConfigValue");
        //   // $('#jqxgridSystemConfiguration').jqxGrid('clear');
        //    $("#jqxgridSystemConfiguration").jqxGrid('endrowedit', prevRow);
        //      // configval=originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue;

        //  }
        $("#gridChnagesConfo").modal('show');
    } else {
        if (isGridCellEdit == 1) {
            thatSysConfig.editrowSystemConfig = row;
            prevConfigValueDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', row, 'ConfigValue');

            $("#jqxgridSystemConfiguration").jqxGrid('beginrowedit', row);
            if (event) {
                if (event.preventDefault) {
                    event.preventDefault();
                }
            }

            rowIndexStartEdit = row;
            return false;
        }
    }
}
///----------------------ONCLICK-OF-SAVE/RESTORE-BUTTON----------------------------------------------
function updateSystemConfiguration(isRestore, row, event, checkflg) {

    if (isRestore == false) {
        thatSysConfig.editrowSystemConfig = -1;
        $("#jqxgridSystemConfiguration").jqxGrid('endrowedit', row);
    }
    categoryDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', row, 'Category');
    if (event) {
        var data = $("#jqxgridSystemConfiguration").jqxGrid('getrowdata', row);
    }

    var configName = data.ConfigName;
    var configValue = data.ConfigValue;
    var configId = data.ConfigId;
    var isRestoreDisp = isRestore;
    var defaultValue = data.DefaultValue;
    var controlValues = data.ControlValues;

    if (configValue === '') {
        $("#informationPopupSysConfo").modal('show');
        $("#InfoMessageBlank").text(i18n.t('value_should_not_be_blank', { lng: lang }));
        $("#InfoMessageModify").hide();
        $("#InfoMessageBlank").show();
        return;
    }
    if (configName === AppConstants.get('CONFIG_NAME_COMPONENT_LOGLEVEL')) {
        var configValueArr = !_.isEmpty(configValue) ? configValue.split(",") : [];
        var controlValuesArr = !_.isEmpty(controlValues) ? controlValues.split(",") : [];
        if (!_.isEmpty(configValueArr)) {
            for (var i = 0; i < configValueArr.length; i++) {
                if (controlValuesArr.indexOf(configValueArr[i]) < 0) {
                    openAlertpopup(1, 'invalid_config_value');
                    restoreValues();
                    return;
                }
            }
        }
    }
    if (configName === AppConstants.get('CONFIG_NAME_LOG_LEVEL') && configValue === AppConstants.get('CONFIG_VALUE_LOG_LEVEL_ALL')) {
        var errmsg = i18n.t('log_level', { lng: lang })
        openAlertpopup(2, errmsg);
        restoreValues();
        return;
    }
    if (checkflg == 1) {
        if (configValue == prevConfigValueDisp && (configValue != "" || configValue == 0)) {
            $("#informationPopupSysConfo").modal('show')
            $("#InfoMessageModify").text(i18n.t("please_modify_the_value", { lng: lang }));
            $("#InfoMessageBlank").hide();
            $("#InfoMessageModify").show();
        } else if (configValue == "" && configValue != 0) {
            thatSysConfig.editrowSystemConfig = prevRow;
            $("#jqxgridSystemConfiguration").jqxGrid('setcellvalue', row, 'ConfigValue', configValue);
            $("#informationPopupSysConfo").modal('show');
            $("#InfoMessageBlank").text(i18n.t('value_should_not_be_blank', { lng: lang }));
            $("#InfoMessageModify").hide();
            $("#InfoMessageBlank").show();
        }
        else {
            setSystemConfiguration(categoryDisp, configName, configValue, configId, isRestoreDisp);
        }
    }
    if (isRestore == true) {
        if (rowIndexStartEdit == '') {
            if (rowIndexStartEdit == 0 && (row >= 0 || row <= 0)) {
                $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', 0, "ConfigValue");
                var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', 0, 'ConfigValue');
                if ((configval != originalDataForSysConfiguration[0].ConfigValue)) {
                    if (rowindexGlobEndedit == 0) {
                        $("#confirmationRestore").text(i18n.t('are_you_sure_you_want_to_restore_default_value', { lng: lang }))
                        $("#restoreConfo").modal('show');
                        thatSysConfig.editrowSystemConfig = -1;
                    }
                } else {
                    $("#confirmationRestore").text(i18n.t('are_you_sure_you_want_to_restore_default_value', { lng: lang }))
                    $("#restoreConfo").modal('show');
                    thatSysConfig.editrowSystemConfig = -1;
                }
            }

            //if (rowIndexStartEdit != row) {
            //    $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
            //    var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
            //    if ((configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue)&&configval!='') {
            //        $("#gridChnagesConfo").modal('show');
            //        thatSysConfig.editrowSystemConfig = -1;
            //    } else if (configval == '' && rowIndexStartEdit != currentRow) {
            //        $("#jqxgridSystemConfiguration").jqxGrid('beginrowedit', rowIndexStartEdit);
            //        thatSysConfig.editrowSystemConfig = rowIndexStartEdit;
            //    }else
            //    {
            //        $("#confirmationRestore").text(i18n.t('are_you_sure_you_want_to_restore_default_value', { lng: lang }))
            //        $("#restoreConfo").modal('show');
            //    }
            //} else if (rowindexGlobEndedit == row) {
            //    $("#confirmationRestore").text(i18n.t('are_you_sure_you_want_to_restore_default_value', { lng: lang }))
            //    $("#restoreConfo").modal('show');
            //} else {

            //}

        } else if (rowindexGlobEndedit == row) {
            if (rowIndexStartEdit > row || rowIndexStartEdit < row) {
                $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
                var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
                if ((configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue) && configval != '') {
                    $("#gridChnagesConfo").modal('show');
                    thatSysConfig.editrowSystemConfig = -1;
                } else {
                    if (configval == '') {
                        thatSysConfig.editrowSystemConfig = rowIndexStartEdit;
                    } else {
                        $("#confirmationRestore").text(i18n.t('are_you_sure_you_want_to_restore_default_value', { lng: lang }))
                        $("#restoreConfo").modal('show');
                        thatSysConfig.editrowSystemConfig = -1;
                    }
                }
            } else {
                $("#confirmationRestore").text(i18n.t('are_you_sure_you_want_to_restore_default_value', { lng: lang }))
                $("#restoreConfo").modal('show');
                thatSysConfig.editrowSystemConfig = -1;
            }
        } else if (rowIndexStartEdit > row || rowIndexStartEdit < row) {
            if (rowIndexStartEdit != '') {

                $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
                var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
                if ((configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue) && configval != '') {
                    $("#gridChnagesConfo").modal('show');
                    thatSysConfig.editrowSystemConfig = -1;
                }
            }
        }
    } else {
        return;
    }
}

function restoreValues() {
    thatSysConfig.editrowSystemConfig = -1;
    $("#jqxgridSystemConfiguration").jqxGrid('setcellvalue', rowIndexStartEdit, 'ConfigValue', originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue);
    categoryDisp = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'Category');
    thatSysConfig.editrowSystemConfig = -1;
    $("#jqxgridSystemConfiguration").jqxGrid('refresh');
    $('#gridChnagesConfo').modal('hide');
    $('#categoryName').val(categoryDisp).prop("selected", "selected");
    $('#categoryName').trigger('chosen:updated');
    rowIndexStartEdit = '';
}

//-------------------------------SaveCall On ConfigColumn--------------------------------------------------------
function setSystemConfiguration(category, ConfigName, value, ConfigId, isRestore) {

    var systemConfiguration = new Object();
    systemConfiguration.Category = category;
    systemConfiguration.ConfigName = ConfigName;
    systemConfiguration.ConfigValue = value;               //default for restore
    systemConfiguration.ConfigId = ConfigId;
    systemConfiguration.Units = null;
    $('.all-disabled').show();

    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                rowindexGlobEndedit = '';
                if (isRestore == true) {
                    openAlertpopup(0, 'default_value_successfully_restored');
                    rowIndexStartEdit = '';
                } else {
                    openAlertpopup(0, 'changes_successfully_saved');
                    rowIndexStartEdit = '';
                }

                refreshGrid(category);
                GetConfigurations();
            } else if (data.responseStatus.StatusCode == AppConstants.get('E_INVALID_INPUT_FORMAT')) {
                refreshGrid(category);
            }
        }
        $('.all-disabled').hide();
    }

    var params = '{"token":"' + TOKEN() + '","systemConfiguration":' + JSON.stringify(systemConfiguration) + ',"isRestore":"' + isRestore + '"}';
    ajaxJsonCall('SetSystemConfiguration', params, callbackFunction, true, 'POST', true);

}

function refreshGrid(category) {
    $("#jqxgridSystemConfiguration").jqxGrid('updatebounddata');
    $('#categoryName').val(category).prop("selected", "selected");
    $('#categoryName').trigger('chosen:updated');
    thatSysConfig.editrowSystemConfig = -1;
}

function configNameRenderer(row, columnfield, value, defaulthtml, columnproperties) {
    var configName = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', row, 'DisplayConfigName');
    //  return "<a " + eventName + "='editSystemConfiguration(" + row + ", event,1)'   disabled='true' class='btn disabled' style='color: inherit; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;'title='Edit'><i class='icon-pencil' ></i></a>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'   disabled='true' class='btn disabled' style='color: inherit;top: 7px; position: relative;' href='javascript:;' title='Restore'><i class='icon-restoredefault'></i></a>";
	return '<div  onClick="checkConfigurationChanges(' + row + ')" style="height:32px;"><a style="color:black;padding-top:5px;margin-left:4px;" class=" systemConfiguration-name-txt"  title="' + configName + '" >' + configName + '</a><div>';
}

function configvalueRenderer(row, columnfield, value, defaulthtml, columnproperties) {
    var configValue = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', row, 'ConfigValue');
    //  return "<a " + eventName + "='editSystemConfiguration(" + row + ", event,1)'   disabled='true' class='btn disabled' style='color: inherit; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;'title='Edit'><i class='icon-pencil' ></i></a>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'   disabled='true' class='btn disabled' style='color: inherit;top: 7px; position: relative;' href='javascript:;' title='Restore'><i class='icon-restoredefault'></i></a>";
	return '<div  onClick="checkConfigurationChanges(' + row + ')" style="height:32px;"><a style="color:black;padding-top:5px;margin-left:4px;" class=" systemConfiguration-name-txt"  title="' + configValue + '" >' + configValue + '</a><div>';
}

function descriptionRenderer(row, columnfield, value, defaulthtml, columnproperties) {
    var description = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', row, 'Description');
    //  return "<a " + eventName + "='editSystemConfiguration(" + row + ", event,1)'   disabled='true' class='btn disabled' style='color: inherit; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;'title='Edit'><i class='icon-pencil' ></i></a>" + "<a " + eventName + "='updateSystemConfiguration(true," + row + ", event,2)'   disabled='true' class='btn disabled' style='color: inherit;top: 7px; position: relative;' href='javascript:;' title='Restore'><i class='icon-restoredefault'></i></a>";
	return '<div  onClick="checkConfigurationChanges(' + row + ')" style="height:32px;"><a style="color:black;padding-top:5px;margin-left:4px;" class=" systemConfiguration-name-txt"  title="' + description + '" >' + description + '</a><div>';
}

function checkConfigurationChanges(row) {
    $("#jqxgridSystemConfiguration").jqxGrid('clearselection');
    $("#jqxgridSystemConfiguration").jqxGrid('selectrow', row);

    $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
    var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
    if (rowIndexStartEdit == row) {

    } else if (rowIndexStartEdit > row || rowIndexStartEdit < row) {
        if (configval != undefined && (configval == 0 || configval != '') && (configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue)) {
            $("#gridChnagesConfo").modal('show');
            thatSysConfig.editrowSystemConfig = -1;
        }
    } else if (rowIndexStartEdit == '' || rowIndexStartEdit == undefined) {

    } else {
        $("#gridChnagesConfo").modal('hide');
    }
    return;
}
//Click On DropDown Validate Grid Changes

function gridChangesOnclickDropdown() {
    if (rowIndexStartEdit == '') {

        if (rowIndexStartEdit === 0) {
            $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
            var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
            if (configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue && configval != '') {
                thatSysConfig.editrowSystemConfig = -1;
                return true;
            } else if (configval == '' || configval == null) {

                return 'blank';
            } else {
                return false;
            }
        }

    } else if (rowIndexStartEdit > 0) {
        $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
        var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
        if (originalDataForSysConfiguration[rowIndexStartEdit] && (configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue) && configval != '') {
            thatSysConfig.editrowSystemConfig = -1;
            return true;
        } else if (configval == '' || configval == null) {
            return 'blank';
        } else {
            return false;
        }
    } else if (rowIndexStartEdit === 0) {
        $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
        var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
        if ((configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue) && configval != '') {
            thatSysConfig.editrowSystemConfig = -1;
            return true;
        } else if (configval == '' || configval == null) {
            return 'blank';
        } else {
            return false;
        }
    }
}

function actionColclick(row) {
    // thatSysConfig.editrowSystemConfig = -1;
    if (rowIndexStartEdit == row) {

    } else if (rowIndexStartEdit > row || rowIndexStartEdit < row) {
        $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
        if (rowIndexStartEdit != '') {
            var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');
            if ((configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue) && configval != '') {
                $("#gridChnagesConfo").modal('show');
                return;
            }
        } else if (rowIndexStartEdit == 0) {
            var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', 0, 'ConfigValue');
            if ((configval != originalDataForSysConfiguration[0].ConfigValue) && configval != '') {
                $("#gridChnagesConfo").modal('show');
                return;
            }
        }
    } else {
        $("#gridChnagesConfo").modal('hide');
    }
    return;
}

//function validateRestore(row) {
//    if (rowIndexStartEdit == row) {
//        return false;
//    } else if (rowIndexStartEdit > row || rowIndexStartEdit < row) {
//        $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
//        var configval = $("#jqxgridSystemConfiguration").jqxGrid('getcellvalue', rowIndexStartEdit, 'ConfigValue');

//        if (configval != originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue) {
//            return true;
//        } else {
//            return false;
//        }
//    }
//}
