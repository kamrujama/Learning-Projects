define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "AppConstants"], function (ko) {

    viewIpConfigResult = new Array();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function sourceIpValidationViewModel() {

    
        var self = this;
        
        
        self.results = ko.observable();
        self.observableModelPopupIP = ko.observable();
        self.observableModelPopup = ko.observable();
        self.ipValForClient = ko.observable(false);
        viewIPConfigImportResult(viewIpConfigResult);
        $("#loadingDiv").show();
        self.clearfilterModelView = function (gID) {
            $("#" + gID).jqxGrid('clearselection');
            $("#" + gID).jqxGrid('updatebounddata');
        }


        //open popup
        self.templateFlag = ko.observable(false);
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup', 1);
        loadelement(modelName, 'genericPopup', 2);
        self.columnlist = ko.observableArray();
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['CreatedOn', 'ImportedFile', 'StatusFileURL'];

        // unload template
        self.unloadTempPopup = function (popupName, gID) {
            self.observableModelPopupIP(popupName);
            checkIsPopUpOPen();
        };

        self.unloadPopup = function (popupName, gID) {
            self.observableModelPopup(popupName);
            checkIsPopUpOPen();
        }
        modelReposition();
        self.openPopup = function (popupName, gID) {
            self.templateFlag(true);

            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gID);
                self.columnlist(genericHideShowColumn(gID, true, compulsoryfields));
                loadelement(popupName, 'genericPopup', 1);
                $('#modelcloseShowHide').modal('show');
            }
        }


        $('#mdlViewIpConfigHeader').mouseup(function () {
            $("#mdlViewIpConfig").draggable({ disabled: true });
        });

        $('#mdlViewIpConfigHeader').mousedown(function () {
            $("#mdlViewIpConfig").draggable({ disabled: false });
        });


        //Export to excel
        self.exportToExcelModelView = function (gID, data) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {

                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                exportjqxcsvData(gID,'AddIPRange_view_import'); 
                 setTimeout(function () {
                    openAlertpopup(1, 'export_Information');
                }, 3000);
                $("#loadingDiv").hide();
            }
        }

        function loadelement(elementname, controllerId, flage) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            if (flage == 2) {
                self.observableModelPopup(elementname);
            } else {
                self.observableModelPopupIP(elementname);
            }
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
});



