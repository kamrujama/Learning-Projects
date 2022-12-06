//Global variables for editing purpose
var isEditable = false;
var editableRow = '';
var selectedValue = "";
var selectedValueStatus = "";
var selectedValueAutoClose = "";
var rowIndexStartEdit = "";
var isevent = "";
var originalDataForadminAlets = [];
var that = this;
this.that.editrow = -1;
var isEditAlert = true;
alertData = new Array();
var PreviousRow;
var currentRow;
//var originalDataForSysConfiguration = ko.observableArray();
var checkForEdit;
var alertscrenGId = "jqxgridAlertAdministartion";
//Edit alert
function EditRow(row, event) {
    that.editrow = row;
    currentRow = row;
    checkForEdit = that.editrow;


    var gridStorage = JSON.parse(sessionStorage.getItem(alertscrenGId + "gridStorage"));
    if (gridStorage) {
        gridStorage[0].isEditRow = checkForEdit;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(alertscrenGId + 'gridStorage', updatedGridStorage);
    }

    //one

    //that.editrow = row;
    if (PreviousRow <= 0 || PreviousRow == '' || PreviousRow == undefined || PreviousRow == 'Blank') {
        if (PreviousRow == 0) {
            if (PreviousRow == 'Blank') {

            } else {
                that.editrow = PreviousRow;
                $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'Severity', originalDataForAlertAdministration[PreviousRow].Severity);
                $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'IsEnabled', originalDataForAlertAdministration[PreviousRow].IsEnabled);
                $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'ThresholdValue', originalDataForAlertAdministration[PreviousRow].ThresholdValue);
                $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'AutoClose', originalDataForAlertAdministration[PreviousRow].AutoClose);
                $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'AlwaysGenerateNewAlert', originalDataForAlertAdministration[PreviousRow].AlwaysGenerateNewAlert);
            }
        }
    } else {
        checkChnagesInCell(row, event);
        that.editrow = PreviousRow;
        $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'Severity', originalDataForAlertAdministration[PreviousRow].Severity);
        $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'IsEnabled', originalDataForAlertAdministration[PreviousRow].IsEnabled);
        $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'ThresholdValue', originalDataForAlertAdministration[PreviousRow].ThresholdValue);
        $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'AutoClose', originalDataForAlertAdministration[PreviousRow].AutoClose);
        $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', PreviousRow, 'AlwaysGenerateNewAlert', originalDataForAlertAdministration[PreviousRow].AlwaysGenerateNewAlert);

    }

    $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', row, "Severity");

    $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', row, "IsEnabled");

    $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', row, "ThresholdValue");

    $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', row, "AutoClose");

    $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', row, "AlwaysGenerateNewAlert");


    //$("#jqxgridAlertAdministartion").jqxGrid('beginrowedit', row);
   
    if (event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
    }
    rowIndexStartEdit = row;
    return false;
}

//Cancel alert
function Cancel(row, event) {
    that.editrow = -1;
    checkForEdit = that.editrow;
    PreviousRow = 'Blank';
    currentRow = 'Blank';
  
    // restore 
    UpdateCancel(false, row, event);

    //$("#jqxgridAlertAdministartion").jqxGrid('endrowedit', row);
    var gridStorage = JSON.parse(sessionStorage.getItem(alertscrenGId + "gridStorage"));
    if (gridStorage) {
        gridStorage[0].isEditRow = checkForEdit;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(alertscrenGId + 'gridStorage', updatedGridStorage);
    }

 

    //one
    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "Severity");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "IsEnabled");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "ThresholdValue");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "AutoClose");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "AlwaysGenerateNewAlert");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "action");
  
    //$("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row,'Severity');
    if (event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
    }
    return false;
}

