//for Grid functionality
gridClearFlag = 0;

UIgridClearFlag = 0;

checkhead = 0;
datepickercheck = '';
schedulADApply = 0;

pagechange = 0;

isHighlightedPage = 0;

filtercheckfiled = '';
numericDefaultCondition = ' ';
loadgrid = '';
loadfield = '';

uiloadgrid = '';
uiloadfield = '';

initopenfilter = 0;
initopenUIfilter = 0;
afterInitopenfilter = 0;

visiblecolumnCountArr = new Array();

serialrenderGridId = '';
pageIdentifier = 'Next';

UifilterfiledsDataArray = new Array();
var gridDateFormat = 'dd/M/yyyy';
var filterDatePlaceHolder = 'E.g. 01/Jan/2021';
var defaultFilterDateFormat = 'DD/MMM/YYYY';
var currentDateShort = moment().format(AppConstants.get('SHORT_DATE_FORMAT'));
var currentDateLong = moment().format(AppConstants.get('LONG_DATETIME_FORMAT_SECONDS'));

function GetExportVisibleColumn(gID) {
    var cols = $("#" + gID).jqxGrid("columns");
    var ColList = new Array();
    if (cols && cols.records) {
        for (var i = 0; i < cols.records.length; i++) {
            if (cols.records[i].hidden != true && cols.records[i].datafield != "isSelected")
                ColList.push(cols.records[i].datafield);
        }
    }

    return ColList;
}

function getSelectedColumns(gID) {
    var cols = $("#" + gID).jqxGrid("columns");
    var ColList = new Array();
    if (cols && cols.records) {
        for (var i = 0; i < cols.records.length; i++) {
            if (cols.records[i].hidden != true && cols.records[i].datafield != "isSelected") {
                var item = new Object();
                item.DisplayName = cols.records[i].text;
                item.AttributeName = cols.records[i].datafield;
                item.IsSelected = cols.records[i]._rendered;
                item.IsCustomAttribute = cols.records[i].datafield;
                ColList.push(cols);
            }
        }
    }

    return ColList;
}

function genericShowHideColumnUserPreference(gridId) {
    var columnArray = new Array();
    var cols = customColumns;
    if (cols.length > 0) {
        var objcolumn;
        for (var i = 0; i < cols.length; i++) {
            objcolumn = new Object();
            if (cols[i].DisplayName != '') {
                objcolumn.DisplayName = cols[i].DisplayName;
                objcolumn.AttributeName = cols[i].AttributeName;
                objcolumn.IsSelected = cols[i].IsSelected;
                objcolumn.IsCustomAttribute = cols[i].IsCustomAttribute;
                objcolumn.gridId = gridId;
                columnArray.push(objcolumn);
            }
        }
    }
    return columnArray;
}

function genericHideShowColumn(gridId, check, compulsoryfields) {
    var columnArray = new Array();
    var cols = $("#" + gridId).jqxGrid("columns");
    var start = 0;
    if (check) {
        start = 1;
    }
    if (cols.records != null) {
        var objcolumn;
        for (var i = start; i < cols.records.length; i++) {
            objcolumn = new Object();
            if ($.inArray(cols.records[i].datafield, compulsoryfields) < 0) {

                if (cols.records[i].text != '') {
                    objcolumn.columnName = cols.records[i].text;
                    objcolumn.columnfield = cols.records[i].datafield;
                    objcolumn.checked = cols.records[i].hidden;
                    objcolumn.gridId = gridId;
                    columnArray.push(objcolumn);
                }
            }
        }
    }
    return columnArray;
}

function getConfigValuesForDateFilter(callType) {
    try {
        console.log("Method-getConfigValuesForDateFilter started ");
        var filterConfigurations = {};
        //keys for substraction in moment js
        //years,quarters,months,weeks,days,hours,minutes,seconds,milliseconds 
        if (callType == ENUM.get("CALLTYPE_MONTH")) {
            var source = _.where(callTypeConfigurations, { ConfigName: AppConstants.get('CATEGORY_CONFIG_MONTH') });
            if (source && source.length > 0) {
                filterConfigurations.configValue = source[0].ConfigValue;
                filterConfigurations.fromDate = moment().subtract('months', source[0].ConfigValue);
            }
        } else if (callType == ENUM.get("CALLTYPE_DAY")) {
            var source = _.where(callTypeConfigurations, { ConfigName: AppConstants.get('CATEGORY_CONFIG_DAY') });
            if (source && source.length > 0) {
                filterConfigurations.configValue = source[0].ConfigValue;
                filterConfigurations.fromDate = moment().subtract('days', source[0].ConfigValue);
            }
        } else if (callType == ENUM.get("CALLTYPE_WEEK")) {
            var source = _.where(callTypeConfigurations, { ConfigName: AppConstants.get('CATEGORY_CONFIG_WEEK') });
            if (source && source.length > 0) {
                filterConfigurations.configValue = source[0].ConfigValue;
                filterConfigurations.fromDate = moment().subtract('weeks', source[0].ConfigValue);
            }
        } else {
            filterConfigurations.configValue = 1;
            filterConfigurations.fromDate = moment().subtract('days', 1);
        }
        console.log("Method-getConfigValuesForDateFilter Ended ");
        return filterConfigurations;
    }
    catch (err) {
        if (err)
            console.log("Method-getConfigValuesForDateFilter " + "Exception-" + err.message);
    }
}

function initialColumnFilterBuilder(gridStorage) {
    try {
        console.log("Method-initialColumnFilterBuilder started ");

        if (gridStorage[0].isdefaultfilter == 0) {
            var DateObj = Object();
            CallType = ENUM.get("CALLTYPE_DAY");
            DateObj.ColumnType = 'Date';
            var filterConfigurations = getConfigValuesForDateFilter(CallType);
            DateObj.FilterDays = filterConfigurations.configValue;;
            DateObj.FilterValue = moment(filterConfigurations.fromDate).format(defaultFilterDateFormat);
            DateObj.FilterValueOptional = moment().format(defaultFilterDateFormat);
            DateObj.IsFixedDateRange = true;
            var dateArr = new Array();
            dateArr.push(DateObj);

            var filtergroup = new $.jqx.filter();
            var filter_or_operator = 1;
            var filtervalue = dateArr;
            var filtercondition = 'contains';
            var filter = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter);

            console.log("Method-initialColumnFilterBuilder Ended ");
            return filtergroup;
        }
    }
    catch (err) {
        if (err)
            console.log("Method-initialColumnFilterBuilder " + "Exception-" + err.message);
    }
}

function columnSortFilterFormatedData(ColumnSortFilter, gridId, gridStorage, grididforfilter, defaultfield, columnType, defaultvalue) {

    if (gridStorage[0].isdefaultfilter == 0) {
        var filterObj = Object();
        var filterArr = new Array();
        if (columnType == "Text") {
            filterObj.FilterColumn = defaultfield;
            filterObj.FilterValue = defaultvalue;
        } else {
            var filterObj = Object();
            if (defaultfield != undefined) {
                filterObj.FilterColumn = defaultfield;
            }
            var filterConfigurations = getConfigValuesForDateFilter(gridStorage[0].CallType);
            filterObj.ColumnType = 'Date';
            filterObj.FilterDays = filterConfigurations.configValue;
            filterObj.FilterValue = moment(filterConfigurations.fromDate).format(defaultFilterDateFormat);
            filterObj.FilterValueOptional = moment().format(defaultFilterDateFormat);
            filterObj.IsFixedDateRange = true;
        }
        filterArr.push(filterObj);
        ColumnSortFilter.SortList = null;
        ColumnSortFilter.FilterList = filterArr;
        ColumnSortFilter.GridId = grididforfilter;
    } else {
        var datainfo12 = $("#" + gridId).jqxGrid('getdatainformation');
        var filterInfo = $("#" + gridId).jqxGrid('getfilterinformation');
        var sortInfo = $("#" + gridId).jqxGrid('getsortinformation');
        if (sortInfo && (sortInfo.sortcolumn == 'undefined' || sortInfo.sortcolumn == null)) {
            if (gridStorage[0].columnSortFilter != null) {
                if (gridStorage[0].columnSortFilter.SortList == null) {
                    ColumnSortFilter.SortList = null;
                } else {
                    ColumnSortFilter.SortList = gridStorage[0].columnSortFilter.SortList;
                }
            } else {
                ColumnSortFilter.SortList = null;
            }
        } else {
            if (sortInfo) {
                var SortList = new Array();
                var ColumnSort = new Object();
                ColumnSort.SortColumn = sortInfo.sortcolumn;
                if (sortInfo.sortdirection.ascending) {
                    ColumnSort.SortOrder = "ascending";
                } else {
                    ColumnSort.SortOrder = "descending";
                }
                SortList.push(ColumnSort);
            }
            ColumnSortFilter.SortList = sortInfo ? SortList : null;
        }

        if (filterInfo && filterInfo.length > 0) {
            var filterList = new Array();
            var columnFilter;
            for (k = 0; k < filterInfo.length; k++) {
                columnFilter = new Object();
                columnFilter.FilterValue = '';
                for (var m = 0; m < filterInfo[k].filter.getfilters().length; m++) {
                    var checkval = filterInfo[k].filter.getfilters()[m].value;
                    var source = _.where(checkval, {
                        ColumnType: 'Date'
                    });
                    if (source != '') {
                        columnFilter.ColumnType = source[0].ColumnType;
                        if ($.inArray(filterInfo[k].filtercolumn + gridId + 'day', fixeddayFilterArray) < 0) {
                            fixeddatechecKInternal = filterInfo[k].filtercolumn + gridId + 'Int';
                            columnFilter.FilterDays = 0;
                            fixeddayFilter = '';
                            columnFilter.IsFixedDateRange = true;
                        } else {
                            fixeddayFilter = filterInfo[k].filtercolumn + gridId + 'day';
                            columnFilter.FilterDays = source[0].FilterDays;
                            fixeddatechecKInternal = '';
                            columnFilter.IsFixedDateRange = false;
                        }

                        columnFilter.FilterValue = source[0].FilterValue;
                        columnFilter.FilterValueOptional = source[0].FilterValueOptional;

                    } else {
                        if (filterInfo[k].filter.getfilters()[m].type == "numericfilter") {
                            columnFilter.ColumnType = "Numeric"
                        }
                        columnFilter.FilterValue += filterInfo[k].filter.getfilters()[m].value + '^';

                    }
                }
                if (source == '') {
                    if (columnFilter.FilterValue.indexOf("ScheduleSent") >= 0 || columnFilter.FilterValue.indexOf("InProgress") >= 0) {
                        if (columnFilter.FilterValue.indexOf("InProgress") >= 0) {
                            columnFilter.FilterValue = columnFilter.FilterValue.substring(0, columnFilter.FilterValue.length - 1);
                            var str = columnFilter.FilterValue;
                            str += '^In Progress';
                            columnFilter.FilterValue = str;
                        }
                        if (columnFilter.FilterValue.indexOf("ScheduleSent") >= 0) {
                            var str = 'Schedule Sent^';
                            str += columnFilter.FilterValue;
                            columnFilter.FilterValue = str;
                        }
                    } else {
                        if (filterInfo[k].filter.getfilters()[0].type == "numericfilter") {
                            columnFilter.ColumnType = "Numeric"
                        }
                        columnFilter.FilterValue = columnFilter.FilterValue.substring(0, columnFilter.FilterValue.length - 1);
                    }
                }
                var custfiltercolumn = $("#" + gridId).jqxGrid('getcolumn', filterInfo[k].filtercolumn);
                columnFilter.FilterColumn = filterInfo[k].filtercolumn;
                if (columnFilter.FilterValue == '') { } else {

                    filterList.push(columnFilter);
                }
            }
            ColumnSortFilter.FilterList = filterList;
            if (pagechange != 1) {
                //gridStorage[0].checkAllFlag = 0;
                //gridStorage[0].selectedDataArr = [];
                //gridStorage[0].counter = 0;
                //checkhead = 0;
                //$("#" + gridId + "seleceteRowSpan").empty();
                //$("#" + gridId + "seleceteRowSpan").append(" " + 0);
                $("#columntable" + gridId).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                $(".panel-side-pop").hide();
            }
        } else {
            if (isPieChartFilter)
                return;

            ColumnSortFilter.FilterList = null;
            gridStorage[0].filterflage = 0;

            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        }
        ColumnSortFilter.GridId = "" + grididforfilter + "";
        gridStorage[0].columnSortFilter = ColumnSortFilter;
    }
    return ColumnSortFilter;
}

function getColumnSortFilterQuery(ColumnSortFilter, gridId, gridStorage) {
    var filterInfo = $("#" + gridId).jqxGrid('getfilterinformation');
    var sortInfo = $("#" + gridId).jqxGrid('getsortinformation');
    var columnSortFilterQuery = '';

    if (sortInfo && (sortInfo.sortcolumn == 'undefined' || sortInfo.sortcolumn == null)) {
        if (gridStorage[0].columnSortFilter != null) {
            ColumnSortFilter.ColumnSort = gridStorage[0].columnSortFilter.ColumnSort;
        } else {
            ColumnSortFilter.ColumnSort = null;
        }
    } else {
        if (sortInfo) {
            var ColumnSort = new Object();
            ColumnSort.ColumnName = sortInfo.sortcolumn;
            if (sortInfo.sortdirection && sortInfo.sortdirection.ascending) {
                ColumnSort.ColumnName = sortInfo.sortcolumn;
            } else {
                ColumnSort.ColumnName = "-" + sortInfo.sortcolumn;
            }
        }
        ColumnSortFilter.ColumnSort = ColumnSort;
        columnSortFilterQuery = "sort=" + ColumnSort.ColumnName;
    }

    if (filterInfo && filterInfo.length > 0) {
        var filterList = new Array();
        var columnFilter;
        for (k = 0; k < filterInfo.length; k++) {
            columnFilter = new Object();
            columnFilter.Value1 = '';
            for (var m = 0; m < filterInfo[k].filter.getfilters().length; m++) {
                var checkval = filterInfo[k].filter.getfilters()[m].value;

                var source = _.where(checkval, {
                    ColumnType: 'Date'
                });
                if (source != '') {
                    columnFilter.ColumnType = source[0].ColumnType;
                    if ($.inArray(filterInfo[k].filtercolumn + gridId + 'day', fixeddayFilterArray) < 0) {
                        fixeddatechecKInternal = filterInfo[k].filtercolumn + gridId + 'Int';
                        columnFilter.SkipIndex = 0;
                        fixeddayFilter = '';
                    } else {
                        fixeddayFilter = filterInfo[k].filtercolumn + gridId + 'day';
                        columnFilter.SkipIndex = source[0].FilterDays;
                        fixeddatechecKInternal = '';
                    }

                    var date1 = new Date(source[0].FilterValue);
                    var date2 = new Date(source[0].FilterValueOptional);
                    var value1 = dateTimeConversionDateFormat(date1.getFullYear(), date1.getMonth(), date1.getDate(), date1.getHours(), date1.getMinutes(), date1.getSeconds());
                    var value2 = dateTimeConversionDateFormat(date2.getFullYear(), date2.getMonth(), date2.getDate(), 23, 59, 59, 0);

                    value1 = convertLocalDateTimeToUTC(new Date(value1));
                    value2 = convertLocalDateTimeToUTC(new Date(value2));

                    columnFilter.Value1 = dateTimeConversionStringFormat(value1.getFullYear(), value1.getMonth(), value1.getDate(), value1.getHours(), value1.getMinutes(), value1.getSeconds());
                    columnFilter.Value2 = dateTimeConversionStringFormat(value2.getFullYear(), value2.getMonth(), value2.getDate(), value2.getHours(), value2.getMinutes(), value2.getSeconds());
                    columnFilter.ConditionValue = 'BeforeDays';

                } else {
                    if (filterInfo[k].filter.getfilters()[m].type == "numericfilter") {
                        columnFilter.ColumnType = "Numeric"
                    }
                    columnFilter.Value1 += checkval + '^';
                }
            }
            if (source == '') {
                if (columnFilter.Value1.indexOf("ScheduleSent") >= 0 || columnFilter.Value1.indexOf("InProgress") >= 0) {
                    if (columnFilter.Value1.indexOf("InProgress") >= 0) {
                        columnFilter.Value1 = columnFilter.Value1.substring(0, columnFilter.Value1.length - 1);
                        var str = columnFilter.Value1;
                        str += '^In Progress';
                        columnFilter.Value1 = str;
                    }
                    if (columnFilter.Value1.indexOf("ScheduleSent") >= 0) {
                        var str = 'Schedule Sent^';
                        str += columnFilter.Value1;
                        columnFilter.Value1 = str;
                    }
                } else {
                    if (filterInfo[k].filter.getfilters()[0].type == "numericfilter") {
                        columnFilter.ColumnType = "Numeric"
                    }
                    columnFilter.Value1 = columnFilter.Value1.substring(0, columnFilter.Value1.length - 1);
                }
            }
            var custfiltercolumn = $("#" + gridId).jqxGrid('getcolumn', filterInfo[k].filtercolumn);
            columnFilter.ColumnName = filterInfo[k].filtercolumn;
            if (columnFilter.Value1 == '') { } else {

                filterList.push(columnFilter);
            }

            //forming filter query string
            if (columnFilter.Value1 && columnFilter.Value2) {       //date column
                columnSortFilterQuery += (columnSortFilterQuery == '') ? (columnFilter.ColumnName + "=" + columnFilter.Value1 + "^" + columnFilter.Value2) : ("&" + columnFilter.ColumnName + "=" + columnFilter.Value1 + "^" + columnFilter.Value2);
            } else {                                                //text column  
                columnSortFilterQuery += (columnSortFilterQuery == '') ? (columnFilter.ColumnName + "=" + columnFilter.Value1) : ("&" + columnFilter.ColumnName + "=" + columnFilter.Value1);
            }
        }

        if (pagechange != 1) {
            $("#columntable" + gridId).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
            $(".panel-side-pop").hide();
        }
    }

    return columnSortFilterQuery;
}

function getPaginationObject(Pagination, gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    var pagerInfo = $("#" + gridId).jqxGrid('getpaginginformation');

    if (pagerInfo.pagenum && pagerInfo.pagesize != null) {
        Pagination.PageNumber = Number(pagerInfo.pagenum) + 1;
    } else {
        Pagination.PageNumber = 1;
    }
    if (pagechange == 1) {
        Pagination.HighLightedItemId = null;
    } else {
        if (gridStorage)
            Pagination.HighLightedItemId = gridStorage[0].highlightedRow;
        else
            Pagination.HighLightedItemId = null;
    }

    return Pagination;
}

function getPaginationObjectforschedule(Pagination, gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    var pagerInfo = $("#" + gridId).jqxGrid('getpaginginformation');
    schedulADApply = 1;
    Pagination.PageNumber = 1;

    if (pagechange == 1) {
        Pagination.HighLightedItemId = null;
    } else {
        Pagination.HighLightedItemId = gridStorage[0].highlightedRow;
    }

    return Pagination;
}

function Severityrenderer(row, columnfield, value, defaulthtml, columnproperties) {
    var html = '<div><span></span></div>';
    if (value == 0) {
        html = '<div style="padding-left:5px;padding-top:5px"><i class="icon-checkmark ienable" ></i><span  style="padding-left:6px;">Low</span></div>';
    } else if (value == 1) {
        html = '<div style="padding-left:5px;padding-top:5px"><i class="icon-checkmark iPanding" ></i><span style="padding-left:6px;">Medium</span></div>';
    } else if (value == 2) {
        html = '<div style="padding-left:5px;padding-top:5px"><i class="icon-checkmark idisabled" ></i><span style="padding-left:6px;">High</span></div>';
    } else if (value == 3) {
        html = '<div style="padding-left:5px;padding-top:5px"><span style="padding-left:6px;">All</span></div>';
    }
    return html;
}

function getGridStorage(gridId) {
    return JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
}

function setGridStorage(gridId) {
    var gridStorageArr = new Array();
    var gridStorageObj = new Object();
    gridStorageObj.checkAllFlag = 0;
    gridStorageObj.counter = 0;
    gridStorageObj.selectedDataArr = [];
    gridStorageObj.unSelectedDataArr = [];
    gridStorageObj.singlerowData = [];
    gridStorageArr.push(gridStorageObj);
    var gridStorage = JSON.stringify(gridStorageArr);
    window.sessionStorage.setItem(gridId + 'gridStorage', gridStorage);
}

function gridFilterClear(gId, adFlag) {

    if (gId == 'Devicejqxgrid') {
        $(".panel-side-pop").hide();
    } else if (gId == 'jqxgridDeletedDevices') {
        $(".panel-side-pop-deleted").hide();
    }
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

    $("#" + gId).jqxGrid("removesort");
    $("#" + gId).jqxGrid("clearfilters");

}

function gridRefresh(gId) {
    $("#" + gId).jqxGrid('updatebounddata');
}

function gridRefreshClearSelection(gId) {
    if (gId == 'Devicejqxgrid') {
        $(".panel-side-pop").hide();
    } else if (gId == 'jqxgridDeletedDevices') {
        $(".panel-side-pop-deleted").hide();
    }
    gridClearFlag = 1;
    $("#" + gId).jqxGrid('updatebounddata');
}

function checkAllSelected(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage && gridStorage[0].checkAllFlag == 1) {
        return 1;
    } else {
        return 0;
    }
}

function getSelectedData(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage != '') {

        return gridStorage[0].singlerowData;
    } else {
        return [];
    }
}

function getAllSelectedDataCount(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    return gridStorage[0].counter;
}

function getMultiSelectedData(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage) {
        return gridStorage[0].multiRowData;
    } else {
        return [];
    }
}

function clearMultiSelectedData(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage) {
        gridStorage[0].multiRowData = [];
        gridStorage[0].selectedDataArr = [];
        UIgridClearFlag = 1;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
    }
}

function getSelectedUniqueId(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage) {
        return gridStorage[0].selectedDataArr;
    } else {
        return [];
    }

}

function getUnSelectedUniqueId(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage) {
        return gridStorage[0].unSelectedDataArr;
    } else {
        return [];
    }
}

function getSelectedPackageId(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage) {
        return gridStorage[0].selectedDataArr;
    } else {
        return [];
    }

}

function getUnSelectedPackageId(gridId) {
    var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
    if (gridStorage) {
        return gridStorage[0].unSelectedDataArr;
    } else {
        return [];
    }
}

function getTotalRowcount(gridId) {
    var datainfo = $("#" + gridId).jqxGrid('getdatainformation');
    return datainfo.rowscount
}

function getDisablecheckFlag(boundindex, datafield, gId, conditionflag) {
    var check = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield);
    if (conditionflag == 1) {
        if (check == true || check == 'Deleted') {
            return 0;
        } else {
            return 1;
        }
    }
    if (conditionflag == 2) {
        if (check == 'Failed' || check == 'In Progress' || check == 'Schedule Sent') {
            return 0;
        } else {
            return 1;
        }
    }
}

function getDisablecheckFlagForDetails(boundindex, datafield1, datafield2, datafield3, datafield4, gId, conditionflag) {
    var datafield1 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield1);
    var datafield2 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield2);
    var datafield3 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield3);
    var datafield4 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield4);
    if (datafield1 == 'Failed' && datafield2 == false && datafield3 == false && datafield4 == AppConstants.get('VEM_PROTOCOL')) {
        return 0;
    } else {
        return 1;
    }
}

function getDisableFlagStatus(boundindex, datafield, gId, conditionflag, datafield1, datafield2, datafield3, datafield4, datafield5) {

    if (conditionflag == 0) {

        return 0;
    }
    if (conditionflag == 1) {
        var check = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield);

        if (check == true || check == 'Deleted') {

            return 0;
        } else {

            return 1;
        }
    }
    if (conditionflag == 2) {
        //if (check == 'Failed' || check == 'In Progress' || check == 'Schedule Sent') {
        var val1 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield1);			//Job Status
        var val2 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield2);			//IsAutoDownloadJob
        var val3 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield3);			//IsRescheduled
        var val4 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield4);			//Protocol
        var val5 = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield5);			//IsResheduleAllowed
        if (val1 == 'Failed' && val2 == false && val3 == false && val4 == AppConstants.get('VEM_PROTOCOL') && val5 == true) {
            return 0;
        } else {
            return 1;
        }
    }
    if (conditionflag == 3) {
        var datafield1val = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield1);
        var datafield2val = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield2);
        var datafield3val = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield3);
        if ((datafield1val == 'Download Failed' || datafield1val == 'Install Failed' || datafield1val == 'Failed') && datafield2val == false && datafield3val == false) {
            return 0;
        } else {
            return 1;
        }
    }
    if (conditionflag == 4) {
        var check = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield);
        if (check == '0') {

            return 0;
        } else {

            return 1;
        }
    }
    if (conditionflag == 5) {
        var checkSubStatusType = $("#" + gId).jqxGrid('getcellvalue', boundindex, datafield);
        if (checkSubStatusType == 'User') {
            return 0;
        } else {
            return 1;
        }
    }
    if (conditionflag == 6) {
        return 0;
    }
}

function enablegridfunctionsNew(gridId, unitIdField, element, gridStorage, checkboxflag, pagerId, conditionflag, statusField, datafield1, datafield2, datafield3, datafield4, zoneinfo) {
    $('.jqx-grid-pager').css("display", "inline");
    $('.jqx-grid-pager').css("z-index", "-1");
    var changePageflag = 0;
    checkhead = 0;
    $("#" + gridId).on("bindingcomplete", function () {

        $(" #gridmenu" + gridId + " ul li:first").css("display", "none")
        $(" #gridmenu" + gridId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenu" + gridId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenu" + gridId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenu" + gridId).css("background-color", "transparent");
        generateGenericPager(pagerId, gridId, checkboxflag, zoneinfo);
        if (gridClearFlag == 1) {
            gridStorage[0].checkAllFlag = 0;
            gridStorage[0].counter = 0;
            gridStorage[0].filterflage = 0;
            gridStorage[0].selectedDataArr = [];
            gridStorage[0].unSelectedDataArr = [];
            gridStorage[0].singlerowData = [];
            gridStorage[0].multiRowData = [];
            gridStorage[0].highlightedRow = null;
            gridStorage[0].highlightedPage = null;
            gridStorage[0].columnsArr = [];
            gridStorage[0].dataFields = [];
            $("#" + gridId).jqxGrid('clearselection');
        } else { }
        if (gridStorage[0].filterflage == 1) {
            $("#columntable" + gridId).children('div').children('div').children('div:first').children('div').css("display", "none");
        } else {
            var datainfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (gridStorage[0].TotalSelectionCount == 0) {
                $("#columntable" + gridId).children('div').children('div').children('div:first').children('div').css("display", "none");
            } else if (gridStorage[0].counter == datainfo.rowscount || gridStorage[0].counter == gridStorage[0].TotalSelectionCount) {
                $("#columntable" + gridId).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                $("#columntable" + gridId).children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
            } else if (gridStorage[0].counter == 0) {
                $("#columntable" + gridId).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
            } else {
                $("#columntable" + gridId).children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
            }
        }
        var rows = $("#" + gridId).jqxGrid('getrows');
        for (var i = 0; i < rows.length; i++) {
            var boundindex = $("#" + gridId).jqxGrid('getrowboundindexbyid', rows[i].uid);
            var DisablecheckFlag = '';
            if (conditionflag == 1) {
                DisablecheckFlag = getDisablecheckFlag(boundindex, statusField, gridId, conditionflag);
            }
            if (conditionflag == 2) {
                DisablecheckFlag = getDisablecheckFlagForDetails(boundindex, datafield1, datafield2, datafield3, datafield4, gridId, conditionflag);
            }

            if (DisablecheckFlag == 0) {
                var selectedid = rows[i][unitIdField];
                if (gridStorage[0].checkAllFlag == 0) {
                    if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {
                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
                    } else {
                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
                    }
                }
                if (gridStorage[0].checkAllFlag == 1) {
                    if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
                    } else {
                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
                    }
                }
            } else {
                $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
            }
        }
        $("#" + gridId + "seleceteRowSpan").empty();
        $("#" + gridId + "seleceteRowSpan").append(" " + gridStorage[0].counter);
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        gridClearFlag = 0;
    });
    $("#" + gridId).on('rowclick', function (event) {
        gridStorage[0].singlerowData = event.args.row.bounddata;
        var args = event.args;
        // row's bound index.
        var boundIndex = args.rowindex;
        // row's visible index.
        var visibleIndex = args.visibleindex;
        // right click.
        var rightclick = args.rightclick;
        // original event.
        var ev = args.originalEvent;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
    });

    $("#" + gridId).on('pagechanged', function (event) {
        changePageflag = 1;
        checkhead = 0;
    });
    getCheckRendereNew(element, gridId, gridStorage, conditionflag, statusField, datafield1, datafield2, datafield3, datafield4);
}

