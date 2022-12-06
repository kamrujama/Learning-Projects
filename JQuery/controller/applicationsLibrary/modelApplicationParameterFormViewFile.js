define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    //var columnSortFilterforApplicationParaTemplate = ko.observable();
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelViewApplicatonsParameterTemplate() {
        
        var self = this;
        $("#mdlFormViewFile").draggable();
        
        //Draggable function
        $('#mdlFormViewFileHeader').mouseup(function () {
            $("#mdlFormViewFile").draggable({ disabled: true });
        });

        $('#mdlFormViewFileHeader').mousedown(function () {
            $("#mdlFormViewFile").draggable({ disabled: false });
        });
        /////////

        self.flag = ko.observable(true);

        if (self.flag()) {
            var param = applicationsParameterFormViewFileParameters(false, null);
            applicationsParameterFormViewFileGrid('applicationParaFromViewFileGrid', param);
        }
    }

    function applicationsParameterFormViewFileGrid(gID, param) {

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
          
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetPFXByApplicationName",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getPFXByApplicationNameResp) {
                    data.getPFXByApplicationNameResp = $.parseJSON(data.getPFXByApplicationNameResp);
                }
                else data.getPFXByApplicationNameResp = [];

                if (data.getPFXByApplicationNameResp && data.getPFXByApplicationNameResp.PaginationResponse) {
                    source.totalrecords = data.getPFXByApplicationNameResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getPFXByApplicationNameResp.PaginationResponse.TotalPages;
                } else {
                    source.totalrecords = 0;
                    source.totalpages = 0;
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
                        param.getPFXByApplicationNameReq.Pagination.PageNumber = Number(pagerInfo.pagenum) + 1;
                    } else {
                        param.getPFXByApplicationNameReq.Pagination.PageNumber = 1;
                    }
                    param.getPFXByApplicationNameReq.ColumnSortFilter = columnSortFilter;
                    param.getPFXByApplicationNameReq.Pagination.HighLightedItemId = gridStorage[0].highlightedRow;
                    data = JSON.stringify(param);
                    return data;
                },
                
            }
        );

    }

    function applicationsParameterFormViewFileParameters() {
        var getPFXByApplicationNameReq = new Object(); 
        var ApplicationId = new Object();
        var ApplicationName = new Object();
        getPFXByApplicationNameReq.ApplicationId = ApplicationId;
        getPFXByApplicationNameReq.ApplicationName = ApplicationName;
        getPFXByApplicationNameReq.VPDXVersion = VPDXVersion;
        var param = new Object();
        param.token = TOKEN();
        param.getPFXByApplicationNameReq = getPFXByApplicationNameReq;
        return param;
    }

});