function jqxgridViewIpConfigFileImport(viewIpConfigResult, gID) {
    if(viewIpConfigResult || viewIpConfigResult != '') {
        for (var i = 0; i < viewIpConfigResult.length; i++) {           /// Filter is not applicable for value Zero if  set zero as string null this code below currently this code is not in used
            var totCount = viewIpConfigResult[i].TotalRecordsCount;
            var successCount = viewIpConfigResult[i].SuccessCount;
            if (successCount == "Null" || totCount == "Null") {
                if (successCount == "Null") {
                    successCount = 0;
                }
                if (totCount == "Null") {
                    totCount = 0;
                }
                var errorCount = totCount - successCount;
                viewIpConfigResult[i].ErrorCount = errorCount;
            } else {
                var errorCount = totCount - successCount;
                viewIpConfigResult[i].ErrorCount = errorCount;
            }
            if (viewIpConfigResult[i].ErrorCount == 0) {
            }

        }
    }
    // prepare the data
    var source =
    {
        datatype: "json",
        localdata: viewIpConfigResult,
        datafields: [
             { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
             { name: 'ImportedFile', map: 'ImportedFile' },
             { name: 'TotalRecordsCount', map: 'TotalRecordsCount' },
             { name: 'SuccessCount', map: 'SuccessCount' },
             { name: 'ErrorCount', map: 'ErrorCount' },
             { name: 'FullName', map: 'UserInfo>FullName' },
             { name: 'StatusFileURL', map: 'StatusFileURL' },
        ],

    };
    $("#" + gID).on("bindingcomplete", function (event) {
        var datainfo = $("#" + gID).jqxGrid('getdatainformation');
        $("#showResult").text(i18n.t('showing', { results: datainfo.rowscount }, { lng: lang }))
    });
    var dataAdapter = new $.jqx.dataAdapter(source);
    var buildFilterPanel = function (filterPanel, datafield) {
         wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID,true);
        //genericBuildFilterPanelFordateUI(filterPanel, datafield, dataAdapter, gID);
    }
    var buildFilterPanelUiDate = function (filterPanel, datafield) {
        // wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID,true);
        genericBuildFilterPanelFordateUI(filterPanel, datafield, dataAdapter, gID);
    }



    var buildFilterPanelUiDate = function (filterPanel, datafield) {
        // wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID,true);
        genericBuildFilterPanelFordateUI(filterPanel, datafield, dataAdapter, gID, "isUIDateFilter");
        return;
    }

    var downLoadIpConfig = function (row, columnfield, value, defaulthtml, columnproperties) {

        return '<div style="padding-left:5px;padding-top:7px;"><a  id="imageId" tabindex="0"  width="50" title="Download" width="50"   onClick="viewModelSourceIp(' + row + ')"><span style="padding-left:5px;padding-right:5px"><u>View Import Details</u></span><i class="icon-download3" style="padding-right:5px;"></i></a>&nbsp;</div>';

    }

    var totalRecordRender = function (row, columnfield, value, defaulthtml, columnproperties) {
        var downloadIpConfigUrl = $("#" + gID).jqxGrid('getcellvalue', row, 'TotalRecordsCount');
    }

    this.gID = $('#jqxgridViewIpConfigResult');

    // create jqxgrid.
    $("#" + gID).jqxGrid(
    {
        width: "100%",
        source: dataAdapter,
        sortable: true,
        filterable: true,
        columnsResize: true,
        columnsreorder: true,
        selectionmode: 'singlerow',
        theme: AppConstants.get('JQX-GRID-THEME'),
        autoshowcolumnsmenubutton: false,
        rowsheight: 32,
        showsortmenuitems: false,
        enabletooltips: true,
        altrows: true,

        columns: [

            {
                text: i18n.t('import_date', { lng: lang }), datafield: 'CreatedOn',columntype: 'datetimeinput', minwidth: 150,  cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelUiDate(filterPanel, datafield);
                },

            },

          {
              text: i18n.t('filename', { lng: lang }), datafield: 'ImportedFile', minwidth: 100,
              filtertype: "custom",
              createfilterpanel: function (datafield, filterPanel) {
                  buildFilterPanel(filterPanel, datafield);
              },

          },

          {
              text: i18n.t('total_count', { lng: lang }), datafield: 'TotalRecordsCount', minwidth: 120,  enabletooltips: false,
              filtertype: "custom", cellsrenderer: totalRecordRender,
              createfilterpanel: function (datafield, filterPanel) {
                  buildFilterPanel(filterPanel, datafield);
              },

          },
          {
              text: i18n.t('success_count', { lng: lang }), datafield: 'SuccessCount', minwidth: 100,  enabletooltips: false,
              filtertype: "custom",
              createfilterpanel: function (datafield, filterPanel) {
                  buildFilterPanel(filterPanel, datafield);
              },

          },
          {
              text: i18n.t('error_count', { lng: lang }), datafield: 'ErrorCount', minwidth: 100,  enabletooltips: false,
              filtertype: "custom",
              createfilterpanel: function (datafield, filterPanel) {
                  buildFilterPanel(filterPanel, datafield);
              },

          },
          {
              text: i18n.t('uploaded_by', { lng: lang }), datafield: 'FullName', minwidth: 100, menu: false, sortable: false, filterable: false,

          },
          {
              text: i18n.t('results', { lng: lang }), datafield: 'StatusFileURL', minwidth: 100,  menu: false, sortable: false, filterable: false, exportable: false, enabletooltips: false, cellsrenderer: downLoadIpConfig,

          },
        ]
    }).on({
        filter: function (e) { self.gridSetRowDetails(e); }
    });

}

var gridSetRowDetails = function (e) {
    var self = this;
    this.gID.jqxGrid('beginupdate');
    var results = self.gID.jqxGrid('getrows').length;
    $("#showResult").text(i18n.t('showing', { results: results }, { lng: lang }));
    this.gID.jqxGrid('resumeupdate');
    return;

};

function viewIPConfigImportResult() {

    var logId = 0;
    var importType = ENUM.get('IMPORT_LOG_TYPE_IP_RANGES_IMPORT');
    function callbackFunction(data, error) {
        if (data) {
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                if (data.importStatus && data.importStatus != '') {
                    data.importStatus = $.parseJSON(data.importStatus);

                    viewIpConfigResult = data.importStatus;
                    jqxgridViewIpConfigFileImport(viewIpConfigResult, 'jqxgridViewIpConfigResult');
                   
                } else {
                    viewIpConfigResult = [];
                    jqxgridViewIpConfigFileImport(viewIpConfigResult, 'jqxgridViewIpConfigResult');
                }
                $("#loadingDiv").hide();
            }
        }
    }

    var method = 'GetImportLogs';
    var params = '{"token":"' + TOKEN() + '","importLogType":"' + importType + '","logId":"' + logId + '"}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
}
function viewModelSourceIp(row) {
    var url = $("#jqxgridViewIpConfigResult").jqxGrid('getcellvalue', row, 'StatusFileURL');
    window.open(url, '_blank');

}