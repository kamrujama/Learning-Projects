define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil) {

    gidForExportShowHideAndResetDiagProfile = 'dignostic_data';
    exportFileName = 'Diagnostic_Data';
    compulsoryfields = [];


    return function dignosticProfileViewModel() {

        var self = this;
        self.diagnosticsXMLData = ko.observable();
        self.ProcessData = ko.observableArray();
        self.diagnosticsData = ko.observableArray();
        self.fileHandlerData = ko.observableArray();
        self.systemKeysData = ko.observableArray();
        self.diagnosticProfileTabs = ko.observableArray();

        self.diagnosticProfileTabs = koUtil.diagnosticProfileTabs;
        getDeviceDiagnosticsData();
        getVRKCertificate();
        //checkWhichActiveDiagGrid();

        //
        var pageName = "diagnosticDetails";
        var initpagObj = initPageStorageObj(pageName);
        var PageStorage = initpagObj.PageStorage;
        if (PageStorage && PageStorage[0].selectedVerticalTabName && PageStorage[0].selectedVerticalTabName != '') {
            var diagnosticTabChangeFunction = function () {
                var id = '#' + PageStorage[0].selectedVerticalTabName;
                $("#diagnosticProfileTabHeader").each(function () {
                    $(this).children('li').removeClass('active');
                });
                $(id + 'tabDiv').addClass('active');
                $("#diagnosticProfileDetailsDiv").each(function () {
                    $(this).children('div.tab-pane').removeClass("active")
                });
                $(id + 'Div').addClass('active');
            }
            setTimeout(diagnosticTabChangeFunction, 1000);
        }

        function getDeviceDiagnosticsData() {
            var uniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

            var callBackfunction = function (data, error) {
                var dataArr = [];
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.deviceDiagnosticData) {
                            self.diagnosticsXMLData($.xml2json(data.deviceDiagnosticData.DiagnosticsXMLData));
                            var xml = self.diagnosticsXMLData();
                            if (xml.DataSet && xml.DataSet.length > 0) {
                                for (var i = 0; i < xml.DataSet.length; i++) {
                                    if (xml.DataSet[i].Identifier == "DiagProfile") {
                                        self.ProcessData(xml.DataSet[i].DataSetContent.DiagnosticProfile.ProcessUsage.Process);

                                        if (self.ProcessData().length == undefined) {
                                            self.ProcessData([]);
                                            self.ProcessData().push(xml.DataSet[i].DataSetContent.DiagnosticProfile.ProcessUsage.Process);
                                        }
                                        processGrid('process_data', self.ProcessData());
                                        //checkWhichActiveDiagGrid();

                                        $.each(xml.DataSet[i].DataSetContent.DiagnosticProfile, function (key, element) {
                                            var obj = new Object();
                                            if (key != "ProcessUsage") {
                                                obj.Name = key;
                                                obj.Value = element;

                                                //var date = Date.parse(element);
                                                //var localDate = jsonLocalDateConversion(date, LONG_DATETIME_FORMAT_AMPM);

                                                //if (isNaN(date)) {

                                                //} else {
                                                //    //obj.Value = moment(date).format(LONG_DATETIME_FORMAT_AMPM)

                                                //    // obj.Value = moment(element).format(LONG_DATETIME_FORMAT_AMPM);
                                                //    obj.Value = localDate;
                                                //}

                                                self.fileHandlerData.push(obj);
                                            }

                                        });

                                        diagnosticGrid('process_file_handles', self.fileHandlerData());

                                    } else if (xml.DataSet[i].Identifier == "DiagCounters") {
                                        self.diagnosticsData(xml.DataSet[i].DataSetContent.DiagnosticCounters.Counter);
                                        diagnosticGrid('dignostic_data', self.diagnosticsData());
                                    }
                                }
                            }

                        } else {
                            diagnosticGrid('dignostic_data', []);
                            processGrid('process_data', []);
                            diagnosticGrid('process_file_handles', []);
                        }
                    } 
                }
            }


            var params = '{"token":"' + TOKEN() + '","uniqueDeviceId":' + uniqueDeviceId + '}';
            ajaxJsonCall('GetDeviceDiagnosticsData', params, callBackfunction, true, 'POST', true);
        }

        function getVRKCertificate() {

            var callBackfunction = function (data, error) {
                var dataArr = [];
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data && data.getDeviceVRKCertificateResp) {
                            data.getDeviceVRKCertificateResp = $.parseJSON(data.getDeviceVRKCertificateResp);
                        }

                        if (data.getDeviceVRKCertificateResp && data.getDeviceVRKCertificateResp.VRKCertificate) {
                            self.systemKeysData(data.getDeviceVRKCertificateResp.VRKCertificate);
                            systemKeysGrid('system_key', self.systemKeysData());
                        } else {
                            systemKeysGrid('system_key', []);
                        }
                    } 
                }
            }

            var getDeviceVRKCertificateReq = new Object();
            getDeviceVRKCertificateReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

            var params = '{"token":"' + TOKEN() + '","getDeviceVRKCertificateReq":' + JSON.stringify(getDeviceVRKCertificateReq) + '}';
            ajaxJsonCall('GetDeviceVRKCertificate', params, callBackfunction, true, 'POST', true);
        }


        //for pop up
        self.observableModelPopup = ko.observable();
        self.diagnosticProfilePopUpComponent = ko.observable();
        self.templateFlag = ko.observable(false);
        self.columnlist = ko.observableArray();
        self.gridIdForShowHide = ko.observable();
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');





        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.diagnosticProfilePopUpComponent('unloadTemplate');
            self.observableModelPopup(popupName);
        };
        modelReposition();
        self.openPopup = function (popupName) {
            self.templateFlag(true);

            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gidForExportShowHideAndResetDiagProfile);
                self.columnlist(genericHideShowColumn(gidForExportShowHideAndResetDiagProfile, true, compulsoryfields));
                loadelement(popupName, 'genericPopup');
                $('#diagnosticProfile').modal('show');
            }
        }

        self.clearfilteDiagnosticProfileGrid = function () {
            clearUiGridFilter(gidForExportShowHideAndResetDiagProfile);
        }

        //Export to excel
        self.exportToExcelDiagnosticProfileGrids = function (data) {
            var dataInfo = $("#" + gidForExportShowHideAndResetDiagProfile).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {

                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                $("#" + gidForExportShowHideAndResetDiagProfile).jqxGrid('exportdata', 'csv', exportFileName);
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }
    };

    function minTwoDigits(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function processGrid(gID, data) {
        var isFilter;
        if (isprocessGridFilter == undefined || isprocessGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        isprocessGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;
        //gidForExportShowHideAndResetDiagProfile = gID;        
        for (var i = 0; i < data.length; i++) {
            data[i].CPUPercent = parseFloat(minTwoDigits(data[i].CPUPercent)) / 10;
            data[i].MemPercent = parseFloat(minTwoDigits(data[i].MemPercent)) / 10;
        }
        var source =
           {
               datatype: "Array",
               localdata: data,
               datafields: [
                   { name: 'ProcessName', type: 'string' },
                   { name: 'CPUPercent', type: 'string' },
                   { name: 'MemPercent', type: 'string' }

               ],

           };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
        };       
        var perRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            value = parseFloat(value) / 10;
            var val = '<div style="padding-left:5x;padding-top:7px">' + value.toString() + '</div>'
            return val;

        }

        $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: gridHeightFunction(gID, "DevDetail"),
            source: dataAdapter,
            sortable: true,
            filterable: true,
            columnsResize: true,
            columnsreorder: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            enabletooltips: true,
            rowsheight: 32,
            pagesize: 20,
            altrows: true,
            ready: function () {
                callOnGridReady(gID, gridStorage, CallType, '');
                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
            },
            columns: [
                  {
                      text: i18n.t('ProcessName', { lng: lang }), datafield: 'ProcessName', minwidth: 130,  width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  },
                  {
                      text: i18n.t('CPUPercent', { lng: lang }), datafield: 'CPUPercent', minwidth: 100, width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  },
                  {
                      text: i18n.t('MemPercent', { lng: lang }), datafield: 'MemPercent', minwidth: 100, resizable: true, width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  }

            ]


        });

    }

    function diagnosticGrid(gID, data) {
        if (data == undefined) {
            data=[];
        }
        var isFilter;
        if (gID == 'process_file_handles') {//For Sorting....
            data.sort(function (a, b) { return a.Name < b.Name ? 1 : -1; });
            if (isfileHandlerGridFilter == undefined || isfileHandlerGridFilter == false) {
                isFilter = false;
            } else {
                isFilter = true;
            }
            isfileHandlerGridFilter = true;
        } else {
           
            if (isdiagnosticGridFilter == undefined || isdiagnosticGridFilter == false) {
                isFilter = false;
            } else {
                isFilter = true;
            }
            isdiagnosticGridFilter = true;
        }
       
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;
        //  gidForExportShowHideAndResetDiagProfile = gID;
        


        for (var i = 0; i < data.length; i++) {

            if (data[i].Type == 'Time') {
                var newDate = new Date(data[i].Value);
                var yearTodisplay = newDate.getFullYear();
                if (yearTodisplay == '1970') {
                    data[i].Value = '';
                } else {
                    data[i].Value = moment(data[i].Value).format(LONG_DATETIME_FORMAT_AMPM);
                }
            }
        }

        var source =
           {
               datatype: "Array",
               localdata: data,
               datafields: [
                   { name: 'Name', type: 'string' },
                   { name: 'Value', type: 'string' }

               ],

           };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
        };
        var perRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            value = parseFloat(value) / 10;
            var val = '<div>' + value + '</div>'
            return val;

        }

        $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: gridHeightFunction(gID, "DevDetail"),
            source: dataAdapter,
            sortable: true,
            filterable: true,
            columnsResize: true,
            columnsreorder: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            enabletooltips: true,
            rowsheight: 32,
            pagesize: 20,
            altrows: true,
            ready: function () {
                callOnGridReady(gID, gridStorage, CallType, '');
                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
            },
            columns: [
                  {
                      text: i18n.t('attribute', { lng: lang }), datafield: 'Name', minwidth: 130, width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  },
                  {
                      text: i18n.t('Value', { lng: lang }), datafield: 'Value', width: "50%",  resizable:true,
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  }

            ]
        });
    }

    function systemKeysGrid(gID, data) {
        var isFilter;
        if (issystemKeysGridFilter == undefined || issystemKeysGridFilter == false) {
            isFilter = false;
        } else {
            isFilter = true;
        }
        if (data) {
            data.ValidFrom = convertToLocaltimestamp(data.ValidFrom);
            data.ValidTo = convertToLocaltimestamp(data.ValidTo);
        }
        issystemKeysGridFilter = true;
        var InitGridStoragObj = initGridStorageObj(gID, null, isFilter);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;
        CallType = InitGridStoragObj.CallType;
        data = ko.toJSON(data);
        var source =
           {
               datatype: "json",
               localdata: data,
               datafields: [
                   { name: 'CertName', type: 'string' },
                   { name: 'CertType', type: 'string' },
                   { name: 'ValidFrom', type: 'date' },
                   { name: 'ValidTo', type: 'date' },
                   { name: 'DownloadUrl', type: 'string' }

               ],

           };
        var dataAdapter = new $.jqx.dataAdapter(source);

        var dateRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var rowData = $("#" + gID).jqxGrid('getrowdata', row);

            var dateNow = moment(new Date);
            var validTo = moment(rowData.ValidTo);

            var certificateValidTo = jsonDateConversion(validTo, LONG_DATETIME_FORMAT_AMPM);

            if(moment(validTo).isBefore(dateNow)) {
                return '<div  style="padding-left:10px;padding-top:9px;">' + certificateValidTo + '<span style="color: red"> ' + "<b> - Expired </b>" + ' </span></div>';
            } else {
                return '<div  style="padding-left:10px;padding-top:9px;">' + certificateValidTo + '</div>';
            }
        }

        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
        };        
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordateUI(filterPanel, datafield, dataAdapter, gID);
        }
        var downloadRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            return '<a  id="imageId" onClick="downloadCert(' + row + ')", class="btn default" target="_blank" style="margin-left: 5px;" height="60" title="Download" width="50" ><i class="icon-download3"></i></a>';
        }

        $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: gridHeightFunction(gID, "DevDetail"),
            source: dataAdapter,
            sortable: true,
            filterable: true,
            columnsResize: true,
            columnsreorder: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            enabletooltips: true,
            rowsheight: 32,
            pagesize: 20,
            altrows: true,
            ready: function () {
                callOnGridReady(gID, gridStorage, CallType, '');
                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
            },
            columns: [
                  {
                      text: i18n.t('systemKeys_Name', { lng: lang }), datafield: 'CertName', minwidth: 100, width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  },
                  {
                      text: i18n.t('systemKeys_Type', { lng: lang }), datafield: 'CertType', minwidth: 100, width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanel(filterPanel, datafield);
                      }
                  },
                  {
                      text: i18n.t('SYSTEMVALID_FROM', { lng: lang }), datafield: 'ValidFrom', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 130, resizable: false, filterable: true, width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                          buildFilterPanelDate(filterPanel, datafield);
                      }
                  },
                  {
                      text: i18n.t('SYSTEMVALID_TO', { lng: lang }), datafield: 'ValidTo', editable: false, cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 130, resizable: false, filterable: true, cellsrenderer: dateRenderer, width: 'auto',
                      filtertype: "custom",
                      createfilterpanel: function (datafield, filterPanel) {
                         buildFilterPanelDate(filterPanel, datafield);
                      }
                  },
                  { text: i18n.t('dgcol_Download', { lng: lang }), filterable: false, sortable: false, menu: false, dataField: 'DownloadUrl', editable: false, minwidth: 100, cellsrenderer: downloadRenderer,width: 'auto' },

            ]
        });
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

    //checkWhichActiveDiagGrid();
});

