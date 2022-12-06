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

        var checkpopupopen = 0;

        var id = $("#showHideMainDiv").parent('div').parent('div').parent('div')[0].id;
        if (id != "") {
            id = '#' + id + '';
            $(id).on('shown.bs.modal', function () {
                $('#btnOkShowHide').focus();
            })
        }
        
        columnList = [];
        columnArray = [];
        checkedColumns = [];
        uncheckedColumns = [];

        var self = this;

        //focus on first btn
        $('#showHideMainDiv').on('shown.bs.modal', function () {     ///For Device Attribute Screen  
            $('#btnOkShowHide').focus();
        });

        $('#showHideMainDiv').keydown(function (e) {
            if ($('#btnOkShowHide').is(":focus") && (e.which || e.keyCode) == 13) {
                e.preventDefault();
                saveSelectedColumns(gridid);
                self.closedpopup();
            }
        });

        ///////////////////

        $('#showHideMainDivGenericHeader').mouseup(function () {
            $("#showHideMainDivContent").draggable({ disabled: true });
        });

        $('#showHideMainDivGenericHeader').mousedown(function () {
            $("#showHideMainDivContent").draggable({ disabled: false });
        });


        self.closedpopup = function (data) {
            var id = $("#showHideMainDiv").parent('div').parent('div').parent('div').parent('div').parent('div')[0].id;
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
        if (object.checked) {
            $("#" + object.gridid).jqxGrid('hidecolumn', object.column);
        } else {
            $("#" + object.gridid).jqxGrid('showcolumn', object.column);
        }
        var gridStorage = JSON.parse(sessionStorage.getItem(object.gridid + "gridStorage"));
        if (gridStorage) {
            gridStorage[0].isgridState = $("#" + object.gridid).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(object.gridid + 'gridStorage', updatedGridStorage);
        }
    }
    columnArray = [];
}

function funShowHide(id, ch) {

    var arr = id.split('-check-')
    gridid = arr[0];
    var column = arr[1];

    columnArray.push(new Object({ 'gridid': gridid, 'column': column, 'checked': ch }));
    if (ch) {
        for (var m = 0; m < uncheckedColumns.length; m++) {
            if (uncheckedColumns[m] == column) {
                uncheckedColumns.splice(m, 1);
            }
        }
        checkedColumns.push(column);
    } else {
        for (var n = 0; n < checkedColumns.length; n++) {
            if (checkedColumns[n] == column) {
                checkedColumns.splice(n, 1);
            }
        }
        uncheckedColumns.push(column);
    }
}

function saveSelectedColumns() {
    if (checkedColumns.length == 0 && uncheckedColumns.length == 0)
        return;
    if (gridid == "blankDevicejqxgrid" || gridid == "Devicejqxgrid") {
        var showHideColList = sessionStorage.getItem(gridid + "ShowHideCol");
        if (showHideColList) {
            uncheckedColumns = $.parseJSON(showHideColList).concat(uncheckedColumns);
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

    if (visibleColumnsList.length == 0) {
        if (checkedColumns.length == 0 && uncheckedColumns.length > 0)
            var columns = columnList;
        else if (uncheckedColumns.length == 0 && checkedColumns.length > 0)
            var columns = [];
    }
    else {
        if (isPopUpOpen)
            var columns = visibleColumnsListForPopup;
        else
            var columns = visibleColumnsList;
    }


    if (uncheckedColumns.length > 0) {
        for (var m = 0; m < uncheckedColumns.length; m++) {
            for (var n = 0; n < columns.length; n++) {
                if (columns[n] == uncheckedColumns[m]) {
                    columns.splice(n, 1);
                    break;
                }
            }
        }
    }

    if (checkedColumns.length > 0) {
        for (var p = 0; p < checkedColumns.length; p++) {
            isExists = false;
            for (var q = 0; q < columns.length; q++) {
                if (checkedColumns[p] == columns[q]) {
                    isExists = true;
                    break;
                }
            }

            if (!isExists) {
                columns.push(checkedColumns[p]);
            }
        }
    }


    if (isPopUpOpen)
        visibleColumnsListForPopup = columns;
    else
        visibleColumnsList = columns;


    //if (columnArray.length != 0) {
    //    columnWidth(columnArray[0].gridid)
    //}

    columnList = [];
    columnArray = [];
    checkedColumns = [];
    uncheckedColumns = [];
    //columnWidth(gridid);
}