function getCheckRendereNew(element, gID, gridStorage, conditionflag, statusField, datafield1, datafield2, datafield3, datafield4) {
    var gridId = "#" + gID;
    $(element).jqxCheckBox({
        width: 22,
        height: 16,
        animationShowDelay: 0,
        animationHideDelay: 0
    });
    columnCheckBox = $(element);
    $(element).on('change', function (event) {
        var checked = event.args.checked;
        var pageinfo = $(gridId).jqxGrid('getpaginginformation');
        var pagenum = pageinfo.pagenum;
        var pagesize = pageinfo.pagesize;
        if (checked == null) return;
        $(gridId).jqxGrid('beginupdate');
        var datainfo = $(gridId).jqxGrid('getdatainformation');
        if (checked) {
            gridStorage[0].checkAllFlag = 1;
            gridStorage[0].unSelectedDataArr = [];
            if (gridStorage[0].TotalSelectionCount != null) {
                gridStorage[0].counter = gridStorage[0].TotalSelectionCount;
            } else {
                gridStorage[0].counter = datainfo.rowscount;
            }
            checkhead = 0;
            $(gridId + "seleceteRowSpan").empty();
            $(gridId + "seleceteRowSpan").append(" " + gridStorage[0].counter);
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').html()
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
        } else if (checked == false) {
            gridStorage[0].checkAllFlag = 0;
            gridStorage[0].selectedDataArr = [];
            gridStorage[0].counter = 0;
            checkhead = 0;
            $(gridId + "seleceteRowSpan").empty();
            $(gridId + "seleceteRowSpan").append(" " + 0);
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
        }
        var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
        selectedRows = $(gridId).jqxGrid('getselectedrowindexes');
        for (var i = startrow; i < startrow + pagesize; i++) {
            var boundindex = $(gridId).jqxGrid('getrowboundindex', i);
            if (conditionflag == 1) {
                var DisablecheckFlag = getDisablecheckFlag(boundindex, statusField, gID, conditionflag);
            }
            if (conditionflag == 2) {
                var DisablecheckFlag = getDisablecheckFlagForDetails(boundindex, datafield1, datafield2, datafield3, datafield4, gID, conditionflag);
            }
            if (DisablecheckFlag == 1) {
                $(gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', false);
            } else {
                $(gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', event.args.checked);
            }
        }

        $(gridId).jqxGrid('endupdate');
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
    });

}

function getGridBiginEdit(gID, unitIdField, gridStorage, deviceSearchCheck, isGlobalOperationAllowed) {

    $("#" + gID).on('cellbeginedit', function (event) {

        isGridChange = true;

        //if (gID == 'Devicejqxgrid') {
        //    $(".panel-side-pop").show();
        //    $(this).parent().parent().addClass("list-selected");
        //};
        var args = event.args;
        var datainfo = $("#" + gID).jqxGrid('getdatainformation');
        var selectedid = $("#" + gID).jqxGrid('getcellvalue', args.rowindex, unitIdField);
        var selectData = $("#" + gID).jqxGrid('getrowdata', args.rowindex);
        if (args.value == false) {

            if (gridStorage[0].counter != datainfo.rowscount || gridStorage[0].counter != gridStorage[0].TotalSelectionCount) {
                if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {
                    gridStorage[0].selectedDataArr.push(selectedid);
                    gridStorage[0].multiRowData.push(selectData);
                }
                gridStorage[0].unSelectedDataArr = jQuery.grep(gridStorage[0].unSelectedDataArr, function (value) {
                    return (value != selectedid && value != null);
                });
                gridStorage[0].counter = gridStorage[0].counter + 1;
            }
        } else {

            if (gridStorage[0].counter != 0) {
                if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                    gridStorage[0].unSelectedDataArr.push(selectedid);
                }
                gridStorage[0].selectedDataArr = jQuery.grep(gridStorage[0].selectedDataArr, function (value) {
                    return (value != selectedid && value != null);
                });

                var obj = new Object();
                obj[unitIdField] = selectedid;
                var sourceData = _.where(gridStorage[0].multiRowData, obj);

                if (sourceData != '') {
                    gridStorage[0].multiRowData = jQuery.grep(gridStorage[0].multiRowData, function (value) {
                        var l = gridStorage[0].multiRowData.indexOf(sourceData[0]);
                        return (value != gridStorage[0].multiRowData[l] && value != null);
                    });
                }

                gridStorage[0].counter = gridStorage[0].counter - 1;

            }
        }
        if (gridStorage[0].selectedDataArr.length >= 1) {
            $(".panel-side-pop-deleted").show();
        } else {
            $(".panel-side-pop-deleted").hide();
        }

        if (deviceSearchCheck != undefined) {
            if (isGlobalOperationAllowed || (!isGlobalOperationAllowed && gridStorage[0].selectedDataArr.length == 1) || (gridStorage[0].selectedDataArr.length == 0)) {
                $(".panel-side-pop").show();
                $(".panel-side-pop-deleted").show();
            } else {
                $(".panel-side-pop").hide();
                $(".panel-side-pop-deleted").hide();
            }
        }


        if ($("#copyTemplateSave").attr('id') == undefined) {

        } else {
            $('#copyTemplateSave').removeAttr('disabled');
            if (gridStorage[0].counter == 0) {
                $('#copyTemplateSave').attr('disabled', true);
            }
        }
        if (gridStorage[0].counter == datainfo.rowscount || gridStorage[0].counter == gridStorage[0].TotalSelectionCount) {
            if (gridStorage[0].checkAllFlag == 1) {
                $("#modifyCheckBox").attr('checked', true);
                // $("#viewCheckbox").attr('checked', true);
                $("#deleteCheckbox").attr('checked', true);
                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
            } else {
                //if (gridStorage[0].counter == datainfo.rowscount) {
                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
                //}
            }
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-indeterminate');
        } else if (gridStorage[0].counter == 0) {
            if ($("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').hasClass('jqx-checkbox-check-checked')) {
                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                //$("#" + gID).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
                // $("#viewCheckbox").attr('checked', false);
                $("#modifyCheckBox").attr('checked', false);
            }
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-indeterminate');
            //    $("#viewCheckbox").attr('checked', false);
            $("#modifyCheckBox").attr('checked', false);
            $("#deleteCheckbox").attr('checked', false);
            //$("#" + gID).find('.jqx-grid-column-header:first').find('span').removeClass('partial-selection');
            if (deviceSearchCheck != undefined) {
                $(".panel-side-pop").hide();
            }
        } else {
            // $("#viewCheckbox").attr('checked', false);
            $("#modifyCheckBox").attr('checked', false);
            $("#deleteCheckbox").attr('checked', false);
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-fill-state-normal')
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-indeterminate');
            //$("#" + gID).find('.jqx-grid-column-header:first').find('span').addClass('partial-selection');
        }
        $("#" + gID + "seleceteRowSpan").empty();
        $("#" + gID + "seleceteRowSpan").append(" " + gridStorage[0].counter);
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
    });
}

function enablegridfunctions(gridId, unitIdField, element, gridStorage, checkboxflag, pagerId, zoneinfo, conditionflag, statusField, datafield1, datafield2, datafield3, datafield4, deviceSearchCheck, isGlobalOperationAllowed, datafield5) {
    $('.jqx-grid-pager').css("display", "inline");
    $('.jqx-grid-pager').css("z-index", "-1");
    var changePageflag = 0;
    checkhead = 0;
    pagechange = 0;

    $("#" + gridId).unbind("bindingcomplete").on("bindingcomplete", function () {
        //alert('bindingcomplete call');
        //$("#" + gridId).jqxGrid('setcolumnproperty', 'PackageName', 'minwidth', 50);
        //$("#" + gridId).jqxGrid('setcolumnproperty', 'PackageName', 'width', 50);

        initopenfilter = 0;
        $(" #gridmenu" + gridId + " ul li:first").css("display", "none")
        $(" #gridmenu" + gridId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenu" + gridId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenu" + gridId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenu" + gridId).css("background-color", "transparent");
        generateGenericPager(pagerId, gridId, checkboxflag, zoneinfo);
        if (gridClearFlag == 1) {
            gridStorage[0].checkAllFlag = 0;
            gridStorage[0].counter = 0;
            gridStorage[0].filterflage = 0;
            gridStorage[0].selectedDataArr = [];
            gridStorage[0].unSelectedDataArr = [];
            gridStorage[0].singlerowData = [];
            gridStorage[0].multiRowData = [];
            gridStorage[0].columnsArr = [];
            gridStorage[0].highlightedRow = null;
            gridStorage[0].highlightedPage = null;
            gridStorage[0].state = null;
            gridStorage[0].columnSortFilter = null;
            gridStorage[0].dataFields = [];
            $("#" + gridId).jqxGrid('clearselection');
        } else {
            var gridStorageId = gridId;
            if (gridId == 'jqxgridForSelectedDevicesdiagnostics' || gridId == 'jqxgridForSelectedDevicesmanageContents' || gridId == 'jqxgridForSelectedDevicesdownloads') {
                gridStorageId = 'jqxgridForSelectedDevices';
            }

            var gridStorageUpdated = JSON.parse(sessionStorage.getItem(gridStorageId + "gridStorage"));
            if (gridStorageUpdated && gridStorageUpdated.length > 0 && !_.isEmpty(gridStorageUpdated[0].resizedColumns)) {
                gridStorage[0].resizedColumns = gridStorageUpdated[0].resizedColumns;
            }
        }

        var datainfo = $("#" + gridId).jqxGrid('getdatainformation');

        var rows = $("#" + gridId).jqxGrid('getrows');
        var selectedCount = 0;
        if (gridStorage[0].TotalSelectionCount != null) {
            selectedCount = gridStorage[0].TotalSelectionCount;
        } else {
            selectedCount = datainfo.rowscount;
        }

        if (gridStorage[0].filterflage == 1) {
            if (checkboxflag == false) {
                $("#columntable" + gridId).children('div').children('div').children('div:first').css("display", "none");
            } else {
                if (gridStorage[0].checkAllFlag == 1) {
                    //if no unselection, retain count on page change
                    //if unselection, don't update the counter on page change
                    if (_.isEmpty(gridStorage[0].unSelectedDataArr) || gridStorage[0].unSelectedDataArr.length === 0) {
                        gridStorage[0].counter = selectedCount;
                    }
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('.jqx-checkbox').jqxCheckBox({ checked: true });
                } else {
                    if (gridStorage[0].counter > 0) {
                        if (datainfo.rowscount == gridStorage[0].counter)
                            $("#" + gridId).find('.jqx-grid-column-header:first').find('.jqx-checkbox').jqxCheckBox({ checked: true });
                        else
                            $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-indeterminate');
                    }
                }
                if (datainfo.rowscount <= 0 || gridStorage[0].TotalSelectionCount == 0) {
                    if (checkboxflag) {
                        $("#" + gridId).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
                        $("#" + gridId).find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
                        $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-fill-state-normal');
                    }
                }
            }
        } else {
            if (datainfo.rowscount <= 0 || gridStorage[0].TotalSelectionCount == 0) {
                if (checkboxflag == false) {
                    $("#columntable" + gridId).children('div').children('div').children('div:first').css("display", "none");
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-fill-state-normal');
                } else {
                    $("#" + gridId).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
                    $("#" + gridId).find('.jqx-grid-column-header:first').append('<div style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
                }
            }
            if (gridStorage[0].counter == datainfo.rowscount) {
                if (gridStorage[0].checkAllFlag == 1) {
                    //if no unselection, retain count on page change
                    //if unselection, don't update the counter
                    if (_.isEmpty(gridStorage[0].unSelectedDataArr) || gridStorage[0].unSelectedDataArr.length === 0) {
                        gridStorage[0].counter = selectedCount;
                    }
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
                } else {
                    if ($("#" + gridId).find('.jqx-grid-column-header:first').find('span').hasClass('jqx-checkbox-check-checked')) {
                        $("#" + gridId).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
                    }
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-fill-state-normal');
                }
            } else if (gridStorage[0].counter == gridStorage[0].TotalSelectionCount) {
                if (gridStorage[0].TotalSelectionCount == 0) {
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-fill-state-normal');
                } else {
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
                }
            } else if (gridStorage[0].counter == 0) {
                if ($("#" + gridId).find('.jqx-grid-column-header:first').find('span').hasClass('jqx-checkbox-check-checked')) {
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
                }
                if ($("#" + gridId).find('.jqx-grid-column-header:first').find('span').hasClass('jqx-checkbox-check-indeterminate')) {
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-indeterminate');
                }
                $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-fill-state-normal');
            } else {
                $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-indeterminate');
            }
        }

        var isUnSelected = false;
        for (var i = 0; i < rows.length; i++) {
            var boundindex = $("#" + gridId).jqxGrid('getrowboundindexbyid', rows[i].uid);
            var DisablecheckFlag = getDisableFlagStatus(boundindex, statusField, gridId, conditionflag, datafield1, datafield2, datafield3, datafield4, datafield5);
            var selectedid = rows[i][unitIdField];
            if (DisablecheckFlag == 0) {
                var selectData = $("#" + gridId).jqxGrid('getrowdata', boundindex);
                if (gridStorage[0].checkAllFlag == 0) {
                    if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {

                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
                    } else {

                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 1);

                        if (gridId == 'Devicejqxgrid') {
                            $(".panel-side-pop").show();
                        }
                        if (gridId == 'jqxgridDeletedDevices') {
                            $(".panel-side-pop-deleted").show();
                        }
                    }
                }
                if (gridStorage[0].checkAllFlag == 1) {
                    if (gridId == 'Devicejqxgrid') {
                        $(".panel-side-pop").show();
                    }
                    if (gridId == 'jqxgridDeletedDevices') {
                        $(".panel-side-pop-deleted").show();
                    }
                    if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
                        if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {
                            gridStorage[0].selectedDataArr.push(selectedid);
                            gridStorage[0].multiRowData.push(selectData);
                        }
                        gridStorage[0].unSelectedDataArr = jQuery.grep(gridStorage[0].unSelectedDataArr, function (value) {
                            return (value != selectedid && value != null);
                        });
                    } else {
                        $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
                        isUnSelected = true;
                        selectedCount--;
                        if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                            gridStorage[0].unSelectedDataArr.push(selectedid);
                        }
                        gridStorage[0].selectedDataArr = jQuery.grep(gridStorage[0].selectedDataArr, function (value) {
                            return (value != selectedid && value != null);;
                        });
                        gridStorage[0].multiRowData = jQuery.grep(gridStorage[0].multiRowData, function (value) {
                            return (value != gridStorage[0].multiRowData[i] && value != null);
                        });
                    }
                }
            } else {
                $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
            }

            if (gridStorage[0].highlightedRow == selectedid) {
                $("#" + gridId).jqxGrid('clearselection');
                $("#" + gridId).jqxGrid('selectrow', boundindex);
            }
        }

        if (isUnSelected) {     //if unselection, update the counter            
            gridStorage[0].counter = selectedCount;
            if ($("#" + gridId).find('.jqx-grid-column-header:first').find('span').hasClass('jqx-checkbox-check-checked')) {
                $("#" + gridId).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
            }
            $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-indeterminate');
        } else if (gridStorage[0].checkAllFlag === 1 && (!_.isEmpty(gridStorage[0].unSelectedDataArr) || gridStorage[0].unSelectedDataArr.length > 0)) {    //if no unselection, retain count; //if unselection, don't update the counter
            gridStorage[0].counter = datainfo.rowscount;
        }

        $("#" + gridId + "seleceteRowSpan").empty();
        $("#" + gridId + "seleceteRowSpan").append(" " + gridStorage[0].counter);
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        gridClearFlag = 0;
        if (gridStorage[0].highlightedPage > 0) {
            if (isHighlightedPage == 0) {
                isHighlightedPage = 1;
                if (datainfo.sortinformation.sortcolumn != undefined && datainfo.sortinformation.sortcolumn != null && datainfo.sortinformation.sortcolumn != '') {
                    $("#" + gridId).jqxGrid('gotopage', (gridStorage[0].highlightedPage - 1));
                }
            }
        }

        $("#" + gridId).jqxGrid('refresh');

        if (gridStorage[0].isGridReady == 1) {
            gridStorage[0].isgridState = $("#" + gridId).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
            //gridStorage[0].isgridState.columns.sort(function (a, b) { return a.text > b.text ? 1 : -1; });

            //var cols = $("#" + gridId).jqxGrid("columns");
            //visiblecolumnCountArr = [];

            //if (cols.records != null) {
            //    for (var i = 0; i < cols.records.length; i++) {

            //        //alert('cols.records[i].hidden  ' + cols.records[i].hidden);
            //        if (cols.records[i].hidden == true) {
            //            //alert('hidecolumn  '+cols.records[i].text);
            //        } else {
            //            var obj = new Object();
            //            obj.datafield = cols.records[i].datafield;
            //            visiblecolumnCountArr.push(obj);
            //            //alert('visiblecolumn  ' + cols.records[i].text);
            //        }
            //        //if (i == cols.records.length-1) {
            //        //    //alert(cols.records[i].text);
            //        //}
            //    }
            //}

            //if (visiblecolumnCountArr != null && visiblecolumnCountArr != '' && visiblecolumnCountArr != undefined) {
            //    for (var v = 0; v < visiblecolumnCountArr.length; v++) {
            //        if (v == visiblecolumnCountArr.length - 1) {
            //            //alert('visiblecolumnCountArr[i]  ' + JSON.stringify(visiblecolumnCountArr[v]));
            //            $("#" + gridId).jqxGrid('setcolumnproperty', visiblecolumnCountArr[v].datafield, 'resizable', false);
            //            $("#" + gridId).jqxGrid('setcolumnproperty', visiblecolumnCountArr[v].datafield, 'width', 'auto');
            //        } else {
            //            $("#" + gridId).jqxGrid('setcolumnproperty', visiblecolumnCountArr[v].datafield, 'resizable', true);
            //        }
            //    }
            //}
        }

        $('.jqx-grid-cleared-cell').css("visibility", "visible !important");
        $('.jqx-grid-cleared-cell').css("display", "block");

        //$("#" + gridId).jqxGrid("addrow", null, {});

    });

    $("#" + gridId).on('rowclick', function (event) {
        //alert('call' +gridId);

        gridStorage[0].singlerowData = event.args.row.bounddata;
        var args = event.args;
        var boundIndex = args.rowindex;
        var visibleIndex = args.visibleindex;
        var rightclick = args.rightclick;
        var ev = args.originalEvent;
        //gridStorage[0].highlightedRow = gridStorage[0].singlerowData[unitIdField];
        //gridStorage[0].isgridState = $("#" + gridId).jqxGrid('savestate');
        //var updatedGridStorage = JSON.stringify(gridStorage);
        //window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
    });

    $("#" + gridId).on("celldoubleclick", function (event) {

        isHighlightedPage = 1;
        var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
        if (gridStorage) {
            gridStorage[0].highlightedRow = null;
            gridStorage[0].highlightedPage = 0;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        }

        if (gridId === "jqxgridAlertsOpen" || gridId === "jqxgridAlertHistory" || gridId === "jqxgridDownloadlib" ||
            gridId === "jqxgridVRKBundlesLib" || gridId === "jqxgridReferenceSet" || gridId === "jqxgridApplications" ||
            gridId === "jqxgridHierarchyAssignment" || gridId === "jqxgridDeviceReferenceAssignment" || gridId === "jqxgridImport" ||
            gridId === "jqxgridExport" || gridId === "jqxgridDeviceSubStatus" || gridId === "templateGrid" ||
            gridId === "jqxgridAuditReport" || gridId === "jqxgridContentlib" || gridId === "jqxgridGroupEstablishment" ||
            gridId === "jqxgridUsers" || gridId === "jqxgridRoles" || gridId === "jqxgridForSelectedDevices" || gridId === "ReferenceSetGrid" ||
            gridId === "jqxGridSubscriptionList" || gridId === "jqxGridMySubscriptionList" || gridId === "jqxgridSwapHistory" || gridId === "jqxgridPeripheralDeviceDetails" ||
            gridId === "jqxgridRelocationHistory" || gridId === "jqxgridCommunicationHistory" || gridId === "jqxgridDeviceContact" || gridId == "jqxgridDownloadJobProfil" ||
            gridId === "jqxgridDetailedDownloadProfile" || gridId === "jqxGridvrkDownloadJobForDeviceProfile" || gridId === "jqxgridVRKDownloadDetailsForDeviceProfile" ||
            gridId === "jqxgridAlertsOpenProfile" || gridId === "jqxgridChangeHistory" || gridId === "jqxgridActionJobProfile" || gridId === "jqxgridDetailedActionProfile" ||
            gridId === "jqxgridContentJobStatusProfile" || gridId === "detailContentGridProfile" || gridId === "jqxgridDockingHistory" || gridId === "paramTemplateByVersionGrid" ||
            gridId === "jqxgridSecurityGroups" || gridId === "jqxgridMerchant" || gridId === "jqxgridMerchantUsers" || gridId === "jqxgridTags" || gridId === "jqxgridSponsors" ||
            gridId === "blankTroubleShootGrid" || gridId === "jqxgridTroubleShoot" || gridId === "jqxgridParameterAuditHistory" || gridId === "jqxgridParentReferenceSets" || "jqxGridTaskStatusDetails") {
            return;
        } else {
            var isDevicesAllowed = userHasViewAccess("Devices");
            if (isDevicesAllowed) {
                var args = event.args;
                var row = args.rowindex;
                var datarow = $("#" + gridId).jqxGrid('getrowdata', row);
                gotoDeviceProfile(datarow.UniqueDeviceId);
            } else {
                openAlertpopup(1, 'user_does_not_have_privilege');
            }
        }
    });

    $("#" + gridId).on('pagechanged', function (event) {

        changePageflag = 1;
        gridStorage[0].highlightedPage = null
        pagechange = 0;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        checkhead = 0;
    });
    getCheckRendere(element, gridId, unitIdField, gridStorage, conditionflag, statusField, datafield1, datafield2, datafield3, datafield4, deviceSearchCheck, isGlobalOperationAllowed, datafield5);

    $("#" + gridId).on("columnreordered", function (event) {
        var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
        if (!_.isEmpty(gridStorage) && gridStorage.length > 0) {
            gridStorage[0].isColumnReordered = true;
            gridStorage[0].isgridState = $("#" + gridId).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        }
    });

    $("#" + gridId).on('columnresized', function (event) {
        var column = event.args.datafield;
        var newwidth = event.args.newwidth
        var oldwidth = event.args.oldwidth;

        var updatedColumn = new Object();
        updatedColumn.column = column;
        updatedColumn.width = newwidth;

        var gridStorage = JSON.parse(sessionStorage.getItem(gridId + "gridStorage"));
        if (!_.isEmpty(gridStorage) && gridStorage.length > 0 && gridStorage[0].resizedColumns) {
            var sourceColumn = _.where(gridStorage[0].resizedColumns, {
                column: column
            });

            if (sourceColumn && sourceColumn.length > 0) {
                var index = gridStorage[0].resizedColumns.indexOf(sourceColumn[0]);
                gridStorage[0].resizedColumns[index].width = newwidth;
            } else {
                gridStorage[0].resizedColumns.push(updatedColumn);
            }
        }

        if (!_.isEmpty(gridStorage) && gridStorage.length > 0) {
            gridStorage[0].isgridState = $("#" + gridId).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        }
    });
}

function getCheckRendere(element, gID, unitIdField, gridStorage, conditionflag, statusField, datafield1, datafield2, datafield3, datafield4, deviceSearchCheck, isGlobalOperationAllowed, datafield5) {
    var gridId = "#" + gID;
    $(element).jqxCheckBox({
        width: 22,
        height: 16,
        animationShowDelay: 0,
        animationHideDelay: 0
    });
    columnCheckBox = $(element);
    $(element).on('change', function (event) {
        var checked = event.args.checked;
        var pageinfo = $(gridId).jqxGrid('getpaginginformation');
        var totalPagesCount = pageinfo.pagescount;
        var pagenum = pageinfo.pagenum;
        var pagesize = pageinfo.pagesize;
        if (checked == null) return;
        $(gridId).jqxGrid('beginupdate');
        var datainfo = $(gridId).jqxGrid('getdatainformation');
        if (checked) {
            if (deviceSearchCheck != undefined) {
                if (isGlobalOperationAllowed) {
                    $(".panel-side-pop").show();
                    $(".panel-side-pop-deleted").show();
                } else {
                    $(".panel-side-pop").hide();
                    $(".panel-side-pop-deleted").hide();
                }
            }
            gridStorage[0].checkAllFlag = 1;
            gridStorage[0].unSelectedDataArr = [];
            if (gridStorage[0].TotalSelectionCount != null) {
                gridStorage[0].counter = gridStorage[0].TotalSelectionCount;
            } else {
                if (gridId === "#jqxgridHierarchyAssignment") {
                    var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
                    var totalSelectedCount = 0;
                    if (totalPagesCount - pagenum === 1) {
                        totalSelectedCount = datainfo.rowscount - startrow;
                    } else {
                        totalSelectedCount = pagesize;
                    }
                    gridStorage[0].counter = totalSelectedCount;
                } else {
                    gridStorage[0].counter = datainfo.rowscount;
                }
            }
            checkhead = 0;
            $(gridId + "seleceteRowSpan").empty();
            $(gridId + "seleceteRowSpan").append(" " + gridStorage[0].counter);
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').html()
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-indeterminate');
        } else if (checked == false) {
            $(".panel-side-pop-deleted").hide();
            gridStorage[0].checkAllFlag = 0;
            gridStorage[0].selectedDataArr = [];
            gridStorage[0].multiRowData = [];
            gridStorage[0].counter = 0;
            checkhead = 0;
            $(gridId + "seleceteRowSpan").empty();
            $(gridId + "seleceteRowSpan").append(" " + 0);
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-indeterminate');
            if (deviceSearchCheck != undefined) {
                $(".panel-side-pop").hide();
            }
        }


        //if (deviceSearchCheck != undefined) {
        //    if (isGlobalOperationAllowed || (!isGlobalOperationAllowed && gridStorage[0].selectedDataArr.length == 1) || (checked && gridStorage[0].selectedDataArr.length == 0))
        //        if (checked) $(".panel-side-pop").show();
        //        else
        //            $(".panel-side-pop").hide();
        //    }

        var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
        selectedRows = $(gridId).jqxGrid('getselectedrowindexes');
        gridStorage[0].selectedDataArr = [];
        for (var i = startrow; i < startrow + pagesize; i++) {

            var boundindex = $(gridId).jqxGrid('getrowboundindex', i);
            var DisablecheckFlag = getDisableFlagStatus(boundindex, statusField, gID, conditionflag, datafield1, datafield2, datafield3, datafield4, datafield5);
            var selectedid = $(gridId).jqxGrid('getcellvalue', boundindex, unitIdField);
            var selectData = $(gridId).jqxGrid('getrowdata', boundindex);
            if (DisablecheckFlag == 1) {
                $(gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', false);
            } else {
                $(gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', event.args.checked);
                if (checked == false) {
                    if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                        gridStorage[0].unSelectedDataArr.push(selectedid);
                    }
                    gridStorage[0].selectedDataArr = jQuery.grep(gridStorage[0].selectedDataArr, function (value) {
                        return (value != selectedid && value != null);
                    });
                    gridStorage[0].multiRowData = jQuery.grep(gridStorage[0].multiRowData, function (value) {
                        return (value != gridStorage[0].multiRowData[i] && value != null);
                    });

                } else {

                    if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0 && selectedid != null) {
                        gridStorage[0].selectedDataArr.push(selectedid);
                        gridStorage[0].multiRowData.push(selectData);

                    }
                    gridStorage[0].unSelectedDataArr = jQuery.grep(gridStorage[0].unSelectedDataArr, function (value) {
                        return (value != selectedid && value != null);
                    });
                }
            }

        }
        $(gridId).jqxGrid('endupdate');
        $(gridId).jqxGrid('refresh');
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
        $("#contenttable" + gID).addClass('overflowtest');


    });


}

function getCheckRendereNew(element, gID, unitIdField, gridStorage, conditionflag, statusField, datafield1, datafield2, datafield3, datafield4) {
    var gridId = "#" + gID;

    $(element).jqxCheckBox({
        width: 16,
        height: 16,
        animationShowDelay: 0,
        animationHideDelay: 0,
        checked: checkState
    });
    columnCheckBox = $(element);

    $(element).on('change', function (event) {

        var checked = event.args.checked;
        var pageinfo = $(gridId).jqxGrid('getpaginginformation');
        var pagenum = pageinfo.pagenum;
        var pagesize = pageinfo.pagesize;
        if (checked == null || updatingCheckState) return;
        $(gridId).jqxGrid('beginupdate');
        var datainfo = $(gridId).jqxGrid('getdatainformation');
        if (checked) {
            gridStorage[0].checkAllFlag = 1;
            gridStorage[0].unSelectedDataArr = [];
            if (gridStorage[0].TotalSelectionCount != null) {
                gridStorage[0].counter = gridStorage[0].TotalSelectionCount;
            } else {
                gridStorage[0].counter = datainfo.rowscount;
            }
            checkhead = 0;
            $(gridId + "seleceteRowSpan").empty();
            $(gridId + "seleceteRowSpan").append(" " + gridStorage[0].counter);
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').html()
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');

        } else if (checked == false) {
            gridStorage[0].checkAllFlag = 0;
            gridStorage[0].selectedDataArr = [];
            gridStorage[0].counter = 0;
            checkhead = 0;
            $(gridId + "seleceteRowSpan").empty();
            $(gridId + "seleceteRowSpan").append(" " + 0);
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');

        }

        var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
        selectedRows = $(gridId).jqxGrid('getselectedrowindexes');
        for (var i = startrow; i < startrow + pagesize; i++) {

            var boundindex = $(gridId).jqxGrid('getrowboundindex', i);
            //getDisableFlagStatus(boundindex, statusField, gID, conditionflag, datafield1, datafield2, datafield3);
            var DisablecheckFlag = getDisableFlagStatus(boundindex, statusField, gID, conditionflag, datafield1, datafield2, datafield3, datafield4);

            var selectedid = $(gridId).jqxGrid('getcellvalue', boundindex, unitIdField);
            var selectData = $(gridId).jqxGrid('getrowdata', boundindex);

            if (DisablecheckFlag == 1) {
                $(gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', false);
            } else {
                $(gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', event.args.checked);
                if (checked == false) {
                    if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                        gridStorage[0].unSelectedDataArr.push(selectedid);
                    }
                    gridStorage[0].selectedDataArr = jQuery.grep(gridStorage[0].selectedDataArr, function (value) {
                        return (value != selectedid && value != null);
                    });
                    gridStorage[0].multiRowData = jQuery.grep(gridStorage[0].multiRowData, function (value) {
                        return (value != gridStorage[0].multiRowData[i] && value != null);
                    });

                } else {
                    if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {
                        gridStorage[0].selectedDataArr.push(selectedid);
                        gridStorage[0].multiRowData.push(selectData);
                    }
                    gridStorage[0].unSelectedDataArr = jQuery.grep(gridStorage[0].unSelectedDataArr, function (value) {
                        return (value != selectedid && value != null);
                    });
                }
            }

        }
        $(gridId).jqxGrid('endupdate');
        $(gridId).jqxGrid('render');

        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
        $("#contenttable" + gID).addClass('overflowtest');


    });


}

function callGridFilter(gId, gridStorage) {
    $("#" + gId).on('filter', function (event) {
        var gridStorageUpdated = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
        if (gridStorageUpdated && gridStorageUpdated.length > 0 && !_.isEmpty(gridStorageUpdated[0].resizedColumns)) {
            gridStorage[0].resizedColumns = gridStorageUpdated[0].resizedColumns;
        }

        isHighlightedPage = 0;
        gridStorage[0].filterflage = 1
        $("#" + gId).jqxGrid('updatebounddata');
    });
}

function callGridSort(gId, gridStorage, unitIdField) {
    $("#" + gId).on('sort', function (event) {
        isHighlightedPage = 0;
        var gridStorageUpdated = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
        if (gridStorageUpdated && gridStorageUpdated.length > 0 && !_.isEmpty(gridStorageUpdated[0].resizedColumns)) {
            gridStorage[0].resizedColumns = gridStorageUpdated[0].resizedColumns;
        }

        //var selectedRow = getSelectedData(gId);
        //if (selectedRow != '') {
        //    gridStorage[0].highlightedRow = selectedRow[unitIdField];
        //} 
        //var updatedGridStorage = JSON.stringify(gridStorage);
        //window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
        if (gridClearFlag != 1) {

            $("#" + gId).jqxGrid('updatebounddata');
        } else {
            gridStorage[0].highlightedRow = null;
            // $("#" + gId).jqxGrid('updatebounddata');
        }
    });
}

function genericBuildFilterPanelold(filterPanel, datafield, dataAdapter, gId) {
    try {
        console.log("Method-genericBuildFilterPanelold started" + "grid-" + gId);
        var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
        var storedFilterVal = '';
        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                storedFilterVal = filterInfo[i].filter.getfilters()[0].value;
            }
        }
        var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
        var strinput = '';
        strinput += '<div class="grid-pop" style="width:194px;height: 51px;">';
        strinput += '<div class="con-area">';
        strinput += ' <div class="form-group mb0">';
        strinput += ' <input id="' + gId + datafield + 'txtFilter" title="wildcard (%,*,?,_) can be used to match any sequence of chars or single char." type="email" value="' + storedFilterVal + '" class="form-control">'; //placeholder = "Test"
        strinput += ' </div>';
        strinput += ' </div>';
        //strinput += ' <div class="btn-footer">';
        //strinput += ' <span id="' + gId + datafield + 'btnStrClear" disabled=true  class="btn btn-default">' + i18n.t('reset', { lng: lang }) + '</span>';
        //strinput += ' <span  id="' + gId + datafield + 'btnStrFilter"  class="btn btn-primary">' + i18n.t('go', { lng: lang }) + '</span>';
        //strinput += ' </div>';
        strinput += ' </div>';
        inputdiv.append(strinput);
        filterPanel.append(inputdiv);
        if (filterInfo.length > 0) {
            $("#" + gId + datafield + "btnStrClear").attr('disabled', false);
        }
        var dataSource = {
            localdata: dataAdapter.records,
            async: false
        }
        var dataadapter = new $.jqx.dataAdapter(dataSource, {
            autoBind: false,
            autoSort: true,
            async: false,
            uniqueDataFields: [datafield]
        });
        var column = $("#" + gId).jqxGrid('getcolumn', datafield);

        $("#" + gId + datafield + "txtFilter").keypress(function (e) {
            if (e.keyCode == 13) {
                var checkvalue = $("#" + gId + datafield + "txtFilter").val().trim();
                //checkvalue = checkvalue.replace(/\s+$/, '');

                if (checkvalue.length > 0) {
                    var filtergroup = new $.jqx.filter();
                    var filter_or_operator = 1;
                    var filtervalue = checkvalue; // $("#" + gId + datafield + "txtFilter").val();
                    var filtercondition = 'contains';
                    var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                    filtergroup.addfilter(filter_or_operator, filter1);
                    $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);
                    $("#" + gId).jqxGrid('applyfilters');
                    $("#" + gId).jqxGrid('closemenu');
                } else {
                    if (storedFilterVal.length > 0) {
                        $("#" + gId).jqxGrid('removefilter', datafield);
                        $("#" + gId).jqxGrid('closemenu');
                    }
                }
            }


        });

        //$("#" + gId + datafield + "btnStrFilter").on("click", function () {
        //        var filtergroup = new $.jqx.filter();
        //        var filter_or_operator = 1;
        //        var filtervalue = $("#" + gId + datafield + "txtFilter").val();
        //        var filtercondition = 'contains';
        //        var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        //        filtergroup.addfilter(filter_or_operator, filter1);
        //        $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);
        //        $("#" + gId).jqxGrid('applyfilters');
        //        $("#" + gId).jqxGrid('closemenu');
        //});

        //$("#" + gId + datafield + "btnStrClear").on("click", function () {
        //        $("#" + gId).jqxGrid('removefilter', datafield);
        //        $("#" + gId).jqxGrid('closemenu');
        //});
        $(" #gridmenu" + gId + " ul li:first").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenu" + gId).css("background-color", "transparent");

        console.log("Method-genericBuildFilterPanelold ended" + "grid-" + gId);
    }
    catch (err) {
        if (err)
            console.log("Method-genericBuildFilterPanelold grid-" + gId + " Exception-" + err.message);
    }
}

function applywildfilterold(e, self, gridid, datafield) {

    var filterInfo = $("#" + gridid).jqxGrid('getfilterinformation');
    var storedFilterVal = '';
    for (i = 0; i < filterInfo.length; i++) {
        if (filterInfo[i].filtercolumn == datafield) {
            storedFilterVal = filterInfo[i].filter.getfilters()[0].value;
        }
    }
    if (e.keyCode == 13) {
        var checkvalue = $(self).val().trim();
        if (checkvalue.length > 0) {
            var filtergroup = new $.jqx.filter();
            var filter_or_operator = 1;
            var filtervalue = checkvalue; // $("#" + gId + datafield + "txtFilter").val();
            var filtercondition = 'contains';
            var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter1);
            $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
            $("#" + gridid).jqxGrid('applyfilters');
            $("#" + gridid).jqxGrid('closemenu');
        } else {
            if (storedFilterVal.length > 0) {
                $("#" + gridid).jqxGrid('removefilter', datafield);
                $("#" + gridid).jqxGrid('closemenu');
            }
        }
    }


}

function applywildfilter(datafield, gridid, self) {


    //var checkvalue = $(self).val().trim();
    var control = $(self).closest('div').prev('div').children('div').children('input');
    //$(control).attr('autofocus', 'true');
    //$(control).setCursorPosition(1);
    var checkvalue = $(self).closest('div').prev('div').children('div').children('input').val().trim();

    //$(self).closest('div').prev('div').children('div').children('input').focus();

    if (checkvalue.length > 0) {
        var filtergroup = new $.jqx.filter();
        var filter_or_operator = 1;
        var filtervalue = checkvalue; // $("#" + gId + datafield + "txtFilter").val();
        var filtercondition = 'contains';
        var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        filtergroup.addfilter(filter_or_operator, filter1);
        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
        $("#" + gridid).jqxGrid('applyfilters');
        $("#" + gridid).jqxGrid('closemenu');
    } else {


    }



}

function genericBuildFilterPanelold(filterPanel, datafield, dataAdapter, gId) {
    filtercheckfiled = datafield;
    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
    var storedFilterVal = '';
    for (i = 0; i < filterInfo.length; i++) {
        if (filterInfo[i].filtercolumn == datafield) {
            storedFilterVal = filterInfo[i].filter.getfilters()[0].value;
        }
    }
    var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
    var strinput = '';
    strinput += '<div class="grid-pop" style="width:194px;height: 51px;">';
    strinput += '<div class="con-area">';
    strinput += ' <div class="form-group mb0">';
    var funcGridId = "'" + gId + "'";
    var funcfieldId = "'" + datafield + "'";
    strinput += ' <input title="wildcard (%,*,?,_) can be used to match any sequence of chars or single char." type="email" onkeypress="applywildfilter(event,this,' + funcGridId + ',' + funcfieldId + ')"  value="' + storedFilterVal + '" class="form-control txtfilterclass">'; //placeholder = "Test"
    strinput += ' </div>';
    strinput += ' </div>';;
    strinput += ' </div>';
    inputdiv.append(strinput);
    filterPanel.append(inputdiv);

    var dataSource = {
        localdata: dataAdapter.records,
        async: false
    }
    var dataadapter = new $.jqx.dataAdapter(dataSource, {
        autoBind: false,
        autoSort: true,
        async: false,
        uniqueDataFields: [datafield]
    });
    var column = $("#" + gId).jqxGrid('getcolumn', datafield);

    $(" #gridmenu" + gId + " ul li:first").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
    $(" #gridmenu" + gId).css("background-color", "transparent");
}

function enableWildGobutton(self, gId) {
    //alert($(self).parent('div').parent('div').next('div').html());
    var value = $(self).val();
    //alert('apllyValue===' + applyval)
    if (value.trim() != '') {
        $(self).parent('div').parent('div').next('div').children('button').next('button').removeAttr('disabled');
    } else {
        $(self).parent('div').parent('div').next('div').children('button').next('button').attr('disabled', true);

        if (gId.id == 'Devicejqxgrid') {
            $(".panel-side-pop").hide();
        } else if (gId == 'jqxgridDeletedDevices') {
            $(".panel-side-pop-deleted").hide();
        }
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
        window.sessionStorage.setItem(gId.id + 'gridStorage', gridStorage);
    }
}

function genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gId) {
    //alert("generated");
    try {
        console.log("Method-genericBuildFilterPanel started " + "grid-" + gId);
        filtercheckfiled = datafield;
        dateFiltercheck = '';
        var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
        var storedFilterVal = '';
        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                storedFilterVal = filterInfo[i].filter.getfilters()[0].value;
            }
        }
        var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
        var strinput = '';
        strinput += '<div class="grid-pop" style="width:194px;height: 38px;">';
        strinput += '<div class="con-area">';
        strinput += ' <div class="form-group mb0">';
        var funcGridId = "'" + gId + "'";
        var funcfieldId = "'" + datafield + "'";
        applyval = storedFilterVal;
        if (storedFilterVal != '') {
            strinput += ' <input type="text" id="txtx' + gId + datafield + '"  onkeyup="enableWildGobutton(this, ' + gId + ')"  title="wildcard (%,*,?,_) can be used to match any sequence of chars or single char."   value="' + storedFilterVal + '" class="form-control txtfilterclass">'; //placeholder = "Test"
        } else {
            strinput += ' <input type="text" id="txtx' + gId + datafield + '" onkeyup="enableWildGobutton(this, ' + gId + ')"   title="wildcard (%,*,?,_) can be used to match any sequence of chars or single char."   value="' + storedFilterVal + '" class="form-control txtfilterclass">'; //placeholder = "Test"
        }
        strinput += ' </div>';

        strinput += ' </div>';
        //strinput += '<div class="btn-footer" style="padding: 9px; width: 194px; margin-top: -8px; margin-left: -1px;">';
        //strinput += '<button  disabled=true class="btn btn-default btnwildfilterClear ">' + i18n.t('reset', { lng: lang }) + '</button>';
        //strinput += '<button  disabled=true onclick="applywildfilter(' + funcfieldId + ',' + funcGridId + ',this)"  class="btn btn-primary btnwildfilter ">' + i18n.t('go', { lng: lang }) + '</button>';
        //strinput += '</div>';
        strinput += ' </div>';
        inputdiv.append(strinput);
        filterPanel.append(inputdiv);

        var filtersource = _.where(filterInfo, {
            datafield: datafield
        });

        if (filtersource.length > 0) {
            $('.btnwildfilterClear').attr('disabled', false);

        }

        var dataSource = {
            localdata: dataAdapter.records,
            async: false
        }
        var dataadapter = new $.jqx.dataAdapter(dataSource, {
            autoBind: false,
            autoSort: true,
            async: false,
            uniqueDataFields: [datafield]
        });
        var column = $("#" + gId).jqxGrid('getcolumn', datafield);


        //alert($(".filter").children('div').children('div').children('div').children('div').children('div').html());

        $('.btnwildfilterClear').on("click", function () {
            //alert('cla ref');
            $("#" + gId).jqxGrid('removefilter', datafield);
            //filterPanel.empty();
            $("#" + gId).jqxGrid('closemenu');
        });

        $('.txtfilterclass').keyup(function (e) {

            if (e.keyCode == 13) {
                //alert($(this).val())
                applywildfilterOnEnter(datafield, gId, $(this).val())
            }
        });

        $('.txtfilterclass').blur(function (e) {

            //alert($(this).val())
            applywildfilterOnEnter(datafield, gId, $(this).val())
        });


        $(" #gridmenu" + gId + " ul li:first").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenu" + gId).css("background-color", "transparent");



        $(".jqx-icon-arrow-down").on("click", function () {




            setTimeout(function () {
                $("#txtx" + gId + datafield).focus();
                $("#txtx" + gId + datafield).val($("#txtx" + gId + datafield).val());

            }, 200);
        });
        //alert("storedFilterVal " + storedFilterVal)



        setTimeout(function () {

            $("#txtx" + gId + datafield).focus();
            $("#txtx" + gId + datafield).val($("#txtx" + gId + datafield).val());

        }, 200);
        //$(".filter").children('div').children('div').children('div').children('div').children('div').children('input').focus();
        console.log("Method-genericBuildFilterPanel ended " + "grid-" + gId);
    }
    catch (err) {
        if (err)
            console.log("Method-genericBuildFilterPanel " + "grid-" + gId + "Exception-" + err.message);
    }
}

function applywildfilterOnEnter(datafield, gridid, checkvalue) {

    if (checkvalue.trim().length > 0) {

        var filtergroup = new $.jqx.filter();
        var filter_or_operator = 1;
        var filtervalue = checkvalue.trim();

        var filtercondition = 'contains';
        var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        filtergroup.addfilter(filter_or_operator, filter1);

        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
        $("#" + gridid).jqxGrid('applyfilters');
        $("#" + gridid).jqxGrid('closemenu');

    } else {

        $("#" + gridid).jqxGrid('removefilter', datafield);
        $("#" + gridid).jqxGrid('closemenu');


    }



}

function enableFromDatepickerOnclick(self, gridid, datafield) {
    try {
        console.log("Method-enableFromDatepickerOnclick started " + "grid-" + gridid);

        var fromval = $(self).val();

        console.log("Method-enableFromDatepickerOnclick " + "grid-" + gridid + " InpuFromtValue-" + fromval);

        $(self).datepicker({
            autoclose: true,
            setDate: fromval,
            dateFormat: gridDateFormat,
            format: gridDateFormat
        });
        $(self).datepicker('update');

        var tocontrol = $(self).parent('div').next('div').children('input');

        //$(self).datepicker({ autoclose: true, setDate: $(self).val(), dateFormat: currentDateShort });
        //$('.fromtxtclass').datepicker({ autoclose: true, setDate: $('.fromtxtclass').val(), dateFormat: currentDateShort });

        $(self).datepicker().on('changeDate', function (ev) {
            if (moment().isAfter($(tocontrol).val())) {
                $(self).change();
            }
        });

        $(self).datepicker().on('click', function (ev) {

            $(self).datepicker({
                autoclose: true,
                setDate: fromval,
                dateFormat: gridDateFormat,
                format: gridDateFormat
            });
            $(self).datepicker('update');

        });

        $(self).change(function () {
            if (moment().isAfter($(self))) {
                $("#" + gridid).jqxGrid('openmenu', datafield);
            }
        });
        console.log("Method-enableFromDatepickerOnclick ended " + "grid-" + gridid);
    }
    catch (err) {
        if (err)
            console.log("Method-enableFromDatepickerOnclick grid-" + gridid + " Exception-" + err.message);
    }
}

