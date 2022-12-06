var isAlldelIp = '';
var ipSourceRowId = '';
var isDeleteEnable = false;
var isCheckAllowed = false;
define(["knockout", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "AppConstants"], function (ko, autho) {

    var lang = getSysLang();
    sourceIpValidationData = new Array();
    length =new Object();
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function sourceIpValidationViewModel() {

     
        var ispageload = 0;
        var self = this;
       
        $('#refreshGroupList').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#refreshGroupList').click();
            }
        });
        $('#addGroup').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#addGroup').click();
            }
        });
        $('#deleteGroups').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#deleteGroups').click();
            }
        });

        //--------------------FOCUS ON CONFO AND--------------------------------

        $('#modelViewDeleteIp').keydown(function (e) {
            if ($('#deleteIpnoBtn').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deleteYes').focus();
            }
        });
        $('#modelViewDeleteIp').on('shown.bs.modal', function (e) {
            $('#deleteIpnoBtn').focus();

        });
        //---------------------------------------------------------------------

        checkDeleteRights();
        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        function checkDeleteRights () {
            var retval = autho.checkRightsBYScreen('System Settings', 'IsModifyAllowed');
            if (retval == true) {
                $("#checkboxeForGUIAndClient").find("input").prop("disabled", false);
                isDeleteEnable = true;
            } else {
                $("#checkboxeForGUIAndClient").find("input").prop("disabled", true);
                isDeleteEnable = false;
            }
            isCheckAllowed = retval;
        }

        self.checkboxRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        self.observableModelPopup = ko.observable(); 
        self.observableModelPopupViewModel = ko.observable();
        self.ipValForClient = ko.observable(false);
        
        getSourceIpValidationDetails(sourceIpValidationData);
        isAlldelIp = '';

       
        self.clearfilter = function (gId) {
            $("#" + gId).jqxGrid('clearselection');
            $("#" + gId).jqxGrid('updatebounddata');
        }

        self.refreshGrid = function (gId) {
           getSourceIpValidationDetails(sourceIpValidationData);
        }

        self.sourceIPValForClientCheckbox = function () {
            var checkVal = $("#valGuiClient").is(':checked');
            sourceIPValClientCheckbox(checkVal, 1, sourceIpValidationData);
        }

        self.sourceIPValForDeviceCheckbox = function () {
            var valDevice = $("#Valdevice").is(':checked');
            sourceIPValClientCheckbox(valDevice, 2, sourceIpValidationData);
        }

        // unload template
        self.unloadTempPopup = function (popupName, gId, flag) {
            if (flag == 1) {
                self.observableModelPopupViewModel(popupName);
                $('#viewModelAddIP').modal('hide');
            } else {
                self.observableModelPopup(popupName);
                $('#viewSourceIpValidationModal').modal('hide');                
            }
            checkIsPopUpOPen();
        };

        //open popup
        self.templateFlag = ko.observable(false);
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup',1);
        loadelement(modelName, 'genericPopup', 2);

        setMenuSelection();
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelAddSourceIPValidation") {
                loadelement(popupName, 'administration',1);
                $('#viewModelAddIP').modal('show');
            } else if (popupName == "modelViewIPConfigImportResult") {
                loadelement(popupName, 'administration',2);
                $('#viewSourceIpValidationModal').modal('show');
            }

        }

        // Export to excel
        self.exportToExcel = function (gID, data) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                exportjqxcsvData(gID,'SourceIPConfig');        
                setTimeout(function () {
                    openAlertpopup(1, 'export_Information');
                }, 3000);
                $("#loadingDiv").hide();
            }
        }

        self.deleteIpConfoYes = function () {
            deleteSourceIpValidation('jqxgridSourceIPValidation', isAlldelIp);
        }


        function loadelement(elementname, controllerId,flag) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            if (flag == 1) {
                self.observableModelPopupViewModel(elementname);
            } else {
                self.observableModelPopup(elementname);
            }
           
        }
        //delete Single
        self.deleteSourceIpVal = function (isAllDel) {
            isAlldelIp = isAllDel;
            var getRowData = $("#jqxgridSourceIPValidation").jqxGrid('getdatainformation');
            if (getRowData.rowscount > 0) {
                confirmationInfo(null, isAlldelIp);
            } else {

            }
        }

        seti18nResourceData(document, resourceStorage);

    }

    function sourceIPValClientCheckbox(valueGuiCheckbox, iPRangeVal,sourceIpValidationData) {

        var enableIPRangesForGUIandDevice = new Object();
        if (iPRangeVal == 1) {
            enableIPRangesForGUIandDevice.iPRangeValidation = ENUM.get('IPRANGEVALIDATION_GUI');
        } else if (iPRangeVal == 2) {
            enableIPRangesForGUIandDevice.iPRangeValidation = ENUM.get('IPRANGEVALIDATION_DEVICE');
        }
      
        enableIPRangesForGUIandDevice.isEnabled = valueGuiCheckbox;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (iPRangeVal == 1) {
                        if (valueGuiCheckbox == true) {
                            openAlertpopup(0, 'source_ip_validation_for_gui_is_enabled');
                            getSourceIpValidationDetails(sourceIpValidationData);
                        } else {
                            openAlertpopup(0, 'source_ip_validation_for_gui_is_disabled');
                            getSourceIpValidationDetails(sourceIpValidationData);
                        }
                       
                    } else if (iPRangeVal == 2) {
                        if (valueGuiCheckbox == true) {
                            openAlertpopup(0, 'source_ip_validation_for_divice_is_enabled');
                            getSourceIpValidationDetails(sourceIpValidationData);
                        } else {
                            openAlertpopup(0, 'source_ip_validation_for_device_is_disabled');
                            getSourceIpValidationDetails(sourceIpValidationData);
                        }
                    }
                } 
            }
        }

        var method = 'EnableIPRangesForGUIandDevice';
        var params = '{"token":"' + TOKEN() + '","iPRangeValidation":' + enableIPRangesForGUIandDevice.iPRangeValidation + ',"isEnabled":"' + enableIPRangesForGUIandDevice.isEnabled + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
        
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

