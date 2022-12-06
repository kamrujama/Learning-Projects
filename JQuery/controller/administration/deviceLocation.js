define(["knockout", "autho", "koUtil", "spinner"], function (ko, autho, koUtil) {
    var lang = getSysLang();

    return function fileNameOnDeviceViewModel() {

     
        // code for confirmation tabindex
        $('#deleteDeviceFileLocationID').on('shown.bs.modal', function () {
            $('#btnDeviceLocationNo').focus();
        })

        var state = "";

        var self = this;
        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }


        self.deviceLocationData = ko.observableArray();

        var InitGridStoragObj = initGridStorageObj('jqxgridDeviceFileLocation');
        var gridStorage = InitGridStoragObj.gridStorage;

        //var gridStorageArr = new Array();
        //var gridStorageObj = new Object();
        //gridStorageObj.checkAllFlag = 0;
        //gridStorageObj.counter = 0;
        //gridStorageObj.filterflage = 0;
        //gridStorageObj.selectedDataArr = [];
        //gridStorageObj.unSelectedDataArr = [];
        //gridStorageObj.singlerowData = [];
        //gridStorageObj.multiRowData = [];
        //gridStorageObj.TotalSelectionCount = null;
        //gridStorageObj.highlightedRow = null;
        //gridStorageObj.highlightedPage = null;
        //gridStorageArr.push(gridStorageObj);
        //var gridStorage = JSON.stringify(gridStorageArr);
        //window.sessionStorage.setItem('jqxgridDeviceFileLocationgridStorage', gridStorage);
        //var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridDeviceFileLocationgridStorage"));

        getDeviceFileLocationDetails(self.deviceLocationData, null, gridStorage);

        setMenuSelection();

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#btnRefresh').click();
            }
        });

        $('#btnAddDeviceFileLoc').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#btnAddDeviceFileLoc').click();
            }
        });

        $('#btnDeleteDeviceFileLoc').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#btnDeleteDeviceFileLoc').click();
            }
        });

        $('#btnRestFilter').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#btnRestFilter').click();
            }
        });


        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#deleteDeviceFileLocationID').on('shown.bs.modal', function (e) {
            $('#btnDeviceLocationNo').focus();

        });
        $('#deleteDeviceFileLocationID').keydown(function (e) {
            if ($('#btnDeviceLocationNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnDeviceLocationYes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------
        //Delete device files
        self.deleteDeviceFile = function (gId) {
            var selectedrowids = getSelectedUniqueId(gId);

            if (selectedrowids.length == 1) {
                $('#deleteDeviceFileLocationID').modal('show');
                $("#deviceMsgId").text(i18n.t('delete_device_file_alert', { lng: lang }));
            } else if (selectedrowids.length > 1) {
                $('#deleteDeviceFileLocationID').modal('show');
                $("#deviceMsgId").text(i18n.t('multiple_device_file_location_alert', { lng: lang }));
            } else {
                openAlertpopup(1, 'Please_select_item');
            }
        }

        //confirmation popup for single row selection
        self.deleteSelectedFileLocationDevices = function (gId) {
            var getMulSelectedData = getMultiSelectedData(gId);
            
            var selectedIds = getSelectedUniqueId(gId);
           
            deleteDeviceFileConfirm(gId, self.deviceLocationData, getMulSelectedData,selectedIds);
        }

        //unload template
        self.unloadTempPopup = function (popupName,modelId) {
            self.observableModelPopup('unloadTemplate');
            $('#' + modelId).modal('hide');
        };

        //Refresh Grid
        self.refreshGrid = function (gId) {
            //var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridDeviceFileLocationgridStorage"));
            state = $("#jqxgridDeviceFileLocation").jqxGrid('savestate');
            getDeviceFileLocationDetails(self.deviceLocationData, state);
        }

        // refresh on success
        self.refershGridOnSuccess = function () {
            $("#gridArea").empty();
            var str = '<div id="jqxgridDeviceFileLocation"></div>';
            $("#gridArea").append(str);
            getDeviceFileLocationDetails(self.deviceLocationData, null);
        }

        //Reset filter
        self.clearfilter = function (gId) {

            var InitGridStoragObj = initGridStorageObj(gId);
            var gridStorage = InitGridStoragObj.gridStorage;

            if (gridStorage) {
                gridStorage[0].checkAllFlag = 0;
                gridStorage[0].counter = 0;
                gridStorage[0].filterflage = 0;
                gridStorage[0].selectedDataArr = [];
                gridStorage[0].unSelectedDataArr = [];
                gridStorage[0].singlerowData = [];
                gridStorage[0].multiRowData = [];
                gridStorage[0].TotalSelectionCount = null;
                gridStorage[0].highlightedRow = null;
                gridStorage[0].highlightedPage = null;


                gridStorage[0].state = null;
                gridStorage[0].columnSortFilter = null;
                gridStorage[0].Pagination = null;
                gridStorage[0].isGridReady = 0;
                gridStorage[0].isgridState = '';
                gridStorage[0].adSearchObj = null;
                gridStorage[0].iscontentGrid = 2;
                gridStorage[0].isEditRow = null;


                var updatedGridStorage = JSON.stringify(gridStorage);
                window.sessionStorage.setItem(gId + 'gridStorage', updatedGridStorage);
            }

            //var gridStorageArr = new Array();
            //var gridStorageObj = new Object();
            //gridStorageObj.checkAllFlag = 0;
            //gridStorageObj.counter = 0;
            //gridStorageObj.filterflage = 0;
            //gridStorageObj.selectedDataArr = [];
            //gridStorageObj.unSelectedDataArr = [];
            //gridStorageObj.singlerowData = [];
            //gridStorageObj.multiRowData = [];
            //gridStorageObj.TotalSelectionCount = null;
            //gridStorageObj.highlightedRow = null;
            //gridStorageObj.highlightedPage = null;
            //gridStorageArr.push(gridStorageObj);
            //var gridStorage = JSON.stringify(gridStorageArr);
            //window.sessionStorage.setItem('jqxgridDeviceFileLocationgridStorage', gridStorage);

            $("#gridArea").empty();
            var str = '<div id="jqxgridDeviceFileLocation"></div>'
            $("#gridArea").append(str);
            getDeviceFileLocationDetails(self.deviceLocationData, null);
            //clearUiGridFilter(gId);
        }

        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        modelReposition();
        self.openPopup = function (popupName, gID) {
            self.templateFlag(true);
            if (popupName == "modelAddDeviceFileLocation") {

                loadelement(popupName, 'administration');
                $('#modelDeviceLocationID').modal('show');
            } else if (popupName == "modelDeleteDeviceFileLocation") {
                loadelement(popupName, 'administration');

                $('#modelDeleteID').modal('show');
            }
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        seti18nResourceData(document, resourceStorage);
    };


    //Delete confirmation YES click

    function deleteDeviceFileConfirm(gId, deviceLocationData, getMulSelectedData, selectedIds) {

        var genericConfigurations = new Array();

        for (var i = 0; i < getMulSelectedData.length; i++) {
            if ($.inArray(getMulSelectedData[i].ConfigId,selectedIds) >= 0) {
                var EGenericConfigurations = new Object();
                EGenericConfigurations.Category = AppConstants.get('DEVICE_FILE_LOCATION');
                EGenericConfigurations.ConfigId = getMulSelectedData[i].ConfigId;
                EGenericConfigurations.ConfigName = getMulSelectedData[i].ConfigName;
                EGenericConfigurations.ConfigValue = getMulSelectedData[i].ConfigValue;
                genericConfigurations.push(EGenericConfigurations);
            }

        }

        //alert('final--' + JSON.stringify(genericConfigurations));

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                    if (getMulSelectedData.length == 1 && data.deletedRecordsCount == 1) {
                        $("#gridArea").empty();
                        var str = '<div id="jqxgridDeviceFileLocation"></div>';
                        $("#gridArea").append(str);
                        getDeviceFileLocationDetails(deviceLocationData, null);
                        var msg = i18n.t('dev_location_file', { lng: lang }) + " " + getMulSelectedData[0].ConfigValue + " " + i18n.t('deleted_successfuly', { lng: lang });
                        openAlertpopup(0, msg);
                        clearUiGridFilter(gId)


                    } else if ((data.deletedRecordsCount == 1) || (data.deletedRecordsCount > 1)) {
                        $("#gridArea").empty();
                        var str = '<div id="jqxgridDeviceFileLocation"></div>';
                        $("#gridArea").append(str);
                        getDeviceFileLocationDetails(deviceLocationData, null);

                        var msg = +data.deletedRecordsCount + " " + i18n.t('count_device_file_location_deleted', { lng: lang });
                        openAlertpopup(0, msg);
                        clearUiGridFilter(gId)

                    } else if (getMulSelectedData.length == 1) {
                        openAlertpopup(1, 'no_device_file_location_deleted_for_single');
                        clearUiGridFilter(gId)
                    } else {
                        openAlertpopup(1, 'no_device_file_location_deleted_for_multiple');
                        clearUiGridFilter(gId)
                    }
                } 
            }
        }

        var method = 'DeleteConfigurationValue';
        var params = '{"token":"' + TOKEN() + '","genericConfigurations":' + JSON.stringify(genericConfigurations) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);


    }

    function generateTemplate(tempname, controllerId) {
        //new template code
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: viewName },

            template: { require: 'plugin/text!' + htmlName }
        });
        // end new template code
    }

    function jqxgridDeviceFileLocation(deviceLocationData, gID) {
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

        //var gridStorageArr = new Array();
        //var gridStorageObj = new Object();
        //gridStorageObj.checkAllFlag = 0;
        //gridStorageObj.counter = 0;
        //gridStorageObj.filterflage = 0;
        //gridStorageObj.selectedDataArr = [];
        //gridStorageObj.unSelectedDataArr = [];
        //gridStorageObj.singlerowData = [];
        //gridStorageObj.multiRowData = [];
        //gridStorageObj.TotalSelectionCount = null;
        //gridStorageObj.highlightedRow = null;
        //gridStorageObj.highlightedPage = null;
        //gridStorageArr.push(gridStorageObj);
        //var gridStorage = JSON.stringify(gridStorageArr);
        //window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        //var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));


        // prepare the data
        var source =
        {
            datatype: "observableArray",
            localdata: deviceLocationData,
            datafields: [
                { name: 'ConfigId', map: 'ConfigId' },
                { name: 'ConfigName', map: 'ConfigName' },
                { name: 'ConfigValue', map: 'ConfigValue' },
                { name: 'Description', map: 'Description' },
                { name: 'isSelected', type: 'number' }
            ],

        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
        }
        var rendered = function (element) {

            enableUiGridFunctions(gID, 'ConfigId', element, gridStorage, true);

            return true;
        }
       
        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            height: gridHeightFunction(gID),
            width: "100%",
            source: dataAdapter,
            sortable: true,
            filterable: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            pagesize: deviceLocationData.length,
            altrows: true,
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            showsortmenuitems: false,
            enabletooltips: true,
            editable: true,
            columnsResize: true,

            ready: function () {
                callOnGridReady(gID, gridStorage);

                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;                
            },

            columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                { text: '', datafield: 'ConfigId', hidden: true, minwidth: 0, },
                {

                    text: i18n.t('deviceLocation', { lng: lang }), datafield: 'ConfigValue', editable: false, minwidth: 100,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('user_friendly_nm', { lng: lang }), datafield: 'ConfigName', editable: false, minwidth: 100,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

              {
                  text: i18n.t('description', { lng: lang }), datafield: 'Description',   minwidth: 100, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
            ]
        });

        getUiGridBiginEdit(gID, 'ConfigId', gridStorage);
        callUiGridFilter(gID, gridStorage);
        $("#" + gID).on("sort", function (event) {
            if (gridStorage[0].isGridReady == 1) {

                gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
                var updatedGridStorage = JSON.stringify(gridStorage);
                window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
            } else {

            }
        });
    }


    function getDeviceFileLocationDetails(deviceLocationData, state, gridStorage) {
        var category = AppConstants.get('DEVICE_FILE_LOCATION');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.genericConfigurations) {
                        data.genericConfigurations = $.parseJSON( data.genericConfigurations);
                        deviceLocationData(data.genericConfigurations);
                        jqxgridDeviceFileLocation(deviceLocationData(), 'jqxgridDeviceFileLocation', gridStorage);

                        var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridDeviceFileLocationgridStorage"));

                        if (gridStorage) {

                            if (gridStorage[0].isgridState != null && gridStorage[0].isgridState != '') {
                            $("#jqxgridDeviceFileLocation").jqxGrid('loadstate', state);
                                //var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridDeviceFileLocationgridStorage"));
                            
                            if (gridStorage[0].checkAllFlag == 1) {
                                if (gridStorage[0].selectedDataArr.length < deviceLocationData().length) {
                                    if (gridStorage[0].selectedDataArr.length <= 0) {
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                    } else {
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                    }
                                } else {
                                    $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
                                    $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                                }
                            } else {
                                if (gridStorage[0].selectedDataArr.length < deviceLocationData().length) {
                                    if (gridStorage[0].selectedDataArr.length <= 0) {
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                    } else {
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
                                        $("#columntablejqxgridDeviceFileLocation").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                    }
                                }
                            }
                            }

                        } else {

                        }
                    } else {
                        jqxgridDeviceFileLocation([], 'jqxgridDeviceFileLocation');
                    }
                } 
            }
        }

        var method = 'GetConfigurationValues';
        var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});