function downloadCert(rowindex) {
    var downloadUrl = $("#system_key").jqxGrid('getcellvalue', rowindex, 'DownloadUrl');

    var fileNameDisp = downloadUrl.split('/').pop().toLowerCase();
    var fileExtension = fileNameDisp.split('.').pop();
    if (fileExtension.toLowerCase() == "zip") {
        var f = document.createElement("iframe");
        document.body.appendChild(f);
        f.src = downloadUrl;
        setTimeout(function () { document.body.removeChild(f); openAlertpopup(1, 'export_Information'); }, 1000);
    } else {
        $.ajax({
            url: downloadUrl,

            dataType: "text",
            success: function (result) {

                var downloadResult = download(result, fileNameDisp, "application/txt");
                if (downloadResult == true) {

                    openAlertpopup(0, 'file_successfully_downloaded');
                } else {

                }
            },
            error: function (jqXHR, status, error) {
                if (jqXHR != null) {
                    ajaxErrorHandler(jqXHR, status, error);
                    if (jqXHR.status != 401) {
                        openAlertpopup(2, 'error_occurred_while_downloading_file');
                    } 
                } else {
                    openAlertpopup(2, 'error_occurred_while_downloading_file');
                }
               
            }
        });
    }
}
self.check = function (id) {
    gidForExportShowHideAndResetDiagProfile = id;
    storeVerticalTabInSession('diagnosticDetails', id);
    compulsaryFieldAndExportFileName(gidForExportShowHideAndResetDiagProfile);
    setIdForDeviceDetailsTab = id;
    //checkWhichActiveDiagGrid();
}