function enableToDatepickerOnclick(self, gridid, datafield) {
    try {
        console.log("Method-enableToDatepickerOnclick start " + "grid-" + gridid);
        var toval = $(self).val();
        console.log("Method-enableFromDatepickerOnclick " + "grid-" + gridid + "InputToValue-" + toval);
        $(self).datepicker({
            autoclose: true,
            setDate: toval,
            dateFormat: gridDateFormat,
            format: gridDateFormat
        });

        $(self).datepicker('update');

        var fromcontrol = $(self).parent('div').prev('div').children('input');

        $(self).datepicker().on('changeDate', function (ev) {
            if (moment().isAfter($(self).val())) {
                $(self).change();
            }
        });

        $(self).datepicker().on('click', function (ev) {

            $(self).datepicker({
                autoclose: true,
                setDate: $(this).val(),
                dateFormat: gridDateFormat,
                format: gridDateFormat
            });
            $(self).datepicker('update');
        });

        $(self).change(function () {
            if (moment().isAfter($(self).val())) {
                $("#" + gridid).jqxGrid('openmenu', datafield);
            }
        });
        console.log("Method-enableToDatepickerOnclick ended " + "grid-" + gridid);
    }
    catch (err) {
        if (err)
            console.log("Method-enableToDatepickerOnclick grid-" + gridid + " Exception-" + err.message);
    }
}

function enableTextbox(id, self, gridid, datafield) {
    try {
        console.log("Method-enableTextbox started " + "grid-" + gridid);
        if ($(self).is(':checked')) {

            fixeddatechecKInternal = datafield + gridid + 'Int';
            $(self).closest('div').prev('form').children('div').next('div').children('input').attr('disabled', 'disabled');
            $(self).closest('div').next('div').children('input').removeAttr('disabled');
            $(self).closest('div').next('div').next('div').children('input').removeAttr('disabled');
            $(self).closest('div').prev('div').children('div').next('div').children('input').attr('disabled', 'disabled');
            $(self).closest('div').prev('div').children('div').next('div').children('div').children('a').attr('disabled', 'disabled');
            $(self).closest('div').prev('div').children('div').next('div').children('div').children('a').css("cursor", "not-allowed");

            var fromval = $(self).closest('div').next('div').children('input').val();
            var toval = $(self).closest('div').next('div').next('div').children('input').val();

            $(self).closest('div').next('div').children('input').datepicker({
                autoclose: true,
                setDate: fromval,
                dateFormat: gridDateFormat,
                format: gridDateFormat
            });
            $(self).closest('div').next('div').children('input').datepicker('update');

            $(self).closest('div').next('div').next('div').children('input').datepicker({
                autoclose: true,
                setDate: toval,
                dateFormat: gridDateFormat,
                format: gridDateFormat
            });
            $(self).closest('div').next('div').next('div').children('input').datepicker('update');

            $($(self).closest('div').next('div').children('input')).datepicker().on('changeDate', function (ev) {
                if (moment().isAfter($(self).closest('div').next('div').children('input').val())) {
                    $(self).closest('div').next('div').children('input').change();
                }
            });

            $($(self).closest('div').next('div').children('input')).datepicker().on('click', function (ev) {

                $(self).closest('div').next('div').children('input').datepicker({
                    autoclose: true,
                    setDate: $(this).val(),
                    dateFormat: gridDateFormat,
                    format: gridDateFormat
                });
                $(self).closest('div').next('div').children('input').datepicker('update');
            });

            $(self).closest('div').next('div').children('input').change(function () {
                if (moment().isAfter($(self).closest('div').next('div').children('input'))) {
                    ///alert('1' + gridid + '-----' + loadgrid + '------' + loadfield);
                    if (fixeddatechecKInternal != '') {
                        $("#" + loadgrid).jqxGrid('openmenu', loadfield);
                    } else {
                        $("#" + loadgrid).jqxGrid('openmenu', loadfield);
                    }


                }
            });
            $($(self).closest('div').next('div').next('div').children('input')).datepicker().on('changeDate', function (ev) {
                if (moment().isAfter($(self).closest('div').next('div').next('div').children('input').val())) {
                    $(self).closest('div').next('div').next('div').children('input').change();
                }
            });

            $($(self).closest('div').next('div').next('div').children('input')).datepicker().on('click', function (ev) {

                $(self).closest('div').next('div').next('div').children('input').datepicker({
                    autoclose: true,
                    setDate: $(this).val(),
                    dateFormat: gridDateFormat,
                    format: gridDateFormat
                });
                $(self).closest('div').next('div').next('div').children('input').datepicker('update');
            });

            $(self).closest('div').next('div').next('div').children('input').change(function () {
                if (moment().isAfter($(self).closest('div').next('div').next('div').children('input'))) {
                    //alert('kk2');
                    $("#" + gridid).jqxGrid('openmenu', datafield);
                }
            });
            $(self).val('1');

        } else {
            fixeddayFilter = datafield + gridid + 'day';

            $(self).closest('div').prev('form').children('div').next('div').children('input').removeAttr('disabled');
            //$("#" + id + "toDate").attr('disabled', 'disabled');
            //$("#" + id + "frmDate").attr('disabled', 'disabled');
            $(self).closest('div').next('div').children('input').attr('disabled', 'disabled');
            $(self).closest('div').next('div').next('div').children('input').attr('disabled', 'disabled');
            $(self).closest('div').prev('div').children('div').next('div').children('input').removeAttr('disabled');
            $(self).closest('div').prev('div').children('div').next('div').children('div').children('a').removeAttr('disabled');
            $(self).closest('div').prev('div').children('div').next('div').children('div').children('a').css("cursor", "pointer");
            $(self).val('0');

        }
        console.log("Method-enableTextbox ended " + "grid-" + gridid);
    }
    catch (err) {
        if (err)
            console.log("Method-enableTextbox grid-" + gridid + " Exception-" + err.message);
    }
}

function applydatefilter(datafield, gridid, id, self, isDeviceTimezone) {

    try {
        console.log("Method-applydatefilter started " + "grid-" + gridid);
        fixeddatechecKInternal = datafield + gridid + 'Int';
        //var rengecheck = $(self).closest('div').prev('div').children('div').next('div').prev('div').children('input');
        var rengecheck = $(self).closest('div').prev('div').children('div').next('div').prev('div').children('label').children('input').val()

        var fromDate = $(self).closest('div').prev('div').children('div').next('div').children('input');
        //var toDate =   $(self).closest('div').prev('div').children('div').next('div').next('div').children('input');
        var toDate = $(self).closest('div').prev('div').children('div').next('div').next('div').next('div').children('input');

        var fromday = $(self).closest('div').prev('div').children('div').next('div').prev('div').prev('div').children('div').next('div').children('input').val()
        //$("#" + id + "fixedrange")
        //if ((typeof (filtergroup) == "undefined") || (filtergroup == null)) {
        //   
        var filtergroup = new $.jqx.filter();
        //}
        var filter_or_operator = 1;
        var DateObj = Object();
        DateObj.ColumnType = 'Date';
        var diifcheck = 0;

        if (rengecheck == 1) {
            fixeddatechecKInternal = datafield + gridid + 'Int';
            fixeddayFilter = datafield + gridid + 'day';
            fixeddayFilterArray = jQuery.grep(fixeddayFilterArray, function (value) {
                return (value != fixeddayFilter && value != null);;
            });
            //alert(JSON.stringify(fixeddayFilterArray));
            fixeddayFilter = '';
            ///new code 
            var fDate = $(fromDate).val();
            //var chunks = fDate.split('-');
            //var fDate = [chunks[1], chunks[0], chunks[2]].join("/");

            var tDate = $(toDate).val();
            //var chunks = tDate.split('-');
            //var tDate = [chunks[1], chunks[0], chunks[2]].join("/");

            ///
            if (!fDate || !tDate) {
                openAlertpopup(1, 'please_select_from_date_to_date');
                $("#informationPopup").css('z-index', '9999999');
                // $("li.filter.jqx-rc-all").css('display', 'block');
            }
            var dateB = moment(fDate);
            var dateC = moment(tDate);
            if (moment(dateB).isAfter(dateC, 'day')) {
                diifcheck = 1;
            } else {
                if ($(fromDate).val() == '' || $(fromDate).val() == null || $(toDate).val() == '' || $(toDate).val() == null) {
                    diifcheck = 2;
                } else {

                    var fDate = $(fromDate).val();
                    //var chunks = fDate.split('-');
                    //var fDate = [chunks[1], chunks[0], chunks[2]].join("/");

                    var tDate = $(toDate).val();
                    //var chunks = tDate.split('-');
                    //var tDate = [chunks[1], chunks[0], chunks[2]].join("/");
                    //if (gridid == 'jqxgridSwapHistory') {
                    DateObj.FilterDays = 0;
                    //} else {
                    //    DateObj.FilterDays = dateC.diff(dateB, 'days');
                    //}

                    DateObj.FilterValue = fDate; //$(fromDate).val();//$("#frmDate").val();
                    DateObj.FilterValueOptional = tDate; //$(toDate).val();//$("#toDate").val();
                    DateObj.IsFixedDateRange = false;
                }
            }
        } else {
            fixeddatechecKInternal = '';
            fixeddayFilter = datafield + gridid + 'day';
            fixeddayFilterArray.push(fixeddayFilter);
            //alert(JSON.stringify(fixeddayFilterArray));
            DateObj.FilterDays = fromday;
            var fromDate = moment().subtract('days', DateObj.FilterDays);
            //var fromDate12 = moment().subtract('days', DateObj.FilterDays).format(currentDateShort);
            DateObj.FilterValue = moment(fromDate).format(defaultFilterDateFormat); //$("#frmDate").val();
            //if (isDeviceTimezone) {
            DateObj.FilterValueOptional = moment().format(AppConstants.get('LONG_DATETIME_FORMAT_SECONDS'));
            //} else {
            //    DateObj.FilterValueOptional = moment().format(currentDateShort);
            //}//$("#toDate").val(); 
            DateObj.IsFixedDateRange = true;
        }

        // apply the filters.
        if (diifcheck == 1) {
            openAlertpopup(1, 'to_filterdate_greater');
            dateFiltercheck = 'datefilterinfo';
            //openDAtefilterAlertpopup('to_filterdate_greater');
            $("#" + gridid).jqxGrid('closemenu', datafield);
        } else {
            if (diifcheck == 2) {

            } else {
                if (rengecheck == 1) {
                    if (DateObj.FilterValue == '' || DateObj.FilterValueOptional == '') {


                    } else {
                        var dateArr = new Array();
                        dateArr.push(DateObj);
                        var filtervalue = dateArr; //'Date'+textInput.val()+'--'+textInput2.val();
                        var filtercondition = 'contains';
                        var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                        filtergroup.addfilter(filter_or_operator, filter1);
                        // add the filters.
                        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);

                        $("#" + gridid).jqxGrid('applyfilters');
                        //filterPanel.empty();
                        $("#" + gridid).jqxGrid('closemenu');

                    }
                } else {
                    if (DateObj.FilterDays == null || DateObj.FilterDays == 0) {

                    } else {

                        var dateArr = new Array();
                        dateArr.push(DateObj);
                        var filtervalue = dateArr; //'Date'+textInput.val()+'--'+textInput2.val();
                        var filtercondition = 'contains';
                        var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                        filtergroup.addfilter(filter_or_operator, filter1);
                        // add the filters.
                        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
                        $("#" + gridid).jqxGrid('applyfilters');
                        //filterPanel.empty();
                        $("#" + gridid).jqxGrid('closemenu');

                    }
                }
            }
        }
        console.log("Method-applydatefilter ended " + "grid-" + gridid);
    }
    catch (err) {
        if (err)
            console.log("Method-applydatefilter grid-" + gridid + " Exception-" + err.message);
    }
}

function genericBuildFilterPanelFordateold(filterPanel, datafield, dataAdapter, gId) {
    try {
        console.log("Method-genericBuildFilterPanelFordateold started " + "grid-" + gId);
        var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
        var storedFilterVal = new Object();
        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                var source = filterInfo[i].filter.getfilters()[0].value;
                storedFilterVal.FilterDays = source[0].FilterDays;
                storedFilterVal.FilterValue = source[0].FilterValue;
                storedFilterVal.FilterValueOptional = source[0].FilterValueOptional;
            }
        }
        var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
        var strinput = '';
        strinput += '<div class="grid-pop" style="width:189px;">';
        strinput += '<div class="con-area" style="padding:5px">';
        strinput += '<form class="form-inline">';
        strinput += '<div class="form-group">';
        strinput += '<label class="inline-adjust">' + i18n.t('last', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '<div class="input-group spinner" style="padding-left:5px;padding-right:5px" data-trigger="spinner">';
        if (storedFilterVal.FilterDays == null || storedFilterVal.FilterDays == 'undefined') {
            strinput += '<input type="text" id=' + gId + datafield + "fixedrangeInput" + ' data-bind="enable:dateDownload" style="width:46px;" class="form-control" value="1" data-rule="hour">';
        } else {
            strinput += '<input type="text" id=' + gId + datafield + "fixedrangeInput" + ' data-bind="enable:dateDownload" style="width:46px;" class="form-control" value="' + storedFilterVal.FilterDays + '" data-rule="hour">';
        }
        strinput += '<div class="input-group-addon">';
        strinput += '<a href="javascript:;" class="spin-up" data-spin="up"><i class="icon-angle-up"></i></a>';
        strinput += '<a href="javascript:;" class="spin-down" data-spin="down"><i class="icon-angle-down"></i></a>';
        strinput += '</div>';
        strinput += '</div>';
        strinput += '<div class="form-group" >';
        strinput += '<label class="inline-adjust">' + i18n.t('license_password_expiry_days', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '</form>';
        strinput += '<div style="padding-top:6px">';
        strinput += '<label>';
        var fixedrangeid = "'" + gId + datafield + "'";
        strinput += '<input class="checkbox" id=' + gId + datafield + "fixedrange" + '  type="checkbox" value=""> ' + i18n.t('fixed_date_range', {
            lng: lang
        }) + '';
        strinput += '</label>';
        strinput += '</div>';
        strinput += '<div class="form-group" id=' + gId + datafield + "frmDateDiv" + '>';
        strinput += ' <label>' + i18n.t('frmDate', {
            lng: lang
        }) + '</label>';
        strinput += ' <input type="text" id=' + gId + datafield + "frmDate" + ' disabled=true class="form-control datepics" placeholder="' + filterDatePlaceHolder + '">';
        strinput += '</div>';
        strinput += '<div class="form-group">';
        strinput += '<label>' + i18n.t('toDate', {
            lng: lang
        }) + '</label>';
        strinput += '<input type="text" id=' + gId + datafield + "toDate" + ' disabled=true class="form-control datepics" placeholder="' + filterDatePlaceHolder + '">';
        strinput += ' </div>';
        strinput += '</div>';
        strinput += '<div class="btn-footer" style="padding:9px">';
        strinput += '<button id="' + gId + datafield + 'btndateClear" disabled=true class="btn btn-default">' + i18n.t('reset', {
            lng: lang
        }) + '</button>';
        strinput += '<button id="' + gId + datafield + 'btndateFilter"  class="btn btn-primary">' + i18n.t('go', {
            lng: lang
        }) + '</button>';
        strinput += '</div>';
        strinput += '</div>';
        inputdiv.append(strinput);
        filterPanel.append(inputdiv);
        $('[data-trigger="spinner"]').spinner();

        $("#" + gId + datafield + "toDate").datepicker({
            autoclose: true,
            dateFormat: gridDateFormat,
            format: gridDateFormat
        });
        $("#" + gId + datafield + "frmDate").datepicker({
            autoclose: true,
            dateFormat: gridDateFormat,
            format: gridDateFormat
        });



        $("#" + gId + datafield + "toDate").attr('value', jsonDateConversion(storedFilterVal.FilterValueOptional, gridDateFormat));
        $("#" + gId + datafield + "frmDate").attr('value', jsonDateConversion(storedFilterVal.FilterValue, gridDateFormat));
        if (filterInfo.length > 0) {
            $("#" + gId + datafield + "btndateClear").attr('disabled', false);
        }
        var dataSource = {
            localdata: dataAdapter.records,
            async: false
        }
        var dataadapter = new $.jqx.dataAdapter(dataSource, {
            autoBind: false,
            autoSort: true,
            async: false,
            uniqueDataFields: [datafield]
        });
        var column = $("#" + gId).jqxGrid('getcolumn', datafield);
        $("#" + gId + datafield + "frmDate").datepicker().on('changeDate', function (ev) {
            $("#" + gId + datafield + "frmDate").change();
        });

        $("#" + gId + datafield + "frmDate").change(function () { });

        $("#" + gId + datafield + "fixedrange").on("change", function () {

            if ($(this).is(':checked')) {
                $("#" + gId + datafield + "fixedrangeInput").attr('disabled', true);
                $("#" + gId + datafield + "toDate").attr('disabled', false);
                $("#" + gId + datafield + "frmDate").attr('disabled', false);
            } else {
                $("#" + gId + datafield + "fixedrangeInput").attr('disabled', false);
                $("#" + gId + datafield + "toDate").attr('disabled', true);
                $("#" + gId + datafield + "frmDate").attr('disabled', true);
            }
        });
        $("#" + gId + datafield + "btndateFilter").on("click", function () {
            var filtergroup = new $.jqx.filter();
            var filter_or_operator = 1;
            var DateObj = Object();
            DateObj.ColumnType = 'Date';
            var diifcheck = 0;
            if ($("#" + gId + datafield + "fixedrange").is(':checked')) {

                var dateB = moment($("#" + gId + datafield + "frmDate").val());
                var dateC = moment($("#" + gId + datafield + "toDate").val());
                if (moment(dateB).isAfter(dateC, 'day')) {
                    diifcheck = 1;
                } else {
                    DateObj.FilterDays = dateC.diff(dateB, 'days');
                    DateObj.FilterValue = createJSONTimeStamp($("#" + gId + datafield + "frmDate").val()); //$("#frmDate").val();
                    DateObj.FilterValueOptional = createJSONTimeStamp($("#" + gId + datafield + "toDate").val()); //$("#toDate").val(); 
                }
            } else {
                DateObj.FilterDays = $("#" + gId + datafield + "fixedrangeInput").val();
                var fromDate = moment().subtract('days', DateObj.FilterDays);
                DateObj.FilterValue = createJSONTimeStamp(fromDate); //$("#frmDate").val();
                DateObj.FilterValueOptional = createJSONTimeStamp(moment().format(gridDateFormat)); //$("#toDate").val(); 
            }
            var dateArr = new Array();
            dateArr.push(DateObj);
            var filtervalue = dateArr; //'Date'+textInput.val()+'--'+textInput2.val();
            var filtercondition = 'contains';
            var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter1);
            // add the filters.
            $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);
            // apply the filters.
            if (diifcheck == 1) {
                openAlertpopup(1, 'to_filterdate_greater');
                dateFiltercheck = 'datefilterinfo';
                //openDAtefilterAlertpopup('to_filterdate_greater');
            } else {
                $("#" + gId).jqxGrid('applyfilters');
                $("#" + gId).jqxGrid('closemenu');
            }

        });
        $("#" + gId + datafield + "btndateClear").on("click", function () {
            $("#" + gId).jqxGrid('removefilter', datafield);
            $("#" + gId).jqxGrid('closemenu');

            if (gId == 'Devicejqxgrid') {
                $(".panel-side-pop").hide();
            } else if (gId == 'jqxgridDeletedDevices') {
                $(".panel-side-pop-deleted").hide();
            }
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
        });
        $(" #gridmenu" + gId + " ul li:first").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenu" + gId).css("background-color", "transparent");

        console.log("Method-genericBuildFilterPanelFordateold ended " + "grid-" + gId);
    }
    catch (err) {
        if (err)
            console.log("Method-genericBuildFilterPanelFordateold grid-" + gId + " Exception-" + err.message);
    }
}

function genericBuildFilterPanelFordateold1(filterPanel, datafield, dataAdapter, gId) {
    try {
        console.log("Method-genericBuildFilterPanelFordateold1 started " + "grid-" + gId);
        var filtername = "" + gId + datafield + "";
        if ($.inArray(filtername, filerlistArray) < 0) {

            filerlistArray.push(filtername);
        } else {

        }

        var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
        var columnName = $('#' + gId).jqxGrid('getcolumnproperty', datafield, 'text');
        var isDeviceTimeZone = false;
        if (columnName.indexOf("*") > -1) {
            isDeviceTimeZone = true;
        }
        var storedFilterVal = new Object();
        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                var source = filterInfo[i].filter.getfilters()[0].value;
                storedFilterVal.FilterDays = source[0].FilterDays;
                storedFilterVal.FilterValue = source[0].FilterValue;
                storedFilterVal.FilterValueOptional = source[0].FilterValueOptional;
            }
        }
        var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
        var strinput = '';
        strinput += '<div class="grid-pop" style="width:189px;">';
        strinput += '<div class="con-area" style="padding:5px">';
        strinput += '<form class="form-inline">';
        strinput += '<div class="form-group">';
        strinput += '<label class="inline-adjust">' + i18n.t('last', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '<div class="input-group spinner" style="padding-left:5px;padding-right:5px" data-trigger="spinner">';
        if (storedFilterVal.FilterDays == null || storedFilterVal.FilterDays == 'undefined') {
            strinput += '<input  type="text" id="' + gId + datafield + "fixedrangeInput" + '  style="width:46px;" class="form-control" value="1" data-rule="hour">';
        } else {
            strinput += '<input type="text" id=' + gId + datafield + "fixedrangeInput" + '  style="width:46px;" class="form-control" value="' + storedFilterVal.FilterDays + '" data-rule="hour">';
        }
        strinput += '<div class="input-group-addon">';
        strinput += '<a href="javascript:;" class="spin-up" data-spin="up"><i class="icon-angle-up"></i></a>';
        strinput += '<a href="javascript:;" class="spin-down" data-spin="down"><i class="icon-angle-down"></i></a>';
        strinput += '</div>';
        strinput += '</div>';
        strinput += '<div class="form-group" >';
        strinput += '<label class="inline-adjust">' + i18n.t('license_password_expiry_days', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '</form>';
        strinput += '<div style="padding-top:6px">';
        strinput += '<label>';
        var fixedrangeid = "'" + gId + datafield + "'";
        var funcGridId = "'" + gId + "'";
        var funcfieldId = "'" + datafield + "'";
        strinput += '<input class="checkbox" id=' + gId + datafield + "fixedrange" + ' onchange="enableTextbox(' + fixedrangeid + ')"  type="checkbox" value="0"> ' + i18n.t('fixed_date_range', {
            lng: lang
        }) + '';
        strinput += '</label>';
        strinput += '</div>';
        strinput += '<div class="form-group"  >';
        strinput += ' <label>' + i18n.t('frmDate', {
            lng: lang
        }) + '</label>';
        strinput += ' <input type="text" id=' + gId + datafield + "frmDate" + ' disabled=true class="form-control datepics" placeholder="' + filterDatePlaceHolder + '">';
        strinput += '</div>';
        strinput += '<div class="form-group">';
        strinput += '<label>' + i18n.t('toDate', {
            lng: lang
        }) + '</label>';
        strinput += '<input type="text" id=' + gId + datafield + "toDate" + ' disabled=true class="form-control datepics" placeholder="' + filterDatePlaceHolder + '">';
        strinput += ' </div>';
        strinput += '</div>';
        strinput += '<div class="btn-footer" style="padding:9px">';
        strinput += '<button id="' + gId + datafield + 'btndateClear" disabled=true class="btn btn-default">' + i18n.t('reset', {
            lng: lang
        }) + '</button>';
        strinput += '<button id="' + gId + datafield + 'btndateFilter" onclick="applydatefilter(' + funcfieldId + ',' + funcGridId + ',' + fixedrangeid + ',this,' + isDeviceTimeZone + ')"  class="btn btn-primary">' + i18n.t('go', {
            lng: lang
        }) + '</button>';
        strinput += '</div>';
        strinput += '</div>';
        //inputdiv.empty();
        inputdiv.append(strinput);
        //filterPanel.empty();
        filterPanel.append(inputdiv);
        $('[data-trigger="spinner"]').spinner();

        $("#" + gId + datafield + "toDate").datepicker({
            autoclose: true,
            dateFormat: currentDateShort
        });
        $("#" + gId + datafield + "frmDate").datepicker({
            autoclose: true,
            dateFormat: currentDateShort
        });

        //$("#" + gId + datafield + "toDate").attr('value', jsonDateConversion(storedFilterVal.FilterValueOptional, currentDateShort));
        //$("#" + gId + datafield + "frmDate").attr('value', jsonDateConversion(storedFilterVal.FilterValue, currentDateShort));
        var tval = storedFilterVal.FilterValueOptional;
        if (tval != undefined) {
            var gentval = tval.split(' ');
            if (gentval.length > 1) {
                tval = gentval[0];
            }
        }
        $("#" + gId + datafield + "toDate").attr('value', tval);
        $("#" + gId + datafield + "frmDate").attr('value', storedFilterVal.FilterValue);
        if (filterInfo.length > 0) {
            $("#" + gId + datafield + "btndateClear").attr('disabled', false);
        }
        var dataSource = {
            localdata: dataAdapter.records,
            async: false
        }
        var dataadapter = new $.jqx.dataAdapter(dataSource, {
            autoBind: false,
            autoSort: true,
            async: false,
            uniqueDataFields: [datafield]
        });
        var column = $("#" + gId).jqxGrid('getcolumn', datafield);
        $("#" + gId + datafield + "frmDate").datepicker().on('changeDate', function (ev) {
            if (moment().isAfter($("#" + gId + datafield + "frmDate").val())) {
                $("#" + gId + datafield + "frmDate").change();
            }
        });

        $("#" + gId + datafield + "frmDate").change(function () {
            if (moment().isAfter($("#" + gId + datafield + "frmDate").val())) {
                $("#" + gId).jqxGrid('openmenu', datafield);
            }
        });


        //$("#" + gId + datafield + "toDate").datepicker().on('changeDate', function (ev) {
        //    if (moment($("#" + gId + datafield + "toDate").val()).isAfter($("#" + gId + datafield + "toDate").val())) {
        //        $("#" + gId + datafield + "toDate").change();
        //    }
        //});

        //$("#" + gId + datafield + "toDate").change(function () {
        //    if (moment($("#" + gId + datafield + "frmDate").val()).isAfter($("#" + gId + datafield + "toDate").val())) {
        //        openAlertpopup(1, 'to_filterdate_greater');
        //        $("#" + gId).jqxGrid('openmenu', datafield);
        //    }
        //});

        //$("#" + gId + datafield + "fixedrange").on("change", function () {

        //    if ($(this).is(':checked')) {
        //        $("#" + gId + datafield + "fixedrangeInput").attr('disabled', true);
        //        $("#" + gId + datafield + "toDate").attr('disabled', false);
        //        $("#" + gId + datafield + "frmDate").attr('disabled', false);
        //    } else {
        //        $("#" + gId + datafield + "fixedrangeInput").attr('disabled', false);
        //        $("#" + gId + datafield + "toDate").attr('disabled', true);
        //        $("#" + gId + datafield + "frmDate").attr('disabled', true);
        //    }
        //});
        //$("#" + gId + datafield + "btndateFilter").bind("click",function () {
        //        var filtergroup = new $.jqx.filter();
        //        var filter_or_operator = 1;
        //        var DateObj = Object();
        //        DateObj.ColumnType = 'Date';
        //        var diifcheck = 0;
        //        if ($("#" + gId + datafield + "fixedrange").is(':checked')) {

        //            var dateB = moment($("#" + gId + datafield + "frmDate").val());
        //            var dateC = moment($("#" + gId + datafield + "toDate").val());
        //            if (moment(dateB).isAfter(dateC, 'day')) {
        //                diifcheck = 1;
        //            } else {
        //                DateObj.FilterDays = dateC.diff(dateB, 'days');
        //                DateObj.FilterValue = CreatJSONDate($("#" + gId + datafield + "frmDate").val());//$("#frmDate").val();
        //                DateObj.FilterValueOptional = CreatJSONDate($("#" + gId + datafield + "toDate").val());//$("#toDate").val(); 
        //            }
        //        } else {
        //            DateObj.FilterDays = $("#" + gId + datafield + "fixedrangeInput").val();
        //            var fromDate = moment().subtract('days', DateObj.FilterDays);
        //            DateObj.FilterValue = CreatJSONDate(fromDate);//$("#frmDate").val();
        //            DateObj.FilterValueOptional = CreatJSONDate(moment().format(gridDateFormat));//$("#toDate").val(); 
        //        }
        //        var dateArr = new Array();
        //        dateArr.push(DateObj);
        //        var filtervalue = dateArr;//'Date'+textInput.val()+'--'+textInput2.val();
        //        var filtercondition = 'contains';
        //        var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        //        filtergroup.addfilter(filter_or_operator, filter1);
        //        // add the filters.
        //        $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);
        //    // apply the filters.
        //        if (diifcheck == 1) {
        //            openAlertpopup(1, 'to_filterdate_greater');

        //        } else {
        //            $("#" + gId).jqxGrid('applyfilters');
        //            $("#" + gId).jqxGrid('closemenu');
        //        }

        //});
        $("#" + gId + datafield + "btndateClear").on("click", function () {
            $("#" + gId).jqxGrid('removefilter', datafield);
            //filterPanel.empty();
            $("#" + gId).jqxGrid('closemenu');

            if (gId == 'Devicejqxgrid') {
                $(".panel-side-pop").hide();
            } else if (gId == 'jqxgridDeletedDevices') {
                $(".panel-side-pop-deleted").hide();
            }
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
        });
        $(" #gridmenu" + gId + " ul li:first").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenu" + gId).css("background-color", "transparent");
        console.log("Method-genericBuildFilterPanelFordateold1 ended " + "grid-" + gId);
    }
    catch (err) {
        if (err)
            console.log("Method-genericBuildFilterPanelFordateold1 grid-" + gId + " Exception-" + err.message);
    }
}

function genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gId) {
    try {
        console.log("Method-genericBuildFilterPanelFordate started " + "grid-" + gId);
        filtercheckfiled = datafield;
        dateFiltercheck = '';
        var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
        var columnName = $('#' + gId).jqxGrid('getcolumnproperty', datafield, 'text');
        var isDeviceTimeZone = false;
        if (columnName.indexOf("*") > -1) {
            isDeviceTimeZone = true;
        }
        var storedFilterVal = new Object();
        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                var source = filterInfo[i].filter.getfilters()[0].value;
                //storedFilterVal.FilterDays = source[0].FilterDays;
                storedFilterVal.FilterValue = source[0].FilterValue;

                if ($.inArray(datafield + gId + 'day', fixeddayFilterArray) < 0) {

                    fixeddatechecKInternal = datafield + gId + 'Int';
                    storedFilterVal.FilterDays = 1;
                    fixeddayFilter = '';
                    storedFilterVal.IsFixedDateRange = true;
                } else {

                    fixeddayFilter = datafield + gId + 'day';
                    storedFilterVal.FilterDays = source[0].FilterDays;
                    fixeddatechecKInternal = '';
                    storedFilterVal.IsFixedDateRange = false;
                }

                //if (fixeddayFilter == datafield + gId + 'day') {
                //} else {
                //    fixeddatechecKInternal = datafield + gId + 'Int';
                //}
                storedFilterVal.FilterValueOptional = source[0].FilterValueOptional;

            }
        }

        var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
        var strinput = '';
        strinput += '<div class="grid-pop" style="width:189px;">';
        strinput += '<div class="con-area" style="padding:5px">';
        strinput += '<div class="form-inline">';
        strinput += '<div class="form-group">';
        strinput += '<label class="inline-adjust">' + i18n.t('last', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '<div class="input-group spinner" style="padding-left:5px;padding-right:5px" data-trigger="spinner">';
        strinput += '<input  type="text"   style="width:46px;" onkeyUp="isNumberKey(this)" class="form-control filterday" value="1" data-rule="dateFilter">';

        strinput += '<div class="input-group-addon">';
        strinput += '<a href="javascript:;" class="spin-up" data-spin="up"><i class="icon-angle-up"></i></a>';
        strinput += '<a href="javascript:;" class="spin-down" data-spin="down"><i class="icon-angle-down"></i></a>';
        strinput += '</div>';
        strinput += '</div>';
        strinput += '<div class="form-group" >';
        strinput += '<label class="inline-adjust">' + i18n.t('license_password_expiry_days', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '</div>';
        strinput += '<div style="padding-top:6px">';
        strinput += '<label>';

        var fixedrangeid = "'" + gId + datafield + "'";
        var funcGridId = "'" + gId + "'";
        var funcfieldId = "'" + datafield + "'";

        if (fixeddatecheck == datafield + gId + 'set') {

            if (fixeddayFilter == datafield + gId + 'day') {
                strinput += '<input class="checkbox" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox"  value="0"> ' + i18n.t('fixed_date_range', {
                    lng: lang
                }) + '';
            } else {
                strinput += '<input class="checkbox" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox" checked="checked" value="1"> ' + i18n.t('fixed_date_range', {
                    lng: lang
                }) + '';
            }
        } else {
            if (fixeddatechecKInternal == datafield + gId + 'Int') {

                if (fixeddayFilter == datafield + gId + 'day') {
                    strinput += '<input class="checkbox" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox"  value="0"> ' + i18n.t('fixed_date_range', {
                        lng: lang
                    }) + '';
                } else {
                    strinput += '<input class="checkbox" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox" checked="checked" value="1"> ' + i18n.t('fixed_date_range', {
                        lng: lang
                    }) + '';
                }
            } else {

                strinput += '<input class="checkbox" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox"  value="0"> ' + i18n.t('fixed_date_range', {
                    lng: lang
                }) + '';
            }
        }

        strinput += '</label>';
        strinput += '</div>';
        strinput += '<div class="form-group"  >';
        strinput += ' <label>' + i18n.t('frmDate', {
            lng: lang
        }) + '</label>';
        if (fixeddatecheck == datafield + gId + 'set') {
            if (fixeddayFilter == datafield + gId + 'day') {
                strinput += ' <input type="text"  disabled=true class="form-control datepics fromtxtclass" placeholder="' + filterDatePlaceHolder + '">';
            } else {
                strinput += ' <input type="text" onClick="enableFromDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"  class="form-control datepics fromtxtclass" placeholder="' + filterDatePlaceHolder + '">';
            }
        } else {
            if (fixeddatechecKInternal == datafield + gId + 'Int') {
                if (fixeddayFilter == datafield + gId + 'day') {
                    strinput += ' <input type="text"  disabled=true class="form-control datepics fromtxtclass" placeholder="' + filterDatePlaceHolder + '">';
                } else {
                    strinput += ' <input type="text" onClick="enableFromDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"   class="form-control datepics fromtxtclass" placeholder="' + filterDatePlaceHolder + '">';
                }
            } else {
                strinput += ' <input type="text"  disabled=true class="form-control datepics fromtxtclass" placeholder="' + filterDatePlaceHolder + '">';
            }
        }

        strinput += '</div>';
        strinput += '<div class="form-group">';
        strinput += '<label>' + i18n.t('toDate', {
            lng: lang
        }) + '</label>';
        if (fixeddatecheck == datafield + gId + 'set') {
            if (fixeddayFilter == datafield + gId + 'day') {
                strinput += '<input type="text"  disabled=true class="form-control datepics totxtclass" placeholder="' + filterDatePlaceHolder + '">';
            } else {
                strinput += '<input type="text" onClick="enableToDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"   class="form-control datepics totxtclass" placeholder="' + filterDatePlaceHolder + '">';
            }
        } else {
            if (fixeddatechecKInternal == datafield + gId + 'Int') {
                if (fixeddayFilter == datafield + gId + 'day') {
                    strinput += '<input type="text"  disabled=true class="form-control datepics totxtclass" placeholder="' + filterDatePlaceHolder + '">';
                } else {
                    strinput += '<input type="text" onClick="enableToDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"  class="form-control datepics totxtclass" placeholder="' + filterDatePlaceHolder + '">';
                }
            } else {
                strinput += '<input type="text"  disabled=true class="form-control datepics totxtclass" placeholder="' + filterDatePlaceHolder + '">';
            }
        }
        strinput += ' </div>';
        strinput += '</div>';
        strinput += '<div class="btn-footer" style="padding:9px">';
        strinput += '<button  disabled=true class="btn btn-default btnfilterClear ">' + i18n.t('reset', {
            lng: lang
        }) + '</button>';
        strinput += '<button  id="filterGoButton"  onclick="applydatefilter(' + funcfieldId + ',' + funcGridId + ',' + fixedrangeid + ',this,' + isDeviceTimeZone + ')"  value="check" class="btn btn-primary btnfilter ">' + i18n.t('go', {
            lng: lang
        }) + '</button>';
        strinput += '</div>';
        strinput += '</div>';
        //inputdiv.empty();
        inputdiv.append(strinput);
        //filterPanel.empty();
        filterPanel.append(inputdiv);
        $('[data-trigger="spinner"]').spinner();

        var fval = storedFilterVal.FilterValue;
        var tval = storedFilterVal.FilterValueOptional;
        if (tval != undefined) {
            var gentval = tval.split(' ');
            if (gentval.length > 1) {
                tval = gentval[0];
            }
        }
        //alert(fval + '---' + tval);
        loadgrid = gId;
        loadfield = datafield;
        if (fval != null && fval != '' && storedFilterVal.IsFixedDateRange) {
            $('.fromtxtclass').datepicker({
                autoclose: true,
                setDate: fval,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }
            });
            //var genDate = fval.split('/');
            //genDate[0] = parseInt(genDate[0]) - 1;
            //alert(JSON.stringify(genDate));
            //$('.fromtxtclass').datepicker('setDate', new Date(genDate[2], genDate[0], genDate[1]));
            $('.fromtxtclass').datepicker('update');
        } else {
            $('.fromtxtclass').datepicker({
                autoclose: true,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }
            });
            $('.fromtxtclass').datepicker('update');
        }

        /////
        if (tval != null && storedFilterVal.IsFixedDateRange) {
            $('.totxtclass').datepicker({
                autoclose: true,
                setDate: tval,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }
            });
            $('.totxtclass').datepicker('update');

        } else {

            $('.totxtclass').datepicker({
                autoclose: true,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }

            });
            $('.totxtclass').datepicker('update');
        }
        /////



        if (storedFilterVal.IsFixedDateRange) {
            $('.fromtxtclass').attr('value', storedFilterVal.FilterValue);
            $('.totxtclass').attr('value', tval);
        }
        if (storedFilterVal.FilterDays == null || storedFilterVal.FilterDays == 'undefined') {

        } else {

            $('.filterday').val(storedFilterVal.FilterDays);
        }
        var filtersource = _.where(filterInfo, {
            datafield: datafield
        });

        if (filtersource.length > 0) {
            $('.btnfilterClear').attr('disabled', false);
        }

        var dataSource = {
            localdata: dataAdapter.records,
            async: false
        }

        var dataadapter = new $.jqx.dataAdapter(dataSource, {
            autoBind: false,
            autoSort: true,
            async: false,
            uniqueDataFields: [datafield]
        });


        var column = $("#" + gId).jqxGrid('getcolumn', datafield);




        $('.btnfilterClear').on("click", function () {

            if (fixeddatecheck == datafield + gId + 'set') {
                fixeddatecheck = '';
            } else {
                if (fixeddatechecKInternal = datafield + gId + 'Int') {
                    fixeddatechecKInternal = '';
                }
            }
            CallType = ENUM.get("CALLTYPE_NONE");
            $("#" + gId).jqxGrid('removefilter', datafield);
            //filterPanel.empty();
            $("#" + gId).jqxGrid('closemenu');

            if (gId == 'Devicejqxgrid') {
                $(".panel-side-pop").hide();
            } else if (gId == 'jqxgridDeletedDevices') {
                $(".panel-side-pop-deleted").hide();
            }
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
        });
        $('.input-group-addon').on("click", function () {
            $(".btnfilter").prop("disabled", false);
        });
        $('.checkbox').on("click", function () {
            $(".btnfilter").prop("disabled", false);
        });
        $(" #gridmenu" + gId + " ul li:first").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
        $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
        $(" #gridmenu" + gId).css("background-color", "transparent");

        console.log("Method-genericBuildFilterPanelFordate ended " + "grid-" + gId);
    }
    catch (err) {
        if (err)
            console.log("Method-genericBuildFilterPanelFordate grid-" + gId + " Exception-" + err.message);
    }
}

