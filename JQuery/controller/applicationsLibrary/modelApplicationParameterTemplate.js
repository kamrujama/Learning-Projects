define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var columnSortFilterforApplicationParaTemplate = ko.observable();
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelViewApplicatonsParameterTemplate() {
        
        var self = this;

        //Draggable function
        $('#mdlTemplateHeader').mouseup(function () {
            $("#mdlTemplate").draggable({ disabled: true });
        });

        $('#mdlTemplateHeader').mousedown(function () {
            $("#mdlTemplate").draggable({ disabled: false });
        });
		
        //for parameterTemplate
        var param = applicationsParameterTemplateparameters(false, columnSortFilterforApplicationParaTemplate, null);
        applicationsParameterTemplateGrid('applicationParaTemplateGrid', param);
            
        }
        // for parameter template
        function applicationsParameterTemplateGrid(gID, param) {
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
            gridStorageArr.push(gridStorageObj);
            var gridStorage = JSON.stringify(gridStorageArr);
            window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
            var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));


            var source =
            {
                dataType: "json",
                dataFields: [
                         { name: 'isSelected', type: 'number' },
                ],
                root: 'GetApplicationParameterTemplates',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetApplicationParameterTemplates",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data && data.getApplicationParameterTemplatesResp) {
                        data.getApplicationParameterTemplatesResp = $.parseJSON(data.getApplicationParameterTemplatesResp);
                    }
                    else data.getApplicationParameterTemplatesResp = [];
                    if (data.getApplicationParameterTemplatesResp && data.getApplicationParameterTemplatesResp.PaginationResponse) {
                        source.totalrecords = data.getApplicationParameterTemplatesResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getApplicationParameterTemplatesResp.PaginationResponse.TotalPages;
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                    }
                },
                downloadComplete: function (data, status, xhr) {
                    if (data && data.getApplicationParameterTemplatesResp) {
                        data.getApplicationParameterTemplatesResp = $.parseJSON(data.getApplicationParameterTemplatesResp);
                    }
                },

            };


            var dataAdapter = new $.jqx.dataAdapter(source,
                {
                    formatData: function (data) {
                        columnSortFilter = new Object();
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage);
                        var pagerInfo = $("#" + gID).jqxGrid('getpaginginformation');
                        if (pagerInfo.pagenum && pagerInfo.pagesize != null) {
                            param.getApplicationParameterTemplatesReq.Pagination.PageNumber = Number(pagerInfo.pagenum) + 1;
                        } else {
                            param.getApplicationParameterTemplatesReq.Pagination.PageNumber = 1;
                        }
                        param.getApplicationParameterTemplatesReq.ColumnSortFilter = columnSortFilter;
                        param.getApplicationParameterTemplatesReq.Pagination.HighLightedItemId = gridStorage[0].highlightedRow;
                        data = JSON.stringify(param);
                        return data;
                    }
                }
            );


            $("#" + gID).bind("sort", function (event) {
                $("#" + gID).jqxGrid('updatebounddata');
            });

            //for allcheck
            var rendered = function (element) {
                enablegridfunctions(gID, 'ApplicationId', element, gridStorage, true);
                return true;
            }
        }
      
    
    function applicationsParameterTemplateparameters(columnSortFilterforApplicationParaTemplate) {
        var getApplicationParameterTemplatesReq = new Object();
        var ApplicationId = new Object();
        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        var ColumnSortFilter = columnSortFilterforApplicationParaTemplate;

        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Export.DynamicColumns = null;
        Export.ExportReportType = 5;
        Export.IsExport = false;

        getApplicationParameterTemplatesReq.ColumnSortFilter = ColumnSortFilter;
        getApplicationParameterTemplatesReq.Pagination = Pagination;
        getApplicationParameterTemplatesReq.ColumnSortFilter = null;
        getApplicationParameterTemplatesReq.Export = Export;

        var param = new Object();
        param.token = TOKEN();
        param.getApplicationParameterTemplatesReq = getApplicationParameterTemplatesReq;
        
        return param;
    }


});