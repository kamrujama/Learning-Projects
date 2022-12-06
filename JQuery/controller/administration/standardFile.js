define(["knockout", "koUtil", "autho", "spinner"], function (ko, koUtil, autho) {
    var lang = getSysLang();
    koUtil.GlobalColumnFilter = new Array();

    return function fileNameOnDeviceViewModel() {

     
        // code for confirmation tabindex
        $('#deleteDeviceID').on('shown.bs.modal', function () {
            $('#btnStandardFileNo').focus();
        })
        //end

        var self = this;

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) {                               
                $('#btnRefresh').click();
            }
        });

        $('#btnAddStandardFile').bind('keyup', function (e) {
            if (e.keyCode === 13) {                                 
                $('#btnAddStandardFile').click();
            }
        });

        $('#btnDeleteStandardFile').bind('keyup', function (e) {
            if (e.keyCode === 13) {                                 
                $('#btnDeleteStandardFile').click();
            }
        });

        $('#btnRestFilter').bind('keyup', function (e) {
            if (e.keyCode === 13) {                                 
                $('#btnRestFilter').click();
            }
        });


        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#deleteDeviceID').on('shown.bs.modal', function (e) {
            $('#btnStandardFileNo').focus();

        });
        $('#deleteDeviceID').keydown(function (e) {
            if ($('#btnStandardFileNo').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnStandardFileYes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------
        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }


        self.fileNameOnDeviceData = ko.observableArray();

        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        setMenuSelection();
        modelReposition();
        self.openPopup = function (popupName, gID) {
            self.templateFlag(true);
            if (popupName == "modelAddStandardFile") {
                loadelement(popupName, 'administration');
                $('#modelFileNameId').modal('show');
                $('#addFileNameID').on('shown.bs.modal', function () {
                    $('#userNameID').focus();
                })

            }
        }

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            $('#modelFileNameId').modal('hide');
        };

        //set local storage
        var InitGridStoragObj = initGridStorageObj('jqxgridFileNameOnDevice');
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
        //window.sessionStorage.setItem('jqxgridFileNameOnDevice' + 'gridStorage', gridStorage);

        //

        //reset filter
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
            } else {
                
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
            //window.sessionStorage.setItem('jqxgridFileNameOnDevicegridStorage', gridStorage);
           
            $("#gridArea").empty();
            var str = '<div id="jqxgridFileNameOnDevice"></div>'
            $("#gridArea").append(str);
            getFileNameOnDeviceDetails(self.fileNameOnDeviceData, null);
            //setTimeout(function () {
            //    clearUiGridFilter(gId);
            //    getFileNameOnDeviceDetails(self.fileNameOnDeviceData, null);
            //}, 500);
            ////setTimeout(function () {
            //    //clearUiGridFilter(gId);
            ////}, 500);
            
           
        }

        //refresh grid
        self.refreshGrid = function (gId) {
            state = $("#jqxgridFileNameOnDevice").jqxGrid('savestate');
            getFileNameOnDeviceDetails(self.fileNameOnDeviceData, state);

        }

        //delete file name on device
        self.deleteDevice = function (gId) {

            var getSelectedData = getSelectedUniqueId(gId);
            if (getSelectedData.length == 1) {
                $('#deleteDeviceID').modal('show');
                $("#standardMsgId").text(i18n.t('delete_standard_file_alert', { lng: lang }));
            } else if (getSelectedData.length > 1) {
                $('#deleteDeviceID').modal('show');
                $("#standardMsgId").text(i18n.t('mul_delete_standard_file_alert', { lng: lang }));
            } else {
                openAlertpopup(1, 'Please_select_item_standard');
            }
        }

        //confirmation popup for single data
        self.deleteFileNameOnDevice = function (gId) {
            var getMulSelectedData = getMultiSelectedData(gId);
            var selectedIds = getSelectedUniqueId(gId);
            deletedDataOnFileNameDevices(gId, self.fileNameOnDeviceData, getMulSelectedData, selectedIds);
        }

        // refresh grid on success
        self.refershgridonsuccess = function () {

            $("#gridArea").empty();
            var str = '<div id="jqxgridFileNameOnDevice"></div>';
            $("#gridArea").append(str);
            getFileNameOnDeviceDetails(self.fileNameOnDeviceData, null);
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        getFileNameOnDeviceDetails(self.fileNameOnDeviceData, null);

        seti18nResourceData(document, resourceStorage);
    };

    // deleted data
    function deletedDataOnFileNameDevices(gId, fileNameOnDeviceData, getMulSelectedData, selectedIds) {

        var genericConfiguration = new Array();

        for (var i = 0; i < getMulSelectedData.length; i++) {
            if ($.inArray(getMulSelectedData[i].ConfigId, selectedIds) >= 0) {
                var EGenericConfigurations = new Object();
                EGenericConfigurations.ConfigId = getMulSelectedData[i].ConfigId;
                EGenericConfigurations.ConfigName = getMulSelectedData[i].ConfigName;
                EGenericConfigurations.ConfigValue = getMulSelectedData[i].ConfigValue;
                EGenericConfigurations.Category = AppConstants.get('DEVICE_CONTENT_FILENAME');
                genericConfiguration.push(EGenericConfigurations);
            }
        }

        

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (getMulSelectedData.length == 1 && data.deletedRecordsCount == 1) {
                        $("#gridArea").empty();
                        var str = '<div id="jqxgridFileNameOnDevice"></div>';
                        $("#gridArea").append(str);
                        getFileNameOnDeviceDetails(fileNameOnDeviceData, null);
                        var msg = i18n.t('user_friendly_name_deleted', { lng: lang }) + " " + getMulSelectedData[0].ConfigName + " " + i18n.t('deleted_successfuly', { lng: lang });
                        openAlertpopup(0, msg);
                        clearUiGridFilter(gId);
                    } else if ((data.deletedRecordsCount == 1) || (data.deletedRecordsCount > 1)) {
                        $("#gridArea").empty();
                        var str = '<div id="jqxgridFileNameOnDevice"></div>';
                        $("#gridArea").append(str);
                        getFileNameOnDeviceDetails(fileNameOnDeviceData, null);
                        var msg = +data.deletedRecordsCount + " " + i18n.t('count_user_friendly_name_deleted', { lng: lang });
                        openAlertpopup(0, msg);
                        clearUiGridFilter(gId);
                    } else if (getMulSelectedData.length == 1) {
                        openAlertpopup(1, 'no_user_friendly_names_deleted_for_single');
                        clearUiGridFilter(gId);

                    } else {
                        openAlertpopup(1, 'no_user_friendly_names_deleted_for_multiple');
                        clearUiGridFilter(gId);
                    }
                } 
            }
        }

        var method = 'DeleteConfigurationValue ';
        var params = '{"token":"' + TOKEN() + '","genericConfigurations":' + JSON.stringify(genericConfiguration) + '}';
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

    function jqxgridFileNameOnDevice(fileNameOnDeviceData, gID) {
        //calculate height of grid
        var gridheight = $(window).height();

        var percentValue;
        if (gridheight > 600) {
            percentValue = (25 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';
        } else {
            gridheight = '400px';
        }
        ////////////////
        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        
        
        //var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridFileNameOnDevicegridStorage"));
       

        // prepare the data
        var source =
        {
            dataType: "observablearray",
            localdata: fileNameOnDeviceData,
            datafields: [
                { name: 'ConfigId', map: 'ConfigId' },
                { name: 'ConfigName', map: 'ConfigName' },
                { name: 'ConfigValue', map: 'ConfigValue' },
                { name: 'Description', map: 'Description' },
                { name: 'isSelected', type: 'number' }
               
            ],

        };
        var dataAdapter = new $.jqx.dataAdapter(source);

        var rendered = function (element) {

            enableUiGridFunctions(gID, 'ConfigId', element, gridStorage, true);

            return true;
        }

        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID);
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
            altrows: true,
            pagesize: fileNameOnDeviceData.length,
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            editable: true,
            enabletooltips: true,
            columnsResize: true,
            rowsheight: 32,

            ready: function () {

                callOnGridReady(gID, gridStorage);
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
                  text: i18n.t('user_friendly_nm', { lng: lang }), datafield: 'ConfigName',  minwidth: 100, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
              {
                  text: i18n.t('file_nm_on_terminal', { lng: lang }), datafield: 'ConfigValue',  minwidth: 100, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
              {
                  text: i18n.t('description', { lng: lang }), datafield: 'Description',   minwidth: 100, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
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

    function getFileNameOnDeviceDetails(fileNameOnDeviceData, state) {

        var category = AppConstants.get('DEVICE_CONTENT_FILENAME');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.genericConfigurations) {
                        data.genericConfigurations = $.parseJSON(data.genericConfigurations);
                        fileNameOnDeviceData(data.genericConfigurations);
                        jqxgridFileNameOnDevice(fileNameOnDeviceData(), 'jqxgridFileNameOnDevice');

                        var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridFileNameOnDevicegridStorage"));
                        if (gridStorage) {

                            if (gridStorage[0].isgridState != null && gridStorage[0].isgridState !='') {
                                
                                $("#jqxgridFileNameOnDevice").jqxGrid('loadstate', state);
                                var gridStorage = JSON.parse(sessionStorage.getItem("jqxgridFileNameOnDevicegridStorage"));

                                if (gridStorage[0].checkAllFlag == 1) {
                                    if (gridStorage[0].selectedDataArr.length < fileNameOnDeviceData().length) {
                                        if (gridStorage[0].selectedDataArr.length <= 0) {
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                        } else {
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                        }
                                    } else {
                                        $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').addClass('jqx-checkbox-check-checked');
                                        $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                                    }
                                } else {
                                    if (gridStorage[0].selectedDataArr.length < fileNameOnDeviceData().length) {
                                        if (gridStorage[0].selectedDataArr.length <= 0) {
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('partial-selection');
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                        } else {
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').addClass('partial-selection');
                                            $("#columntablejqxgridFileNameOnDevice").children('div').children('div').children('div').children('div').children('div').children('span').removeClass('jqx-checkbox-check-checked');
                                        }
                                    }
                                }
                            } else {

                                
                            }
                        }
                        
                    } else {
                        jqxgridFileNameOnDevice([], 'jqxgridFileNameOnDevice');
                    }
                   
                } 
            }
        }

        var method = 'GetConfigurationValues';
        var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});