function applyforMultichoicfilter(self, gId, datafield, isBool) {
    var isBlanksSelected = false;
    var e = $(self).parent('div').parent('div').prev('div').children('div')[0];
    $(e).find("input:checkbox").each(function (i, ob) {
        if ($(ob).is(':checked')) {
            isBlanksSelected = true;
        }
    });

    var selectedFilterValue = '';
    var filtergroup = new $.jqx.filter();

    if (!isBlanksSelected) {
        var e = $(self).parent('div').prev('div').children('div');
        $(e).find("input:checkbox").each(function (i, ob) {
            if ($(ob).is(':checked')) {
                selectedFilterValue += ($(ob).val() == '(Blanks)' ? 'null' : $(ob).val()) + '^';
            }
        });
    } else {
        selectedFilterValue = 'null' + '^';
    }


    if (selectedFilterValue == '') {
        $("#" + gId).jqxGrid('removefilter', datafield);
        // apply the filters.
        $("#" + gId).jqxGrid('closemenu');
    } else {
        selectedFilterValue = selectedFilterValue.substring(0, selectedFilterValue.length - 1)
        var filtervalue = selectedFilterValue;
        if (isBool != undefined && isBool) {
            var multiArr = new Array();
            var multiObj = Object();
            multiObj.ColumnType = 'BOOL';
            multiObj.FilterValue = selectedFilterValue;
            multiArr.push(multiObj);
            filtervalue = multiArr;
        }
        var filter_or_operator = 1;
        var filtercondition = 'contains';
        var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        filtergroup.addfilter(filter_or_operator, filter1);

        // add the filters.
        $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);

        // apply the filters.
        $("#" + gId).jqxGrid('applyfilters');
        $("#" + gId).jqxGrid('closemenu');
    }


}

function applyBlanksforMultichoicfilter(self) {

    var isBlanksSelected = $(self).is(':checked') ? true : false;
    if (isBlanksSelected) {
        $('.checkboxdiv :input').prop('disabled', true);
        $('.checkboxdiv .checkbox').css("pointer-events", "none");
        $('.checkboxdiv :checkbox').prop('checked', false);
    } else {
        $('.checkboxdiv :input').prop('disabled', false);
        $('.checkboxdiv .checkbox').css("pointer-events", "auto");
        $('.checkboxdiv').prop('disabled', false);
    }
}

function applyValueforMultichoicefilter(self) {
    var selectedFilterValue = "";
    $('.checklabel').find("input:checkbox").each(function (i, ob) {
        if ($(ob).is(':checked')) {
            //Filter value is set to null if blank is selected, this is handled in server and GUI
            selectedFilterValue += ($(ob).val() == '(Blanks)' ? 'null' : $(ob).val()) + '^';
        }
    });
    if (selectedFilterValue == "") {
        $(".btnMultiFilter").prop('disabled', true);
    } else {
        $(".btnMultiFilter").prop('disabled', false);
    }
}

function genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gId, name, isBool, filterArray) {
    isPieChartFilter = false;
    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
    var storedFilterArr = new Array();
    for (i = 0; i < filterInfo.length; i++) {
        if (filterInfo[i].filtercolumn == datafield) {
            if (isBool) {
                var checkval = filterInfo[i].filter.getfilters()[0].value;
                var source = _.where(checkval, {
                    ColumnType: 'BOOL'
                });
                if (source != '') {
                    storedFilterArr = source[0].FilterValue.split('^');
                }
            } else {

                storedFilterArr = filterInfo[i].filter.getfilters()[0].value.split('^');
            }

        }
    }
    if (gId == "jqxgridMerchantUsers" || (gId == "jqxgridDownloadlib" && datafield == "FolderName") || (gId == "jqxgridPackageFiles" && datafield == "FolderName")) {
        var checkArr = filterArray;
    } else {
        var checkArr = getMultiCoiceFilterArr(name);
    }

    if (name == "Severity") {
        for (var i = 0; i < checkArr.length; i++) {
            var obj = checkArr[i];
            if (obj.ControlValue == 'NotApplicable' && obj.Value == 'Not Applicable') {
                checkArr.splice(i, 1);
                i--;
            }
        }
    }
    var inputdiv = $('<div class="col-md-4" style="height:500px;"></div>');
    var strinput = '';

    var funcGridId = "'" + gId + "'";
    var funcfieldId = "'" + datafield + "'";

    //Blanks Option Line
    var isBlanksSelected = (storedFilterArr[0] == 'null') ? true : false;
    strinput += '<div style="width:216px;" class="con-area"><div class="grid-pop" style="width: 216px; height: 30px; padding-left: 10px; display: block;">';
    strinput += '<div class="checkbox">';
    strinput += '<label class="checklabel">';
    if (isBlanksSelected)
        strinput += '<input type="checkbox" class="checkItem" id="blankCheckBox" checked=true  value="' + 1 + '" onchange="applyBlanksforMultichoicfilter(this)">' + '(Blanks)';
    else
        strinput += '<input type="checkbox" class="checkItem" id="blankCheckBox"  value="' + 0 + '" onchange="applyBlanksforMultichoicfilter(this)" >' + '(Blanks)';

    strinput += '</label>';
    strinput += ' </div>';
    strinput += ' </div>';
    //Blank End

    strinput += '<div class="grid-pop" style="width:216px;">';
    if (isBlanksSelected)
        strinput += '<div class="con-area checkboxdiv" id="checkboxdiv' + gId + datafield + '" disabled style="display: block;height: 110px;overflow-y: auto;width: 214px;">';
    else
        strinput += '<div class="con-area checkboxdiv" id="checkboxdiv' + gId + datafield + '" style="display: block;height: 110px;overflow-y: auto;width: 214px;">';

    if (datafield == 'PreviousDeviceSubStatus' || datafield == 'CurrentDeviceSubStatus') {
        for (var i = 0; i < checkArr.length; i++) {
            if (checkArr[i].Id == 0) {
                checkArr.splice(i, 1);
                break;
            }
        }
    }
    //alert("arr satr" +  JSON.stringify(storedFilterArr));
    for (var i = 0; i < checkArr.length; i++) {
        if ($.inArray(checkArr[i].ControlValue, storedFilterArr) < 0) {
            if (isBlanksSelected) {
                strinput += '<div class="checkbox" style="padding-left: 7px;pointer-events:none">';
            }
            else {
                strinput += '<div class="checkbox" style="padding-left: 7px">';
            }
            strinput += '<label class="checklabel">';
            if (datafield == 'DeviceFileLocationAlias') {
                if (isBlanksSelected) {
                    strinput += '<input type="checkbox" id="' + gId + datafield + checkArr[i].Value + '" class="checkItem" value="' + checkArr[i].Value + '" disabled>' + checkArr[i].Value;
                }
                else {
                    strinput += '<input type="checkbox" id="' + gId + datafield + checkArr[i].Value + '" class="checkItem" value="' + checkArr[i].Value + '">' + checkArr[i].Value;
                }
            } else {
                if (isBlanksSelected) {
                    strinput += '<input type="checkbox" id="' + gId + datafield + checkArr[i].ControlValue + '" class="checkItem" value="' + checkArr[i].ControlValue + '" disabled>' + checkArr[i].Value;
                }
                else {
                    strinput += '<input type="checkbox" id="' + gId + datafield + checkArr[i].ControlValue + '" class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
                }
            }
            strinput += '</label>';
            strinput += ' </div>';

        } else {

            strinput += '<div class="checkbox" style="padding-left: 7px">';
            strinput += '<label class="checklabel">';
            if (datafield == 'DeviceFileLocationAlias') {
                strinput += '<input type="checkbox" id="' + gId + datafield + checkArr[i].Value + '" checked=true class="checkItem" value="' + checkArr[i].Value + '">' + checkArr[i].Value;
            } else {
                strinput += '<input type="checkbox" id="' + gId + datafield + checkArr[i].ControlValue + '" checked=true class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
            }
            strinput += '</label>';
            strinput += ' </div>';

        }
    }
    strinput += '</div>';
    strinput += '<div class="btn-footer">';
    strinput += ' <button  class="btn btn-default btnMultiClear" disabled=true>' + i18n.t('reset', {
        lng: lang
    }) + '</button>';
    strinput += ' <button disabled=true id="multiFilterGoButton"  class="btn btn-primary btnMultiFilter" onclick="applyforMultichoicfilter(this,' + funcGridId + ',' + funcfieldId + ',' + isBool + ')">' + i18n.t('go', {
        lng: lang
    }) + '</button>';
    strinput += ' </div>';
    strinput += '</div>';

    inputdiv.append(strinput);
    filterPanel.append(inputdiv);
    var filtersource = _.where(filterInfo, {
        datafield: datafield
    });


    if (filtersource.length > 0) {
        $('.btnMultiClear').attr('disabled', false);
    }
    var dataSource = {
        localdata: dataAdapter.records,
        async: false
    }
    var dataadapter = new $.jqx.dataAdapter(dataSource, {
        autoBind: false,
        autoSort: true,
        async: false,
        uniqueDataFields: [datafield]
    });
    var column = $("#" + gId).jqxGrid('getcolumn', datafield);



    $('.btnMultiClear').on("click", function () {
        $("#" + gId).jqxGrid('removefilter', datafield);
        // apply the filters.
        $("#" + gId).jqxGrid('closemenu');

        if (gId == 'Devicejqxgrid') {
            $(".panel-side-pop").hide();
        } else if (gId == 'jqxgridDeletedDevices') {
            $(".panel-side-pop-deleted").hide();
        }
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
    });
    $('.checklabel').on("click", function (event) {

        var selectedFilterValue = "";
        $('.checklabel').find("input:checkbox").each(function (i, ob) {
            if ($(ob).is(':checked')) {
                selectedFilterValue += ($(ob).val() == '(Blanks)' ? 'null' : $(ob).val()) + '^';
            }
        });
        if (selectedFilterValue == "") {
            $(".btnMultiFilter").prop('disabled', true);
        } else {
            $(".btnMultiFilter").prop('disabled', false);
        }
    });
    $(" #gridmenu" + gId + " ul li:first").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
    $(" #gridmenu" + gId).css("background-color", "transparent");



    $(".jqx-icon-arrow-down").on("click", function () {


        setTimeout(function () {

            var isBlanksSelected = $("#blankCheckBox").is(":checked");
            var id = "#checkboxdiv" + gId + datafield;
            $(id).empty()
            var newstr = "";
            for (var i = 0; i < checkArr.length; i++) {
                if ($.inArray(checkArr[i].ControlValue, storedFilterArr) < 0) {
                    if (isBlanksSelected) {
                        newstr += '<div class="checkbox" style="padding-left: 7px;pointer-events:none">';
                    }
                    else {
                        newstr += '<div class="checkbox" style="padding-left: 7px">';
                    }
                    newstr += '<label class="checklabel">';
                    if (datafield == 'DeviceFileLocationAlias') {
                        if (isBlanksSelected) {
                            newstr += '<input type="checkbox" id="' + gId + datafield + checkArr[i].Value + '" class="checkItem" value="' + checkArr[i].Value + '" onchange="applyValueforMultichoicefilter(this)" disabled>' + checkArr[i].Value;
                        }
                        else {
                            newstr += '<input type="checkbox" id="' + gId + datafield + checkArr[i].Value + '" class="checkItem" value="' + checkArr[i].Value + '" onchange="applyValueforMultichoicefilter(this)">' + checkArr[i].Value;
                        }
                    } else {
                        if (isBlanksSelected) {
                            newstr += '<input type="checkbox" id="' + gId + datafield + checkArr[i].ControlValue + '" class="checkItem" value="' + checkArr[i].ControlValue + '"  onchange="applyValueforMultichoicefilter(this)" disabled>' + checkArr[i].Value;
                        }
                        else {
                            newstr += '<input type="checkbox" id="' + gId + datafield + checkArr[i].ControlValue + '" class="checkItem" value="' + checkArr[i].ControlValue + '"  onchange="applyValueforMultichoicefilter(this)">' + checkArr[i].Value;
                        }
                    }
                    newstr += '</label>';
                    newstr += ' </div>';

                } else {

                    newstr += '<div class="checkbox" style="padding-left: 7px">';
                    newstr += '<label class="checklabel">';
                    if (datafield == 'DeviceFileLocationAlias') {
                        newstr += '<input type="checkbox" id="' + gId + datafield + checkArr[i].Value + '" checked=true class="checkItem" value="' + checkArr[i].Value + '"  onchange="applyValueforMultichoicefilter(this)">' + checkArr[i].Value;
                    } else {
                        newstr += '<input type="checkbox" id="' + gId + datafield + checkArr[i].ControlValue + '" checked=true class="checkItem" value="' + checkArr[i].ControlValue + '"  onchange="applyValueforMultichoicefilter(this)">' + checkArr[i].Value;
                    }
                    newstr += '</label>';
                    newstr += ' </div>';

                }
            }

            $(id).append(newstr);

        }, 200);
    });
}

function genericBuildFilterPanelMultiChoiceForReport(filterPanel, datafield, dataAdapter, gId, name, columnSortFilterforeport) {
    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
    var storedFilterArr = new Array();

    if (columnSortFilterforeport.FilterList) {

        for (i = 0; i < columnSortFilterforeport.FilterList.length; i++) {
            if (columnSortFilterforeport.FilterList[i].FilterColumn == datafield) {
                storedFilterArr = columnSortFilterforeport.FilterList[i].FilterValue.split('^');

            }
        }
    } else {

        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                storedFilterArr = filterInfo[i].filter.getfilters()[0].value.split('^');
            }
        }
    }

    var checkArr = getMultiCoiceFilterArr(name);
    //Add Blank Value Default
    if (checkArr == null)
        checkArr = new Array();

    var inputdiv = $('<div class="col-md-4" style="height:500px;"></div>');
    var strinput = '';

    var funcGridId = "'" + gId + "'";
    var funcfieldId = "'" + datafield + "'";

    //Blanks Option Line
    var isBlanksSelected = (storedFilterArr[0] == 'null') ? true : false;
    strinput += '<div style="width:216px;" class="con-area"><div class="grid-pop" style="width: 216px; height: 30px; padding-left: 10px; display: block;">';
    strinput += '<div class="checkbox">';
    strinput += '<label>';
    if (isBlanksSelected)
        strinput += '<input type="checkbox" class="checkItem" id="blankCheckBox" checked=true  value="' + 1 + '" onchange="applyBlanksforMultichoicfilter(this)">' + '(Blanks)';
    else
        strinput += '<input type="checkbox" class="checkItem" id="blankCheckBox"  value="' + 0 + '" onchange="applyBlanksforMultichoicfilter(this)" >' + '(Blanks)';

    strinput += '</label>';
    strinput += ' </div>';
    strinput += ' </div>';
    //Blank End

    strinput += '<div class="grid-pop" style="width:216px;">';
    if (isBlanksSelected)
        strinput += '<div class="con-area checkboxdiv" disabled style="display: block;height: 110px;overflow-y: auto;width: 214px;">';
    else
        strinput += '<div class="con-area checkboxdiv" style="display: block;height: 110px;overflow-y: auto;width: 214px;">';

    for (var i = 0; i < checkArr.length; i++) {

        if ($.inArray(checkArr[i].ControlValue, storedFilterArr) < 0) {

            strinput += '<div class="checkbox" style="padding-left: 7px">';
            strinput += '<label>';
            if (datafield == 'DeviceFileLocationAlias') {
                strinput += '<input type="checkbox" class="checkItem" value="' + checkArr[i].Value + '">' + checkArr[i].Value;
            } else {
                strinput += '<input type="checkbox" class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
            }
            strinput += '</label>';
            strinput += ' </div>';

        } else {

            strinput += '<div class="checkbox" style="padding-left: 7px">';
            strinput += '<label>';
            if (datafield == 'DeviceFileLocationAlias') {
                strinput += '<input type="checkbox" checked=true class="checkItem" value="' + checkArr[i].Value + '">' + checkArr[i].Value;
            } else {
                strinput += '<input type="checkbox" checked=true class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
            }
            strinput += '</label>';
            strinput += ' </div>';

        }
    }
    strinput += '</div>';
    strinput += '<div class="btn-footer">';
    strinput += ' <button  class="btn btn-default btnMultiClear" disabled=true>' + i18n.t('reset', {
        lng: lang
    }) + '</button>';
    strinput += ' <button disabled=true id="multiReportFilterGoButton" class="btn btn-primary btnMultiFilter" onclick="applyforMultichoicfilter(this,' + funcGridId + ',' + funcfieldId + ')">' + i18n.t('go', {
        lng: lang
    }) + '</button>';
    strinput += ' </div>';
    strinput += '</div>';

    inputdiv.append(strinput);
    filterPanel.append(inputdiv);
    var filtersource = _.where(filterInfo, {
        datafield: datafield
    });


    if (filtersource.length > 0) {
        $('.btnMultiClear').attr('disabled', false);
    }
    var dataSource = {
        localdata: dataAdapter.records,
        async: false
    }
    var dataadapter = new $.jqx.dataAdapter(dataSource, {
        autoBind: false,
        autoSort: true,
        async: false,
        uniqueDataFields: [datafield]
    });
    var column = $("#" + gId).jqxGrid('getcolumn', datafield);



    $('.btnMultiClear').on("click", function () {
        $("#" + gId).jqxGrid('removefilter', datafield);
        // apply the filters.
        $("#" + gId).jqxGrid('closemenu');

        if (gId == 'Devicejqxgrid') {
            $(".panel-side-pop").hide();
        } else if (gId == 'jqxgridDeletedDevices') {
            $(".panel-side-pop-deleted").hide();
        }
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
    });
    $('.checkbox').on("click", function () {
        $(".btnMultiFilter").prop('disabled', false);
    });
    $(" #gridmenu" + gId + " ul li:first").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
    $(" #gridmenu" + gId).css("background-color", "transparent");

}

function applymultiplefilter(datafield, gId, id) {

    var isBlanksSelected = false;
    var e = $(self).parent('div').parent('div').prev('div').children('div')[0];
    $(e).find("input:checkbox").each(function (i, ob) {
        if ($(ob).is(':checked')) {
            isBlanksSelected = true;
        }
    });

    var selectedFilterValue = '';
    var filtergroup = new $.jqx.filter();

    if (!isBlanksSelected) {
        $("#" + gId + datafield + "div").find("input:checkbox").each(function (i, ob) {

            if ($(ob).is(':checked')) {

                selectedFilterValue += $(ob).val() + '^';
            }
        });
    } else {
        selectedFilterValue = 'null' + '^';
    }

    selectedFilterValue = selectedFilterValue.substring(0, selectedFilterValue.length - 1)
    var filter_or_operator = 1;
    var filtervalue = selectedFilterValue;
    var filtercondition = 'contains';
    var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
    filtergroup.addfilter(filter_or_operator, filter1);

    // add the filters.
    $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);

    // apply the filters.
    $("#" + gId).jqxGrid('applyfilters');
    $("#" + gId).jqxGrid('closemenu');
}


function generateGenericPager(pagerId, gId, checkboxflag, zoneinfo) {
    var datainfo = $("#" + gId).jqxGrid('getdatainformation');
    var paginginfo = datainfo.paginginformation;


    str = '';
    str += '<div class="row grid-pager" style="margin-top: -30px;">';
    str += '<div class="col-md-7 fpager pr0">';
    str += '<span class="btn btn-sm bn cd" style="padding-left:0px">';
    str += '<span>' + i18n.t('Showing: ', {
        lng: lang
    }) + '</span>';
    var pageno = parseInt(paginginfo.pagenum) * parseInt(paginginfo.pagesize);

    if (datainfo.rowscount <= 0) {
        str += '<span id="' + gId + 'showingSpan">' + (0 + parseInt(pageno) + '-' + (datainfo.rowscount)) + '</span>';
    } else {
        var rowsPerPage = AppConstants.get('ROWSPERPAGE');
        if (gId == "reportGrid" || gId == "jqxChildGridDetails") {
            rowsPerPage = AppConstants.get('REPORTSROWPERPAGE')
        }
        if (datainfo.rowscount < rowsPerPage) {
            str += '<span id="' + gId + 'showingSpan">' + (1 + parseInt(pageno) + '-' + (datainfo.rowscount)) + '</span>';
        } else {
            var rows = $('#' + gId).jqxGrid('getrows');
            if (rows.length < rowsPerPage) {
                str += '<span id="' + gId + 'showingSpan">' + (1 + parseInt(pageno)) + '-' + datainfo.rowscount + '</span>';
            } else {
                str += '<span id="' + gId + 'showingSpan">' + (1 + parseInt(pageno) + '-' + (parseInt(pageno) + parseInt(paginginfo.pagesize))) + '</span>';
            }
        }
    }
    var strValue = i18n.t('pager_info_of', { lng: lang });
    if (gId == "jqxgridTroubleShoot") {
        if (datainfo.rowscount >= 10000) {
            strValue = i18n.t('pager_info_of_first', { lng: lang });
        }
    }
    str += '<span> ' + strValue + ' </span>';
    str += '<span>' + datainfo.rowscount + '</span>';
    str += '</span>';
    if (checkboxflag) {
        str += '<span class="btn btn-sm bn cd" style="padding-left:0px">';
        str += ' <span>' + i18n.t('Total_selected_items', {
            lng: lang
        }) + '</span>';
        str += ' <span style="width:30px" id="' + gId + 'seleceteRowSpan"> </span>';
        str += '</span>';
    }
    str += '<span class="btn btn-sm bn cd" style="padding-left:0px">';
    if (zoneinfo) {
        str += '' + i18n.t('Device_TimeZone', {
            lng: lang
        }) + '';
    }
    str += '</span>';
    str += '</div>';
    str += '<div class="col-md-5 spager tar pl0">';
    str += ' <div class="form-inline">';
    var pgId = gId;
    gId = "'" + gId + "'";
    if (paginginfo.pagenum + 1 == 1) {
        str += ' <button id="' + pgId + 'fristbtn" tabindex="0" disabled=true type="submit" title="' + i18n.t('First_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default mr5" onclick="gotoFirst(' + gId + ')"><i class="icon-previous-f"></i></button>';
        str += ' <button id="' + pgId + 'perbtn" tabindex="0" disabled=true type="submit" title="' + i18n.t('Previous_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default" onclick="gotoPrevious(' + gId + ')"><i class="icon-previous"></i></button>';
    } else {
        str += ' <button  id="' + pgId + 'fristbtn" tabindex="0" type="submit" title="' + i18n.t('First_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default mr5" onclick="gotoFirst(' + gId + ')"><i class="icon-previous-f"></i></button>';
        str += ' <button  id="' + pgId + 'perbtn" tabindex="0" type="submit" title="' + i18n.t('Previous_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default" onclick="gotoPrevious(' + gId + ')"><i class="icon-previous"></i></button>';
    }
    str += ' <span class="btn btn-sm bn cd pr0">' + i18n.t('page', {
        lng: lang
    }) + '</span>';
    if (datainfo.rowscount <= 0) {

        //str += ' <input type="text" style="font-size:11px;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif" disabled=true id="txtGoToPage' + pgId + '" onkeypress="gotoPageCall(event,' + gId + ')"  class="form-control form-sm width-60" value="' + (paginginfo.pagenum) + '" >';
        str += ' <input type="text" style="font-size:11px;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif" disabled=true id="txtGoToPage' + pgId + '" tabindex="0" onkeypress="gotoPageCall(event,' + gId + ')"  class="form-control form-sm width-60" value="' + (0) + '" >';
    } else {

        if (paginginfo.pagescount == 1) {

            str += ' <input type="text" style="font-size:11px;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif" disabled=true id="txtGoToPage' + pgId + '" tabindex="0" onkeypress="gotoPageCall(event,' + gId + ')"  class="form-control form-sm width-60" value="' + (paginginfo.pagenum + 1) + '" >';
        } else {

            if (schedulADApply == 1) {
                str += ' <input type="text" style="font-size:11px;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif" id="txtGoToPage' + pgId + '" tabindex="0" onkeypress="gotoPageCall(event,' + gId + ')" class="form-control form-sm width-60" value="1" >';
                $("#txtGoToPagejqxgridForSelectedDevices").val('1');
                //schedulADApply = 0;
            } else {

                str += ' <input type="text" style="font-size:11px;font-family:Open Sans, Helvetica Neue, Helvetica, Arial, sans-serif" id="txtGoToPage' + pgId + '" tabindex="0" onkeypress="gotoPageCall(event,' + gId + ')" class="form-control form-sm width-60" value="' + (paginginfo.pagenum + 1) + '" >';
            }

        }
    }
    str += ' <span class="btn btn-sm bn cd pl0"> / ' + paginginfo.pagescount + '</span>';
    if (paginginfo.pagenum + 1 == paginginfo.pagescount || datainfo.rowscount == 0) {
        str += ' <button id="' + pgId + 'nextbtn" tabindex="0" disabled=true type="submit" title="' + i18n.t('Next_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default mr5" onclick="gotoNext(' + gId + ')"><i class="icon-next"></i></button>';
        str += ' <button id="' + pgId + 'lastbtn" tabindex="0" disabled=true type="submit" title="' + i18n.t('Last_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default" onclick="gotoLast(' + gId + ')"><i class="icon-next-f"></i></button>';
    } else {
        str += ' <button id="' + pgId + 'nextbtn" tabindex="0" type="submit" title="' + i18n.t('Next_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default mr5" onclick="gotoNext(' + gId + ')"><i class="icon-next"></i></button>';
        str += ' <button  id="' + pgId + 'lastbtn" tabindex="0" type="submit" title="' + i18n.t('Last_Page_pagn', {
            lng: lang
        }) + '" class="btn btn-sm btn-default" onclick="gotoLast(' + gId + ')"><i class="icon-next-f"></i></button>';
    }
    str += ' </div>';
    str += '</div>';
    str += '</div>';
    $("#" + pagerId).empty();
    $("#" + pagerId).append(str);

}

function clearSelections(gId) {
    $("#warningPageChange").modal('hide');

    gridClearFlag = 1;
    var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
    gridStorage[0].checkAllFlag = 0;
    gridStorage[0].selectedDataArr = [];
    gridStorage[0].multiRowData = [];
    gridStorage[0].counter = 0;
    var gridStorageUpdated = JSON.stringify(gridStorage);
    window.sessionStorage.setItem(gId + 'gridStorage', gridStorageUpdated);

    $("#" + gId + "seleceteRowSpan").empty();
    $("#" + gId + "seleceteRowSpan").append(" " + 0);
    $("#columntable" + gId).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');

    if (pageIdentifier === 'First') {
        gotoFirst(gId);
    } else if (pageIdentifier === 'Last') {
        gotoLast(gId);
    } else if (pageIdentifier === 'Previous') {
        gotoPrevious(gId);
    } else if (pageIdentifier === 'Next') {
        gotoNext(gId);
    } else if (pageIdentifier === 'GoToPage') {
        goToSpecificPage(gId);
    }
}

function gotoFirst(gId) {
    pageIdentifier = 'First';
    if (gId === "jqxgridHierarchyAssignment" && checkAllSelected(gId) == 1) {
        $('#warningPageChange').modal('show');
        return;
    }

    var datainfo = $("#" + gId).jqxGrid('getdatainformation');
    var paginginfo = datainfo.paginginformation;
    pagechange = 1;
    $("#" + gId).jqxGrid('gotopage', 0);
}

function gotoLast(gId) {
    pageIdentifier = 'Last';
    if (gId === "jqxgridHierarchyAssignment" && checkAllSelected(gId) == 1) {
        $('#warningPageChange').modal('show');
        return;
    }

    pagechange = 1;
    var datainfo = $("#" + gId).jqxGrid('getdatainformation');
    $("#" + gId).jqxGrid('gotopage', datainfo.rowscount);
}

function gotoPrevious(gId) {
    pageIdentifier = 'Previous';
    if (gId === "jqxgridHierarchyAssignment" && checkAllSelected(gId) == 1) {
        $('#warningPageChange').modal('show');
        return;
    }

    pagechange = 1;
    if ($('#txtGoToPage' + gId).val() == '' || $('#txtGoToPage' + gId).val() == 0) {
        $("#" + gId).jqxGrid('gotoprevpage');
    } else {
        var pagno = parseInt($('#txtGoToPage' + gId).val());
        pagno = pagno - parseInt(2);
        $("#" + gId).jqxGrid('gotopage', pagno);
    }
}

function gotoNext(gId) {
    pageIdentifier = 'Next';
    if (gId === "jqxgridHierarchyAssignment" && checkAllSelected(gId) == 1) {
        $('#warningPageChange').modal('show');
        return;
    }

    pagechange = 1;
    var datainfo = $("#" + gId).jqxGrid('getdatainformation');
    var paginginfo = datainfo.paginginformation;

    if ($('#txtGoToPage' + gId).val() == '' || $('#txtGoToPage' + gId).val() == 0) {
        $("#" + gId).jqxGrid('gotonextpage');
    } else {
        if (isNumeric($('#txtGoToPage' + gId).val()) && $('#txtGoToPage' + gId).val() <= paginginfo.pagescount && $('#txtGoToPage' + gId).val() > 0) {
            var pagno = parseInt($('#txtGoToPage' + gId).val());
            $("#" + gId).jqxGrid('gotopage', pagno);

        } else {
            var msg = i18n.t('enter_valid_page_number', {
                lng: lang
            }) + paginginfo.pagescount + '.';
            openAlertpopup(1, msg);
        }
    }
}

function goToSpecificPage(gId) {
    pagechange = 1;
    var datainfo = $("#" + gId).jqxGrid('getdatainformation');
    var paginginfo = datainfo.paginginformation;
    if (isNumeric($('#txtGoToPage' + gId).val())) {
        if ($('#txtGoToPage' + gId).val() > paginginfo.pagescount || $('#txtGoToPage' + gId).val() <= 0) {
            var msg = i18n.t('enter_valid_page_number', {
                lng: lang
            }) + paginginfo.pagescount + '.';
            openAlertpopup(1, msg);
        } else {
            schedulADApply = 0;
            $("#" + gId).jqxGrid('gotopage', $('#txtGoToPage' + gId).val() - 1);
        }
    } else {
        var msg = i18n.t('enter_valid_page_number', {
            lng: lang
        }) + paginginfo.pagescount + '.';
        openAlertpopup(1, msg);
    }
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function gotoPageCall(e, gId) {
    if (e.keyCode == 13) {
        pagechange = 1;
        var datainfo = $("#" + gId).jqxGrid('getdatainformation');
        var paginginfo = datainfo.paginginformation;
        if (isNumeric($('#txtGoToPage' + gId).val())) {

            if ($('#txtGoToPage' + gId).val() > paginginfo.pagescount || $('#txtGoToPage' + gId).val() <= 0) {

                var msg = i18n.t('enter_valid_page_number', {
                    lng: lang
                }) + paginginfo.pagescount + '.';
                openAlertpopup(1, msg);
            } else {
                pageIdentifier = 'GoToPage';
                if (gId === "jqxgridHierarchyAssignment" && checkAllSelected(gId) == 1) {
                    $('#warningPageChange').modal('show');
                    return;
                }

                schedulADApply = 0;
                $("#" + gId).jqxGrid('gotopage', $('#txtGoToPage' + gId).val() - 1);
            }
        } else {
            var msg = i18n.t('enter_valid_page_number', {
                lng: lang
            }) + paginginfo.pagescount + '.';
            openAlertpopup(1, msg);
        }
    }
}

function setPaginationAsPerhghlightedId(gridId, pageNo) {
    var datainfo = $("#" + gridId).jqxGrid('getdatainformation');
    if (datainfo.rowscount < AppConstants.get('ROWSPERPAGE')) {
        if (datainfo.rowscount <= 0) {
            var first = 0;
        } else {

            var first = 1;
        }
    } else {

        var first = parseInt(pageNo);
        first = first * AppConstants.get('ROWSPERPAGE')
        first = first - AppConstants.get('ROWSPERPAGE')
        first = first + 1;
    }



    var second = 0;
    if (datainfo.rowscount < AppConstants.get('ROWSPERPAGE')) {
        second = first + parseInt(datainfo.rowscount);
    } else {
        second = first + parseInt(AppConstants.get('ROWSPERPAGE'));
    }
    second = second - 1;
    var str = first + '-' + second;

    $("#" + gridId + "showingSpan").text(str);
    $('#txtGoToPage' + gridId).val(pageNo);
    if (pageNo > 1) {
        $("#" + gridId + "fristbtn").attr('disabled', false);
        $("#" + gridId + "perbtn").attr('disabled', false);
    } else {
        $("#" + gridId + "fristbtn").attr('disabled', true);
        $("#" + gridId + "perbtn").attr('disabled', true);
    }

    var paginginfo = datainfo.paginginformation;
    if (pageNo < paginginfo.pagescount) {
        $("#" + gridId + "nextbtn").attr('disabled', false);
        $("#" + gridId + "lastbtn").attr('disabled', false);
    } else {
        $("#" + gridId + "nextbtn").attr('disabled', true);
        $("#" + gridId + "lastbtn").attr('disabled', true);
    }
    if (datainfo.rowscount <= 0) {
        $("#" + gridId + "nextbtn").attr('disabled', true);
        $("#" + gridId + "lastbtn").attr('disabled', true);
        $("#" + gridId + "nextbtn").attr('disabled', true);
        $("#" + gridId + "lastbtn").attr('disabled', true);
        var str = '0-0';
        $("#" + gridId + "showingSpan").text(str);
    }
}

function getMultiCoiceFilterArr(inputVal) {

    var source = _.where(globalmultiChoiceFilterData[0], {
        Name: inputVal
    });
    var arr = new Array();
    if (source != '') {
        if (inputVal == 'EncrEnabled') {
            var ifNAexist = $.grep(source, function (e) {
                return e.Value == "N/A";
            });
            if (ifNAexist.length == 0) {
                var obj = new Object();
                obj.ControlValue = 'N/A';
                obj.Id = 0;
                obj.Name = 'N/A';
                obj.Value = 'N/A';
                arr.push(obj);
            }
        }
        for (var i = 0; i < source.length; i++) {
            var obj = new Object();
            obj.ControlValue = source[i].ControlValue;
            obj.Id = source[i].Id;
            obj.Name = source[i].Name;
            obj.Value = source[i].Value;
            arr.push(obj);
        }
    }
    return arr;
}

function UpdateMultiChoiceFilterArray(inputVal, updateArray) {
    var source = _.where(globalmultiChoiceFilterData[0], {
        Name: inputVal
    });
    for (var i = 0; i < source.length; i++) {
        for (var j = 0; j < globalmultiChoiceFilterData[0].length; j++) {
            if (source[i].Id == globalmultiChoiceFilterData[0][j].Id && source[i].Name == globalmultiChoiceFilterData[0][j].Name) {
                globalmultiChoiceFilterData[0].splice(j, 1);
            }
        }
    }
    for (var k = 0; k < updateArray.length; k++) {
        var obj = new Object();
        obj.ControlValue = updateArray[k].SubStatus;
        obj.Id = updateArray[k].SubStatusId;
        obj.Name = inputVal;
        obj.Value = updateArray[k].SubStatus;
        if (globalmultiChoiceFilterData && globalmultiChoiceFilterData.length)
            globalmultiChoiceFilterData[0].push(obj);
    }

}

function AlertNameFilterArr(inputVal) {

    var source = _.where(globalmultiChoiceFilterData[0], {
        Name: inputVal
    });
    var arr = new Array();
    for (var i = 0; i < source.length; i++) {
        var obj = new Object();
        obj.ControlValue = source[i].Value;
        obj.Id = source[i].Id;
        obj.Name = source[i].Name;
        obj.Value = source[i].ControlValue;
        arr.push(obj);
    }
    return arr;
}

function genericCellDisablesrenderer(row, column, value, defaultHtml, gridId, datafields) {
    var check = $("#" + gridId).jqxGrid('getcellvalue', row, datafields);
    if (check == true || check == 'Deleted') {
        return defaultHtml;
    } else {
        var element = $(defaultHtml);
        element.css('pointer-events', 'none');
        element.css('opacity', '0.4');
        return element[0].outerHTML;
    }
}

function genericCellDisablesrendererForDetails(row, column, value, defaultHtml, gridId, datafield1, datafield2, datafield3, datafield4) {
    var datafield1val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield1);		//Job Status
    var datafield2val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield2);		//IsAutoDownloadJob
    var datafield3val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield3);		//IsRescheduled
    var datafield4val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield4);		//Protocol
    if (datafield1val == 'Failed' && datafield2val == false && datafield3val == false && datafield4val == AppConstants.get('VEM_PROTOCOL')) {
        return defaultHtml;
    } else {
        var element = $(defaultHtml);
        element.css('pointer-events', 'none');
        element.css('opacity', '0.4');
        return element[0].outerHTML;
    }
}

function genericCellClassDisablesrendererForDetails(row, column, gridId, datafield1, datafield2, datafield3, datafield4, datafield5) {
    var datafield1val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield1);		//Job Status
    var datafield2val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield2);		//IsAutoDownloadJob
    var datafield3val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield3);		//IsResheduleAllowed
    var datafield4val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield4);		//IsRescheduled
    var datafield5val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield5);		//Protocol
    if (datafield1val == 'Failed' && datafield2val == false && datafield3val == true && datafield4val == false && datafield5val == AppConstants.get('VEM_PROTOCOL')) {
        return '';
    } else {
        return 'disabled';
    }
}

