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

        self.closedpopup = function (data) {
            var id = $("#showHideMainDiv").parent('div').parent('div').parent('div').parent('div').parent('div')[0].id;
            $("#" + id).modal('hide');

        }

        $('#showHideMainDiv').keydown(function (e) {
            if ($('#btnOkShowHide').is(":focus") && (e.which || e.keyCode) == 13) {
                e.preventDefault();
                saveSelectedColumns(gridid);
                self.closedpopup();
            }
        });

        $('#showHideMainDivScheduleHeader').mouseup(function () {
            $("#showHideMainDivScheduleContent").draggable({ disabled: true });
        });

        $('#showHideMainDivScheduleHeader').mousedown(function () {
            $("#showHideMainDivScheduleContent").draggable({ disabled: false });
        });

        columnList = koUtil.gridColumnList;
        seti18nResourceData(document, resourceStorage);
    };
});

function resetState() {
    //var strName = getschedulscrenName();

    var object;
    for (var i = 0; i < columnArray.length; i++) {
        object = columnArray[i];
        if (object.checked) {
            $("#" + object.gridid).jqxGrid('hidecolumn', object.column);
        } else {
            $("#" + object.gridid).jqxGrid('showcolumn', object.column);
        }
        //strName = 'jqxgridForSelectedDevices' + strName;
        ////alert('object.gridid   ' + object.gridid);
        //var gridStorage = JSON.parse(sessionStorage.getItem(strName + "gridStorage"));
        //if (gridStorage) {
        //    gridStorage[0].isgridState = $("#" + object.gridid).jqxGrid('savestate');
        //    var updatedGridStorage = JSON.stringify(gridStorage);
        //    window.sessionStorage.setItem(strName + 'gridStorage', updatedGridStorage);
        //}
    }
    columnArray = [];
}

function funShowHide(id, ch) {

    var arr = id.split('-check-')
    var gridid = arr[0];
    var column = arr[1];

    columnArray.push(new Object({ 'gridid': gridid, 'column': column, 'checked': ch }));
    if (ch) {
        $("#" + gridid).jqxGrid('showcolumn', column);

        for (var m = 0; m < uncheckedColumns.length; m++) {
            if (uncheckedColumns[m] == column) {
                uncheckedColumns.splice(m, 1);
            }
        }
        checkedColumns.push(column);

    } else {
        $("#" + gridid).jqxGrid('hidecolumn', column);

        for (var n = 0; n < checkedColumns.length; n++) {
            if (checkedColumns[n] == column) {
                checkedColumns.splice(n, 1);
            }
        }
        uncheckedColumns.push(column);
    }
    var srName = getschedulscrenName();
    var gridStorage = JSON.parse(sessionStorage.getItem(gridid + srName + "gridStorage"));
    if (gridStorage) {
        gridStorage[0].isgridState = $("#" + gridid).jqxGrid('savestate');
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridid + srName + 'gridStorage', updatedGridStorage);
    }
}

function saveSelectedColumns() {
    if (checkedColumns.length == 0 && uncheckedColumns.length == 0)
        return;

    if (visibleColumnsForScheduleList.length == 0) {
        if (checkedColumns.length == 0 && uncheckedColumns.length > 0)
            var columns = columnList;
        else if (uncheckedColumns.length == 0 && checkedColumns.length > 0)
            var columns = [];
    }
    else {
        var columns = visibleColumnsForScheduleList;
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

    visibleColumnsForScheduleList = columns;

    columnList = [];
    columnArray = [];
    checkedColumns = [];
    uncheckedColumns = [];
    //var strName = getschedulscrenName();
    //strName = 'jqxgridForSelectedDevices' + strName;
    ////('gridid ' + gridid);
    //var gridStorage = JSON.parse(sessionStorage.getItem(strName + "gridStorage"));
    //if (gridStorage) {
    //    gridStorage[0].isgridState = $("#" + gridid).jqxGrid('savestate');
    //    var updatedGridStorage = JSON.stringify(gridStorage);
    //    window.sessionStorage.setItem(strName + 'gridStorage', updatedGridStorage);
    //}
}