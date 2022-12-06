gridid = '';
define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil) {
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    columnList = new Array();
    columnArray = new Array();
    checkedColumns = new Array();
    uncheckedColumns = new Array();


    return function showHideColViewModel() {
        if (isDeviceSearchWithAdvanceSearch)
            gridid = "Devicejqxgrid";
        else
            gridid = "blankDevicejqxgrid";

        var checkpopupopen = 0;
        
        $("#totalSelectedColumnCount").text(selectedColumns.length); //Initializing Totalselected clumns count
        if (selectedColumns.length == 0) {
            $("#btnClearUserPreferences").prop('disabled', true);
        }
        var id = $("#showHideUserPreferencesDiv").parent('div').parent('div').parent('div')[0].id;
        if (id != "") {
            id = '#' + id + '';
            $(id).on('shown.bs.modal', function () {
                $('#btnSaveUserPreferences').focus();
            })
        }

        columnList = [];
        columnArray = [];
        checkedColumns = [];
        uncheckedColumns = [];

        var self = this;                
        //focus on first btn
        $('#showHideUserPreferencesDiv').on('shown.bs.modal', function () {     ///For Device Attribute Screen  showHideUserPreferencesDivGenericHeader
            $('#btnSaveUserPreferences').focus();
        });

        $('#showHideUserPreferencesDiv').keydown(function (e) {
            if ($('#btnSaveUserPreferences').is(":focus") && (e.which || e.keyCode) == 13) {
                e.preventDefault();
                saveSelectedColumns(gridid);
                self.closedpopup();
            }
        });

        ///////////////////

        $('#showHideUserPreferencesDivGenericHeader').mouseup(function () {
            $("#showHideUserPreferencesDivContent").draggable({ disabled: true });
        });

        $('#showHideUserPreferencesDivGenericHeader').mousedown(function () {
            $("#showHideUserPreferencesDivContent").draggable({ disabled: false });
        });


        self.closedpopup = function (data) {
            var id = $("#showHideUserPreferencesDiv").parent('div').parent('div').parent('div').parent('div').parent('div')[0].id;
            $("#" + id).modal('hide');

        }

        columnList = koUtil.gridColumnList;
        seti18nResourceData(document, resourceStorage);
    };

});

function resetState() {
    var object;
    for (var i = 0; i < columnArray.length; i++) {
        object = columnArray[i];
        if (object.IsSelected) {
            $("#" + gridid).jqxGrid('hidecolumn', object.columnField);
        } else {
            $("#" + gridid).jqxGrid('showcolumn', object.columnField);
        }
        var gridStorage = JSON.parse(sessionStorage.getItem(gridid + "gridStorage"));
        if (gridStorage) {
            gridStorage[0].isgridState = $("#" + gridid).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridid + 'gridStorage', updatedGridStorage);
        }
    }
    columnArray = [];
    var adStorage = JSON.parse(sessionStorage.getItem(gridid + "adStorage"));
    if (adStorage && adStorage[0].adSearchObj) {
        selectedColumns = adStorage[0].userPreferenceColumns ? adStorage[0].userPreferenceColumns : [];
        adStorage[0].adSearchObj.SelectedHeaders = selectedColumns;
    }
    var updatedadStorage = JSON.stringify(adStorage);
    window.sessionStorage.setItem(gridid + 'adStorage', updatedadStorage);
}

function showHideColumns(id, checked) {

    var arr = id.split('-check-')
    gridid = arr[0];
    var columnField = arr[1];
    var isCustomAttribute = arr[2];

    columnArray.push(new Object({ 'AttributeName': columnField, 'IsSelected': checked, 'IsCustomAttribute': isCustomAttribute }));
    var source = _.where(selectedColumns, { AttributeName: columnField });
    if (source && source.length > 0) {
        selectedColumns = jQuery.grep(selectedColumns, function (value) {
            var index = selectedColumns.indexOf(source[0]);
            return (value != selectedColumns[index] && value != null);
        });
    } else {
        if (checked && selectedColumns.length >= 15) {
            openAlertpopup(1, 'device_search_max_columns_select');
            $("#" + id).prop("checked", false);
            $("#" + id).removeAttr("checked");
            return;
        }
        if (checked) {
            var columnSource = _.where(customColumns, { AttributeName: columnField });
            var columnName = columnSource[0].DisplayName;
            selectedColumns.push(new Object({ 'DisplayName': columnName, 'AttributeName': columnField, 'IsSelected': checked, 'IsCustomAttribute': isCustomAttribute }));
        }
    }

    $("#totalSelectedColumnCount").text(selectedColumns.length);
    if (selectedColumns.length == 0) {
        $("#btnClearUserPreferences").prop('disabled', true);
    }
    else {
        $("#btnClearUserPreferences").prop('disabled', false);
    }

    if (checked) {
        for (var m = 0; m < uncheckedColumns.length; m++) {
            if (uncheckedColumns[m] == columnField) {
                uncheckedColumns.splice(m, 1);
            }
        }
        checkedColumns.push(columnField);
    } else {
        for (var n = 0; n < checkedColumns.length; n++) {
            if (checkedColumns[n] == columnField) {
                checkedColumns.splice(n, 1);
            }
        }
        uncheckedColumns.push(columnField);
    }
}