function genericCellDisablesrendererForVRKDetails(row, column, gridId, datafield1, datafield2, datafield3) {
    var datafield1val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield1);
    var datafield2val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield2);
    var datafield3val = $("#" + gridId).jqxGrid('getcellvalue', row, datafield3);
    if ((datafield1val == 'Download Failed' || datafield1val == 'Install Failed' || datafield1val == 'Failed') && datafield2val == false && datafield3val == false) {
        return '';
    } else {
        return 'disabled';
    }
}

function genericCellDisablesrendererNew(row, columnfield, value, gridId, datafields) {
    var check = $("#" + gridId).jqxGrid('getcellvalue', row, datafields);
    if (check == true || check == 'Deleted') {
        return '';
    } else {

        return 'disabled';
    }
}

function disableIcons(arrIds) {
    for (var i = 0; i < arrIds.length; i++) {
        $("#" + arrIds[i]).prop("disabled", true);
    }
}

function enableIcons(arrIds) {
    for (var i = 0; i < arrIds.length; i++) {
        $("#" + arrIds[i]).prop("disabled", false);
    }
}

//for allpy Defoult Date filter
function addDefaultfilter(CallType, datafield, gID) {

    var DateObj = Object();
    //CallType = ENUM.get("CALLTYPE_WEEK");
    DateObj.ColumnType = 'Date';
    DateObj.FilterDays = 1;
    var fromDate = moment().subtract('days', 6);
    DateObj.FilterValue = moment(fromDate).format(gridDateFormat);
    DateObj.FilterValueOptional = moment().format(gridDateFormat);
    DateObj.IsFixedDateRange = true;
    var dateArr = new Array();
    dateArr.push(DateObj);

    var filtergroup = new $.jqx.filter();
    var filter_or_operator = 1;
    var filtervalue = dateArr;
    var filtercondition = 'contains';
    var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
    filtergroup.addfilter(filter_or_operator, filter1);
    $("#" + gID).jqxGrid('addfilter', datafield, filtergroup);
    $("#" + gID).jqxGrid('applyfilters');

    return CallType;
}

function addDefaultfilterForReport(columnSortFilterforeport, gID) {



    if (columnSortFilterforeport.FilterList) {

        for (i = 0; i < columnSortFilterforeport.FilterList.length; i++) {
            var filtergroup = new $.jqx.filter();
            if (columnSortFilterforeport.FilterList[i].ColumnType == 'Date') {
                var DateObj = Object();
                DateObj.ColumnType = columnSortFilterforeport.FilterList[i].ColumnType;
                DateObj.FilterDays = columnSortFilterforeport.FilterList[i].FilterDays;
                DateObj.FilterValue = columnSortFilterforeport.FilterList[i].FilterValue;
                DateObj.FilterValueOptional = columnSortFilterforeport.FilterList[i].FilterValueOptional;
                if (columnSortFilterforeport.FilterList[i].IsFixedDateRange != undefined) {
                    DateObj.IsFixedDateRange = columnSortFilterforeport.FilterList[i].IsFixedDateRange;
                } else {
                    DateObj.IsFixedDateRange = true;
                }

                var dateArr = new Array();
                dateArr.push(DateObj);

                var datafield = columnSortFilterforeport.FilterList[i].FilterColumn;
                var filter_or_operator = 1;
                var filtervalue = dateArr;
                var filtercondition = 'contains';
                var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                filtergroup.addfilter(filter_or_operator, filter1);
                $("#" + gID).jqxGrid('addfilter', datafield, filtergroup);

            } else {
                var datafield = columnSortFilterforeport.FilterList[i].FilterColumn;
                var filter_or_operator = 1;
                var filtervalue = columnSortFilterforeport.FilterList[i].FilterValue;
                var filtercondition = 'contains';
                var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                filtergroup.addfilter(filter_or_operator, filter1);
                $("#" + gID).jqxGrid('addfilter', datafield, filtergroup);
            }

        }
    }

    //alert('columnSortFilterforeport  ' + JSON.stringify(columnSortFilterforeport));


    $("#" + gID).jqxGrid('applyfilters');


    //$("#" + gID).jqxGrid('sortby', 'SERIALNUMBER', 'asc');


}

///for ui side grid


function UIapplywildfilter(datafield, gridid, self) {
    //alert('click')
    var control = $(self).closest('div').prev('div').children('div').children('input');
    var checkvalue = $(self).closest('div').prev('div').children('div').children('input').val().trim();


    if (checkvalue.length > 0) {
        //alert('checkvalue--' + checkvalue)

        var filtergroup = new $.jqx.filter();
        var filter_or_operator = 1;
        var filtervalue = checkvalue;
        var filtercondition = 'contains';
        if (checkvalue.indexOf("*") >= 0 || checkvalue.indexOf("%") >= 0) {
            var chrArr = '';
            if (checkvalue.indexOf("%") >= 0) {
                chrArr = checkvalue.split('%');
            } else {
                chrArr = checkvalue.split('*');
            }
            if (chrArr[1] != '') {
                if (chrArr[2] != '') {
                    filtercondition = 'ends_with';
                    filtervalue = chrArr[1];
                } else {
                    filtercondition = 'contains';
                    filtervalue = chrArr[1];
                }
            } else {
                filtercondition = 'starts_with';
                filtervalue = chrArr[0];
            }
        } else {

            filtercondition = 'EQUAL';
        }
        if (gridid == 'jqxgridViewIpConfigResult' && (datafield == 'TotalRecordsCount' || datafield == 'SuccessCount' || datafield == 'ErrorCount')) {
            var filter1 = filtergroup.createfilter('numericfilter', filtervalue, filtercondition);
        } else if (gridid == 'jqxgridViewIpConfigResult' && (datafield == 'CreatedOn')) {
            var filter1 = filtergroup.createfilter('datefilter', filtervalue, filtercondition);
        } else {
            var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        }
        //var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        filtergroup.addfilter(filter_or_operator, filter1);
        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
        $("#" + gridid).jqxGrid('applyfilters');
        $("#" + gridid).jqxGrid('closemenu');
        $('.UIbtnwildfilterClear').attr('disabled', false);
    } else {


    }



}

function wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gId, checkFlag) {

    uiloadgrid = gId;
    uiloadfield = datafield;

    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
    var storedFilterVal = '';

    var filterstorageObj = initfilterstorage(gId);

    var filterStorage = filterstorageObj.filterStorage;

    for (i = 0; i < filterInfo.length; i++) {
        if (filterInfo[i].filtercolumn == datafield) {
            //storedFilterVal = filterInfo[i].filter.getfilters()[0].value;
            for (var i = 0; i < filterStorage[0].filterData.length; i++) {
                if (filterStorage[0].filterData[i].datafield == datafield) {
                    storedFilterVal = filterStorage[0].filterData[i].Value;
                }
            }
            //alert('yes  ' + filterInfo[i].filter.getfilters()[0].value);
        }
    }

    //for (var i = 0; i < UifilterfiledsDataArray.length; i++) {
    //    if (UifilterfiledsDataArray[i].gridid == gId) {
    //        for (var j = 0; j < UifilterfiledsDataArray[i].filterfieldData.length; j++) {
    //            if (UifilterfiledsDataArray[i].filterfieldData[j].datafield == datafield) {
    //                storedFilterVal = UifilterfiledsDataArray[i].filterfieldData[j].Value;
    //            }
    //        }
    //    }
    //}

    var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
    var strinput = '';
    strinput += '<div class="grid-pop" style="width:194px;height: 38px;">';
    strinput += '<div class="con-area">';
    strinput += ' <div class="form-group mb0">';
    var funcfieldId = "'" + datafield + "'";
    var funcGridId = "'" + gId + "'";

    strinput += ' <input type="text" id="txtUI' + gId + datafield + '" title="wildcard (%,*) can be used to match any sequence of chars or single char." onkeyup="enableWildGobutton(this, ' + gId + ')"  value="' + storedFilterVal + '" class="form-control UItxtfilterclass">';
    strinput += ' </div>';
    strinput += ' </div>';
    //strinput += '<div class="btn-footer" style="padding: 9px; width: 194px; margin-top: -8px; margin-left: -1px;">';
    //strinput += '<button  disabled=true  class="btn btn-default UIbtnwildfilterClear ">' + i18n.t('reset', { lng: lang }) + '</button>';
    //strinput += '<button disabled=true onclick="UIapplywildfilter(' + funcfieldId + ',' + funcGridId + ',this)"  class="btn btn-primary UIbtnwildfilter ">' + i18n.t('go', { lng: lang }) + '</button>';
    //strinput += '</div>';
    strinput += ' </div>';
    inputdiv.append(strinput);
    filterPanel.append(inputdiv);

    var filtersource = _.where(filterInfo, {
        datafield: datafield
    });

    if (filtersource.length > 0) {
        //$('#uiWildfilterclear').attr('disabled', false);
        $('.UIbtnwildfilterClear').removeAttr('disabled');
    }
    var dataSource = {
        localdata: dataAdapter.records,
        async: false
    }
    var dataadapter = new $.jqx.dataAdapter(dataSource, {
        autoBind: false,
        autoSort: true,
        async: false,
        uniqueDataFields: [datafield]
    });
    var column = $("#" + gId).jqxGrid('getcolumn', datafield);


    $('.UIbtnwildfilterClear').on("click", function () {

        $("#" + gId).jqxGrid('removefilter', datafield);
        $("#" + gId).jqxGrid('closemenu');
        $(".UItxtfilterclass").val('');
        $('.UIbtnwildfilterClear').attr('disabled', true);
        var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));

        if (checkFlag) { } else {
            setUiHeaderCheckstyle(gId);
        }
    });



    //$("#uiWildfilterclear" + datafield).on("click", function () {
    //    $("#" + uiloadgrid).jqxGrid('removefilter', datafield);
    //    $("#" + uiloadgrid).jqxGrid('closemenu');
    //    $("#txtfilter" + datafield).val('');
    //    $('#uiWildfilterclear' + datafield).attr('disabled', true);
    //    var gridStorage = JSON.parse(sessionStorage.getItem(uiloadgrid + "gridStorage"));



    //    if (checkFlag) {
    //    } else {
    //        setUiHeaderCheckstyle(uiloadgrid);
    //    }


    //});

    $(" #gridmenu" + gId + " ul li:first").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
    $(" #gridmenu" + gId).css("background-color", "transparent");

    $('.UItxtfilterclass').keypress(function (e) {
        if (e.keyCode == 13) {
            UIapplywildfilterOnEnter(datafield, gId, $(this).val(), checkFlag);
        }
    });
    $('.UItxtfilterclass').blur(function (e) {
        //alert($(this).val())
        UIapplywildfilterOnEnter(datafield, gId, $(this).val(), checkFlag);
    });
    $(" #gridmenu" + uiloadgrid).css("background-color", "transparent");

    if (storedFilterVal != '') {
        initopenUIfilter = 0;
        $('.grid-pop').css("display", "none");
    } else {
        $('.grid-pop').css("display", "block");
    }


    setTimeout(function () {

        $("#txtUI" + gId + datafield).focus();
        $("#txtUI" + gId + datafield).val($("#txtUI" + gId + datafield).val());

    }, 200);

    $(".jqx-icon-arrow-down").on("click", function () {


        setTimeout(function () {
            $("#txtUI" + gId + datafield).focus();
            $("#txtUI" + gId + datafield).val($("#txtUI" + gId + datafield).val());

        }, 200);
    });
}

function onNumericSelection(datafield, gridid, conditionValue) {
    if (conditionValue) {
        numericDefaultCondition = conditionValue.text;
        $('#numericFilterSelectedOption').text(numericDefaultCondition);
    }
    if (conditionValue && $("#numericElement" + gridid + datafield).val().length > 0) {
        $('.UIbtnwildnumericfilter').removeAttr('disabled');
    }
}

function applywildNumericFilter(datafield, gridid) {
    var filterstorageObj = initfilterstorage(gridid);
    var filterStorage = filterstorageObj.filterStorage;
    var checkvalue = $("#numericElement" + gridid + datafield).val();

    if (checkvalue.trim().length > 0) {
        var filtergroup = new $.jqx.filter();
        var filter_or_operator = 1;
        var filtervalue = numericDefaultCondition + '' + checkvalue.trim();;
        var filtertype = "numericfilter";
        var filtercondition = numericDefaultCondition;
        if (numericDefaultCondition == '>') {
            filtercondition = 'GREATER_THAN';
        } else if (numericDefaultCondition == '<') {
            filtercondition = 'LESS_THAN';
        } else if (numericDefaultCondition == '>=') {
            filtercondition = 'GREATER_THAN_OR_EQUAL';
        } else if (numericDefaultCondition == '<=') {
            filtercondition = 'LESS_THAN_OR_EQUAL';
        } else if (numericDefaultCondition == '!=') {
            filtercondition = 'NOT_EQUAL';
        } else if (numericDefaultCondition == '=') {
            filtercondition = 'EQUAL';
        }

        var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
        filtergroup.addfilter(filter_or_operator, filter);
        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
        $("#" + gridid).jqxGrid('applyfilters');

        var gridfilterdataobj = new Object();
        gridfilterdataobj.datafield = datafield;
        gridfilterdataobj.Value = numericDefaultCondition + '' + checkvalue.trim();
        var arr = new Array();
        arr.push(gridfilterdataobj)

        if (filterStorage) {
            var filterdata = [];
            if (filterStorage[0].filterData != undefined) {
                var arr = filterStorage[0].filterData;
                filterdata = $.grep(arr, function (e, i) {
                    return e.datafield !== datafield;
                });
                filterStorage[0].filterData = filterdata;
                filterStorage[0].filterData.push(gridfilterdataobj);

                var updatedfilterStorage = JSON.stringify(filterStorage);
                window.sessionStorage.setItem(gridid + 'filterStorage', updatedfilterStorage);
            }
        }
        $("#" + gridid).jqxGrid('closemenu');
        $('.UIbtnwildfilterClear').attr('disabled', false);
    }
}

function genericBuildFilterPanelForNumeric(filterPanel, datafield, dataAdapter, gId) {

    filtercheckfiled = datafield;
    dateFiltercheck = '';
    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
    var storedFilterVal = '';
    for (i = 0; i < filterInfo.length; i++) {
        if (filterInfo[i].filtercolumn == datafield) {
            storedFilterVal = filterInfo[i].filter.getfilters()[0].value;
        }
    }
    var filterConditions = ['>', '<', '>=', '<=', '!=', '='];
    numericDefaultCondition = '>';
    var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
    var strinput = '';
    strinput += '<div class="grid-pop" style="width:194px;height: 38px;">';
    strinput += '<div class="con-area">';
    strinput += ' <div class="form-group mb0">';
    var funcGridId = "'" + gId + "'";
    var funcfieldId = "'" + datafield + "'";
    applyval = storedFilterVal;
    strinput += '  <div class="input-group">';
    strinput += '  <div class="input-group-btn" style="font-weight:bold; font-size:16px;"><button type="button" class="btn btn-secondary dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false"><span  id="numericFilterSelectedOption">' + filterConditions[0] + '</span><span style="margin-left:16px;" class="caret"></span></button>';
    strinput += '  <div class="dropdown-menu dropdown-menu-left">';
    for (var j = 0; j < filterConditions.length; j++) {
        strinput += ' <a id="selectedCondition' + j + '" class="form-control" onclick="onNumericSelection(' + funcfieldId + ',' + funcGridId + ',this)">' + filterConditions[j] + '</a>';
    }
    strinput += '  </div></div><input  id="numericElement' + gId + datafield + '" onkeyup="enableWildGobutton(this, ' + gId + ')"  type="number" onkeypress="return event.charCode >= 48 && event.charCode <= 57" class="form-control numericfilterclass" aria-label="Text input with dropdown button"></div>';
    strinput += ' </div>';
    strinput += ' </div>';
    strinput += '<div class="btn-footer" style="padding: 9px; width: 194px; margin-top: -8px; margin-left: -1px;">';
    strinput += '<button  disabled=true  class="btn btn-default UIbtnwildNMfilterClear ">' + i18n.t('reset', {
        lng: lang
    }) + '</button>';
    strinput += '<button disabled=true onclick="applywildNumericFilter(' + funcfieldId + ',' + funcGridId + ')"  class="btn btn-primary UIbtnwildnumericfilter">' + i18n.t('go', {
        lng: lang
    }) + '</button>';
    strinput += '</div>';
    strinput += ' </div>';
    inputdiv.empty();
    inputdiv.append(strinput);
    filterPanel.append(inputdiv);
    var filtersource = _.where(filterInfo, {
        datafield: datafield
    });
    if (filtersource.length > 0) {
        $('.UIbtnwildNMfilterClear').attr('disabled', false);
    }

    var dataSource = {
        localdata: dataAdapter.records,
        async: false
    }
    var dataadapter = new $.jqx.dataAdapter(dataSource, {
        autoBind: false,
        autoSort: true,
        async: false,
        uniqueDataFields: [datafield]
    });
    var column = $("#" + gId).jqxGrid('getcolumn', datafield);

    $('.UIbtnwildNMfilterClear').on("click", function () {
        $("#" + gId).jqxGrid('removefilter', datafield);
        $("#" + gId).jqxGrid('closemenu');
        $('#numericFilterSelectedOption').text('>');
    });
    //$('.numericfilterclass').keypress(function (e) {
    //    if ($("#numericElement" + gId + datafield).val().length > 0) {
    //        $('.UIbtnwildnumericfilter').removeAttr('disabled');
    //    }
    //});
    $(".numericfilterclass").on('change keyup paste', function () {
        if ($(this).val().length > 0) {
            $('.UIbtnwildnumericfilter').removeAttr('disabled');
        }
    })

    $(" #gridmenu" + gId + " ul li:first").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
    $(" #gridmenu" + gId).css("background-color", "transparent");

    $(".jqx-icon-arrow-down").on("click", function () {

        setTimeout(function () {
            $("#numericElement" + gId + datafield).focus();
            $("#numericElement" + gId + datafield).val($("#numericElement" + gId + datafield).val());

        }, 200);
    });
    if (storedFilterVal != "") {
        if (storedFilterVal.indexOf('=') == 1) {
            numericDefaultCondition = storedFilterVal.substring(0, 2);
            $('#numericFilterSelectedOption').text(storedFilterVal.substring(0, 2));
            $("#numericElement" + gId + datafield).val(storedFilterVal.substring(2, storedFilterVal.length));
        } else {
            numericDefaultCondition = storedFilterVal.substring(0, 1);
            $('#numericFilterSelectedOption').text(storedFilterVal.substring(0, 1));
            $("#numericElement" + gId + datafield).val(storedFilterVal.substring(1, storedFilterVal.length));
        }
        $('.UIbtnwildnumericfilter').removeAttr('disabled');
    }

    setTimeout(function () {
        $("#numericElement" + gId + datafield).focus();
        $("#numericElement" + gId + datafield).val($("#numericElement" + gId + datafield).val());
    }, 200);
}


function initfilterstorage(gID) {
    var filterlistArr = new Array();
    filterlistArr = JSON.parse(sessionStorage.getItem("filterlist"));
    if (filterlistArr) {
        if ($.inArray(gID + 'filterStorage', filterlistArr) < 0) {
            filterlistArr.push(gID + 'filterStorage');
        }
    }
    var filterlist = JSON.stringify(filterlistArr);
    window.sessionStorage.setItem('filterlist', filterlist);


    var filterStorage = JSON.parse(sessionStorage.getItem(gID + "filterStorage"));
    if (filterStorage == null) {
        var filterStorageArr = new Array();

        var filterStorageObj = new Object();
        filterStorageObj.filterData = [];

        filterStorageArr.push(filterStorageObj);
        var filterStorage = JSON.stringify(filterStorageArr);
        window.sessionStorage.setItem(gID + 'filterStorage', filterStorage);
        gridStorage = JSON.parse(sessionStorage.getItem(gID + "filterStorage"));

    } else {

    }

    var obj = new Object();
    obj.filterStorage = filterStorage;

    return obj;

}

function UIapplywildfilterOnEnter(datafield, gridid, checkvalue, checkFlag) {

    var filterstorageObj = initfilterstorage(gridid);

    var filterStorage = filterstorageObj.filterStorage;



    if (checkvalue.trim().length > 0) {

        var filtergroup = new $.jqx.filter();
        var filter_or_operator = 1;
        var filtervalue = checkvalue.trim();
        var filtercondition = 'contains';
        if (checkvalue.indexOf("*") >= 0 || checkvalue.indexOf("%") >= 0) {
            var chrArr = '';
            if (checkvalue.indexOf("%") >= 0) {
                chrArr = checkvalue.split('%');
            } else {
                chrArr = checkvalue.split('*');
            }
            if (chrArr[1] != '') {
                if (chrArr[2] != '') {
                    filtercondition = 'ends_with';
                    filtervalue = chrArr[1];
                } else {
                    filtercondition = 'contains';
                    filtervalue = chrArr[1];
                }
            } else {
                filtercondition = 'starts_with';
                filtervalue = chrArr[0];
            }
        } else {

            filtercondition = 'EQUAL';
        }
        if (gridid == 'jqxgridViewIpConfigResult' && (datafield == 'TotalRecordsCount' || datafield == 'SuccessCount' || datafield == 'ErrorCount')) {
            var filter1 = filtergroup.createfilter('numericfilter', filtervalue, filtercondition);
        } else if (gridid == 'jqxgridViewIpConfigResult' && (datafield == 'CreatedOn')) {
            var filter1 = filtergroup.createfilter('datefilter', filtervalue, filtercondition);
        } else if (gridid == "process_data") {
            if (datafield == "CPUPercent" || datafield == "MemPercent") {
                if (checkvalue == '*.*' || checkvalue == '*.' || checkvalue == ".*") {
                    filtervalue = '.';
                    filtercondition = 'contains';
                }
            }
            var filter1 = filtergroup.createfilter('stringfilter', filtervalue + '', filtercondition);

        } else {
            var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
        }
        //var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);


        filtergroup.addfilter(filter_or_operator, filter1);
        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
        $("#" + gridid).jqxGrid('applyfilters');


        //var result = $.grep(UifilterfiledsDataArray, function (e, i) {
        //    return e.filterfieldData !== '';
        //});
        //UifilterfiledsDataArray = result;
        //var mainArr = new Object();
        //mainArr.gridid = gridid;

        var gridfilterdataobj = new Object();
        gridfilterdataobj.datafield = datafield;
        gridfilterdataobj.Value = checkvalue.trim();
        var arr = new Array();
        arr.push(gridfilterdataobj)

        if (filterStorage) {

            var arr = filterStorage[0].filterData;
            arr = $.grep(arr, function (e, i) {
                return e.datafield !== datafield;
            });
            filterStorage[0].filterData = arr;
            filterStorage[0].filterData.push(gridfilterdataobj);

            var updatedfilterStorage = JSON.stringify(filterStorage);
            window.sessionStorage.setItem(gridid + 'filterStorage', updatedfilterStorage);
        }
        //mainArr.filterfieldData = arr;

        //UifilterfiledsDataArray.push(mainArr);
        //end new chnages
        var datainformations = $("#" + gridid).jqxGrid('getdatainformation');
        if (datainformations.rowscount == 0) {
            $("#" + gridid).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
            $("#" + gridid).find('.jqx-grid-column-header:first').append('<div id="checkboxAll' + gridid + datafield + '" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
            if (gridid == 'jqxgridAvailablePackage' || gridid == 'jqxgridAvailableKeys') {
                $("#btnForAllMoveright").addClass('disabled');
            }
        } else {
            if (gridid == 'jqxgridAvailablePackage' || gridid == 'jqxgridAvailableKeys') {
                $("#btnForAllMoveright").removeClass('disabled');
            }
            $("#checkboxAll" + gridid + datafield).remove();
            $("#" + gridid).find('.jqx-grid-column-header:first').fadeTo('slow', 1);
        }
        $("#" + gridid).jqxGrid('closemenu');
        $('.UIbtnwildfilterClear').attr('disabled', false);
    } else {

        var arr = filterStorage[0].filterData;
        arr = $.grep(arr, function (e, i) {
            return e.datafield !== datafield;
        });

        //alert("after arr" + JSON.stringify(arr));

        filterStorage[0].filterData = arr;
        var updatedfilterStorage = JSON.stringify(filterStorage);
        window.sessionStorage.setItem(gridid + 'filterStorage', updatedfilterStorage);
        //for (var i = 0; i < UifilterfiledsDataArray.length; i++) {
        //    if (UifilterfiledsDataArray[i].gridid == gridid) {
        //        alert("UifilterfiledsDataArray[i].gridid" + UifilterfiledsDataArray[i].gridid)
        //        var result = $.grep(UifilterfiledsDataArray[i].filterfieldData, function (e, i) {
        //            return e.datafield !== datafield;
        //        });
        //        UifilterfiledsDataArray[i].filterfieldData = result;
        //    }
        //}
        //var result = $.grep(UifilterfiledsDataArray, function (e, i) {
        //    return e.filterfieldData !== '';
        //});
        //UifilterfiledsDataArray = result;   
        $("#" + gridid).jqxGrid('removefilter', datafield);
        $("#" + gridid).jqxGrid('closemenu');
        $(".UItxtfilterclass").val('');
        $('.UIbtnwildfilterClear').attr('disabled', true);
        var datainformations = $("#" + gridid).jqxGrid('getdatainformation');
        if (datainformations.rowscount > 0) {
            if (gridid == 'jqxgridAvailablePackage' || gridid == 'jqxgridAvailableKeys') {
                $("#btnForAllMoveright").removeClass('disabled');
            }
            $("#checkboxAll" + gridid + datafield).remove();
            $("#" + gridid).find('.jqx-grid-column-header:first').fadeTo('slow', 1);
        }
        var gridStorage = JSON.parse(sessionStorage.getItem(gridid + "gridStorage"));

        if (checkFlag) { } else {
            setUiHeaderCheckstyle(gridid);
        }

    }



}

function multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gId, checkArr, checkFlag) {

    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');

    var storedFilterArr = new Array();
    if (!_.isEmpty(filterInfo) && filterInfo.length > 0) {
        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                for (var j = 0; j < filterInfo[i].filter.getfilters().length; j++) {
                    storedFilterArr.push(filterInfo[i].filter.getfilters()[j].value);
                }

            }
        }
    }
    var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
    var strinput = '';

    var funcGridId = "'" + gId + "'";
    var funcfieldId = "'" + datafield + "'";
    strinput += '<div class="grid-pop" style="width:216px;">';
    strinput += '<div class="con-area checkboxdiv' + datafield + '" id="checkboxdiv' + gId + datafield + '" style="display: block;height: 110px;overflow-y: auto;width: 214px;">';
    for (var i = 0; i < checkArr.length; i++) {

        if ($.inArray(checkArr[i].ControlValue, storedFilterArr) < 0) {

            strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
            strinput += '<label>';
            strinput += '<input type="checkbox" class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;;
            strinput += '</label>';
            strinput += ' </div>';

        } else {

            strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
            strinput += '<label>';
            strinput += '<input type="checkbox" checked=true class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
            strinput += '</label>';
            strinput += ' </div>';

        }
    }
    strinput += '</div>';
    strinput += '<div class="btn-footer">';
    strinput += ' <button id="UiMultiChoiceFilterClear' + datafield + '"  class="btn btn-default UiMultiChoiceFilterClear" disabled=true>' + i18n.t('reset', {
        lng: lang
    }) + '</button>';
    strinput += ' <button id="UiMultiChoiceFilter' + datafield + '" class="btn btn-primary UiMultiChoiceFilter">' + i18n.t('go', {
        lng: lang
    }) + '</button>';
    strinput += ' </div>';
    strinput += '</div>';

    inputdiv.append(strinput);
    filterPanel.append(inputdiv);
    var filtersource = _.where(filterInfo, {
        datafield: datafield
    });


    if (filtersource.length > 0) {
        $(".UiMultiChoiceFilterClear").attr('disabled', false);
    }
    var dataSource = {
        localdata: dataAdapter.records,
        async: false
    }
    var dataadapter = new $.jqx.dataAdapter(dataSource, {
        autoBind: false,
        autoSort: true,
        async: false,
        uniqueDataFields: [datafield]
    });
    var column = $("#" + gId).jqxGrid('getcolumn', datafield);


    $('.UiMultiChoiceFilter').on("click", function () {
        var filtergroup = new $.jqx.filter();
        var filtertype = 'stringfilter';
        var checkedItems = new Array();
        var e = $(this).parent('div').prev('div').children('div');
        $(e).find("input:checkbox").each(function (i, ob) {
            if ($(ob).is(':checked')) {

                var obj = new Object();
                obj.value = $(ob).val();
                checkedItems.push(obj);
            }
        });

        for (var i = 0; i < checkedItems.length; i++) {

            var filter_or_operator = 1;
            var filtervalue = checkedItems[i].value;

            var filtercondition = 'equal';
            var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter);
        }




        // apply the filters.
        if (checkedItems.length > 0) {
            $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);
            $("#" + gId).jqxGrid('applyfilters');
            $("#" + gId).jqxGrid('closemenu');
            $(".UiMultiChoiceFilterClear").attr('disabled', false);
        }



    });

    $(".UiMultiChoiceFilterClear").on("click", function () {

        $(".checkboxdiv" + datafield).empty();
        var strinput = '';
        for (var i = 0; i < checkArr.length; i++) {



            strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
            strinput += '<label>';
            strinput += '<input type="checkbox" class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
            strinput += '</label>';
            strinput += ' </div>';


        }
        $(".checkboxdiv" + datafield).append(strinput);
        $("#" + gId).jqxGrid('removefilter', datafield);
        // apply the filters.
        $("#" + gId).jqxGrid('closemenu');
        $(".UiMultiChoiceFilterClear").attr('disabled', true);
        var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));

        storedFilterArr = [];

        if (checkFlag) {

        } else {
            setUiHeaderCheckstyle(gId);
        }

    });
    $(" #gridmenu" + gId + " ul li:first").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(1)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
    $(" #gridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
    $("#gridmenu" + gId).css("background-color", "transparent");

    $(".jqx-grid-column-filterbutton").on("click", function () {




    });

    $(".jqx-icon-arrow-down").on("click", function () {


        setTimeout(function () {

            var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');

            var storedFilterArr1 = new Array();
            for (i = 0; i < filterInfo.length; i++) {

                if (filterInfo[i].filtercolumn == datafield) {
                    for (var j = 0; j < filterInfo[i].filter.getfilters().length; j++) {

                        storedFilterArr1.push(filterInfo[i].filter.getfilters()[j].value);
                    }

                }
            }
            var id = "#checkboxdiv" + gId + datafield;
            $(id).empty();
            var newuistr = "";
            for (var i = 0; i < checkArr.length; i++) {

                if ($.inArray(checkArr[i].ControlValue, storedFilterArr1) < 0) {

                    newuistr += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
                    newuistr += '<label>';
                    newuistr += '<input type="checkbox" class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;;
                    newuistr += '</label>';
                    newuistr += ' </div>';

                } else {

                    newuistr += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
                    newuistr += '<label>';
                    newuistr += '<input type="checkbox" checked=true class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
                    newuistr += '</label>';
                    newuistr += ' </div>';

                }
            }
            $(id).append(newuistr);
        }, 200);
    });
}

function multichoiceFilterUISideDashBoard(filterPanel, datafield, dataAdapter, gId, checkArr, checkFlag) {


    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');

    var storedFilterArr = new Array();
    var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
    var strinput = '';

    var funcGridId = "'" + gId + "'";
    var funcfieldId = "'" + datafield + "'";
    strinput += '<div class="grid-pop" style="width:216px;">';
    strinput += '<div class="con-area checkboxdiv' + datafield + '" style="display: block;height: 110px;overflow-y: auto;width: 214px;">';
    for (var i = 0; i < checkArr.length; i++) {
        if (datafield == 'AlertName' || datafield == 'Status' || datafield == 'ComputedDeviceStatus') {
            if ($.inArray(checkArr[i].ControlValue, storedFilterArr) < 0) {

                strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
                strinput += '<label>';
                strinput += '<input type="checkbox" class="checkItem" value="' + checkArr[i].Value + '">' + checkArr[i].Value;;
                strinput += '</label>';
                strinput += ' </div>';

            } else {

                strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
                strinput += '<label>';
                strinput += '<input type="checkbox" checked=true class="checkItem" value="' + checkArr[i].Value + '">' + checkArr[i].Value;
                strinput += '</label>';
                strinput += ' </div>';

            }
        } else {

            if ($.inArray(checkArr[i].ControlValue, storedFilterArr) < 0) {

                strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
                strinput += '<label>';
                strinput += '<input type="checkbox" class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;;
                strinput += '</label>';
                strinput += ' </div>';

            } else {

                strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox" style="padding-left: 7px">';
                strinput += '<label>';
                strinput += '<input type="checkbox" checked=true class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
                strinput += '</label>';
                strinput += ' </div>';

            }

        }

    }
    strinput += '</div>';
    strinput += '<div class="btn-footer">';
    strinput += ' <button id="UiMultiChoiceFilterClear' + datafield + '"  class="btn btn-default " disabled=true>' + i18n.t('reset', {
        lng: lang
    }) + '</button>';
    strinput += ' <button id="UiMultiChoiceFilter' + datafield + '"  class="btn btn-primary UiMultiChoiceFilter' + datafield + '" >' + i18n.t('go', {
        lng: lang
    }) + '</button>';
    strinput += ' </div>';
    strinput += '</div>';

    inputdiv.append(strinput);
    filterPanel.append(inputdiv);
    var filtersource = _.where(filterInfo, {
        datafield: datafield
    });


    if (filtersource.length > 0) {
        $("#UiMultiChoiceFilterClear" + datafield).attr('disabled', false);
    }
    var dataSource = {
        localdata: dataAdapter.records,
        async: false
    }
    var dataadapter = new $.jqx.dataAdapter(dataSource, {
        autoBind: false,
        autoSort: true,
        async: false,
        uniqueDataFields: [datafield]
    });
    var column = $("#" + gId).jqxGrid('getcolumn', datafield);


    $(".UiMultiChoiceFilter" + datafield).on("click", function () {

        var filtergroup = new $.jqx.filter();
        var filtertype = 'stringfilter';
        var checkedItems = new Array();
        var e = $(this).parent('div').prev('div').children('div');
        $(e).find("input:checkbox").each(function (i, ob) {
            if ($(ob).is(':checked')) {

                var obj = new Object();
                obj.value = $(ob).val();
                checkedItems.push(obj);
            }
        });

        for (var i = 0; i < checkedItems.length; i++) {

            var filter_or_operator = 1;
            var filtervalue = checkedItems[i].value;

            var filtercondition = 'equal';
            var filter = filtergroup.createfilter(filtertype, filtervalue, filtercondition);
            filtergroup.addfilter(filter_or_operator, filter);
        }




        // apply the filters.
        if (checkedItems.length > 0) {
            $("#" + gId).jqxGrid('addfilter', datafield, filtergroup);
            $("#" + gId).jqxGrid('applyfilters');
            $("#" + gId).jqxGrid('closemenu');
            $("#UiMultiChoiceFilterClear" + datafield).attr('disabled', false);
        }



    });

    $("#UiMultiChoiceFilterClear" + datafield).on("click", function () {

        $(".checkboxdiv" + datafield).empty();
        var strinput = '';
        for (var i = 0; i < checkArr.length; i++) {



            strinput += '<div id="#multiCheckDiv' + datafield + '" class="checkbox">';
            strinput += '<label>';
            strinput += '<input type="checkbox" class="checkItem" value="' + checkArr[i].ControlValue + '">' + checkArr[i].Value;
            strinput += '</label>';
            strinput += ' </div>';


        }
        $(".checkboxdiv" + datafield).append(strinput);
        $("#" + gId).jqxGrid('removefilter', datafield);
        // apply the filters.
        $("#" + gId).jqxGrid('closemenu');
        $("#UiMultiChoiceFilterClear" + datafield).attr('disabled', true);
        var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
        if (checkFlag) {

        } else {
            setUiHeaderCheckstyle(gId);
        }

    });

    $(" #gridmenu" + gId).css("background-color", "transparent");
}