function Update(isRestore, row, event) {

    that.editrow = -1;
    // $("#jqxgridAlertAdministartion").jqxGrid('endrowedit', row);
    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "Severity");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "IsEnabled");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "ThresholdValue");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "AutoClose");

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', row, "AlwaysGenerateNewAlert");

    if (event) {
        var data = $("#jqxgridAlertAdministartion").jqxGrid('getrowdata', row);
        var alerttypesdetails = new Array()
        var setAlertTypesReq = new Object();
        var AlertTypesDetails = new Object();
        AlertTypesDetails.AlertType = data.AlertType;
        AlertTypesDetails.AlertTypeId = data.AlertTypeId;
        AlertTypesDetails.Description = data.Description;
        AlertTypesDetails.Originator = data.Originator;

        if (data.IsSeverityApplicable != null) {
            if (data.IsSeverityApplicable == true) {
                if (data.Severity == "High") {
                    AlertTypesDetails.Severity = "High";
                } else if (data.Severity == "Low") {
                    AlertTypesDetails.Severity = "Low";
                } else if (data.Severity == "Medium") {
                    AlertTypesDetails.Severity = "Medium";
                }
            } else {
                AlertTypesDetails.Severity = "Not Applicable";
            }
        }

        //   AlertTypesDetails.Severity = data.Severity;
        var statusValue = '';
        if (data.IsEnabled == "Enabled") {
            statusValue = "true";
        } else {
            statusValue = "false";
        }


        AlertTypesDetails.IsEnabled = statusValue;
        if (data.ThresholdValue == "Not Applicable") {
            AlertTypesDetails.ThresholdValue = 0;
        } else {
            AlertTypesDetails.ThresholdValue = data.ThresholdValue;
        }


        if (selectedValueAutoClose == "") {
            if (data.AutoClose == "Enabled") {
                AlertTypesDetails.AutoClose = "true";
            } else {
                AlertTypesDetails.AutoClose = "false";
            }
        } else {
            if (selectedValueAutoClose == "Enabled") {
                AlertTypesDetails.AutoClose = "true";
            } else {
                AlertTypesDetails.AutoClose = "false";
            }
        }

        if (data.AlwaysGenerateNewAlert == "Not Applicable") {
            AlertTypesDetails.AlwaysGenerateNewAlert = 0;
        } else {
            AlertTypesDetails.AlwaysGenerateNewAlert = data.AlwaysGenerateNewAlert;
            if (AlertTypesDetails.AlwaysGenerateNewAlert == 'True') {
                AlertTypesDetails.AlwaysGenerateNewAlert = true;
            } else if (AlertTypesDetails.AlwaysGenerateNewAlert == 'False') {
                AlertTypesDetails.AlwaysGenerateNewAlert = false;
            }
        }

        alerttypesdetails.push(AlertTypesDetails)

        setAlertTypesReq.Alerttypesdetails = alerttypesdetails;
        setAlertTypesReq.isRestore = isRestore;
        $("#loadingDiv").show();

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    getAlertTypes(alertData)
                    openAlertpopup(0, 'changes_successfully_saved');
                }
            }
            $("#loadingDiv").hide();
        }

        var method = 'SetAlertTypes';
        var params = '{"token":"' + TOKEN() + '","alertTypes":' + JSON.stringify(setAlertTypesReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

        if (event.preventDefault) {
            event.preventDefault();
        }
    }
    return false;
}

var state = null;
define(["knockout", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, autho) {

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });


    return function DashBoardViewModel() {

     
        $("#gridChnagesConfo").modal('hide');
        var self = this;
        var PreviousRow;
        var currentRow;
        getAlertTypes(alertData);
        checkRights();

        $('#refreshAdminAlert').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#refreshAdminAlert').click();
            }
        });

        //Check Rights
        function checkRights() {
            var retval = autho.checkRightsBYScreen('Alerts', 'IsModifyAllowed');
            isEditAlert = retval;
            return retval;
        }

        self.refreshGrid = function (gID) {
            state = $("#" + gID).jqxGrid('savestate');
            self.alertData = ko.observableArray();
            getAlertTypes(alertData);
            that.editrow = -1;

        }

        // Grid changes save buttom
        self.gridChnagesConfo_Save = function (row) {

            $('#gridChnagesConfo').modal('hide');
           
            that.editrow = -1;
            Update(false, rowIndexStartEdit, isevent);
            Cancel(rowIndexStartEdit, isevent);
            return;

        }
        //// Grid Changes Cancel Button Click
        self.gridChnagesConfo_Cancel = function () {
            that.editrow = -1;
            //  $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', rowIndexStartEdit, 'Severity', originalDataForAlertAdministration[rowIndexStartEdit].Severity);
            //  $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', rowIndexStartEdit, 'IsAutoCloseApplicable', originalDataForAlertAdministration[rowIndexStartEdit].IsAutoCloseApplicable);
            //  $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', rowIndexStartEdit, 'ThresholdValue', originalDataForAlertAdministration[rowIndexStartEdit].ThresholdValue);
            //  $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', rowIndexStartEdit, 'AutoClose', originalDataForAlertAdministration[rowIndexStartEdit].AutoClose);
            //  $("#jqxgridAlertAdministartion").jqxGrid('setcellvalue', rowIndexStartEdit, 'AlwaysGenerateNewAlert', originalDataForAlertAdministration[rowIndexStartEdit].AlwaysGenerateNewAlert);

            // configval=originalDataForSysConfiguration[rowIndexStartEdit].ConfigValue;
            // $("#jqxgridSystemConfiguration").jqxGrid('endcelledit', rowIndexStartEdit, "ConfigValue");
            // categoryDisp = $("#jqxgridAlertAdministartion").jqxGrid('getcellvalue', rowIndexStartEdit, 'Category');
            //allGridRequest(categoryDisp, dataForMAnyGridArray);
            // that.editrow = -1;
            $("#jqxgridAlertAdministartion").jqxGrid('updatebounddata');
            $('#gridChnagesConfo').modal('hide');

            rowIndexStartEdit = '';
        }
        setMenuSelection();
        //Clear Filter
        self.clearfilter = function (gridId) {
            state = null;
            clearUiGridFilter(gridId);

        }

        self.exportToExcel = function (gID) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                exportjqxcsvData(gID,'Alert_types');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }

        }
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }

            self.observableModelPopup(elementname);

        }

        seti18nResourceData(document, resourceStorage);
    };
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


});