function jqxgridSourceIpValidation(paramIpsource, gID) {

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

    var InitGridStoragObj = initGridStorageObj(gID);
    var gridStorage = InitGridStoragObj.gridStorage;
    
    
 
    // prepare the data
    var source =
    {
        datatype: "json",
        datafields: [
            { name: 'StartRange', map: 'StartRange' },
            { name: 'EndRange', map: 'EndRange' },
            { name: 'IsActive', map: 'UserInfo>IsActive' },
            { name: 'FullName', map: 'UserInfo>FullName' },
            { name: 'IPRangeId', map: 'IPRangeId' }
        ],
        root: 'ValidIPRanges',
        type: "POST",
        data: paramIpsource,
        url: AppConstants.get('API_URL') + "/GetValidIPRanges",
        contentType: 'application/json',
    };
    var dataAdapter = new $.jqx.dataAdapter(source, {
        formatData: function (data) {
            $('#jqxgridSourceIPValidation').jqxGrid('clear');
            $('.all-disabled').show();
            $("#loadingDiv").show();
            data = JSON.stringify(paramIpsource);
            return data;
        },
        downloadComplete: function (data, status, xhr) {
            $("#loadingDiv").hide();
            if (data.getValidIPRangesResp) {
                data.getValidIPRangesResp = $.parseJSON(data.getValidIPRangesResp);
                if (data.getValidIPRangesResp.ValidIPRanges == null) data.getValidIPRangesResp.ValidIPRanges = [];
                if (data.getValidIPRangesResp.IsEnableForGUI == true) {
                    $('#valGuiClient').prop('checked', true);
                } else {
                    $('#valGuiClient').prop('checked', false);
                }
                if (data.getValidIPRangesResp.IsEnableForDevice == true) {
                    $('#Valdevice').prop('checked', true);
                } else {
                    $('#Valdevice').prop('checked', false);
                }
            } else {

                data.getValidIPRangesResp = new Object();
                data.getValidIPRangesResp.ValidIPRanges = [];
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
        if (datainfo.rowscount == 0 || isCheckAllowed==false) {
            $("#checkboxeForGUIAndClient").find("input").prop("disabled", true);
        } else {
            $("#checkboxeForGUIAndClient").find("input").prop("disabled", false);
        }

        if (gridStorage[0].isGridReady == 1) {
            
            gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
        } else {
            
        }
    });



    var buildFilterPanel = function (filterPanel, datafield) {
      
        wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
    }

    var deleteSouceIP = function (row, columnfield, value, defaulthtml, columnproperties) {        
            if (isDeleteEnable == true) {
                return '<div style="padding-left:5px;padding-top:7px;"><a  id="imageId" tabindex="0"  width="50" title="Delete IP Range" onClick=confirmationInfo(' + row + ',"' + 'false' + '") ><i class="icon-bin" style="padding-right:5px;padding-left:7px;"></i></a>&nbsp;<span  ></span></div>';
            } else {
                return '<div style="padding-left:5px;padding-top:7px;"><a disabled id="imageId" tabindex="0"  width="50" title="Delete IP Range" onClick=confirmationInfo(' + row + ',"' + 'false' + '") ><i class="icon-bin" style="padding-right:5px;padding-left:7px;"></i></a>&nbsp;<span  ></span></div>';
            }        
    }

    // create jqxgrid.
    $("#" + gID).jqxGrid(
    {
        height: gridHeightFunction(gID, "60"),
        width: "100%",
        source: dataAdapter,
        altrows: true,
        sortable: true,
        filterable: true,
        selectionmode: 'singlerow',
        theme: AppConstants.get('JQX-GRID-THEME'),
        autoshowcolumnsmenubutton: false,
        rowsheight: 32,
        showsortmenuitems: false,
        columnsResize: true,
        enabletooltips: true,
        autoshowfiltericon: true,

        ready: function () {

            callOnGridReady(gID, gridStorage);
        },

        columns: [
            {
                text: i18n.t('ip_range_from', { lng: lang }), datafield: 'StartRange', minwidth: 180, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                },
            },

          {
              text: i18n.t('ip_range_to', { lng: lang }), datafield: 'EndRange', minwidth: 180, enabletooltips: false,
              filtertype: "custom",
              createfilterpanel: function (datafield, filterPanel) {
                  buildFilterPanel(filterPanel, datafield);
              },
          },

          {
              text: i18n.t('created_by', { lng: lang }), datafield: 'FullName', minwidth: 150, menu: false, sortable: false, filterable: false,

          },
          {
              text: i18n.t('delete', { lng: lang }), datafield: 'IsActive', minwidth: 150, cellsrenderer: deleteSouceIP, menu: false, sortable: false, filterable: false, exportable: false, enabletooltips: false

          },
        ]
    });
}

function getSourceIpValidationDetails(sourceIpValidationData) {
    var getValidIPRangesReq = new Object();
    var Export = new Object();
    var Selector = new Object();
    var Pagination = new Object();

    Pagination.HighLightedItemId = null
    Pagination.PageNumber = 1;
    Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

    Selector.SelectedItemIds = null
    Selector.UnSelectedItemIds = null;

    Export.DynamicColumns = null;
    Export.IsAllSelected = false;
    Export.IsExport = false;



    getValidIPRangesReq.Export = Export;
    getValidIPRangesReq.Pagination = Pagination;
    getValidIPRangesReq.Selector = Selector;

    getValidIPRangesReq.ColumnSortFilter = null;
    getValidIPRangesReq.DeviceSubStatusType = 0;
   // $("#loadingDiv").show();

    var paramIpsource = new Object();
    paramIpsource.token = TOKEN();
    paramIpsource.getValidIPRangesReq = getValidIPRangesReq;
    jqxgridSourceIpValidation(paramIpsource, 'jqxgridSourceIPValidation')
}


function confirmationInfo(row,isAllDel) {
    isAlldelIp = isAllDel;
    var filename = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', row, 'IsEnabled');
    var startRange = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', row, 'StartRange');
    var endRange = $("#jqxgridSourceIPValidation" ).jqxGrid('getcellvalue', row, 'EndRange');
    var iPRangeId = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', row, 'IPRangeId');
    ipSourceRowId = row;
    var startRangeDisp = startRange;
    var endRangeDisp = endRange;
    var datainfo = $("#jqxgridSourceIPValidation").jqxGrid('getdatainformation');
   var length = datainfo.rowscount;
  
      if (isAllDel == "true") {
            $("#rangeDisp").text(i18n.t('delete_all_ip_source_validation', { lng: lang }));
            $("#modelViewDeleteIp").modal('show');
      } else {
          var getRowData = $("#jqxgridSourceIPValidation").jqxGrid('getdatainformation');
          if (getRowData.rowscount == 1) {
              isAllDel = "true"
              isAlldelIp = isAllDel;
              $("#rangeDisp").text(i18n.t('delete_all_ip_source_validation', { lng: lang }));
              $("#modelViewDeleteIp").modal('show');
          } else {
              $("#rangeDisp").text(i18n.t('are_you_sure_you_want_to_delete_ip_range', { startRangeDisp: startRangeDisp, endRangeDisp: endRangeDisp }, { lng: lang }));
              $("#modelViewDeleteIp").modal('show');
          }
        }
}

function deleteSourceIpValidation(gID, isAllDel) {
    var validIPRanges = new Array();
    var EValidIPRanges = new Array();

    var startRange = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', ipSourceRowId, 'StartRange');
    var endRange = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', ipSourceRowId, 'EndRange');
    var iPRangeId = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', ipSourceRowId, 'IPRangeId');

    var startRangeDisp = startRange;
    var endRangeDisp = endRange;
    if (isAllDel == "true") {
       
        var dataInfo = $("#jqxgridSourceIPValidation").jqxGrid('getdatainformation');
        var dataDel = new Array();
        for (var i = 0; i < dataInfo.rowscount; i++) {
            var dataDel = ($("#" + gID).jqxGrid('getrenderedrowdata', i));
            var EValidIPRanges = new Object();
            EValidIPRanges.EndRange = dataDel.EndRange;
            EValidIPRanges.StartRange = dataDel.StartRange;
            EValidIPRanges.IPRangeId = dataDel.IPRangeId;
            validIPRanges.push(EValidIPRanges);
        }

        deleteIp(validIPRanges, true, null, null);
    } else {
     
        var EValidIPRanges = new Object();
        EValidIPRanges.EndRange = endRange;
        EValidIPRanges.StartRange = startRange;
        EValidIPRanges.IPRangeId = iPRangeId;
        validIPRanges.push(EValidIPRanges);
        deleteIp(validIPRanges, false, startRange, endRange);
    }
    $("#loadingDiv").show();
}
function deleteIp(validIPRanges, isAllDel, startRange, endRange) {
    var startRange = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', ipSourceRowId, 'StartRange');
    var endRange = $("#jqxgridSourceIPValidation").jqxGrid('getcellvalue', ipSourceRowId, 'EndRange');

    var startRangeDisp = startRange;
   var endRangeDisp = endRange;
    
    function callbackFunction(data, error) {
       
        if (data) {
        
            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                $("#loadingDiv").hide();
                if (isAllDel == false) {
                    openAlertpopup(0, i18n.t('delete_ip_range_success', { startRangeDisp: startRangeDisp, endRangeDisp: endRangeDisp }, { lng: lang }));
                } else {
                    openAlertpopup(0, 'all_ip_ranges_are_successfully_deleted');
                }
                isAlldelIp = '';
                sourceIpValidationData = data.getValidIPRangesResp;
                getSourceIpValidationDetails(sourceIpValidationData)
            } 
        }
        
    }

    var method = 'DeleteValidIPRanges';
    var params = '{"token":"' + TOKEN() + '","validIPRanges":' + JSON.stringify(validIPRanges) + ',"isAllDeleted":"' + isAllDel + '"}';
    ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

}