function getUiGridBiginEdit(gID, unitIdField, gridStorage, criteriaGroups) {

    $("#" + gID).on('cellbeginedit', function (event) {
        isGridChange = true;
        if (gID == "jqxgridAlertVFSSO" || gID == "jqxgridAlertVHQAD" || gID == "jqxgridAlertFR")
            $('#saveBtn').removeAttr('disabled');
        else if (gID == "jqxgridAlertSubscriptions")
            $('#btnSaveUserAlerts').removeAttr('disabled');
        else if (gID == "groupsGrid")
            $('#btnSave').removeAttr('disabled');

        var args = event.args;
        var datainfo = $("#" + gID).jqxGrid('getdatainformation');
        var selectedid = $("#" + gID).jqxGrid('getcellvalue', args.rowindex, unitIdField);
        var selectData = $("#" + gID).jqxGrid('getrowdata', args.rowindex);
        var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));
        if (args.value == false) {
            if (gridStorage[0].counter != datainfo.rowscount) {
                if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {
                    gridStorage[0].selectedDataArr.push(selectedid);
                    gridStorage[0].multiRowData.push(selectData);
                }
                gridStorage[0].unSelectedDataArr = jQuery.grep(gridStorage[0].unSelectedDataArr, function (value) {
                    return (value != selectedid && value != null);
                });
                gridStorage[0].counter = gridStorage[0].counter + 1;
                if (!_.isEmpty(criteriaGroups)) {
                    var arr = criteriaGroups();
                    var source = _.where(arr, {
                        GroupId: selectData.GroupId
                    });
                    if (source == '') {
                        isGroupModified = true;
                        criteriaGroups.push(selectData);
                    }
                }
            }
        } else {
            if (gridStorage[0].counter != 0) {
                if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                    gridStorage[0].unSelectedDataArr.push(selectedid);
                }
                gridStorage[0].selectedDataArr = jQuery.grep(gridStorage[0].selectedDataArr, function (value) {
                    return (value != selectedid && value != null);
                });
                gridStorage[0].multiRowData = jQuery.grep(gridStorage[0].multiRowData, function (value) {
                    var l = gridStorage[0].multiRowData.indexOf(selectData);
                    return (value != gridStorage[0].multiRowData[l] && value != null);
                });

                gridStorage[0].counter = gridStorage[0].counter - 1;
                if (!_.isEmpty(criteriaGroups)) {
                    for (var i = 0; i < criteriaGroups().length; i++) {
                        if (selectData.GroupId == criteriaGroups()[i].GroupId) {
                            criteriaGroups.splice(i, 1);
                        }
                    }
                }
            }
        }

        if ($("#btnSaveRFS").attr('id') == undefined) {

        } else {
            $("#btnCopyRFS").removeAttr('disabled');
            $('#btnSaveRFS').removeAttr('disabled');
        }

        if (gridStorage[0].counter == datainfo.rowscount) {
            if (gridStorage[0].checkAllFlag == 1) {
                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
            } else {
                if (gridStorage[0].counter == datainfo.rowscount) {

                    if (gID == 'jqxgridAlert') {
                        if (alertSelectedCount == datainfo.rowscount) {
                            gridStorage[0].checkAllFlag = 1;
                            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
                        } else {
                            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
                            return;
                        }
                    }
                    gridStorage[0].checkAllFlag = 1;
                    $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
                }
            }
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
        } else if (gridStorage[0].counter == 0) {
            if ($("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').hasClass('jqx-checkbox-check-checked')) {
                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');

            }
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');

        } else {
            $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
        }
        if (gID == 'jqxgridAvailablePackage' || gID == 'jqxgridAvailableActions' || gID == 'jqxgridAvailableKeys') {
            if (gridStorage[0].selectedDataArr.length > 0) {
                $("#btnForMoveRight").removeClass('disabled');
                $("#btnForMoveRight").removeAttr("disabled");
            } else {
                $("#btnForMoveRight").addClass('disabled');
                $("#btnForMoveRight").attr('disabled');
            }
        }
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
    });
}

function enableUiGridFunctions(gridId, unitIdField, element, gridStorage, checkboxflag, statusField, criteriaGroups, isEnabled) {

    $('.jqx-grid-pager').css("display", "inline");
    $('.jqx-grid-pager').css("z-index", "-1");
    var changePageflag = 0;
    checkhead = 0;
    pagechange = 0;



    $("#" + gridId).on("bindingcomplete", function () {
        initopenUIfilter = 0;

        //setTimeout(function () {
        $(" #gridmenu" + gridId).css("background-color", "transparent");

        if (UIgridClearFlag == 1) {
            gridStorage[0].checkAllFlag = 0;
            gridStorage[0].counter = 0;
            gridStorage[0].filterflage = 0;
            gridStorage[0].selectedDataArr = [];
            gridStorage[0].unSelectedDataArr = [];
            gridStorage[0].singlerowData = [];
            gridStorage[0].multiRowData = [];
            gridStorage[0].columnsArr = [];
            gridStorage[0].highlightedRow = null;
            gridStorage[0].highlightedPage = null;
            gridStorage[0].dataFields = [];
            $("#" + gridId).jqxGrid('clearselection');
        } else { }
        var datainfo = $("#" + gridId).jqxGrid('getdatainformation');

        if (gridStorage[0].filterflage == 1) {

            if (checkboxflag == false) {

                $("#columntable" + gridId).children('div').children('div').children('div:first').css("display", "none");
            } else {

                //$("#columntable" + gridId).children('div').children('div').children('div:first').children('div').css("display", "none");
                if (gridStorage[0].checkAllFlag == 1) {

                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');

                } else {

                    if (gridStorage[0].counter > 0) {
                        $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('partial-selection');
                    } else {
                        //$("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
                    }
                }
                if (datainfo.rowscount <= 0 || gridStorage[0].TotalSelectionCount == 0) {
                    if (checkboxflag) {
                        $("#" + gridId).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
                        $("#" + gridId).find('.jqx-grid-column-header:first').append('<div class="fadeDiv" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
                    }
                }
                //$("#" + gridId).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
                //$("#" + gridId).find('.jqx-grid-column-header:first').append('<div  class="fadeDiv" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
            }
        } else {


            if (datainfo.rowscount <= 0) {
                if (checkboxflag == false) {

                    $("#columntable" + gridId).children('div').children('div').children('div:first').css("display", "none");
                } else {

                    $("#" + gridId).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
                    $("#" + gridId).find('.jqx-grid-column-header:first').append('<div class="fadeDiv" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
                }
            }
            if (gridStorage[0].counter == datainfo.rowscount && gridStorage[0].counter != 0) {

                //if (gridStorage[0].checkAllFlag == 1) {
                $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');
                //}
                $("#" + gridId).find('.jqx-grid-column-header:first').find('span').removeClass('partial-selection');
            } else if (gridStorage[0].counter == 0) {
                if ($("#" + gridId).find('.jqx-grid-column-header:first').find('span').hasClass('jqx-checkbox-check-checked')) {
                    $("#" + gridId).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
                }
                $("#" + gridId).find('.jqx-grid-column-header:first').find('span').removeClass('partial-selection');
            } else {
                $("#" + gridId).find('.jqx-grid-column-header:first').find('span').addClass('partial-selection');
            }

            if (isEnabled == false) {
                $("#" + gridId).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
                $("#" + gridId).find('.jqx-grid-column-header:first').append('<div class="fadeDiv" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0.4;filter: alpha(opacity = 50)"></div>');
            }
        }

        var rows = $("#" + gridId).jqxGrid('getrows');
        for (var i = 0; i < rows.length; i++) {
            var boundindex = $("#" + gridId).jqxGrid('getrowboundindexbyid', rows[i].uid);
            var selectedid = rows[i][unitIdField];

            var selectData = $("#" + gridId).jqxGrid('getrowdata', boundindex);
            if (gridStorage[0].checkAllFlag == 0) {

                if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {

                    $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
                } else {

                    $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
                }
            }
            if (gridStorage[0].checkAllFlag == 1) {

                if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                    $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 1);
                    if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {
                        gridStorage[0].selectedDataArr.push(selectedid);
                        gridStorage[0].multiRowData.push(selectData);
                    }
                    gridStorage[0].unSelectedDataArr = jQuery.grep(gridStorage[0].unSelectedDataArr, function (value) {
                        return (value != selectedid && value != null);
                    });
                } else {
                    $("#" + gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', 0);
                    if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                        gridStorage[0].unSelectedDataArr.push(selectedid);
                    }
                    gridStorage[0].selectedDataArr = jQuery.grep(gridStorage[0].selectedDataArr, function (value) {
                        return (value != selectedid && value != null);
                    });
                    gridStorage[0].multiRowData = jQuery.grep(gridStorage[0].multiRowData, function (value) {

                        var k = gridStorage[0].multiRowData.indexOf(selectData);

                        return (value != gridStorage[0].multiRowData[k] && value != null);
                    });
                }
            }

        }

        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        UIgridClearFlag = 0;

        //}, 500);

        $("#" + gridId).jqxGrid('refresh');

        if (gridStorage[0].isGridReady == 1) {
            gridStorage[0].isgridState = $("#" + gridId).jqxGrid('savestate');
        }

    });
    $("#" + gridId).on('rowclick', function (event) {
        gridStorage[0].singlerowData = event.args.row.bounddata;
        var args = event.args;
        // row's bound index.
        var boundIndex = args.rowindex;
        // row's visible index.
        var visibleIndex = args.visibleindex;
        // right click.
        var rightclick = args.rightclick;
        // original event.
        var ev = args.originalEvent;
        //gridStorage[0].highlightedRow = gridStorage[0].singlerowData[unitIdField];
        //var updatedGridStorage = JSON.stringify(gridStorage);
        //window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
    });

    getUiCheckRendere(element, gridId, unitIdField, gridStorage, statusField, criteriaGroups);

}

function getUiCheckRendere(element, gID, unitIdField, gridStorage, statusField, criteriaGroups) {


    var gridId = "#" + gID;
    $(element).jqxCheckBox({
        width: 22,
        height: 16,
        animationShowDelay: 0,
        animationHideDelay: 0
    });
    columnCheckBox = $(element);
    $(element).on('change', function (event) {
        if (gID == "jqxgridAlertVFSSO" || gID == "jqxgridAlertVHQAD" || gID == "jqxgridAlertFR")
            $('#saveBtn').removeAttr('disabled');
        else if (gID == "jqxgridAlertSubscriptions")
            $('#btnSaveUserAlerts').removeAttr('disabled');

        var datainfo = $(gridId).jqxGrid('getdatainformation');
        if (gridId == '#availableModels' && datainfo.rowscount == 0) {

        } else {

            var checked = event.args.checked;
            var pageinfo = $(gridId).jqxGrid('getpaginginformation');
            var pagenum = pageinfo.pagenum;
            var pagesize = pageinfo.pagesize;
            if (checked == null) return;
            $(gridId).jqxGrid('beginupdate');
            var datainfo = $(gridId).jqxGrid('getdatainformation');
            if (checked) {

                gridStorage[0].checkAllFlag = 1;
                gridStorage[0].unSelectedDataArr = [];
                if (gridStorage[0].TotalSelectionCount != null) {
                    gridStorage[0].counter = gridStorage[0].TotalSelectionCount;
                } else {
                    gridStorage[0].counter = datainfo.rowscount;
                }
                checkhead = 0;
                $(gridId + "seleceteRowSpan").empty();
                $(gridId + "seleceteRowSpan").append(" " + gridStorage[0].counter);

                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').html()
                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');


            } else if (checked == false) {

                gridStorage[0].checkAllFlag = 0;
                gridStorage[0].selectedDataArr = [];
                gridStorage[0].counter = 0;
                checkhead = 0;
                $(gridId + "seleceteRowSpan").empty();
                $(gridId + "seleceteRowSpan").append(" " + 0);
                $("#columntable" + gID).children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');

            }

            var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
            selectedRows = $(gridId).jqxGrid('getselectedrowindexes');
            for (var i = startrow; i < startrow + pagesize; i++) {


                var boundindex = $(gridId).jqxGrid('getrowboundindex', i);
                var selectedid = $(gridId).jqxGrid('getcellvalue', boundindex, unitIdField);
                var selectData = $(gridId).jqxGrid('getrowdata', boundindex);
                var checkRight = '';
                if (statusField != undefined) {
                    checkRight = $(gridId).jqxGrid('getcellvalue', boundindex, statusField);

                }
                if (checkRight != "Basic Access") {
                    $(gridId).jqxGrid('setcellvalue', boundindex, 'isSelected', event.args.checked);

                    if (checked == false) {
                        if ($.inArray(selectedid, gridStorage[0].unSelectedDataArr) < 0) {
                            gridStorage[0].unSelectedDataArr.push(selectedid);
                        }
                        gridStorage[0].selectedDataArr = jQuery.grep(gridStorage[0].selectedDataArr, function (value) {
                            return (value != selectedid && value != null);
                        });
                        gridStorage[0].multiRowData = jQuery.grep(gridStorage[0].multiRowData, function (value) {
                            var l = gridStorage[0].multiRowData.indexOf(selectData);
                            return (value != gridStorage[0].multiRowData[l] && value != null);
                        });
                        if (criteriaGroups != undefined) {
                            criteriaGroups.remove(selectData);
                        }

                    } else {
                        if ($.inArray(selectedid, gridStorage[0].selectedDataArr) < 0) {
                            gridStorage[0].selectedDataArr.push(selectedid);
                            gridStorage[0].multiRowData.push(selectData);
                        }
                        gridStorage[0].unSelectedDataArr = jQuery.grep(gridStorage[0].unSelectedDataArr, function (value) {
                            return (value != selectedid && value != null);
                        });
                        if (criteriaGroups != undefined) {
                            var aarr = criteriaGroups();
                            var source = _.where(aarr, {
                                GroupId: selectData.GroupId
                            });
                            if (source == '') {
                                isGroupModified = true;
                                criteriaGroups.push(selectData);
                            }
                            var arr = criteriaGroups();

                        }
                    }

                }


            }
            if (gID == 'jqxgridAvailablePackage' || gID == 'jqxgridAvailableActions' || gID == 'jqxgridAvailableKeys') {
                if (gridStorage[0].selectedDataArr.length > 0) {
                    $("#btnForMoveRight").removeClass('disabled');
                    $("#btnForMoveRight").removeAttr("disabled");
                } else {
                    $("#btnForMoveRight").addClass('disabled');
                    $("#btnForMoveRight").attr('disabled');
                }
            }

            $(gridId).jqxGrid('endupdate');
            $(gridId).jqxGrid('refresh');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);

            if ($("#btnSaveRFS").attr('id') == undefined) {

            } else {
                $("#btnCopyRFS").removeAttr('disabled');
                $('#btnSaveRFS').removeAttr('disabled');
            }
        }

    });


}

function callUiGridFilter(gId, gridStorage) {
    $("#" + gId).on('filter', function (event) {

        if (gridStorage) {

            if (gridStorage[0].isGridReady == 1) {

                gridStorage[0].isgridState = $("#" + gId).jqxGrid('savestate');
                var updatedGridStorage = JSON.stringify(gridStorage);
                window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
            } else {

            }
        }



        gridStorage[0].filterflage = 1
        var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');

        if (filterInfo.length > 0) {
            // $("#" + gId).find('.jqx-grid-column-header:first').fadeTo('slow', .6);
            //  $("#" + gId).find('.jqx-grid-column-header:first').append('<div class="fadeDiv" style="position: absolute;top:0;left:0;width: 100%;height:100%;z-index:2;opacity:0;filter: alpha(opacity = 100)"></div>');
            //$("#columntable" + gId).children('div').children('div').children('div:first').children('div').css("display", "none");
            $("#" + gId).find('.jqx-grid-column-header:first').fadeIn();
            $(".fadeDiv").remove();

        } else {
            //$("#columntable" + gId).children('div').children('div').children('div:first').children('div').css("display", "block");
            //$("#" + gId).find('.jqx-grid-column-header:first').fadeOut('slow', .6);
            $("#" + gId).find('.jqx-grid-column-header:first').fadeIn();
            $(".fadeDiv").remove();
        }


    });
}

function setUiHeaderCheckstyle(gId) {
    var datainfo = $("#" + gId).jqxGrid('getdatainformation');
    selectedid = getSelectedUniqueId(gId);
    if (selectedid.length < datainfo.rowscount) {
        if (selectedid.length == 0) {
            $("#" + gId).find('.jqx-grid-column-header:first').find('span').removeClass('partial-selection');
            $("#" + gId).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
        } else {
            $("#" + gId).find('.jqx-grid-column-header:first').find('span').addClass('partial-selection');
            $("#" + gId).find('.jqx-grid-column-header:first').find('span').removeClass('jqx-checkbox-check-checked');
        }
    }
    if (selectedid.length == datainfo.rowscount) {

        $("#" + gId).find('.jqx-grid-column-header:first').find('span').removeClass('partial-selection');
        $("#" + gId).find('.jqx-grid-column-header:first').find('span').addClass('jqx-checkbox-check-checked');

    }
    var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');

    if (filterInfo.length == 0) {
        $("#" + gId).find('.jqx-grid-column-header:first').fadeIn('slow', .6);
        $(".fadeDiv").remove();
    } else {

    }



}

function saveUiGridState(gId) {
    var state = null;
    state = $("#" + gId).jqxGrid('savestate');
    return state;
}

function loadUiGridState(state, gId) {
    if (state) {

        $("#" + gId).jqxGrid('loadstate', state);
    } else {
        $("#" + gId).jqxGrid('loadstate');
    }
}

function refreshUiGrid(gId) {

    var state = null;
    state = $("#" + gId).jqxGrid('savestate');

    $("#" + gId).jqxGrid('updatebounddata');

    if (state) {
        $("#" + gId).jqxGrid('loadstate', state);
    } else {
        $("#" + gId).jqxGrid('loadstate');
    }
}

function clearUiGridFilter(gId) {
    UIgridClearFlag = 1;
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

    gridStorageObj.state = null;
    gridStorageObj.columnSortFilter = null;
    gridStorageObj.Pagination = null;
    gridStorageObj.isGridReady = 0;
    gridStorageObj.isgridState = '';
    gridStorageObj.adSearchObj = null;
    gridStorageObj.iscontentGrid = 2;
    gridStorageObj.isEditRow = null;

    gridStorageArr.push(gridStorageObj);
    var gridStorage = JSON.stringify(gridStorageArr);
    window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);

    $("#" + gId).jqxGrid('updatebounddata');
    $("#" + gId).jqxGrid("removesort");
    $("#" + gId).jqxGrid("clearfilters");



}

function dispalyTooltipAndIconRendererForReports(gID, row, column, value, defaultHtml) {
    var text = "Status: ";
    isCancelRequestFailedValue = false;

    //Cancel Requested
    if (value == "Cancel Requested" || value == "CancelRequested") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCancelled_requested_brown"></div></a>' + value + '</span></div>';
    }

    //Cancelled
    else if (value == "Cancelled") {
        defaultHtml = '<div class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusActive-cancelled_black"></div></a>' + value + '</span></div>';
    }

    //Download Failed
    else if (value == "Download Failed" || value == "DownloadFailed") {
        defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><i class="icon-download3"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
    }

    //Download Started
    else if (value == "Download Started" || value == "DownloadStarted") {
        defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div class="iconImg statusDownloadstarted"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
    }

    //Download Successful
    else if (value == "Download Successful" || value == "DownloadSuccessful") {
        defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg downloadSuccessfull"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
    }

    //Failed
    else if (value == "Failed") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    }

    //In Progress
    else if (value == "In Progress" || value == "InProgress") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
    }

    //Install Failed
    else if (value == "Install Failed" || value == "InstallFailed") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusInstall_failed"></div></a>' + value + '</span></div>';
    }

    //Install Successful
    else if (value == "Install Successful" || value == "InstallSuccessful") {
        defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusInstall_successful"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
    }

    //Content Replace Failed
    else if (value == "Content Replace Failed" || value == "ContentReplaceFailed") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
    }

    //Schedule Sent
    else if (value == "Schedule Sent" || value == "Schedule sent" || value == "ScheduleSent") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
    }
    //Schedule Confirmed
    else if (value == "Schedule Confirmed" || value == "ScheduleConfirmed") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
    }
    //Scheduled
    else if (value == "Scheduled") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
    }

    //Scheduling
    else if (value == "Scheduling") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
    }

    //Successful
    else if (value == "Successful") {
        defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color:green" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    }

    return defaultHtml;
}

// depend on job status column dispaly tooltip and icon
function displayTooltipAndIconRenderer(gID, row, column, value, defaultHtml, screenId) {

    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    if (rowData == null)
        return;

    var isCancelRequestFailedValue = $("#" + gID).jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');
    var text = "Status: ";
    var reason = "Reason: ";
    //if (value == "Failed" || value == "Install Failed" || value == "Content Replace Failed" || value == 'Schedule Sent' ||
    //    value == "Active" || value == "Completed") {

    var reasonForValue;
    if (screenId == 1) {
        reasonForValue = rowData.JobDownloadFailedReason;           //Download Job Status, Device Profile Download Details, Device Profile Content Details
    } else if (screenId == 2) {
        reasonForValue = rowData.AdditionalStatusInfo;              //Detailed Download Status, Content Job Status, Detailed Content Status, Device Profile Downoad Jobs, Device Profile Content Jobs, Action Job Status, Detailed Action Status, Device Profile Action Jobs, Device Profile Action Details
    }

    //Failed
    if (value == "Failed") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusDwlFialed_brown"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusDwlFialed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Install Failed
    else if (value == "Install Failed" || value == "InstallFailed") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusInstall_failed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusInstall_failed_brown"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusInstall_failed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusInstall_failed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Content Replace Failed
    else if (value == "Content Replace Failed" || value == "ContentReplaceFailed") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusContentReplacedFailed_brown"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;height="60" width="50"><div class="iconImg statusContentReplacedFailed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Schedule Sent
    else if (value == "Schedule Sent" || value == "Schedule sent" || value == "ScheduleSent") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><div class="iconImg statusScheduled_sent-brown"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusScheduled_sent-brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Schedule Confirmed
    else if (value == "Schedule Confirmed" || value == "ScheduleConfirmed") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><div class="iconImg statusSchedule_confirmed-brown"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusSchedule_confirmed-brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Active
    else if (value == "Active") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><div class="iconImg statusActive-brown"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusActive-brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Completed
    else if (value == "Completed") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCompleted"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCompleted_brown"></div></a>' + value + '</span></div>';

            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span  title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCompleted"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span  title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCompleted_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Cancel Requested
    else if (value == "Cancel Requested" || value == "CancelRequested") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCancelled_requested_brown"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-status-image"><span  title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCancelled_requested_brown"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><div class="icon-download3"></div></a>' + value + '</span></div>';
            }

        }
    }

    //Cancelled
    else if (value == "Cancelled") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusActive-cancelled_black"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><div class="iconImg statusActive-cancelled_black"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: black" height="60" width="50"><div class="iconImg statusActive-cancelled_black"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><div class="iconImg statusActive-cancelled_black"></div></a>' + value + '</span></div>';
            }
        }
    }

    //In Progress
    else if (value == "In Progress" || value == "InProgress") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class=" iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusIn_progress-brown"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusIn_progress-brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Scheduled
    else if (value == "Scheduled") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            }

        }
    }

    //Successful
    else if (value == "Successful") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color:green" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color:brown" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color:green" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + reasonForValue + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color:brown" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
            }

        }
    }

    //Scheduling
    else if (value == "Scheduling") {
        if (reasonForValue == null || reasonForValue == "") {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
            } else {
                //defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><i class="statusScheduling"></i></a>' + value + '</span></div>';
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduling_purple"></div></a>' + value + '</span></div>';
            }
        } else {

            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalStatusInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduling"></div></a>' + value + '</span></div>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalStatusInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusScheduling"></div></a>' + value + '</span></div>' + value + '</span></div>';
            }

        }
    } else if (value == "Install Successful" || value == "InstallSuccessful") {
        if (reasonForValue == undefined || reasonForValue == null || reasonForValue == "" || rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusInstall_successful"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusInstall_successful"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    } else if (value == "Download Successful" || value == "DownloadSuccessful") {
        if (reasonForValue == undefined || reasonForValue == null || reasonForValue == "" || !rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg downloadSuccessfull"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg downloadSuccessfull"></div></a>' + value + '</span></div>';
        }
    } else if (value == "Download Failed" || value == "DownloadFailed") {
        if (reasonForValue == undefined || reasonForValue == null || reasonForValue == "" || rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><i class="icon-download3"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><i class="icon-download3"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    } else if (value == "Pending") {
        defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="padding-left: 0px; color: rgba(49, 176, 213, 1)" height="60" width="50"><i class="icon-history"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
    }
    return defaultHtml;
}

function displayTooltipAndIconRendererForVRK(gID, row, column, value, defaultHtml) {

    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    var isCancelRequestFailedValue = $("#" + gID).jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');
    var text = "Status: ";
    var reason = "Reason: ";
    //if (value == "Failed" || value == "Install Failed" || value == "Content Replace Failed" || value == 'Schedule Sent' ||
    //    value == "Active" || value == "Completed") {

    //Download Failed
    if (value == "Download Failed") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><i class="icon-download3"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><i class="icon-download3"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Failed
    if (value == "Failed") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="font-size:16px;padding-left: 0px; color: red" height="60" width="50"><i class="icon-download3"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><a  id="imageId" class="btn default" style="font-size:16px;padding-left: 0px; color: red" height="60" width="50"><i class="icon-download3"></i></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Install Successful
    if (value == "Install Successful") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusInstall_successful"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusInstall_successful"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }
    //Install Failed
    else if (value == "Install Failed") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusInstall_failed"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusInstall_failed"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Content Replace Failed
    else if (value == "Content Replace Failed") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
        }
    }

    //Schedule Sent
    else if (value == "Schedule Sent") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusScheduled_sent"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
        }
    }
    //Schedule Confirmed
    else if (value == "Schedule Confirmed" || value == "ScheduleConfirmed") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusSchedule_confirmed"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
        }
    }
    //Active
    else if (value == "Active") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
        }
    }

    //Completed
    else if (value == "Completed") {
        if (rowData.AdditionalInfo == null || rowData.AdditionalInfo == "") {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCompleted"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCompleted"></div></a>' + value + '</span></div>';
        }
    }

    //Cancel Requested
    else if (value == "Cancel Requested") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCancelled_requested_brown"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusCancelled_requested_brown"></div></a>' + value + '</span></div>';
        }
    }

    //Cancelled
    else if (value == "Cancelled") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div class="iconImg statusActive-cancelled_black"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div class="iconImg statusActive-cancelled_black"></div></a>' + value + '</span></div>';
        }

    }

    //In Progress
    else if (value == "In Progress") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class=" iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div class=" iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        }
    }

    //Scheduled
    else if (value == "Scheduled") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: purple" height="60" width="50"><div class="iconImg statusScheduled_purple"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: purple" height="60" width="50"><div class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
        }
    }

    //Successful
    else if (value == "Successful") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-icon"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="font-size:16px; padding-left: 0px; color: green" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="font-size:16px; padding-left: 0px; color: green" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
        }
    }
    //Download Successful
    if (value == "Download Successful") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg downloadSuccessfull"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div class="iconImg downloadSuccessfull"></div></a>' + value + '</span></div>';
        }
    }

    //Download Started
    if (value == "Download Started") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div class="iconImg statusDownloadstarted"></div></a><span style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div class="iconImg statusDownloadstarted"></div></a>' + value + '</span></div>';
        }
    }
    //Scheduling
    else if (value == "Scheduling") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: blue" height="60" width="50"><div class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: blue" height="60" width="50"><div class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
        }
    } else if (value == "Pending") {
        defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;   color: rgba(49, 176, 213, 1); font-size:16px;" height="60" width="50"><i class="icon-history"></i></a>' + value + '</span></div>';
    }
    //} else {
    //if (value == "Cancel Requested") {
    //    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #4d4d4d" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    //} else if (value == "Cancelled") {
    //    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    //} else if (value == "In Progress") {
    //    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #ffc89a" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    //} else if (value == "Scheduled") {
    //    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #ffd700" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    //} else if (value == "Successful") {
    //    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color:green" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    //} else if (value == "Scheduling") {
    //    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #412d61" height="60" width="50"><i class="icon-download3"></i></a>' + value + '</span></div>';
    //}
    //}
    //Install Postponed
    else if (value == "Install Postponed") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        }
    }
    //User Install Postponed
    else if (value == "User Install Postponed") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        }
    }
    //Pending Install Confirmation
    else if (value == "Pending Install Confirmation") {
        if (!rowData.AdditionalInfo) {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: blue" height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: blue" height="60" width="50"><div class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        }
    }
    return defaultHtml;
}

function displayTooltipIconRendererForViewResults(gID, row, column, value, defaultHtml) {

    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    var taskId = $("#" + gID).jqxGrid('getcellvalue', row, 'TaskId');
    var isCancelRequestFailedValue = $("#" + gID).jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');
    var text = "Status: ";
    var reason = "Reason: ";
    //if (value == "Failed" || value == "Install Failed" || value == "Content Replace Failed" || value == 'Schedule Sent' ||
    //    value == "Active" || value == "Completed") {

    //Download Failed
    if (value == "Download Failed") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-icon"><a title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '" id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><a  title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Failed
    else if (value == "Failed") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-icon"><a title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '" id="imageId" class="btn default" style="font-size:16px;padding-left: 0px; color: red" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="font-size:16px;padding-left: 0px; color: red" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Install Successful
    else if (value == "Install Successful") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_successful"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_successful"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }
    //Install Failed
    else if (value == "Install Failed") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '" id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_failed"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_failed"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Content Replace Failed
    else if (value == "Content Replace Failed") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
        }
    }

    //Schedule Sent
    else if (value == "Schedule Sent") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '" id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_sent"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '" ><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
        }
    }
    //Schedule Confirmed
    else if (value == "Schedule Confirmed" || value == "ScheduleConfirmed") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '" id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusSchedule_confirmed"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '" ><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
        }
    }
    //Active
    else if (value == "Active") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
        }
    }

    //Completed
    else if (value == "Completed") {
        if (rowData.AdditiionalStatusIfo == null || rowData.AdditiionalStatusIfo == "") {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusCompleted"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusCompleted"></div></a>' + value + '</span></div>';
        }
    }

    //Cancel Requested
    else if (value == "Cancel Requested") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusCancelled_requested_brown"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusCancelled_requested_brown"></div></a>' + value + '</span></div>';
        }
    }

    //Cancelled
    else if (value == "Cancelled") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusActive-cancelled_black"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusActive-cancelled_black"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //In Progress
    else if (value == "In Progress") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px;  height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class=" iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        }
    }

    //Scheduled
    else if (value == "Scheduled") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: purple" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: purple" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_purple"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Success
    else if (value == "Success") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="font-size:16px; padding-left: 0px; color: green" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="font-size:16px; padding-left: 0px; color: green" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        }
    }

    //Successful
    else if (value == "Successful") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="font-size:16px; padding-left: 0px; color: green" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="font-size:16px; padding-left: 0px; color: green" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        }
    }

    //Download Successful
    else if (value == "Download Successful") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg downloadSuccessfull"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg downloadSuccessfull"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Download Started
    else if (value == "Download Started") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDownloadstarted"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDownloadstarted"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    //Download Inprogress
    else if (value == "Download InProgress") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }
    //Install Started
    else if (value == "Installation Started") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }
    //Install Inprogress
    else if (value == "Installation InProgress") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }
    //Scheduling
    else if (value == "Scheduling") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: blue" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: blue" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
        }
    }
    //Install Postponed
    else if (value == "Install Postponed") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        }
    }
    //User Install Postponed
    else if (value == "User Install Postponed") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-icon"><span id="status' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
        }
    }
    //Pending Install Confirmation
    else if (value == "Pending Install Confirmation") {
        if (rowData.AdditiionalStatusIfo) {
            defaultHtml = '<div  class="vf-status-image"><span id="status' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.AdditiionalStatusIfo + '"><a  id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
        } else {
            defaultHtml = '<div  class="vf-status-image"><a title="' + text + '' + value + '" id="imageId" class="btn default" style="padding-left: 0px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a><span id="status' + taskId + '" style="padding-left:0px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    return defaultHtml;
}

function displayTooltipUserTaskStatus(gID, row, column, value, defaultHtml) {
    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    var text = "Status: ";
    var reason = "Reason: ";
    if (_.isEmpty(rowData))
        return;

    //Failed
    if (value == "Failed") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div style="padding-left: 5px; padding-top:5px;"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div style="padding-left: 5px; padding-top:5px;"><span title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }
    //Success
    else if (value == "Success") {
        if (rowData.AdditionalInfo) {
            defaultHtml = '<div style="padding-left: 5px; padding-top:5px;"><span title="' + text + '' + value + '\n' + reason + '' + rowData.AdditionalInfo + '">' + value + '</span></div>';
        } else {
            defaultHtml = '<div style="padding-left: 5px; padding-top:5px;"><span title="' + text + '' + value + '">' + value + '</span></div>';
        }
    }

    return defaultHtml;
}

function displayTooltipForDownloadDuration(gID, row, column, value, defaultHtml) {
    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    var text = "Details: ";

    if (_.isEmpty(rowData)) {
        return;
    }

    if (rowData.DownloadAttempts && rowData.DownloadAttempts != '') {
        return '<div style="padding-left:5px;padding-top:6px;overflow:hidden;text-overflow:ellipsis;"><span style="cursor:pointer" title=" ' + text + '' + rowData.DownloadAttempts + '"> ' + value + ' </span></div>';
    } else {
        return '<div style="padding-left:5px;padding-top:6px;"> ' + value + ' </div>';
    }
}

// tabindex for confirmation popup
//function setTabindexForConfirmationPopUp(x, confirmationTabID, y) {
//    console.log(x);
//    confirmationStartIndex = 2;
//    confirmationLastIndex = x;
//    confirmationPrevIndex = y;
//    confirmationtabLimitInID = confirmationTabID;
//}
//end



function genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID) {
    var isDevicesAllowed = userHasViewAccess("Devices");
    var data = $("#" + gID).jqxGrid('getrowdata', row);
    var href = null;
    var html = '';
    if (data == null)
        return;

    if (!isDevicesAllowed) {
        html = '<div class="serial-Number-txt" style="padding-left:10px;padding-top:9px;"><a tabindex="0" onclick="ShowDeviceRightAlert()" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
    } else {
        serialrenderGridId = gID;
        //html = '<div style="padding-left:10px;padding-top:9px;"><a href="index.html#deviceProfile/' + data.UniqueDeviceId + '" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'
        html = '<div class="serial-Number-txt" style="padding-left:10px;padding-top:9px;"><a tabindex="0" onclick="gotoDeviceProfile(' + data.UniqueDeviceId + ')" style="text-decoration:underline;" title="View Profile" >' + value + '</a></div>'

    }
    return html;
}

function HierarchyPathRenderer(row, columnfield, value, defaulthtml, columnproperties) {
    return '<span style="margin: 4px; margin-top:7px; float: ' + columnproperties.cellsalign + ';">' + value + '</span>';
}

function gotoDeviceProfile(UniqueDeviceId) {
    reloadScrollBars();
    isHighlightedPage = 1;
    globalUniqueDeviceId = UniqueDeviceId;

    var gridStorage = JSON.parse(sessionStorage.getItem(serialrenderGridId + "gridStorage"));
    if (gridStorage) {
        gridStorage[0].highlightedRow = null;
        gridStorage[0].highlightedPage = 0;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(serialrenderGridId + 'gridStorage', updatedGridStorage);
    }
    window.sessionStorage.setItem("DevProfileUniqueDeviceId", UniqueDeviceId);
    $(".overflow-strip").removeClass("displayBlock");
    window.location.hash = "deviceProfileLite/device/deviceProfileLite";
    $("#mainMenuUl").children("li").children("ul").children("li").children("a").removeClass('active');
    $("#mainMenuUl").children("li").children("ul").children("li").each(function () {
        $(this).children("ul").children("li").children("a").removeClass('active');
    });
}

function ShowDeviceRightAlert() {
    openAlertpopup(1, 'user_does_not_have_privilege');
}


function initChartStorageObj(chartName, week, dateTo, dateFrom, deviceSearchObj) {

    var chartlistArr = new Array();
    chartlistArr = JSON.parse(sessionStorage.getItem("chartlist"));
    if ($.inArray(chartName + 'chartStorage', chartlistArr) < 0) {
        if (chartlistArr)
            chartlistArr.push(chartName + 'chartStorage');
    }
    var chartlist = JSON.stringify(chartlistArr);
    window.sessionStorage.setItem('chartlist', chartlist);

    var adlistArr = new Array();
    adlistArr = JSON.parse(sessionStorage.getItem("adlist"));
    if ($.inArray(chartName + 'adStorage', adlistArr) < 0) {
        if (adlistArr)
            adlistArr.push(chartName + 'adStorage');
    }
    var adlist = JSON.stringify(adlistArr);
    window.sessionStorage.setItem('adlist', adlist);




    var chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
    if (chartStorage == null) {
        var chartStorageArr = new Array();

        var chartStorageObj = new Object();
        chartStorageObj.name = chartName;
        chartStorageObj.week = week;
        chartStorageObj.fromDate = dateFrom;
        chartStorageObj.toDate = dateTo;
        chartStorageObj.isInit = 0;


        ////
        chartStorageArr.push(chartStorageObj);
        var chartStorage = JSON.stringify(chartStorageArr);
        window.sessionStorage.setItem(chartName + 'chartStorage', chartStorage);
        chartStorage = JSON.parse(sessionStorage.getItem(chartName + "chartStorage"));
    } else {
        //if (CallType != undefined) {
        //    CallType = gridStorage[0].CallType;
        //}
        //gridStorage[0].isGridReady = 0;
        //var updatedGridStorage = JSON.stringify(gridStorage);
        //window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
    }

    var adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));
    if (adStorage == null) {


        var adStorageArr = new Array();

        var adStorageObj = new Object();
        adStorageObj.isAdSearch = 0;
        adStorageObj.adSearchObj = null;
        adStorageObj.quickSearchObj = null;
        adStorageObj.searchText = null;
        adStorageObj.quickSearchName = null;
        adStorageObj.AdvancedSearchHierarchy = null;
        adStorageObj.AdvancedSearchGroup = null;
        adStorageObj.isWithGroup = 0;
        adStorageObj.isFromDevice = 0;

        adStorageArr.push(adStorageObj);
        var adStorage = JSON.stringify(adStorageArr);
        window.sessionStorage.setItem(chartName + 'adStorage', adStorage);
        adStorage = JSON.parse(sessionStorage.getItem(chartName + "adStorage"));
    } else { }



    var obj = new Object();
    obj.chartStorage = chartStorage;
    obj.adStorage = adStorage;
    if (CallType != undefined) {
        obj.CallType = CallType;
    }

    return obj;

}