function getAlertTypes(alertData) {
    var alertTypeReq = new Object();
    alertTypeReq.AlertStatus = 0;

    var paramAdmin = new Object();
    paramAdmin.token = TOKEN();
    paramAdmin.alertTypeReq = alertTypeReq; 
    alertAdministarionGrid(paramAdmin, "jqxgridAlertAdministartion");
}

function alertAdministarionGrid(paramAlertAdmin, gID) {
    // prepare the data
   
    //calculate height of grid
    var gridheight = $(window).height();
    var percentValue;
    if (gridheight > 600) {
        percentValue = (20 / 100) * gridheight;
        gridheight = gridheight - 150;

        gridheight = gridheight - percentValue + 'px';


    } else {
        gridheight = '400px';
    }
    ////////////////

    var gridheight = $(window).height();
    gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 90;
    //$("#" + gID).jqxGrid({ height: gridheight });


    var InitGridStoragObj = initGridStorageObj(gID);
    var gridStorage = InitGridStoragObj.gridStorage;
    var adStorage = InitGridStoragObj.adStorage;

    var gridSource =
    {
        dataType: "json",
        datafields: [
            { name: 'AlertName', map: 'AlertName' },
            { name: 'Severity', map: 'Severity' },
            { name: 'Description', map: 'Description' },
            { name: 'IsEnabled', map: 'IsEnabled' },
            { name: 'ThresholdValue', type: 'string' },
            { name: 'AutoClose', map: 'AutoClose', type: 'string' },
            { name: 'AlertType', map: 'AlertType' },
            { name: 'AlertTypeId', map: 'AlertTypeId' },
            { name: 'Originator', map: 'Originator' },
            { name: 'MinValue', type: 'number' },
            { name: 'MaxValue', type: 'number' },
            { name: 'AlwaysGenerateNewAlert', map: 'AlwaysGenerateNewAlert' },
            { name: 'IsAutoCloseApplicable', map: 'IsAutoCloseApplicable' },
            { name: 'IsSeverityApplicable', map: 'IsSeverityApplicable' },
        ],
        root: 'alertList',
        type: "POST",
        data: paramAlertAdmin,
        url: AppConstants.get('API_URL') + "/GetAlertTypes",
        contentType: 'application/json',
    };
    var dataAdapter = new $.jqx.dataAdapter(gridSource, {
        formatData: function (data) {
            $('#jqxgridAlertAdministartion').jqxGrid('clear');
            $("#loadingDiv").show();
            $('.all-disabled').show();
            data = JSON.stringify(paramAlertAdmin);
            return data;
        },
        downloadComplete: function (data, status, xhr) {

            if (data.alertList)
                data.alertList = $.parseJSON(data.alertList);
            else {
                data.alertList = [];
            }

            if (data.alertList && data.alertList)
                var adminAlertArrayLength = data.alertList.length;

            if (adminAlertArrayLength > 0) {
                originalDataForadminAlets = data.alertList;
            }

            for (var i = 0; i < adminAlertArrayLength; i++) {
                if (data.alertList[i].ThresholdValue == 0) {
                    data.alertList[i].ThresholdValue = 'Not Applicable';
                } else {
                    data.alertList[i].ThresholdValue = '' + data.alertList[i].ThresholdValue + '';
                }

                if (data.alertList[i].AutoClose == true) {
                    data.alertList[i].AutoClose = 'Enabled';
                } else if (data.alertList[i].AutoClose == false) {

                    if (data.alertList[i].IsAutoCloseApplicable == false) {
                        data.alertList[i].AutoClose = 'Not Applicable';
                    } else {
                        data.alertList[i].AutoClose = 'Disabled';
                    }

                } else {
                    data.alertList[i].AutoClose = '' + data.alertList[i].AutoClose + '';
                }


                if (data.alertList[i].IsAutoCloseApplicable == false) {
                    data.alertList[i].AlwaysGenerateNewAlert = 'Not Applicable';
                } else {
                    data.alertList[i].AlwaysGenerateNewAlert = data.alertList[i].AlwaysGenerateNewAlert;

                }
                if (data.alertList[i].AlwaysGenerateNewAlert == true) {
                    data.alertList[i].AlwaysGenerateNewAlert = 'True';
                } else if (data.alertList[i].AlwaysGenerateNewAlert == false) {
                    data.alertList[i].AlwaysGenerateNewAlert = 'False';
                }

                if (data.alertList[i].IsSeverityApplicable != null) {
                    if (data.alertList[i].IsSeverityApplicable == true) {
                        if (data.alertList[i].Severity == "High") {
                            data.alertList[i].Severity = "High";
                        } else if (data.alertList[i].Severity == "Low") {
                            data.alertList[i].Severity = "Low";
                        } else if (data.alertList[i].Severity == "Medium") {
                            data.alertList[i].Severity = "Medium";
                        }
                    } else {
                        data.alertList[i].Severity = "Not Applicable";
                    }
                }
            }

            originalDataForAlertAdministration = data.alertList;
            PreviousRow = 'Blank';
            currentRow = 'Blank';
            $("#loadingDiv").hide();
            if (data.alertList) {
            }
            $('.all-disabled').hide();
        },
        loadError: function (jqXHR, status, error) {
            $('.all-disabled').hide();
        }

    });

    $("#" + gID).on("filter", function (event) {
        if (gridStorage[0].isGridReady == 1) {

            gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
        } else {

        }
    });

    $("#" + gID).on("sort", function (event) {
        if (gridStorage[0].isGridReady == 1) {
            gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
        } else {

        }
    });


    $("#" + gID).on("bindingcomplete", function (event) {
        var datainfo = $("#" + gID).jqxGrid('getdatainformation');
        $("#showResult").text(i18n.t('showing_admin', { results: datainfo.rowscount }, { lng: lang }));
        if (gridStorage[0].isGridReady == 1) {

            gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
            //alert('===' + gridStorage[0].isEditRow)
            if (gridStorage[0].isEditRow != null && gridStorage[0].isEditRow != '' && gridStorage[0].isEditRow != 'Blank') {
                $("#" + gID).jqxGrid('beginrowedit', gridStorage[0].isEditRow);
            }

        } else {

        }
    });


    var actionOnAlert = function (row, columnfield, value) {

        var eventName = "onclick";
        if ($.jqx.mobile.isTouchDevice()) {
            eventName = "on" + $.jqx.mobile.getTouchEventName('touchstart');
        }

        if (row === that.editrow) {
            return "<div style='text-align: center; width: 100%; top: 7px; position: relative;'><a " + eventName + "='Update(" + row + ", event)' style='color: inherit;' href='javascript:;'>Update</a><span style=''>/</span>" + "<a " + eventName + "='Cancel(" + row + ", event)' style='color: inherit;' href='javascript:;'>Cancel</a><span style=''>/</span>" + "<a " + eventName + "='Cancel(" + row + ", event)' style='color: inherit;' href='javascript:;'>Cancel</a></div>";
        }

        return "<a " + eventName + "='Edit(" + row + ", event)' style='color: inherit; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;'>Edit</a>";
    }

    var statusRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
        if (value == "Enabled") {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:0px;"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</div>';
        } else {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:0px;"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</div>';
        }

    }

    var automaticClosed = function (row, columnfield, value, defaulthtml, columnproperties, event) {
        if (value == "Enabled") {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:0px;"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</div>';
        } else if (value == "Disabled") {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:0px;"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"><div class="iconImg high_Severity"></div></i></a>' + value + '</div>';
        } else if (value == "Not Applicable") {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:7px;" disabled="disabled"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"></a>' + value + '</div>';
        }

    }

    var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties, event) {

        var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');

        if (value == "Low") {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:0px;"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</div>';
        } else if (value == "High") {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:0px;"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</div>';
        } else if (value == "Medium") {
            return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:0px;"><a  id="imageId" tabindex="0" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</div>';
        } else if (value == "Not Applicable") {
            return '<div style="padding-left:35px; padding-top:7px;" disabled="disabled">' + "Not Applicable" + '</div>';
        }
    }


    var beginedit = function (row, datafield, columntype) {
        return true;
    };


    ////////////////////////////////Numeric stepper///////////////////////////////////////////////////
    var createGridEditor = function (row, cellValue, editor, cellText, width, height) {
        PreviousRow = row;
        that.editrow = PreviousRow;
        minValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MinValue');
        maxValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MaxValue');
        editor.jqxNumberInput({ decimalDigits: 0, inputMode: 'simple', width: width, height: height, min: minValue, max: maxValue, spinButtons: true });

    };


    var gridEditorValue = function (row, cellValue, editor) {
        return editor.val();
    }

    /////////////////////////////////Numeric stepper values //////////////////////////////////////////////////////////


    var createGridEditorNumberInput = function (row, cellValue, editor, cellText, width, height, columnfield) {
        PreviousRow = row;
        that.editrow = PreviousRow;
        thresholdValue = $("#" + gID).jqxGrid('getcellvalue', row, 'ThresholdValue');
        if (thresholdValue == 'Not Applicable') {
            var element = $('<div style="padding-top:1px;" id="configValueDisp' + row + '" ><input type="text", readonly="true", disabled="disabled", style="width: 195px; height: 30px;" value="Not Applicable"/></div>');
            editor.append(element);
        } else {
            minValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MinValue');
            maxValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MaxValue');
            editor.jqxNumberInput({ decimal: cellValue, decimalDigits: 0, inputMode: 'simple', min: minValue, max: maxValue, width: 158, height: height, spinButtons: true });
            editor.on('change', function (event) {
                editFlag = true;
                selectedValueAutoClose = event.args.item;
            });
        }
    };

    var initGridEditorNumberInput = function (row, cellValue, editor, cellText, width, height) {
        PreviousRow = row;
        that.editrow = PreviousRow;
        thresholdValue = $("#" + gID).jqxGrid('getcellvalue', row, 'ThresholdValue');

        if (thresholdValue == 'Not Applicable') {

            var inputHTMLElement = editor.find("input");
            inputHTMLElement.focus();
        } else {
            minValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MinValue');
            maxValue = $("#" + gID).jqxGrid('getcellvalue', row, 'MaxValue');
            editor.jqxNumberInput({ min: minValue, max: maxValue, width: 158, height: height, decimal: cellValue });
            editor.on('valueChanged', function (event) {
                editFlag = true;
                var chnageValue = event.args.value;
                if (chnageValue > maxValue) {
                    $("#" + gID).jqxGrid('setcellvalue', row, 'ThresholdValue', maxValue);

                } else if (chnageValue < minValue) {
                    $("#" + gID).jqxGrid('setcellvalue', row, 'ThresholdValue', minValue);

                } else {

                }
            });

        }
    };

    var numericEditorValue = function (row, cellValue, editor, category) {
        thresholdValue = $("#" + gID).jqxGrid('getcellvalue', row, 'ThresholdValue');
        if (thresholdValue == 'Not Applicable') {

            var inputHTMLElement = editor.find("input");

            return inputHTMLElement.val();
        } else {
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
            if (editor.val() == NaN) {
                editor.jqxNumberInput('setDecimal', minValue);
                return editor.val();

            }
            return editor.val();
        }
    }
    //////////////////////////////////////////////////////
    var createGridEditorClosed = function (row, cellValue, editor, cellText, width, height, columnfield) {
        that.editrow = row;
        var sourceClose = ['Enabled', 'Disabled'];
        var placeDropDownName = '';
        if (cellValue == "Enabled") {
            placeDropDownName = "Enabled";
        } else {
            placeDropDownName = "Disabled";
        }

        var isAutoCloseApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoCloseApplicable');

        if (isAutoCloseApplicable == false) {
            var element = $('<div style="padding-top:1px;" id="isAutoCloseApplicableDisp' + row + '" ><input type="text", readonly="true", disabled="disabled", style="width: 150px; height: 30px;" value="Not Applicable"/></div>');
            editor.append(element);
        } else {

            editor.jqxDropDownList({ autoDropDownHeight: true, placeHolder: placeDropDownName, width: width, height: height, source: (sourceClose) });
            editor.on('change', function (event) {
                var rowIndex = event.args.rowindex;

            });

        }



    };

    var initGridEditorDropdown = function (row, cellValue, editor, cellText, width, height) {
        that.editrow = row;
        //     editor.jqxDropDownList('selectItem', cellValue);
        var isAutoCloseApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoCloseApplicable');

        if (isAutoCloseApplicable == false) {

            var inputHTMLElement = editor.find("input");
            inputHTMLElement.focus();
        } else {
            editor.jqxDropDownList('selectItem', cellValue);
        }
    };

    var gridEditorValueDropdown = function (row, cellValue, editor) {
        that.editrow = -1;

        var isAutoCloseApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoCloseApplicable');
        if (isAutoCloseApplicable == false) {
            var inputHTMLElement = editor.find("input");
            return inputHTMLElement.val();
        } else {
            return editor.val();

        }
    }
    //-----------------------------------START-STATUS-DROP-DOWN-EDITOR------------------------
    var createGridEditorStatus = function (row, cellValue, editor, cellText, width, height, columnfield) {
        var sourceClose = ['Enabled', 'Disabled'];
        editor.jqxDropDownList({ autoDropDownHeight: true, width: width, height: height, source: (sourceClose) });
        editor.on('change', function (event) {
            var rowIndex = event.args.rowindex;

        });

    };


    var initGridEditorDropdownSeverity = function (row, cellValue, editor, cellText, width, height) {
        that.editrow = row;
        var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');
        if (isSeverityApplicableFlag == false) {
            var inputHTMLElement = editor.find("input");
            inputHTMLElement.focus();
            // return inputHTMLElement;
        } else {
            editor.jqxDropDownList('selectItem', cellValue);
            // return editor.val();
        }

    };

    var gridEditorValueDropdownStatus = function (row, cellValue, editor) {
        return editor.val();
    }
    //------------------------------------------END-DROP-DOWN-STATUS-EDITOR---------------------------------

    //-----------------------------------START-SEVERITY-DROP-DOWN-EDITOR------------------------

    var createGridEditorSeverity = function (row, cellValue, editor, cellText, width, height, columnfield) {
        var placeDropDownName = '';

        var sourceClose = ['High', 'Low', 'Medium'];

        if (cellValue == "High") {
            placeDropDownName = "High";
        } else if (cellValue == "Medium") {
            placeDropDownName = "Medium";
        } else if (cellValue == "Low") {
            placeDropDownName = "Low";
        } else {
            placeDropDownName = "";
        }

        var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');
        if (isSeverityApplicableFlag == false) {
            var element = $('<div style="padding-top:1px;" id="isSeverityApplicable' + row + '" ><input type="text", readonly="true", disabled="disabled", style="width: 150px; height: 30px;" value="Not Applicable"/></div>');
            editor.append(element);
        } else {
            editor.jqxDropDownList({ autoDropDownHeight: true, placeHolder: placeDropDownName, width: width, height: height, source: (sourceClose) });
            editor.on('change', function (event) {
                var rowIndex = event.args.rowindex;

            });
        }
    };


    var initGridEditorDropdownStatus = function (row, cellValue, editor, cellText, width, height) {
        editor.jqxDropDownList('selectItem', cellValue);
    };

    var gridEditorValueDropdownSeverity = function (row, cellValue, editor) {

        var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');
        if (isSeverityApplicableFlag == false) {
            var inputHTMLElement = editor.find("input");
            return inputHTMLElement.val();
        } else {
            return editor.val();
        }
    }
    //-----------------------------------END-SEVERITY-DROP-DOWN-EDITOR------------------------

    ///--------------------------EDITOR FOR COLUMN ALWAYS GEMNERATE NEW ALERT-----------------------------

    var createGridEditorAlwaysGenerateNewAlert = function (row, cellValue, editor, cellText, width, height, columnfield) {
        var isAutoCloseApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoCloseApplicable');
        var sourceClose = ['True', 'False'];
        var placeDropDownName = cellValue;
        if (cellValue == true) {
            placeDropDownName = "True";
        } else if (cellValue == false) {
            placeDropDownName = "False";
        } else {
            placeDropDownName = "";
        }


        if (isAutoCloseApplicable == false) {
            var element = $('<div style="padding-top:1px;" id="isAutoCloseApplicableDisp' + row + '" ><input type="text", readonly="true", disabled="disabled", style="width: 195px; height: 30px;" value="Not Applicable"/></div>');
            editor.append(element);
        } else {

            editor.jqxDropDownList({ autoDropDownHeight: true, placeHolder: placeDropDownName, width: width, height: height, source: (sourceClose) });
            editor.on('change', function (event) {
                var rowIndex = event.args.rowindex;

            });

        }
    };


    var initGridEditorAlwaysGenerateNewAlert = function (row, cellValue, editor, cellText, width, height) {
        var isAutoCloseApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoCloseApplicable');

        if (isAutoCloseApplicable == false) {

            var inputHTMLElement = editor.find("input");
            inputHTMLElement.focus();
        } else {
            editor.jqxDropDownList('selectItem', cellValue);
        }
    };

    var gridEditorValueAlwaysGenerateNewAlert = function (row, cellValue, editor) {
        var isAutoCloseApplicable = $("#" + gID).jqxGrid('getcellvalue', row, 'IsAutoCloseApplicable');
        if (isAutoCloseApplicable == false) {
            var inputHTMLElement = editor.find("input");
            return inputHTMLElement.val();
        } else {
            return editor.val();

        }
    }


    ///--------------------------  END-----EDITOR FOR COLUMN ALWAYS GEMNERATE NEW ALERT-----------------------------


    var buildFilterPanel = function (filterPanel, datafield) {
        wildfilterForUIGrid(filterPanel, datafield, dataAdapter, 'jqxgridAlertAdministartion', true);
    }

    var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
        multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
    }


    var AlertNamerender = function (row, columnfield, value, defaulthtml, event) {

        return '<div onClick="checkChnagesInCell(' + row + ', event)"   class="m0 systemConfiguration-name-txt" style="padding-left:5px;padding-top:5px;">' + value + '</div>';
    }
    var DescriptionRender = function (row, columnfield, value, defaulthtml, event) {

        return '<div onClick="checkChnagesInCell(' + row + ', event)" class="m0 systemConfiguration-name-txt" style="padding-left:5px;padding-top:5px;">' + value + '</div>';
    }
    var ThresholdValueRender = function (row, columnfield, value, defaulthtml, event) {

        return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:5px;">' + value + '</div>';
    }

    var AlwaysGenerateNewAlertRender = function (row, columnfield, value, defaulthtml, event) {

        return '<div onClick="checkChnagesInCell(' + row + ', event)" style="padding-left:5px;padding-top:5px;width:100%;">' + value + '</div>';
    }
  
    $("#" + gID).jqxGrid(
    {
     
        width: "100%",
        height: gridHeightFunction(gID,"1"),
        source: dataAdapter,
        editable: true,
        altRows: true,
        columnsResize: true,
        filterable: true,
        sortable: true,
        columnsreorder: true,
        selectionmode: 'none',
        enabletooltips: true,
        autoshowcolumnsmenubutton: false,
        showsortmenuitems: false,
        editmode: 'selectedrow',
        rowsheight: 32,
        theme: AppConstants.get('JQX-GRID-THEME'),
        ready: function () {

            var gridheight = $(window).height();
            gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 75;
            $("#" + gID).jqxGrid({ height: gridheight });
           
        },
       
        columns: [
            {
                text: i18n.t('alert_name_admin', { lng: lang }), datafield: 'AlertName', editable: false, minwidth: 90, 
                filtertype: "custom", cellsrenderer: AlertNamerender,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('description_admin', { lng: lang }), datafield: 'Description', editable: false, minwidth: 90, 
                filtertype: "custom", cellsrenderer: DescriptionRender,
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('severity_admin', { lng: lang }), columntype: 'custom', datafield: 'Severity', minwidth: 100,  cellsrenderer: severityRenderer,
                createeditor: createGridEditorSeverity, initeditor: initGridEditorDropdownSeverity, geteditorvalue: gridEditorValueDropdownSeverity,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    var checkArr = [{ ControlValue: "Low", Value: "Low" }, { ControlValue: "High", Value: "High" }, { ControlValue: "Medium", Value: "Medium" }, { ControlValue: "Not Applicable", Value: "Not Applicable" }];
                    buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                }
            },
            {
                text: i18n.t('status_admin', { lng: lang }), columntype: 'custom', datafield: 'IsEnabled', minwidth: 100,  cellsrenderer: statusRenderer,
                createeditor: createGridEditorStatus, initeditor: initGridEditorDropdownStatus, geteditorvalue: gridEditorValueDropdownStatus,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    var checkArr = [{ ControlValue: "Enabled", Value: "Enabled" }, { ControlValue: "Disabled", Value: "Disabled" }];
                    buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                }
            },


            {
                text: i18n.t('threshold_admin', { lng: lang }), columntype: 'custom', datafield: 'ThresholdValue', minwidth: 150, resizable: true,
                createeditor: createGridEditorNumberInput, initeditor: initGridEditorNumberInput, geteditorvalue: numericEditorValue,
                filtertype: "custom", cellsrenderer: ThresholdValueRender,
                cellvaluechanging: function (row, datafield, columntype, oldvalue, newvalue) {
                    return newvalue;
                },
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }

            },
            {
                text: i18n.t('automatic_action_admin', { lng: lang }), datafield: 'AutoClose', columntype: 'custom', minwidth: 100,  enabletooltips: false,
                createeditor: createGridEditorClosed, initeditor: initGridEditorDropdown, geteditorvalue: gridEditorValueDropdown, cellsrenderer: automaticClosed,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    var checkArr = [{ ControlValue: "Enabled", Value: "Enabled" }, { ControlValue: "Disabled", Value: "Disabled" }, { ControlValue: "Not Applicable", Value: "Not Applicable" }];
                    buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                }
            },

            {
                text: i18n.t('always_generate_new_alert', { lng: lang }), datafield: 'AlwaysGenerateNewAlert', columntype: 'custom', minwidth: 130, enabletooltips: false,
                createeditor: createGridEditorAlwaysGenerateNewAlert, initeditor: initGridEditorAlwaysGenerateNewAlert, geteditorvalue: gridEditorValueAlwaysGenerateNewAlert,
                filtertype: "custom", cellsrenderer: AlwaysGenerateNewAlertRender,
                createfilterpanel: function (datafield, filterPanel) {
                    var checkArr = [{ ControlValue: "True", Value: "True" }, { ControlValue: "False", Value: "False" }, { ControlValue: "Not Applicable", Value: "Not Applicable" }];
                    buildFilterPanelMultiChoice(filterPanel, datafield, checkArr);
                }
            },
            {
                text: i18n.t('actions_alert', { lng: lang }), datafield: 'action', align: "center", editable: false, sortable: false, filterable: false, menu: false, minwidth: 100, exportable: false,  cellsrenderer: function (row, column, value) {
                    var eventName = "onclick";
                    var thresholdValue = $("#" + gID).jqxGrid('getcellvalue', row, 'ThresholdValue');
                    if (isEditAlert == false) {
                        return "<a " + eventName + "='EditRow(" + row + ", event)'  disabled='true' class='btn disabled'  style='color: #000000; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;' title='Edit Alert'><i class='icon-pencil' ></i></a>";
                    }
                    //row === that.editrow && 
                    if (row == currentRow) {
                        if (thresholdValue == 'Not Applicable') {
                            return "<div style='text-align: center; width: 100%; top: 7px; position: relative;'><a " + eventName + "='Update(false," + row + ", event)'  class='btn btn-xs btn-default' style='color: #000000;' href='javascript:;' title='Save'><i class='icon-checkmark'></i></a><span style=''></span>" + "<a " + eventName + "='Cancel(" + row + ", event)'  class='btn btn-xs btn-default' tabindex='-1' style='margin-left: 12px;color: #000000;' href='javascript:;' title='Cancel'><i class='icon-cross'></i></a><span style=''></span>";
                        } else {
                            return "<div style='text-align: center; width: 100%; top: 7px; position: relative;'><a " + eventName + "='Update(false," + row + ", event)'  class='btn btn-xs btn-default' style='color: #000000;' href='javascript:;' title='Save'><i class='icon-checkmark'></i></a><span style=''></span>" + "<a " + eventName + "='Cancel(" + row + ", event)'  class='btn btn-xs btn-default' style='margin-left: 5px;color: #000000;' href='javascript:;' title='Cancel'><i class='icon-cross'></i></a><span style=''></span>" + "<a " + eventName + "='Update(true," + row + ", event)'  class='btn btn-xs btn-default' tabindex='-1' style='margin-left: 2px;color: inherit;' href='javascript:;' title='Restore'><div class='iconImg restoreDefault'></div></a>";
                        }
                    }

                    return "<a " + eventName + "='EditRow(" + row + ", event)' class='btn btn-xs btn-default' tabindex='-1' style='color: #000000; margin-left: 50%; left: -15px; top: 7px; position: relative;' href='javascript:;' title='Edit Alert'><i class='icon-pencil' ></i></a>";
                }
            }
        ]
    }).on({
        filter: function (e) { self.gridSetRowDetailsAdminAlert(e); }
    });

    if (state != null) {

        $("#jqxgridAlertAdministartion").jqxGrid('loadstate', state);
    }
    

    //$("#alertAdminBody").on('click', function () {

    //    if (checkForEdit == undefined || checkForEdit == "Blank") {

    //    } else {
    //        if (checkForEdit >= 0) {
    //            //$("#jqxgridAlertAdministartion").jqxGrid('beginrowedit', checkForEdit);
    //            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', checkForEdit, "Severity");

    //            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', checkForEdit, "IsEnabled");

    //            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', checkForEdit, "ThresholdValue");

    //            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', checkForEdit, "AutoClose");

    //            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', checkForEdit, "AlwaysGenerateNewAlert");
               
    //        }

    //    }
    //});    

    $("#BtnsForCheckEditDiv").on('click', function () {
        checkForEdit = 'Blank';
        var gridStorage = JSON.parse(sessionStorage.getItem(alertscrenGId + "gridStorage"));
        if (gridStorage) {
            gridStorage[0].isEditRow = checkForEdit;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(alertscrenGId + 'gridStorage', updatedGridStorage);
        }
        //one 
        if (currentRow >= 0) {

            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', currentRow, "Severity");

            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', currentRow, "IsEnabled");

            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', currentRow, "ThresholdValue");

            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', currentRow, "AutoClose");

            $("#jqxgridAlertAdministartion").jqxGrid('begincelledit', currentRow, "AlwaysGenerateNewAlert");
        }
    });

}