function saveSelectedColumns() {
    if (gridid == "blankDevicejqxgrid" || gridid == "Devicejqxgrid") {
        var showHideColList = sessionStorage.getItem(gridid + "ShowHideCol");
        if (showHideColList) {
            uncheckedColumns = $.parseJSON(showHideColList).concat(uncheckedColumns);
            uncheckedColumns = uncheckedColumns.filter(function(item, pos) {
                 return uncheckedColumns.indexOf(item) === pos })
            }
    }
    
    if (uncheckedColumns.length > 0) {
        for (var m = 0; m < uncheckedColumns.length; m++) {
            $("#" + gridid).jqxGrid('hidecolumn', uncheckedColumns[m]);
        }
    }
    if (checkedColumns.length > 0) {
        for (var p = 0; p < checkedColumns.length; p++) {
            $("#" + gridid).jqxGrid('showcolumn', checkedColumns[p]);
            if (gridid == "blankDevicejqxgrid" || gridid == "Devicejqxgrid") {
                for (var m = 0; m < uncheckedColumns.length; m++) {
                    if (uncheckedColumns[m] == checkedColumns[p]) {
                        uncheckedColumns.splice(m, 1);
                    }
                }
            }
        }
    }

    if (gridid == "blankDevicejqxgrid") {
        var localizationObj = {};
        localizationObj.emptydatastring = i18n.t(" ", { lng: lang });
        $("#" + gridid).jqxGrid('localizestrings', localizationObj);
        setTimeout(function () {
            var localizationObj = {};
            localizationObj.emptydatastring = i18n.t("no_default_data_for_deviceSearch", { lng: lang });
            $("#" + gridid).jqxGrid('localizestrings', localizationObj);
        }, 100);

    } else if (gridid == "blankReportGrid") {
        setTimeout(function () {
            var localizationObj = {};
            localizationObj.emptydatastring = i18n.t("no_default_data_for_report", { lng: lang });
            $("#" + gridid).jqxGrid('localizestrings', localizationObj);
        }, 100);
    }

    var gridStorage = JSON.parse(sessionStorage.getItem(gridid + "gridStorage"));
    if (gridStorage) {
        gridStorage[0].isgridState = $("#" + gridid).jqxGrid('savestate');
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridid + 'gridStorage', updatedGridStorage);
    }

    if (gridid == "blankDevicejqxgrid" || gridid == "Devicejqxgrid") {
        sessionStorage.setItem('DevicejqxgridShowHideCol', JSON.stringify(uncheckedColumns));
        sessionStorage.setItem('blankDevicejqxgridShowHideCol', JSON.stringify(uncheckedColumns));
    }

    var adStorage = JSON.parse(sessionStorage.getItem(gridid + "adStorage"));
    if (adStorage) {
        if (adStorage[0].adSearchObj) {
            adStorage[0].userPreferenceColumns = selectedColumns;
            adStorage[0].adSearchObj.SelectedHeaders = adStorage[0].userPreferenceColumns;
            selectedColumnsClone = selectedColumns.slice();
        } else if (adStorage[0].quickSearchObj) {
            adStorage[0].userPreferenceColumns = selectedColumns;
            adStorage[0].quickSearchObj.SelectedHeaders = adStorage[0].userPreferenceColumns;
            selectedColumnsClone = selectedColumns.slice();
        } else {
            var DeviceSearch = new Object();
            adStorage[0].userPreferenceColumns = selectedColumns;
            DeviceSearch.SelectedHeaders = adStorage[0].userPreferenceColumns;
            selectedColumnsClone = selectedColumns.slice();
            updateAdSearchObj(gridid, DeviceSearch, 0);
            adStorage = JSON.parse(sessionStorage.getItem(gridid + "adStorage"));
        }
    }

    var updatedadStorage = JSON.stringify(adStorage);
    window.sessionStorage.setItem(gridid + 'adStorage', updatedadStorage);

    if (gridid == "blankDevicejqxgrid") {
        return;
    }

    $("#" + gridid).jqxGrid('updatebounddata');
}

//--Added as part of VHQ-12058 to clear all selected columns(checkboxes).
function clearSelectedShowHideColumns() {
    if (selectedColumns.length > 0) {      
        for (var i = 0; i < selectedColumns.length; i++) {
            var checkBoxColId = gridid + '-check-' + selectedColumns[i].AttributeName + '-check-' + selectedColumns[i].IsCustomAttribute;
            $("#" + checkBoxColId).prop("checked", false);
            $("#" + checkBoxColId).removeAttr("checked");           
        }        
    }

    $("#totalSelectedColumnCount").text(0);  
    $("#btnClearUserPreferences").prop('disabled', true);
    selectedColumns = [];
    checkedColumns = [];
    uncheckedColumns = [];
}