function updateOnState(chartName, SearchObj, adStorage) {




    if (SearchObj) {
        if (adStorage[0].isAdSearch == 0) {

            if (SearchObj.SearchText || SearchObj.SearchText != undefined) {
                adStorage[0].adSearchObj = SearchObj;
                adStorage[0].quickSearchObj = null;
                adStorage[0].searchText = null;
                adStorage[0].quickSearchName = null;

            } else {

                adStorage[0].adSearchObj = null;
                adStorage[0].AdvancedSearchHierarchy = null;
                adStorage[0].AdvancedSearchGroup = null;
                adStorage[0].isWithGroup = 0;
            }
        } else {
            if (SearchObj.SearchText || SearchObj.SearchText != undefined) {

                adStorage[0].quickSearchObj = SearchObj;
                //adStorageObj.searchText = null;
                //adStorageObj.quickSearchName = null;
                adStorage[0].adSearchObj = null;
                adStorage[0].AdvancedSearchHierarchy = null;
                adStorage[0].AdvancedSearchGroup = null;
                adStorage[0].isWithGroup = 0;
            } else {
                adStorage[0].quickSearchObj = null;
            }
        }
    }


    var updatedAdStorage = JSON.stringify(adStorage);
    window.sessionStorage.setItem(chartName + 'adStorage', updatedAdStorage);



    if (SearchObj) {

        if (SearchObj.SearchText || SearchObj.SearchText != undefined) {

            $("#criteriabtnDiv").css("display", "inline");
            $("#resetBtnForChart").removeClass('hide');
            $("#resetBtnForGrid").addClass('hide');
            $("#deviceCriteriaDiv").empty();
            if (adStorage[0].isAdSearch == 0) {

                $("#deviceCriteriaDiv").append(SearchObj.SearchText);
                $("#txtQuickSearchDevice").val('');
            } else {

                $("#deviceCriteriaDiv").append(adStorage[0].searchText);
                $("#txtQuickSearchDevice").val(adStorage[0].quickSearchName);

            }
        } else {

            $("#txtQuickSearchDevice").val('');
            $("#criteriabtnDiv").css("display", "none");
            $("#resetBtnForChart").addClass('hide');
            $("#resetBtnForGrid").addClass('hide');
        }
    } else {

        $("#txtQuickSearchDevice").val('');
    }

}


function initPageStorageObj(pageName) {


    var PagelistArr = new Array();
    if (!_.isEmpty(sessionStorage.getItem("Pagelist"))) {
        PagelistArr = JSON.parse(sessionStorage.getItem("Pagelist"));
        if ($.inArray(pageName + 'PageStorage', PagelistArr) < 0) {
            if (PagelistArr)
                PagelistArr.push(pageName + 'PageStorage');
        }
        var Pagelist = JSON.stringify(PagelistArr);
        window.sessionStorage.setItem('Pagelist', Pagelist);
    }

    if (!_.isEmpty(sessionStorage.getItem(pageName + "PageStorage"))) {
        var PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
        if (PageStorage == null) {
            var PageStorageArr = new Array();

            var PageStorageObj = new Object();
            PageStorageObj.name = "";
            PageStorageObj.counter = 0;
            PageStorageObj.filterflage = 0;
            PageStorageObj.selectedDataArr = [];
            PageStorageObj.unSelectedDataArr = [];
            PageStorageObj.singlerowData = [];
            PageStorageObj.multiRowData = [];
            PageStorageObj.TotalSelectionCount = null;
            PageStorageObj.columnSortFilter = null;
            PageStorageObj.Pagination = null;
            PageStorageObj.SysConfig = "";
            PageStorageObj.PagNo = 1;
            PageStorageObj.selectedTabName = null;
            PageStorageObj.selectedVerticalTabName = null;

            PageStorageArr.push(PageStorageObj);
            PageStorage = JSON.stringify(PageStorageArr);
            window.sessionStorage.setItem(pageName + 'PageStorage', PageStorage);
            PageStorage = JSON.parse(sessionStorage.getItem(pageName + "PageStorage"));
        }
    }

    var obj = new Object();
    obj.PageStorage = PageStorage;
    return obj;

}

function initGridStorageObj(gID, CallType, isFilter) {
    if (CallType == null) {
        CallType = undefined;
    }

    var gridStorageId = gID;
    if (gID == 'jqxgridForSelectedDevicesdiagnostics' || gID == 'jqxgridForSelectedDevicesmanageContents' || gID == 'jqxgridForSelectedDevicesdownloads') {
        gridStorageId = 'jqxgridForSelectedDevices';
    }
    var gridlistArr = new Array();
    if (sessionStorage.getItem("gridlist") != '') {
        gridlistArr = JSON.parse(sessionStorage.getItem("gridlist"));
    }
    if (gridlistArr) {
        if ($.inArray(gID + 'gridStorage', gridlistArr) < 0) {
            gridlistArr.push(gID + 'gridStorage');
        }
    }
    var gridlist = JSON.stringify(gridlistArr);
    window.sessionStorage.setItem('gridlist', gridlist);

    var adlistArr = new Array();
    if (sessionStorage.getItem("adlist") != '') {
        adlistArr = JSON.parse(sessionStorage.getItem("adlist"));
    }
    if (adlistArr) {
        if ($.inArray(gID + 'adStorage', adlistArr) < 0) {
            adlistArr.push(gID + 'adStorage');
        }
    }
    var adlist = JSON.stringify(adlistArr);
    window.sessionStorage.setItem('adlist', adlist);
    var gridStorage = null;
    var adStorage = null;
    if (sessionStorage.getItem(gridStorageId + "gridStorage") != '') {
        gridStorage = JSON.parse(sessionStorage.getItem(gridStorageId + "gridStorage"));
    }
    if (sessionStorage.getItem(gID + "adStorage") != '') {
        adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
    }

    if (isFilter != undefined && !isFilter) {
        gridStorage = null;
        adStorage = null;
    }

    if (gridStorage == null) {
        //alert('is null');
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
        ////new for statemang
        gridStorageObj.state = null;
        gridStorageObj.columnSortFilter = null;
        gridStorageObj.Pagination = null;
        gridStorageObj.isGridReady = 0;
        gridStorageObj.isgridState = '';
        gridStorageObj.adSearchObj = null;
        gridStorageObj.iscontentGrid = 2;
        gridStorageObj.isEditRow = null;
        gridStorageObj.resizedColumns = [];
        gridStorageObj.isColumnReordered = false;

        if (CallType != undefined) {
            if (CallType == ENUM.get("CALLTYPE_DAY")) {
                gridStorageObj.CallType = ENUM.get("CALLTYPE_DAY");
            } else {
                gridStorageObj.CallType = ENUM.get("CALLTYPE_WEEK");
            }
            gridStorageObj.isdefaultfilter = 0;
        } else {
            gridStorageObj.isdefaultfilter = 1;
        }
        ////
        gridStorageArr.push(gridStorageObj);
        var gridStorage = JSON.stringify(gridStorageArr);
        window.sessionStorage.setItem(gridStorageId + 'gridStorage', gridStorage);
        gridStorage = JSON.parse(sessionStorage.getItem(gridStorageId + "gridStorage"));
    } else {
        if (CallType != undefined) {
            CallType = gridStorage[0].CallType
            if (gridStorage[0].isgridState) { } else {
                gridStorage[0].isdefaultfilter = 0;
            }

        }

        //alert(gridStorage[0].isGridReady);
        gridStorage[0].isGridReady = 0;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridStorageId + 'gridStorage', updatedGridStorage);
    }


    if (adStorage == null) {


        var adStorageArr = new Array();

        var adStorageObj = new Object();
        adStorageObj.isAdSearch = 0;
        adStorageObj.adSearchObj = null;
        adStorageObj.quickSearchObj = null;
        adStorageObj.searchText = null;
        adStorageObj.quickSearchName = null;
        adStorageObj.AdvancedSearchHierarchy = null;
        adStorageObj.AdvancedSearchGroup = null;
        adStorageObj.isWithGroup = 0;
        adStorageObj.isFromDevice = 0;
        adStorageObj.isQuickSearchApplied = 0;
        adStorageObj.selectedIds = [];
        adStorageObj.unSelectedIds = [];
        adStorageArr.push(adStorageObj);
        var adStorage = JSON.stringify(adStorageArr);
        window.sessionStorage.setItem(gID + 'adStorage', adStorage);
        adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
    } else { }



    var obj = new Object();
    obj.gridStorage = gridStorage;
    obj.adStorage = adStorage;
    if (CallType != undefined) {
        obj.CallType = CallType;
    }

    return obj;

}

function callOnGridReady(gID, gridStorage, CallType, callTpeFeild) {

    if (_.isEmpty(gridStorage)) {
        return;
    }

    var isColumnFiltered = false;
    var isColumnSorted = false;
    var isColumnResized = false;
    var isColumnReordered = false;
    if (gridStorage[0].isgridState) {
        if (gridStorage[0].isgridState.filters && gridStorage[0].isgridState.filters.filterscount > 0) {
            isColumnFiltered = true;
        }
        if (gridStorage[0].isgridState.sortdirection && (gridStorage[0].isgridState.sortdirection.ascending !== false || gridStorage[0].isgridState.sortdirection.descending !== false)) {
            isColumnSorted = true;
        }
        if (gridStorage[0].resizedColumns && gridStorage[0].resizedColumns.length > 0) {
            isColumnResized = true;
        }
        if (gridStorage[0].isColumnReordered == true) {
            isColumnReordered = true;
        }
    }

    if (isColumnFiltered || isColumnSorted || isColumnResized || isColumnReordered) {

        if (CallType != undefined && CallType != null) {
            CallType = gridStorage[0].CallType;
        }
        $("#" + gID).jqxGrid('loadstate', gridStorage[0].isgridState);

        if (gridStorage[0].Pagination) {

            if (gridStorage[0].Pagination.PageNumber != 1) {

                $("#" + gID).jqxGrid('gotopage', gridStorage[0].Pagination.PageNumber - 1);
            }
        }

        var cols = $("#" + gID).jqxGrid("columns");

        if (cols.records != null) {

            if (cols.records.length != null && cols.records.length != undefined) {
                for (var i = 0; i < cols.records.length; i++) {
                    if (cols.records[i].text != '' && gID != 'jqxgridLincenseDetails' && cols.records[i].text != null) {
                        if (cols.records[i].datafield != undefined && cols.records[i] != undefined) {
                            $("#" + gID).jqxGrid('setcolumnproperty', cols.records[i].datafield, 'width', 'auto');
                        }
                    } else {
                        if (gID == 'jqxgridLincenseDetails') {
                            $("#" + gID).jqxGrid('setcolumnproperty', cols.records[i].datafield, 'minwidth', 250);
                            $("#" + gID).jqxGrid('setcolumnproperty', cols.records[i].datafield, 'width', 250);
                        } else {
                            if (cols.records[i].datafield == 'isSelected') {
                                $("#" + gID).jqxGrid('setcolumnproperty', cols.records[i].datafield, 'width', 40);
                            }
                        }
                    }
                }
            }
        }

        if (gridStorage[0].resizedColumns && gridStorage[0].resizedColumns.length > 0) {
            for (var i = 0; i < gridStorage[0].resizedColumns.length; i++) {
                $('#' + gID).jqxGrid('setcolumnproperty', gridStorage[0].resizedColumns[i].column, 'width', gridStorage[0].resizedColumns[i].width);
            }
        }
    } else {

        if (gridStorage[0].Pagination) {

            if (gridStorage[0].Pagination.PageNumber != 1) {

                $("#" + gID).jqxGrid('gotopage', gridStorage[0].Pagination.PageNumber - 1);
            }
        }
        if (CallType != undefined && CallType != null) {

            CallType = gridStorage[0].CallType;
            //addDefaultfilter(gridStorage[0].CallType, callTpeFeild, gID);
        }
    }
    gridStorage[0].isdefaultfilter = 1;
    gridStorage[0].isGridReady = 1;
    var updatedGridStorage = JSON.stringify(gridStorage);

    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);

    var gridheight = $(window).height();
    gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 34;
    //grid minimum height is set to 250px
    if (gridheight < 250) {
        gridheight = 250;
    }
    if (gID != 'jqxgridLincenseDetails') {
        $("#" + gID).jqxGrid({
            height: gridheight
        });
    }
}


function callOnGridReadySchedule(gID, gridStorage, strGID) {

    if (gridStorage[0].isgridState) {
        $("#" + gID).jqxGrid('loadstate', gridStorage[0].isgridState);
        if (gridStorage[0].Pagination) {

            if (gridStorage[0].Pagination.PageNumber != 1) {

                $("#" + gID).jqxGrid('gotopage', gridStorage[0].Pagination.PageNumber - 1);
            }
        }

        var cols = $("#" + gID).jqxGrid("columns");
        if (cols.records != null) {
            for (var i = 0; i < cols.records.length; i++) {
                if (cols.records[i].text != '') {
                    $("#" + gID).jqxGrid('setcolumnproperty', cols.records[i].datafield, 'width', 'auto');
                }
            }
        }
        if (gridStorage[0].resizedColumns && gridStorage[0].resizedColumns.length > 0) {
            for (var i = 0; i < gridStorage[0].resizedColumns.length; i++) {
                $('#' + gID).jqxGrid('setcolumnproperty', gridStorage[0].resizedColumns[i].column, 'width', gridStorage[0].resizedColumns[i].width);
            }
        }
    } else {
        if (gridStorage[0].Pagination) {
            if (gridStorage[0].Pagination.PageNumber != 1) {
                $("#" + gID).jqxGrid('gotopage', gridStorage[0].Pagination.PageNumber - 1);
            }
        }
    }

    gridStorage[0].isGridReady = 1;
    var updatedGridStorage = JSON.stringify(gridStorage);
    window.sessionStorage.setItem(strGID + 'gridStorage', updatedGridStorage);

    var gridheight = $(window).height();
    gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 90;
    $("#" + gID).jqxGrid({ height: gridheight });
}


function callOnGridReadyForReport(gID, gridStorage, columnSortFilterforeport, heightCheck) {

    if (gridStorage[0].isgridState) {

        $("#" + gID).jqxGrid('loadstate', gridStorage[0].isgridState);
        if (gridStorage[0].Pagination) {
            if (gridStorage[0].Pagination.PageNumber != 1) {
                $("#" + gID).jqxGrid('gotopage', gridStorage[0].Pagination.PageNumber - 1);
            }
        }
    } else {

        addDefaultfilterForReport(columnSortFilterforeport, gID)
    }

    gridStorage[0].isGridReady = 1;
    var updatedGridStorage = JSON.stringify(gridStorage);
    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
    if (heightCheck != 1 && heightCheck != undefined && heightCheck != null) {

        var gridheight = $(window).height();
        gridheight = (gridheight - $(".grid-area").offset().top) - $(".fixed-footer").height() - 50;
        $("#" + gID).jqxGrid({
            height: gridheight
        });
    }


}



function updatepaginationOnState(gID, gridStorage, Pagination, SearchObj, adStorage, CallType) {

    var gridStorageId = gID;
    if (gID == 'jqxgridForSelectedDevicesdiagnostics' || gID == 'jqxgridForSelectedDevicesmanageContents' || gID == 'jqxgridForSelectedDevicesdownloads') {
        gridStorageId = 'jqxgridForSelectedDevices';
    }
    var gridStorageUpdated = JSON.parse(sessionStorage.getItem(gridStorageId + "gridStorage"));
    if (gridStorageUpdated && gridStorageUpdated.length > 0 && !_.isEmpty(gridStorageUpdated[0].resizedColumns)) {
        gridStorage[0].resizedColumns = gridStorageUpdated[0].resizedColumns;
    }

    gridStorage[0].iscontentGrid = 1;

    if (gridStorage[0].isGridReady == 1) {
        gridStorage[0].Pagination = Pagination;
        if (CallType != undefined) {
            gridStorage[0].CallType = CallType;
        }

        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridStorageId + 'gridStorage', updatedGridStorage);
    }

    if (SearchObj) {
        if (adStorage && adStorage.length > 0) {
            if (adStorage[0].isAdSearch == 0) {

                if (SearchObj.SearchText || SearchObj.SearchText != undefined) {

                    adStorage[0].adSearchObj = SearchObj;
                    adStorage[0].quickSearchObj = null;
                    adStorage[0].searchText = null;
                    adStorage[0].quickSearchName = null;

                } else {

                    adStorage[0].adSearchObj = null;
                    adStorage[0].AdvancedSearchHierarchy = null;
                    adStorage[0].AdvancedSearchGroup = null;
                    adStorage[0].isWithGroup = 0;
                }
            } else {

                if (!_.isEmpty(SearchObj.SearchText)) {

                    adStorage[0].quickSearchObj = SearchObj;
                    //adStorageObj.searchText = SearchObj.SearchText;
                    //adStorageObj.quickSearchName = null;
                    adStorage[0].adSearchObj = null;
                    adStorage[0].AdvancedSearchHierarchy = null;
                    adStorage[0].AdvancedSearchGroup = null;
                    adStorage[0].isWithGroup = 0;
                    //adStorage[0].isQuickSearchApplied = 0;
                } else {

                    adStorage[0].quickSearchObj = null;
                }
            }
        }
    }

    if (adStorage) {

        var updatedAdStorage = JSON.stringify(adStorage);
        window.sessionStorage.setItem(gID + 'adStorage', updatedAdStorage);
    }



    if (SearchObj) {

        if (SearchObj.SearchText || SearchObj.SearchText != undefined) {

            $("#criteriabtnDiv").css("display", "inline");
            $("#resetBtnForChart").addClass('hide');
            //$("#resetBtnForGrid").removeClass('hide');
            $("#deviceCriteriaDiv").empty();
            if (adStorage && adStorage[0].isAdSearch != 0) {
                $("#deviceCriteriaDiv").append(adStorage[0].searchText);
                $("#txtQuickSearchDevice").val(adStorage[0].quickSearchName);
            } else {
                $("#deviceCriteriaDiv").append(SearchObj.SearchText);
            }
        } else {
            if (gID != 'reportGrid') {
                $("#criteriabtnDiv").css("display", "none");
            }
            $("#resetBtnForChart").addClass('hide');
            $("#resetBtnForGrid").addClass('hide');
        }
    } else {
        $("#txtQuickSearchDevice").val("");
        if (gID != 'reportGrid') {
            $("#criteriabtnDiv").css("display", "none");
        }
        $("#resetBtnForChart").addClass('hide');
        $("#resetBtnForGrid").addClass('hide');
    }

}

function updateAdSearchObj(gId, DeviceSearch, isflag) {

    if (gId == "blankDevicejqxgrid") {
        gId = "Devicejqxgrid";
    }
    var adStorage = JSON.parse(sessionStorage.getItem(gId + "adStorage"));
    if (adStorage && adStorage.length > 0) {
        if (isflag == 0) {
            adStorage[0].adSearchObj = DeviceSearch;
            adStorage[0].isAdSearch = isflag;
            adStorage[0].isQuickSearchApplied = 0;
        } else if (isflag == 2) {
            adStorage[0].adSearchObj = DeviceSearch;
            adStorage[0].quickSearchObj = null;
            adStorage[0].AdvancedSearchHierarchy = null;
            adStorage[0].AdvancedSearchGroup = null;
            adStorage[0].isWithGroup = 0;
            adStorage[0].isAdSearch = 0;
            adStorage[0].quickSearchName = '';
            adStorage[0].isQuickSearchApplied = 0;
            adStorage[0].selectedIds = [];
            adStorage[0].unSelectedIds = [];
        } else {
            adStorage[0].quickSearchObj = DeviceSearch;
            adStorage[0].isAdSearch = isflag;
            adStorage[0].isQuickSearchApplied = 1;
        }
        adStorage[0].isFromDevice = 0;
        adStorage[0].SelectedHeaders = selectedColumns;

        var updatedadStorage = JSON.stringify(adStorage);
        window.sessionStorage.setItem(gId + 'adStorage', updatedadStorage);
    }
}


function setscheduleAdstorageFromDeviceSearch(gID, selectedIds, unSelectedIds) {

    var adStorageArr = new Array();

    var adStorageObj = new Object();
    adStorageObj.isAdSearch = 0;
    adStorageObj.adSearchObj = null;
    adStorageObj.quickSearchObj = null;
    adStorageObj.searchText = null;
    adStorageObj.quickSearchName = null;
    adStorageObj.AdvancedSearchHierarchy = null;
    adStorageObj.AdvancedSearchGroup = null;
    adStorageObj.isWithGroup = 0;
    adStorageObj.isFromDevice = 1;
    adStorageObj.isQuickSearchApplied = 0;
    adStorageObj.selectedIds = selectedIds;
    adStorageObj.unSelectedIds = unSelectedIds;
    adStorageArr.push(adStorageObj);
    var adStorage = JSON.stringify(adStorageArr);
    window.sessionStorage.setItem(gID + 'adStorage', adStorage);

}

function getschedulscrenName() {
    var srName = '';
    var nestedRoutePath = getRouteUrl();
    if (nestedRoutePath[0] == 'device') {
        srName = nestedRoutePath[3];
    } else {
        srName = 'manageContents';
    }
    return srName;
}

function dispalyTooltipIcon_DownloadStatus(gID, row, column, value, defaultHtml, isFromView) {
    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    var taskId = $("#" + gID).jqxGrid('getcellvalue', row, 'TaskId');
    var isCancelRequestFailedValue;
    if (isFromView == 1) {
        if (isCancelRequestFailed != undefined) {
            isCancelRequestFailedValue = isCancelRequestFailed;
        }

    } else {
        isCancelRequestFailedValue = $("#" + gID).jqxGrid('getcellvalue', row, 'IsCancelRequestFailed');
        isCancelRequestFailedValue = _.isEmpty(isCancelRequestFailedValue) ? false : isCancelRequestFailedValue;
    }
    var text = "Status: ";
    var reason = "Reason: ";

    //Failed
    if (value == "Failed") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDwlFialed_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDwlFialed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Download Failed
    else if (value == "Download Failed") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDwlFialed_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus""><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus""><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDwlFialed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Content Replaced
    else if (value == "Content Replaced") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Content Replace Failed
    else if (value == "Content Replace Failed") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: red" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_red"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusContentReplacedFailed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Install Failed
    else if (value == "Install Failed") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_failed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_failed_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_failed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_failed_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Install Postponed
    else if (value == "Install Postponed" || value == "Install postponed") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            }
        }
    }

    //User Install Postponed
    else if (value == "User Install Postponed" || value == "User Install postponed") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            }
        }
    }

    //Schedule Sent
    else if (value == "Schedule Sent") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_sent"></div></a>' + value + '</span></div>';
            }
        }
    }
    //Schedule Confirmed
    else if (value == "Schedule Confirmed" || value == "ScheduleConfirmed") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusSchedule_confirmed"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Install Successful
    else if (value == "Install Successful") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_successful"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_successful_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_successful"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusInstall_successful_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Download Started
    else if (value == "Download Started") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDownloadstarted"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDownloadstarted_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDownloadstarted"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusDownloadstarted_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Download InProgres
    else if (value == "Download InProgress") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg  statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        }
    }
    //Installation Started
    else if (value == "Installation Started") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        }
    }
    //Installation InProgress
    else if (value == "Installation InProgress") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Download Successful
    else if (value == "Download Successful") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg downloadSuccessfull"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg downloadSuccessfull_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg downloadSuccessfull"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg downloadSuccessfull_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Cancelled
    else if (value == "Cancelled") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: black" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-cross"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-cross"></i></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: black" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-cross"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-cross"></i></a>' + value + '</span></div>';
            }
        }
    }

    //Scheduled
    else if (value == "Scheduled") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: purple" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: purple" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduled_purple"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Successful
    else if (value == "Successful") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: green" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><i id="downloadStatusIcon' + taskId + '" class="icon-download3"></i></a>' + value + '</span></div>';
            }
        }
    }

    //Scheduling
    else if (value == "Scheduling") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: blue" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduling_purple"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: blue" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduling"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div  class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusScheduling_purple"></div></a>' + value + '</span></div>';
            }
        }
    }

    //Pending Install Confirmation
    else if (value == "Pending Install Confirmation") {
        if (rowData.DownloadFailedReason == null || rowData.DownloadFailedReason == "") {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        } else {
            if (isCancelRequestFailedValue == 'False' || isCancelRequestFailedValue == false) {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: orange" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_orange"></div></a>' + value + '</span></div>';
            } else {
                defaultHtml = '<div class="vf-downloadstatus"><span id="downloadStatus' + taskId + '" title="' + text + '' + value + '\n' + reason + '' + rowData.DownloadFailedReason + '"><a  id="imageId" class="btn default" style="padding-left: 0px; padding-top:7px; color: brown" height="60" width="50"><div id="downloadStatusIcon' + taskId + '" class="iconImg statusIn_progress_brown"></div></a>' + value + '</span></div>';
            }
        }
    }

    return defaultHtml;
}

function computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml) {

    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    var text = "Status: ";
    if (value == "Pending Hierarchy Assignment" || value == "PendingHierarchyAssignment") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg pendingHier_Assignment"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        //defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg pendingHier_Assignment"></div></a>' + value + '</span></div>';
        defaultHtml = '<div class="vf-computedjobstatus-pha"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg pendingHier_Assignment"></div></a>' + value + '</span></div>';
    }
    if (value == "Pending Registration" || value == "PendingRegistration") {
        // defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg registration"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        // defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg registration"></div></a>' + value + '</span></div>';
        defaultHtml = '<div class="vf-computedjobstatus-pr"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg registration"></div></a>' + value + '</span></div>';
    }

    if (value == "Active") {
        // defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg statusActive-success"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        // defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
        defaultHtml = '<div class="vf-computedjobstatus-active"><span  title="' + text + '' + value + '"><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:7px;padding-top:7px;">' + value + '</span></div>';
    }
    if (value == "Inactive") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg inactive_Orange"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        //defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
        defaultHtml = '<div class="vf-computedjobstatus-inactive"><span  title="' + text + '' + value + '"><i class="icon-cross" style="color:red"></i></span><span style="padding-left:7px;padding-top:7px;">' + value + '</span></div>';
    }
    if (value == "Deleted") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg inactive_Orange"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding: 4px 6px!important; height="50" width="40"><div class="iconImg deletedStatus"></div></a>' + value + '</span></div>';
    }
    if (value == "Blacklisted") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg inactive_Orange"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding: 4px 6px!important; height="50" width="40"><div class="iconImg blacklistedStatus"></div></a>' + value + '</span></div>';
    }

    return defaultHtml;
}

function fromStatusToStatus(gID, row, column, value, defaultHtml) {

    var rowData = $("#" + gID).jqxGrid('getrowdata', row);
    var text = "Status: ";
    if (value == "Pending Hierarchy Assignment" || value == "PendingHierarchyAssignment") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg pendingHier_Assignment"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg pendingHier_Assignment"></div></a>' + value + '</span></div>';
    }
    if (value == "Pending Registration" || value == "PendingRegistration") {
        // defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg registration"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg registration"></div></a>' + value + '</span></div>';
    }

    if (value == "Active") {
        // defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg statusActive-success"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
    }
    if (value == "Inactive") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg inactive_Orange"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
    }

    if (value == "Deleted") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg inactive_Orange"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg deletedStatus"></div></a>' + value + '</span></div>';
    }
    if (value == "Blacklisted") {
        //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg inactive_Orange"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
        defaultHtml = '<div class="vf-devicestatus"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg blacklistedStatus"></div></a>' + value + '</span></div>';
    }
    return defaultHtml;
}

function downloadProgressRendererForJobs(gID, row, column, value, defaultHtml) {
    if (gID == "reportGrid") {
        var percent = $("#" + gID).jqxGrid('getcellvalue', row, 'PercentageOfDownload');
        var downloadStatus = $("#" + gID).jqxGrid('getcellvalue', row, 'CompJobStatus');
    } else {
        var percent = $("#" + gID).jqxGrid('getcellvalue', row, 'DownloadProgress');
        var downloadStatus = $("#" + gID).jqxGrid('getcellvalue', row, 'Status');
    }
    var taskId = $("#" + gID).jqxGrid('getcellvalue', row, 'TaskId');
    var packageFileType = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageFileType');

    if (percent == "0" || percent == '' || percent == null) {
        if (packageFileType == AppConstants.get('OTA') && downloadStatus == AppConstants.get('DownloadFailedCount')) {
            defaultHtml = '<div class="download-progress"><div id="percentage' + taskId + '" aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" class="download-progress-failed"><span id="percentValue' + taskId + '"></span></div></div>';
        } else if (packageFileType == AppConstants.get('OTA') && (downloadStatus == AppConstants.get('ScheduleSentCount') || downloadStatus == AppConstants.get('ScheduleConfirmedCount') || downloadStatus == AppConstants.get('DownloadStartedCount'))) {
            defaultHtml = '<div class="download-progress" style="background: none !important"><div id="percentage' + taskId + '" aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar"><span id="percentValue' + taskId + '"></span></div></div>';
        } else {
            defaultHtml = '<div class="download-progress"><div id="percentage' + taskId + '" aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" class="download-empty"><span id="percentValue' + taskId + '"></span></div></div>';
        }
    } else {
        var width = 20;
        if (percent > 20) {
            width = percent;
        }
        if (downloadStatus == AppConstants.get('DownloadFailedCount')) {
            defaultHtml = '<div class="download-progress"><div id="percentage' + taskId + '" style="width:' + width + '%' + '"; aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" class="download-progress-failed"><span id="percentValue' + taskId + '">' + percent + "%" + '</span></div></div>';
        } else {
            defaultHtml = '<div class="download-progress"><div id="percentage ' + taskId + '" style="width:' + width + '%' + '"; aria-valuemax="100" aria-valuemin="0" aria-valuenow="100" role="progressbar" class="download-progress-success"><span id="percentValue' + taskId + '">' + percent + "%" + '</span></div></div>';
        }
    }
    return defaultHtml;
}

function autoRefreshDownloadStatusProgress(taskId, progressValue, downloadStatus) {
    //Download Progress column
    if ($('#percentage' + taskId).hasClass("download-empty")) {
        $('#percentage' + taskId).removeClass("download-empty");
        $('#percentage' + taskId).addClass("download-progress-success");
    }
    $('#percentage' + taskId).width(progressValue + '%');
    $('#percentValue' + taskId).text(progressValue + '%');

    //Status column
    if (downloadStatus && downloadStatus != '') {
        $('#status' + taskId).text(downloadStatus);
        var downloadStatusClass = $('#downloadStatusIcon' + taskId).attr('class');

        if (downloadStatus == AppConstants.get('ScheduleSentCount')) {                       //Schedule Sent
            $('#downloadStatusIcon' + taskId).removeClass(downloadStatusClass);
            $('#downloadStatusIcon' + taskId).addClass('iconImg statusScheduled_sent');
        } else if (downloadStatus == AppConstants.get('ScheduleConfirmedCount')) {          //Schedule Confirmed
            $('#downloadStatusIcon' + taskId).removeClass(downloadStatusClass);
            $('#downloadStatusIcon' + taskId).addClass('iconImg statusSchedule_confirmed');
        } else if (downloadStatus == AppConstants.get('DownloadStartedCount')) {             //Download Started
            $('#downloadStatusIcon' + taskId).removeClass(downloadStatusClass);
            $('#downloadStatusIcon' + taskId).addClass('iconImg statusDownloadstarted');
        } else if (downloadStatus == AppConstants.get('DownloadSuccessfulCount')) {          //Download Successful
            $('#downloadStatusIcon' + taskId).removeClass(downloadStatusClass);
            $('#downloadStatusIcon' + taskId).addClass('iconImg downloadSuccessfull');
        } else if (downloadStatus == AppConstants.get('FailedCount')) {                      //Failed
            $('#downloadStatusIcon' + taskId).removeClass(downloadStatusClass);
            $('#downloadStatusIcon' + taskId).addClass('iconImg icon-download3');
        } else if (downloadStatus == AppConstants.get('InstallPostponedCount')) {            //Install Postponed
            $('#downloadStatusIcon' + taskId).removeClass(downloadStatusClass);
            $('#downloadStatusIcon' + taskId).addClass('iconImg icon-download3');
        } else if (downloadStatus == AppConstants.get('InstallFailedCount')) {               //Install Failed
            $('#downloadStatusIcon' + taskId).removeClass(downloadStatusClass);
            $('#downloadStatusIcon' + taskId).addClass('iconImg statusInstall_failed');
        }
    }
}

function isNumberKey(self) {
    $(".btnfilter").prop("disabled", false);
    //var textValue = self.value;
    if (self.value == undefined) {
        self.value = 0;
    }
    if (parseInt(self.value) > 31) {
        self.value = 31;
    }

    //var textval = $("#" + self.id).val();
    var reg = /^[0-9]*$/
    var re = /[`~!@#$%^&*()|+\=?;:'",.^a-zA-Z<>\{\}\[\]\\\-_/]/gi;
    var result = reg.test(self.value);
    if (result == true) {

    } else {
        var no_spl_char = self.value.replace(/[`~!@#$%^&*()|+\=?;:'",.^a-zA-Z<>\{\}\[\]\\\-_/]/gi, '');
        self.value = no_spl_char;
    }

}

function dateContainerPrevAndNextdateDispaly(date) {
    try {
        //console.log("Method-dateContainerPrevAndNextdateDispaly started");
        var dateNew = new Date(date);
        var monthString = $(".datepicker-switch").text();
        var monthStringArray = monthString.split(" ");
        var actualCurrentMonth = monthStringArray[0];

        var month = new Array();
        month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
        var funcArgsMonth = dateNew.getMonth();
        if (month[dateNew.getMonth()] == actualCurrentMonth) {
            return true;
        } else {
            return false;
        }
        //console.log("Method-dateContainerPrevAndNextdateDispaly ended");
    }
    catch (err) {
        if (err)
            console.log("Method-dateContainerPrevAndNextdateDispaly " + " Exception-" + err.message);
    }
}


function intializeDataAdapter(source, request) {
    var customerId = window.sessionStorage.getItem("CustomerId");
    request.beforeSend = function (jqXHR, settings) {
        if (VHQFlag == false && EOAccessToken != "") {
            jqXHR.setRequestHeader("CustomerId", customerId);
            jqXHR.setRequestHeader("Authorization", "Bearer " + EOAccessToken);
        }
    };
    request.loadError = function (jqXHR, status, error) {
        $('.all-disabled').hide();
        $("#loader1").hide();
        openAlertpopup(2, 'network_error');
    }
    return new $.jqx.dataAdapter(source, request);
}