var gridSetRowDetailsAdminAlert = function (e) {
    var self = this;
    $("#jqxgridAlertAdministartion").jqxGrid('beginupdate');
    var results = $("#jqxgridAlertAdministartion").jqxGrid('getrows').length;
    $("#showResult").text(i18n.t('showing_admin', { results: results }, { lng: lang }));
    $("#jqxgridAlertAdministartion").jqxGrid('resumeupdate');
    return;

};

function checkChnagesInCell(row, event) {

    isevent = event;
    $("#jqxgridAlertAdministartion").jqxGrid('clearselection');
    $("#jqxgridAlertAdministartion").jqxGrid('selectrow', row);

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', rowIndexStartEdit, "Severity");
    var Severity = $("#jqxgridAlertAdministartion").jqxGrid('getcellvalue', rowIndexStartEdit, 'Severity');

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', rowIndexStartEdit, "IsEnabled");
    var IsEnabledStatus = $("#jqxgridAlertAdministartion").jqxGrid('getcellvalue', rowIndexStartEdit, 'IsEnabled');

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', rowIndexStartEdit, "ThresholdValue");
    var ThresholdValue = $("#jqxgridAlertAdministartion").jqxGrid('getcellvalue', rowIndexStartEdit, 'ThresholdValue');

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', rowIndexStartEdit, "AutoClose");
    var AutoClose = $("#jqxgridAlertAdministartion").jqxGrid('getcellvalue', rowIndexStartEdit, 'AutoClose');

    $("#jqxgridAlertAdministartion").jqxGrid('endcelledit', rowIndexStartEdit, "AlwaysGenerateNewAlert");
    var AlwaysGenerateNewAlert = $("#jqxgridAlertAdministartion").jqxGrid('getcellvalue', rowIndexStartEdit, 'AlwaysGenerateNewAlert');

    if (rowIndexStartEdit == row) {

    }
    else if (rowIndexStartEdit > row || rowIndexStartEdit < row) {
        if (Severity != undefined) {
            if ((Severity != originalDataForAlertAdministration[rowIndexStartEdit].Severity) && (Severity != '')) {
                $("#gridChnagesConfo").modal('show');
                that.editrow = -1;
            }
        }
        if (IsEnabledStatus != undefined) {
            if ((IsEnabledStatus != originalDataForAlertAdministration[rowIndexStartEdit].IsEnabled) && (IsEnabledStatus != '')) {
                $("#gridChnagesConfo").modal('show');
                that.editrow = -1;
            }
        }
        if (ThresholdValue != undefined) {
            if ((ThresholdValue != originalDataForAlertAdministration[rowIndexStartEdit].ThresholdValue) && (ThresholdValue != '')) {
                $("#gridChnagesConfo").modal('show');
                that.editrow = -1;
            }
        }
        if (AutoClose != undefined) {
            if ((AutoClose != originalDataForAlertAdministration[rowIndexStartEdit].AutoClose) && (AutoClose != '')) {
                $("#gridChnagesConfo").modal('show');
                that.editrow = -1;
            }
        }
        if (AlwaysGenerateNewAlert != undefined) {
            if ((AlwaysGenerateNewAlert != originalDataForAlertAdministration[rowIndexStartEdit].AlwaysGenerateNewAlert) && (AlwaysGenerateNewAlert != '')) {
                $("#gridChnagesConfo").modal('show');
                that.editrow = -1;
            }
        }
    }
    else if (rowIndexStartEdit == '' || rowIndexStartEdit == undefined) {

    } else {
        $("#gridChnagesConfo").modal('hide');
    }   
    return;
}

function UpdateCancel(isRestore, row, event) {

    that.editrow = -1;
    getAlertTypes(alertData)
    return false;
}