function compulsaryFieldAndExportFileName(gidForExportShowHideAndResetDiagProfile) {

    if (gidForExportShowHideAndResetDiagProfile == 'diagnosticGrid' || gidForExportShowHideAndResetDiagProfile == 'dignostic_data') {
        compulsoryfields = ['Name'];
        exportFileName = 'Diagnostic_Data';
        whichDiagnosticScreen = 'diagnosticGrid';
    } else if (gidForExportShowHideAndResetDiagProfile == 'processGrid' || gidForExportShowHideAndResetDiagProfile == 'process_data') {
        compulsoryfields = ['ProcessName'];
        exportFileName = 'Process_Data';
    } else if (gidForExportShowHideAndResetDiagProfile == 'process_file_handles') {
        compulsoryfields = ['Name'];
        exportFileName = 'Process_File_Handles';
        whichDiagnosticScreen = 'fileHandlerGrid';
    }
    else if (gidForExportShowHideAndResetDiagProfile == 'system_key') {
        compulsoryfields = ['Name'];
        exportFileName = 'system_key';
        whichDiagnosticScreen = 'systemKeys';
    }
   
}

function checkWhichActiveDiagGrid() {
    if (whichDiagnosticScreen == 'diagnosticGrid') {
        $("#diagnosticGridList").addClass('active');
        $("#processGridList").removeClass('active');
        $("#fileHandlerGridList").removeClass('active');
        $("#systemKeysGridList").removeClass('active');

        $("#DignosticData").addClass('active');
        $("#ProcessData").removeClass('active');
        $("#ProcessFileHandles").removeClass('active');
        $("#SystemKeys").removeClass('active');
    } else if (whichDiagnosticScreen == 'processGrid') {
        $("#processGridList").addClass('active');
        $("#diagnosticGridList").removeClass('active');
        $("#fileHandlerGridList").removeClass('active');
        $("#systemKeysGridList").removeClass('active');

        $("#DignosticData").removeClass('active');
        $("#ProcessData").addClass('active');
        $("#ProcessFileHandles").removeClass('active');
        $("#SystemKeys").removeClass('active');



    } else if (whichDiagnosticScreen == 'fileHandlerGrid') {
        $("#fileHandlerGridList").addClass('active');
        $("#processGridList").removeClass('active');
        $("#diagnosticGridList").removeClass('active');
        $("#systemKeysGridList").removeClass('active');


        $("#DignosticData").removeClass('active');
        $("#ProcessData").removeClass('active');
        $("#ProcessFileHandles").addClass('active');
        $("#SystemKeys").removeClass('active');


    } else if (whichDiagnosticScreen == 'systemKeys') {
        $("#systemKeysGridList").addClass('active');
        $("#diagnosticGridList").removeClass('active');
        $("#processGridList").removeClass('active');
        $("#fileHandlerGridList").removeClass('active');


        $("#DignosticData").removeClass('active');
        $("#ProcessData").removeClass('active');
        $("#ProcessFileHandles").removeClass('active');
        $("#SystemKeys").addClass('active');
    } else if (whichDiagnosticScreen == 0) {
        $("#diagnosticGridList").addClass('active');
        $("#processGridList").removeClass('active');
        $("#fileHandlerGridList").removeClass('active');
        $("#systemKeysGridList").removeClass('active');



        $("#DignosticData").addClass('active');
        $("#ProcessData").removeClass('active');
        $("#ProcessFileHandles").removeClass('active');
        $("#SystemKeys").removeClass('active');
    }
}