function genericBuildFilterPanelFordateUI(filterPanel, datafield, dataAdapter, gId, isUIDateFilter) {
    try {
        console.log("Method-genericBuildFilterPanelFordateUI started" + "grid-" + gId);
        $("#gridmenu" + gId).css({
            "min-height": "264px"
        });
        filtercheckfiled = datafield;
        dateFiltercheck = '';
        var filterInfo = $("#" + gId).jqxGrid('getfilterinformation');
        var columnName = $('#' + gId).jqxGrid('getcolumnproperty', datafield, 'text');
        var isDeviceTimeZone = false;
        if (columnName.indexOf("*") > -1) {
            isDeviceTimeZone = true;
        }
        var storedFilterVal = new Object();
        for (i = 0; i < filterInfo.length; i++) {
            if (filterInfo[i].filtercolumn == datafield) {
                var source = filterInfo[i].filter.getfilters()[0].value;
                //storedFilterVal.FilterDays = source[0].FilterDays;
                storedFilterVal.FilterValue = source[0].FilterValue;

                if ($.inArray(datafield + gId + 'day', fixeddayFilterArray) < 0) {

                    fixeddatechecKInternal = datafield + gId + 'Int';
                    storedFilterVal.FilterDays = 1;
                    fixeddayFilter = '';
                    storedFilterVal.IsFixedDateRange = true;
                } else {

                    fixeddayFilter = datafield + gId + 'day';
                    storedFilterVal.FilterDays = source[0].FilterDays;
                    fixeddatechecKInternal = '';
                    storedFilterVal.IsFixedDateRange = false;
                }

                //if (fixeddayFilter == datafield + gId + 'day') {
                //} else {
                //    fixeddatechecKInternal = datafield + gId + 'Int';
                //}
                storedFilterVal.FilterValueOptional = source[0].FilterValueOptional;

            }
        }

        var inputdiv = $('<div class="col-md-4" style="height:400px;"></div>');
        var strinput = '';
        strinput += '<div class="grid-pop" style="width:189px;">';
        strinput += '<div class="con-area" style="padding:5px">';
        strinput += '<div class="form-inline">';
        strinput += '<div class="form-group">';
        strinput += '<label class="inline-adjust">' + i18n.t('last', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '<div class="input-group spinner" style="padding-left:5px;padding-right:5px" data-trigger="spinner">';
        strinput += '<input  type="text"   style="width:46px;" onkeyup="isNumberKey(this)" class="form-control filterdayUI" value="1" data-rule="dateFilter">';

        strinput += '<div class="input-group-addon">';
        strinput += '<a href="javascript:;" class="spin-up" data-spin="up"><i class="icon-angle-up"></i></a>';
        strinput += '<a href="javascript:;" class="spin-down" data-spin="down"><i class="icon-angle-down"></i></a>';
        strinput += '</div>';
        strinput += '</div>';
        strinput += '<div class="form-group" >';
        strinput += '<label class="inline-adjust">' + i18n.t('license_password_expiry_days', {
            lng: lang
        }) + '</label>';
        strinput += '</div>';
        strinput += '</div>';
        strinput += '<div style="padding-top:6px">';
        strinput += '<label>';

        var fixedrangeid = "'" + gId + datafield + "'";
        var funcGridId = "'" + gId + "'";
        var funcfieldId = "'" + datafield + "'";

        if (fixeddatecheck == datafield + gId + 'set') {

            if (fixeddayFilter == datafield + gId + 'day') {
                strinput += '<input class="checkboxUIDateFilter" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox"  value="0"> ' + i18n.t('fixed_date_range', {
                    lng: lang
                }) + '';
            } else {
                strinput += '<input class="checkboxUIDateFilter" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox" checked="checked" value="1"> ' + i18n.t('fixed_date_range', {
                    lng: lang
                }) + '';
            }
        } else {
            if (fixeddatechecKInternal == datafield + gId + 'Int') {

                if (fixeddayFilter == datafield + gId + 'day') {
                    strinput += '<input class="checkboxUIDateFilter" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox"  value="0"> ' + i18n.t('fixed_date_range', {
                        lng: lang
                    }) + '';
                } else {
                    strinput += '<input class="checkboxUIDateFilter" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox" checked="checked" value="1"> ' + i18n.t('fixed_date_range', {
                        lng: lang
                    }) + '';
                }
            } else {

                strinput += '<input class="checkboxUIDateFilter" onchange="enableTextbox(' + fixedrangeid + ',this,' + funcGridId + ',' + funcfieldId + ')"  type="checkbox"  value="0"> ' + i18n.t('fixed_date_range', {
                    lng: lang
                }) + '';
            }
        }

        strinput += '</label>';
        strinput += '</div>';
        strinput += '<div class="form-group"  >';
        strinput += ' <label>' + i18n.t('frmDate', {
            lng: lang
        }) + '</label>';
        if (fixeddatecheck == datafield + gId + 'set') {
            if (fixeddayFilter == datafield + gId + 'day') {
                strinput += ' <input type="text"  disabled=true class="form-control datepics fromtxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
            } else {
                strinput += ' <input type="text" onClick="enableFromDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"  class="form-control datepics fromtxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
            }
        } else {
            if (fixeddatechecKInternal == datafield + gId + 'Int') {
                if (fixeddayFilter == datafield + gId + 'day') {
                    strinput += ' <input type="text"  disabled=true class="form-control datepics fromtxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
                } else {
                    strinput += ' <input type="text" onClick="enableFromDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"   class="form-control datepics fromtxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
                }
            } else {
                strinput += ' <input type="text"  disabled=true class="form-control datepics fromtxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
            }
        }

        strinput += '</div>';
        strinput += '<div class="form-group">';
        strinput += '<label>' + i18n.t('toDate', {
            lng: lang
        }) + '</label>';
        if (fixeddatecheck == datafield + gId + 'set') {
            if (fixeddayFilter == datafield + gId + 'day') {
                strinput += '<input type="text"  disabled=true class="form-control datepics totxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
            } else {
                strinput += '<input type="text" onClick="enableToDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"   class="form-control datepics totxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
            }
        } else {
            if (fixeddatechecKInternal == datafield + gId + 'Int') {
                if (fixeddayFilter == datafield + gId + 'day') {
                    strinput += '<input type="text"  disabled=true class="form-control datepics totxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
                } else {
                    strinput += '<input type="text" onClick="enableToDatepickerOnclick(this,' + funcGridId + ',' + funcfieldId + ')"  class="form-control datepics totxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
                }
            } else {
                strinput += '<input type="text"  disabled=true class="form-control datepics totxtclassUIDate" placeholder="' + filterDatePlaceHolder + '">';
            }
        }
        strinput += ' </div>';
        strinput += '</div>';
        strinput += '<div class="btn-footer" style="padding:9px">';
        strinput += '<button disabled=true class="btn btn-default btnfilterClearUI ">' + i18n.t('reset', {
            lng: lang
        }) + '</button>';
        strinput += '<button  onclick="applydatefilterUI(' + funcfieldId + ',' + funcGridId + ',' + fixedrangeid + ',this,' + isDeviceTimeZone + ')"  value="check" class="btn btn-primary btnfilter ">' + i18n.t('go', {
            lng: lang
        }) + '</button>';
        strinput += '</div>';
        strinput += '</div>';
        //inputdiv.empty();
        inputdiv.append(strinput);
        //filterPanel.empty();
        filterPanel.append(inputdiv);
        $('[data-trigger="spinner"]').spinner();

        var fval = storedFilterVal.FilterValue;
        var tval = storedFilterVal.FilterValueOptional;
        if (tval != undefined) {
            var gentval = tval.split(' ');
            if (gentval.length > 1) {
                tval = gentval[0];
            }
        }

        //alert(fval + '---' + tval);
        loadgrid = gId;
        loadfield = datafield;
        if (fval != null & fval != '') {
            $('.fromtxtclassUIDate').datepicker({
                autoclose: true,
                setDate: fval,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }
            });

            $('.fromtxtclassUIDate').datepicker('update');
        } else {
            $('.fromtxtclassUIDate').datepicker({
                autoclose: true,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }
            });
            $('.fromtxtclassUIDate').datepicker('update');
        }

        /////
        if (tval != null) {
            $('.totxtclassUIDate').datepicker({
                autoclose: true,
                setDate: tval,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }
            });
            $('.totxtclassUIDate').datepicker('update');

        } else {

            $('.totxtclassUIDate').datepicker({
                autoclose: true,
                dateFormat: gridDateFormat,
                format: gridDateFormat,
                beforeShowDay: function (date) {

                    var isDisplyDates = dateContainerPrevAndNextdateDispaly(date);

                    if (isDisplyDates == true) {

                    } else {
                        return {
                            classes: "datesDisplay"
                        }
                    }
                }

            });
            $('.totxtclassUIDate').datepicker('update');
        }
        /////

        $('.fromtxtclassUIDate').attr('value', storedFilterVal.FilterValue);
        $('.totxtclassUIDate').attr('value', tval);
        if (storedFilterVal.FilterDays == null || storedFilterVal.FilterDays == 'undefined') {

        } else {

            $('.filterdayUI').val(storedFilterVal.FilterDays);
        }
        var filtersource = _.where(filterInfo, {
            datafield: datafield
        });

        if (filtersource.length > 0) {
            $('.btnfilterClearUI').attr('disabled', false);
        }

        var column = $("#" + gId).jqxGrid('getcolumn', datafield);


        $('.btnfilterClearUI').on("click", function () {

            if (fixeddatecheck == datafield + gId + 'set') {
                fixeddatecheck = '';
            } else {
                if (fixeddatechecKInternal == datafield + gId + 'Int') {
                    fixeddatechecKInternal = '';
                }
            }


            $(".checkboxUIDateFilter").attr("checked", false);
            $(".totxtclassUIDate").val("");
            $(".fromtxtclassUIDate").val("");


            $("#" + gId).jqxGrid('removefilter', datafield);
            $("#" + gId).jqxGrid('applyfilters');
            //filterPanel.empty();
            $("#" + gId).jqxGrid('closemenu');

            if (gId == 'Devicejqxgrid') {
                $(".panel-side-pop").hide();
            } else if (gId == 'jqxgridDeletedDevices') {
                $(".panel-side-pop-deleted").hide();
            }
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
        });
        console.log("Method-genericBuildFilterPanelFordateUI ended" + "grid-" + gId);
    }
    catch (err) {
        if (err)
            console.log("Method-genericBuildFilterPanelFordateUI grid-" + gId + " Exception-" + err.message);
    }
}




function applydatefilterUI(datafield, gridid, id, self, isDeviceTimezone) {
    try {

        console.log("Method-applydatefilterUI started" + "grid-" + gridid);

        fixeddatechecKInternal = datafield + gridid + 'Int';
        //var rengecheck = $(self).closest('div').prev('div').children('div').next('div').prev('div').children('input');
        var rengecheck = $(self).closest('div').prev('div').children('div').next('div').prev('div').children('label').children('input').val()

        var fromDate = $(self).closest('div').prev('div').children('div').next('div').children('input');


        //var toDate =   $(self).closest('div').prev('div').children('div').next('div').next('div').children('input');
        var toDate = $(self).closest('div').prev('div').children('div').next('div').next('div').next('div').children('input');

        var fromday = $(self).closest('div').prev('div').children('div').next('div').prev('div').prev('div').children('div').next('div').children('input').val()
        //$("#" + id + "fixedrange")
        //if ((typeof (filtergroup) == "undefined") || (filtergroup == null)) {
        //   
        var filtergroup = new $.jqx.filter();
        //}
        var filter_or_operator = 0;
        var DateObj = Object();
        DateObj.ColumnType = 'Date';
        var diifcheck = 0;

        if (rengecheck == 1) {
            fixeddatechecKInternal = datafield + gridid + 'Int';

            fixeddayFilterArray = jQuery.grep(fixeddayFilterArray, function (value) {
                return (value != fixeddayFilter && value != null);;
            });
            //alert(JSON.stringify(fixeddayFilterArray));
            fixeddayFilter = '';
            ///new code 
            var fDate = $(fromDate).val();
            //var chunks = fDate.split('-');
            //var fDate = [chunks[1], chunks[0], chunks[2]].join("/");

            var tDate = $(toDate).val();
            //var chunks = tDate.split('-');
            //var tDate = [chunks[1], chunks[0], chunks[2]].join("/");

            var dateB = moment(fDate);
            var dateC = moment(tDate);
            if (moment(dateB).isAfter(dateC, 'day')) {
                diifcheck = 1;

            } else {
                if ($(fromDate).val() == '' || $(fromDate).val() == null || $(toDate).val() == '' || $(toDate).val() == null) {
                    diifcheck = 2;

                } else {

                    var fDate = $(fromDate).val();
                    //var chunks = fDate.split('-');
                    //var fDate = [chunks[1], chunks[0], chunks[2]].join("/");

                    var tDate = $(toDate).val();
                    //var chunks = tDate.split('-');
                    //var tDate = [chunks[1], chunks[0], chunks[2]].join("/");
                    //if (gridid == 'jqxgridSwapHistory') {
                    DateObj.FilterDays = 0;
                    //} else {
                    //    DateObj.FilterDays = dateC.diff(dateB, 'days');
                    //}

                    DateObj.FilterValue = fDate; //$(fromDate).val();//$("#frmDate").val();
                    DateObj.FilterValueOptional = tDate; //$(toDate).val();//$("#toDate").val();
                    DateObj.IsFixedDateRange = false;
                }
            }
        } else {
            fixeddatechecKInternal = '';
            fixeddayFilter = datafield + gridid + 'day';
            fixeddayFilterArray.push(fixeddayFilter);
            //alert(JSON.stringify(fixeddayFilterArray));
            DateObj.FilterDays = fromday;
            var fromDate = moment().subtract('days', DateObj.FilterDays);
            var fromDate12 = moment().subtract('days', DateObj.FilterDays).format(currentDateShort);
            DateObj.FilterValue = moment(fromDate).format(gridDateFormat); //$("#frmDate").val();
            //if (isDeviceTimezone) {
            DateObj.FilterValueOptional = moment().format(AppConstants.get('LONG_DATETIME_FORMAT_SECONDS'));
            //} else {
            //    DateObj.FilterValueOptional = moment().format(currentDateShort);
            //}
            //$("#toDate").val(); 
            DateObj.IsFixedDateRange = true;
        }

        // apply the filters.
        if (diifcheck == 1) {
            openAlertpopup(1, 'to_filterdate_greater');
            dateFiltercheck = 'datefilterinfo';
            //openDAtefilterAlertpopup('to_filterdate_greater');
            $("#" + gridid).jqxGrid('closemenu', datafield);
        } else {
            if (diifcheck == 2) {

            } else {
                if (rengecheck == 1) {
                    if (DateObj.FilterValue == '' || DateObj.FilterValueOptional == '') {


                    } else {
                        var dateArr = new Array();
                        dateArr.push(DateObj);
                        var filtervalue = dateArr; //'Date'+textInput.val()+'--'+textInput2.val();
                        //var filtercondition = 'contains';
                        //var filter1 = filtergroup.createfilter('stringfilter', filtervalue, filtercondition);
                        //filtergroup.addfilter(filter_or_operator, filter1);
                        //// add the filters.
                        //$("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);


                        var filtercondition1 = 'GREATER_THAN_OR_EQUAL';
                        var filtervalue1 = filtervalue[0].FilterValue;
                        //var filtervalue1 = "04/Aug/2016";
                        var filter1 = filtergroup.createfilter('datefilter', filtervalue1, filtercondition1);

                        var filtervalue2 = filtervalue[0].FilterValueOptional;
                        //var filtervalue2 = "04/Aug/2016";
                        var filtercondition2 = 'LESS_THAN_OR_EQUAL';
                        var filter2 = filtergroup.createfilter('datefilter', filtervalue2, filtercondition2);
                        filtergroup.addfilter(filter_or_operator, filter1);
                        filtergroup.addfilter(filter_or_operator, filter2);

                        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);


                        $("#" + gridid).jqxGrid('applyfilters');
                        $('.btnfilterClearUI').attr('disabled', false);
                        //filterPanel.empty();
                        $("#" + gridid).jqxGrid('closemenu');
                    }
                } else {
                    if (DateObj.FilterDays == null || DateObj.FilterDays == 0) {

                    } else {

                        var dateArr = new Array();
                        dateArr.push(DateObj);
                        var filtervalue = dateArr; //'Date'+textInput.val()+'--'+textInput2.val();
                        var filtercondition1 = 'GREATER_THAN_OR_EQUAL';
                        var filtervalue1 = filtervalue[0].FilterValue;

                        var filter1 = filtergroup.createfilter('datefilter', filtervalue1, filtercondition1);

                        var filtervalue2 = filtervalue[0].FilterValueOptional;
                        var filtercondition2 = 'LESS_THAN_OR_EQUAL';
                        var filter2 = filtergroup.createfilter('datefilter', filtervalue2, filtercondition2);
                        filtergroup.addfilter(filter_or_operator, filter1);
                        filtergroup.addfilter(filter_or_operator, filter2);
                        // add the filters.
                        $("#" + gridid).jqxGrid('addfilter', datafield, filtergroup);
                        $("#" + gridid).jqxGrid('applyfilters');
                        $('.btnfilterClearUI').attr('disabled', false);
                        setTimeout(function () {
                            $("#" + gridid).jqxGrid('render');
                        }, 2000);
                        //filterPanel.empty();
                        $("#" + gridid).jqxGrid('closemenu');
                    }
                }
            }

        }
        console.log("Method-applydatefilterUI ended" + "grid-" + gridid);
    }
    catch (err) {
        if (err)
            console.log("Method-applydatefilterUI grid-" + gridid + " Exception-" + err.message);
    }
}


//User Profile Edit ***jira issue VHQ-6392 ***
function fnTitleOfUser() {
    if ($("#titleOfUser").val() != "")
        $("#btnSave").prop('disabled', false);
}

function fnFirstName() {
    if ($("#firstName").val() != "")
        $("#btnSave").prop('disabled', false);
}

function fnFRFirstName() {
    if ($("#firstNameFR").val() != "")
        $("#btnSaveUserProfile").prop('disabled', false);
}
function fnFRLastName() {
    if ($("#lastNameFR").val() != "")
        $("#btnSaveUserProfile").prop('disabled', false);
}

function fnLastName() {
    if ($("#lastName").val() != "")
        $("#btnSave").prop('disabled', false);
}

function fnContactNumber1() {
    if ($("#contactNumber1").val() != "")
        $("#btnSave").prop('disabled', false);
}

function fnContactNumber2() {
    if ($("#contactNumber2").val() != "")
        $("#btnSave").prop('disabled', false);
}

function fnAlertEmail() {
    if ($("#alertEmail").val() != "")
        $("#btnSave").prop('disabled', false);
}

function getColumnFilterSearchText(columnSortFilter, gridId) {
    try {
        console.log("Method-getColumnFilterSearchText started" + "grid-" + gridId);
        var brk = '&#13;';
        var equal = '=';
        var semicolon = ';';
        var between = ' between ';
        var equalTo = " Equal To ";
        var and = ' and ';
        var ColumnFilterText = '';
        var FilterList = $("#" + gridId).jqxGrid('getfilterinformation');

        var start = FilterList.length == columnSortFilter.FilterList.length ? 0 : 1;

        for (var i = start; i < FilterList.length; i++) {
            var filterValue = FilterList.length == columnSortFilter.FilterList.length ? columnSortFilter.FilterList[i].FilterValue : columnSortFilter.FilterList[i - 1].FilterValue;
            var filterValueOptional = FilterList.length == columnSortFilter.FilterList.length ? columnSortFilter.FilterList[i].FilterValueOptional : columnSortFilter.FilterList[i - 1].FilterValueOptional;
            var filterColumnType = FilterList.length == columnSortFilter.FilterList.length ? columnSortFilter.FilterList[i].ColumnType : columnSortFilter.FilterList[i - 1].ColumnType;
            var isFixedDateRange = FilterList.length == columnSortFilter.FilterList.length ? columnSortFilter.FilterList[i].IsFixedDateRange : columnSortFilter.FilterList[i - 1].IsFixedDateRange;
            var filterDays = FilterList.length == columnSortFilter.FilterList.length ? columnSortFilter.FilterList[i].FilterDays : columnSortFilter.FilterList[i - 1].FilterDays;

            var filterColumnText = FilterList[i].filtercolumntext;

            if (filterColumnType && filterColumnType == 'MultiChoice') {
                if (filterValue.indexOf("^") != -1) {
                    var array = filterValue.split('^');
                    var displayNames = '';
                    for (var j = 0; j < array.length; j++) {
                        displayNames = displayNames + array[j] + ',';
                    }
                    displayNames = displayNames.substr(0, displayNames.length - 1);
                } else {
                    displayNames = filterValue;
                }
                ColumnFilterText == "" ? ColumnFilterText = (ColumnFilterText + filterColumnText + equalTo + displayNames) : ColumnFilterText = (ColumnFilterText + semicolon + " " + filterColumnText + equalTo + displayNames);
            } else if (filterColumnType && filterColumnType == "Date") {
                if (isFixedDateRange == 'true' || isFixedDateRange == true) {
                    ColumnFilterText == "" ? ColumnFilterText = (ColumnFilterText + filterColumnText + between + filterValue + and + filterValueOptional) : ColumnFilterText = (ColumnFilterText + semicolon + " " + filterColumnText + between + filterValue + and + filterValueOptional);
                } else {
                    ColumnFilterText == "" ? ColumnFilterText = (ColumnFilterText + filterColumnText + ' = Last ' + filterDays + ' Day(s)') : ColumnFilterText = (ColumnFilterText + semicolon + " " + filterColumnText + ' = Last ' + filterDays + ' Day(s)');
                }
            } else if (filterColumnType && filterColumnType == "Numeric") {
                ColumnFilterText == "" ? ColumnFilterText = (ColumnFilterText + filterColumnText + " " + filterValue) : ColumnFilterText = (ColumnFilterText + semicolon + " " + filterColumnText + " " + filterValue);
            } else {
                ColumnFilterText == "" ? ColumnFilterText = (ColumnFilterText + filterColumnText + " " + equal + " " + filterValue) : ColumnFilterText = (ColumnFilterText + semicolon + " " + filterColumnText + " " + equal + " " + filterValue);
            }
        }
        //if(FilterList && FilterList.length > 0)
        //ColumnFilterSearchText = searchText == "" ? ("Column Filter : " + ColumnFilterText) : (searchText + brk + "Column Filter : " + ColumnFilterText);
        // else
        //  ColumnFilterSearchText = ColumnFilterText;
        console.log("Method-getColumnFilterSearchText ended " + "grid-" + gridId);
        return ColumnFilterText;
    }
    catch (err) {
        if (err)
            console.log("Method-getColumnFilterSearchText grid-" + gridId + " Exception-" + err.message);
    }
}

function endswithString(source, searchString, position) {
    var subjectString = source.toString();
    if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
    }
    position -= searchString.length;
    var lastIndex = subjectString.lastIndexOf(searchString, position);
    return lastIndex !== -1 && lastIndex === position;
};

function startsWithString(source, searchString, position) {
    var searchString = searchString.toString();
    position = position || 0;
    return source.substr(position, searchString.length) === searchString;
}

function clearCustomFilterInTable(tableid) {
    var table = document.getElementById(tableid);
    var tr = table.getElementsByTagName("tr");
    for (var k = 0; k < tr.length; k++) {
        tr[k].style.display = '';
    }
    var th = tr[0].getElementsByTagName("th");
    for (var j = 0; j < th.length; j++) {
        $(th[j].getElementsByTagName("a")).removeClass('icon-default-select');
        $(th[j].getElementsByTagName("a")).addClass('icon-default');
        var inputElement = th[j].getElementsByTagName("input");
        if (inputElement.length > 0 && inputElement[0].value != "") {
            inputElement[0].value = "";
        }
    }
    var gridStorageArr = new Array();
    var gridStorageObj = new Object();
    gridStorageObj.checkedValues = [];
    gridStorageArr.push(gridStorageObj);
    var gridStorage = JSON.stringify(gridStorageArr);
    window.sessionStorage.setItem(tableid + 'gridStorage', gridStorage);
}

function customTableFilter(element, dataArray, callBackOnCustomFilter) {
    var inputdiv = $('#' + element.parentElement.id);
    var columnid = element.parentElement.id;
    var tableid = columnid.split('header')[1];
    var columnindex = columnid.split('header')[0];
    var childid = 'child' + element.parentElement.id;
    if (inputdiv[0].lastChild.id == childid) {
        if ($('#' + childid).hasClass('vf-hide')) {
            $('#' + childid).removeClass('vf-hide');
            $('#' + childid).focus();
        } else {
            $('#' + childid).addClass('vf-hide');
        }
    } else {
        var strinput = '';
        strinput += '<div id="child' + element.parentElement.id + '" style="z-index:999;position:absolute;padding-left:20px;padding-top:10px;">'
        strinput += '<div class="grid-pop pull-right" style="width:194px;height: 38px;">';
        strinput += '<div class="con-area">';
        strinput += ' <div class="form-group mb0">';
        //applyval = storedFilterVal;
        //if (storedFilterVal != '') {
        strinput += ' <input type="text" id="txtxcustomfilterfield"  title="wildcard (%,*,?,_) can be used to match any sequence of chars or single char."   value=" " class="form-control txtfilterclass" autofocus>'; //placeholder = "Test"
        //} else {
        //    strinput += ' <input type="text" id="txtx' + gId + datafield + '" onkeyup="enableWildGobutton(this, ' + gId + ')"   title="wildcard (%,*,?,_) can be used to match any sequence of chars or single char."   value="' + storedFilterVal + '" class="form-control txtfilterclass">'; //placeholder = "Test"
        //}
        strinput += ' </div>';

        strinput += ' </div>';
        strinput += ' </div>';
        strinput += ' </div>';
        inputdiv.append(strinput);
        document.getElementById("txtxcustomfilterfield").focus();
    }
    $('.txtfilterclass').keyup(function (e) {

        if (e.keyCode == 13) {
            $('#' + childid).addClass('vf-hide');
            column = document.getElementById(columnid);
            var inputvalue = column.getElementsByTagName("input");
            if ($(inputvalue).val().trim() == "") {
                $(column.getElementsByTagName("a")).addClass('icon-default');
                $(column.getElementsByTagName("a")).removeClass('icon-default-select');
            } else {
                $(column.getElementsByTagName("a")).removeClass('icon-default');
                $(column.getElementsByTagName("a")).addClass('icon-default-select');
            }

            if (inputvalue && inputvalue.txtxcustomfilterfield) {
                var filterValue = inputvalue.txtxcustomfilterfield.value;
                if (filterValue && filterValue.trim() != "")
                    callBackOnCustomFilter(true);
                else
                    callBackOnCustomFilter(false);
            }

            applyVFCustomfilterOnEnter(tableid, columnindex, dataArray, $(this).val());
        }
    });

    $('.txtfilterclass').blur(function (e) {
        $('#' + childid).addClass('vf-hide');
        column = document.getElementById(columnid);
        var inputvalue = column.getElementsByTagName("input");
        if ($(inputvalue).val().trim() == "") {
            $(column.getElementsByTagName("a")).addClass('icon-default');
            $(column.getElementsByTagName("a")).removeClass('icon-default-select');
        } else {
            $(column.getElementsByTagName("a")).removeClass('icon-default');
            $(column.getElementsByTagName("a")).addClass('icon-default-select');
        }
        if (inputvalue && inputvalue.txtxcustomfilterfield) {
            var filterValue = inputvalue.txtxcustomfilterfield.value;

        }

        if (inputvalue && inputvalue.txtxcustomfilterfield) {
            var filterValue = inputvalue.txtxcustomfilterfield.value;
            if (filterValue && filterValue.trim() != "")
                callBackOnCustomFilter(true);
            else
                callBackOnCustomFilter(false);
        }

        applyVFCustomfilterOnEnter(tableid, columnindex, dataArray, $(this).val());
    });
}


function applyVFCustomfilterOnEnter(tableid, columnindex, chrArr, checkvalue) {

    var table = document.getElementById(tableid);
    var tbody = $('#tbody' + tableid);
    var tr = table.getElementsByTagName("tr");
    var dataexist = false;
    var th = tr[0].getElementsByTagName("th");
    for (var k = 0; k < tr.length; k++) {
        tr[k].style.display = '';
    }
    for (var j = 0; j < th.length; j++) {
        var inputElement = th[j].getElementsByTagName("input");
        if (inputElement.length > 0 && inputElement[0].value != "") {

            for (i = 0; i < tr.length; i++) {
                var checkvalue = inputElement[0].value.trim();
                var filtercondition = 'contains';

                if (checkvalue.indexOf("?") < 0 && checkvalue.indexOf("_") < 0) {
                    if (checkvalue.indexOf("*") >= 0 || checkvalue.indexOf("%") >= 0) {
                        var chrArr = '';
                        if (checkvalue.indexOf("%") >= 0) {
                            chrArr = checkvalue.split('%');
                        } else {
                            chrArr = checkvalue.split('*');
                        }
                        if (chrArr[0] != '') {
                            filtercondition = 'starts_with';
                            filtervalue = chrArr[0];
                        } else if (chrArr[chrArr.length - 1] != '') {
                            if (chrArr[chrArr.length - 1] != '') {
                                filtercondition = 'ends_with';
                                filtervalue = chrArr[chrArr.length - 1];
                            } else {
                                for (var m = (chrArr.length - 1); m >= 0; m--) {
                                    filtercondition = 'contains';
                                    filtervalue = chrArr[m];
                                }
                            }
                        } else if (chrArr[chrArr.length - 2] != '') {
                            filtercondition = 'contains';
                            filtervalue = chrArr[chrArr.length - 2];
                        }
                    }
                    else {
                        filtervalue = checkvalue;
                        if (checkvalue == '') {
                            filtercondition = 'contains';
                        } else {
                            filtercondition = 'EQUAL';
                        }
                    }
                    if (tr[i].style.display != 'none') {
                        td = tr[i].getElementsByTagName("td")[j];
                        if (td) {
                            span = td.getElementsByTagName("span")[0];
                            if (span) {
                                var source = span.innerHTML.toUpperCase();
                                switch (filtercondition) {
                                    case 'contains':
                                        if (source.indexOf(filtervalue.toUpperCase()) > -1) {
                                            dataexist = true;
                                            tr[i].style.display = "";
                                        } else {
                                            tr[i].style.display = "none";
                                        }
                                        break;
                                    case 'EQUAL':
                                        if (source == filtervalue.toUpperCase()) {
                                            dataexist = true;
                                            tr[i].style.display = "";
                                        } else {
                                            tr[i].style.display = "none";
                                        }
                                        break;
                                    case 'starts_with':
                                        if (startsWithString(source, filtervalue.toUpperCase())) {
                                            dataexist = true;
                                            tr[i].style.display = "";
                                        } else {
                                            tr[i].style.display = "none";
                                        }
                                        break;
                                    case 'ends_with':
                                        if (endswithString(source, filtervalue.toUpperCase())) {
                                            dataexist = true;
                                            tr[i].style.display = "";
                                        } else {
                                            tr[i].style.display = "none";
                                        }
                                        break;
                                }
                            }
                        }
                    }

                } else {
                    if (checkvalue.indexOf("?") >= 0 || checkvalue.indexOf("_") >= 0) {
                        var singleCharArr = '';
                        singleCharArr = checkvalue.split('');

                        if (tr[i].style.display != 'none') {
                            td = tr[i].getElementsByTagName("td")[j];
                            if (td) {
                                span = td.getElementsByTagName("span")[0];
                                if (span) {
                                    var source = span.innerHTML.toUpperCase();
                                    var sourceArr = source.split('');
                                    var lengthCheck = 0;
                                    if (sourceArr.length == singleCharArr.length) {
                                        for (y = 0; y < singleCharArr.length; y++) {
                                            if ((singleCharArr[y] != '?' && singleCharArr[y] != '_')) {
                                                if (singleCharArr[y].toUpperCase() != sourceArr[y]) {
                                                    tr[i].style.display = "none";
                                                    break;
                                                }
                                                else {
                                                    lengthCheck++;
                                                }
                                            }
                                            if (singleCharArr[y] == '?' || singleCharArr[y] == '_') {
                                                lengthCheck++;
                                            }
                                        }
                                        if (lengthCheck == singleCharArr.length) {
                                            dataexist = true;
                                            tr[i].style.display = "";
                                        }
                                    }
                                    else {
                                        tr[i].style.display = "none";
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //if (!dataexist) {
    //    var tableElement=$('#'+tableid);
    //    var strinput = '';
    //    strinput += '<div id="tablenodatafound" style="text-align:center;font-size:24px;" class="">No Data Found</div>';
    //    tableElement.append(strinput);
    //}else{
    //    $('#tablenodatafound').remove();
    //}
}

function customTableMultichoiceFilter(element, filtersArray, gId, callBackOnCustomFilter) {
    var inputdiv = $('#' + element.parentElement.id);
    var columnid = element.parentElement.id;
    var columnindex = columnid.split('header')[0];
    var tableid = columnid.split('header')[1];
    var childid = 'child' + element.parentElement.id;
    if (inputdiv.children('div').hasClass('grid-pop')) {
        if (inputdiv.children('div').hasClass('vf-hide')) {
            inputdiv.children('div').removeClass('vf-hide');
        } else {
            inputdiv.children('div').addClass('vf-hide');
        }
    }

    var storedFilterArr = new Array();
    var gridStorage = JSON.parse(sessionStorage.getItem(gId + "gridStorage"));
    if (gridStorage && gridStorage.length > 0) {
        if (!_.isEmpty(gridStorage[0].checkedValues) && gridStorage[0].checkedValues.length > 0) {
            for (var j = 0; j < gridStorage[0].checkedValues.length; j++) {
                storedFilterArr.push(gridStorage[0].checkedValues[j].value);
            }
        }
    }

    var strinput = '';
    strinput += '<div id="multiChoiceDiv' + tableid + '" class="grid-pop multi-choice" style="width:216px;position:absolute;z-index: 999">';
    strinput += '<div class="con-area checkboxdiv' + columnid + '" id="checkboxdiv' + columnid + '" style="display: block;height: 110px;overflow-y: auto;width: 214px;">';
    if (filtersArray && filtersArray.length > 0) {
        for (var i = 0; i < filtersArray.length; i++) {
            if ($.inArray(filtersArray[i].ControlValue, storedFilterArr) < 0) {
                strinput += '<div id="#multiCheckDiv' + columnid + '" class="checkbox" style="padding-left: 7px">';
                strinput += '<label>';
                strinput += '<input type="checkbox" id="chkCustomMultiChoice" class="checkItem" value="' + filtersArray[i].ControlValue + '">' + filtersArray[i].Value;
                strinput += '</label>';
                strinput += ' </div>';
            } else {
                strinput += '<div id="#multiCheckDiv' + columnid + '" class="checkbox" style="padding-left: 7px">';
                strinput += '<label>';
                strinput += '<input type="checkbox" id="chkCustomMultiChoiceFiltered" checked=true class="checkItem" value="' + filtersArray[i].ControlValue + '">' + filtersArray[i].Value;
                strinput += '</label>';
                strinput += ' </div>';
            }
        }
    }
    strinput += '</div>';
    strinput += '<div class="btn-footer">';
    if (storedFilterArr && storedFilterArr.length > 0)
        strinput += ' <button id="UiMultiChoiceFilterClear' + gId + '" class="btn btn-default UiMultiChoiceFilterClearTable">' + i18n.t('reset', {
            lng: lang
        }) + '</button>';
    else
        strinput += ' <button id="UiMultiChoiceFilterClear' + gId + '" class="btn btn-default UiMultiChoiceFilterClearTable" disabled=true>' + i18n.t('reset', {
            lng: lang
        }) + '</button>';
    strinput += ' <button id="UiMultiChoiceFilter' + gId + '" class="btn btn-primary UiMultiChoiceFilterTable">' + i18n.t('go', {
        lng: lang
    }) + '</button>';
    strinput += ' </div>';
    strinput += '</div>';

    inputdiv.children('div').remove();
    inputdiv.append(strinput);

    $('.UiMultiChoiceFilterTable').on("click", function () {
        $('#' + childid).addClass('vf-hide');
        column = document.getElementById(columnid);
        var checkedOptions = new Array();
        var e = $("#UiMultiChoiceFilter" + gId).parent('div').prev('div').children('div');
        $(e).find("input:checkbox").each(function (i, ob) {
            if ($(ob).is(':checked')) {
                var obj = new Object();
                obj.value = $(ob).val();
                checkedOptions.push(obj);
            }
        });

        if (checkedOptions && checkedOptions.length > 0) {
            $(column.getElementsByTagName("a")).removeClass('icon-default');
            $(column.getElementsByTagName("a")).addClass('icon-default-select');
            $("#UiMultiChoiceFilterClear" + gId).prop('disabled', false);
            $("#UiMultiChoiceFilter" + gId).parent('div').prev('div').parent('div').addClass('vf-hide');
            callBackOnCustomFilter(true);
        } else {
            $(column.getElementsByTagName("a")).addClass('icon-default');
            $(column.getElementsByTagName("a")).removeClass('icon-default-select');
            callBackOnCustomFilter(false);
        }

        var gridStorageArr = new Array();
        var gridStorageObj = new Object();
        gridStorageObj.checkedValues = checkedOptions;
        gridStorageArr.push(gridStorageObj);
        var gridStorage = JSON.stringify(gridStorageArr);
        window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);

        applyVFCustomTableMultichoiceFilter(tableid, columnindex, checkedOptions);
    });

    $('.UiMultiChoiceFilterClearTable').on("click", function () {
        column = document.getElementById(columnid);
        $(".checkboxdiv" + columnid).empty();
        var strinput = '';
        if (filtersArray && filtersArray.length > 0) {
            for (var i = 0; i < filtersArray.length; i++) {
                strinput += '<div id="#multiCheckDiv' + columnid + '" class="checkbox" style="padding-left: 7px">';
                strinput += '<label>';
                strinput += '<input type="checkbox" class="checkItem" value="' + filtersArray[i].ControlValue + '">' + filtersArray[i].Value;
                strinput += '</label>';
                strinput += ' </div>';
            }
        }
        $(".checkboxdiv" + columnid).append(strinput);
        $("#UiMultiChoiceFilterClear" + gId).prop('disabled', true);
        $("#UiMultiChoiceFilterClear" + gId).parent('div').prev('div').parent('div').addClass('vf-hide');
        $(column.getElementsByTagName("a")).addClass('icon-default');
        $(column.getElementsByTagName("a")).removeClass('icon-default-select');

        var gridStorageArr = new Array();
        var gridStorageObj = new Object();
        gridStorageObj.checkedValues = [];
        gridStorageArr.push(gridStorageObj);
        var gridStorage = JSON.stringify(gridStorageArr);
        window.sessionStorage.setItem(gId + 'gridStorage', gridStorage);

        applyVFCustomTableMultichoiceFilter(tableid, columnindex, []);
    });

    $(document).mousedown(function (e) {
        if (!$('#multiChoiceDiv' + gId).is(e.target) && $('#multiChoiceDiv' + gId).has(e.target).length === 0) {
            $("#UiMultiChoiceFilterClear" + gId).parent('div').prev('div').parent('div').addClass('vf-hide');
        }
    });
}

function applyVFCustomTableMultichoiceFilter(tableid, columnindex, checkedItems) {

    var table = document.getElementById(tableid);
    var tbody = $('#tbody' + tableid);
    var tr = table.getElementsByTagName("tr");
    var th = tr[0].getElementsByTagName("th");
    if (tr && tr.length > 0) {
        for (var i = 0; i < tr.length; i++) {
            tr[i].style.display = '';
        }

        if (checkedItems && checkedItems.length > 0) {
            if (th && th.length > 0) {
                for (var j = 0; j < th.length; j++) {
                    var inputElement = th[j].getElementsByTagName("input");
                    if (inputElement && inputElement.length > 0 && inputElement[0].value != "") {
                        for (var k = 0; k < tr.length; k++) {
                            for (var m = 0; m < checkedItems.length; m++) {
                                var filterOption = checkedItems[m].value;
                                if (tr[k].style.display != 'none') {
                                    td = tr[k].getElementsByTagName("td")[j];
                                    if (td) {
                                        span = td.getElementsByTagName("span")[0];
                                        if (span) {
                                            var source = span.innerHTML.toUpperCase();
                                            if (source == filterOption.toUpperCase()) {
                                                tr[k].style.display = "";
                                                break;
                                            } else {
                                                if (m == checkedItems.length - 1) {
                                                    tr[k].style.display = "none";
                                                } else {
                                                    continue;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

function getDisableWindowHeight(gId) {
    var windowheight = $(window).height();
    return (windowheight - $("#" + gId).offset().top) - $(".fixed-footer").height() - 74;
}

function getDiagnosticFilter(ColumnSortFilter) {
    var coulmnFilter = new Object();
    coulmnFilter.FilterColumn = "FullName";
    coulmnFilter.FilterValue = "!=System System";
    if (ColumnSortFilter.FilterList)
        ColumnSortFilter.FilterList.push(coulmnFilter);
    else {
        var filterList = new Array();
        filterList.push(coulmnFilter);
        ColumnSortFilter.FilterList = filterList;
    }
    return ColumnSortFilter;
}

function setUserPreferencesColumns(gridName, resizedColumns, gridColumns) {
    var columns = [];
    columns = _.where(resizedColumns, { GridId: gridName });
    if (!_.isEmpty(columns) && columns.length > 0) {
        for (var i = 0; i < columns.length; i++) {
            var index = gridColumns.findIndex(function (item) { return item.datafield === columns[i].ColumnId });
            if (index > -1) {
                gridColumns[index].width = columns[i].Width;
            }
        }
    }
    return gridColumns;
}