define(["knockout", "spinner"], function (ko) {
    var lang = getSysLang();

    return function fileNameOnDeviceViewModel() {

     
        var self = this;
        self.fileNameOnDeviceData = ko.observableArray();

        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        modelReposition();
        self.openPopup = function (popupName, gID) {
            self.templateFlag(true);
            if (popupName == "modelAddStandardFile") {
                loadelement(popupName, 'administration');
                $('#modelFileNameId').modal('show');
            }
        }

        //unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            $('#modelFileNameId').modal('hide');
        };

        //reset filter
        self.clearfilter = function (gId) {
            $("#" + gId).jqxGrid('clearselection');
            $("#" + gId).jqxGrid('updatebounddata');
        }

        //refresh grid
        self.refreshGrid = function () {
            getFileNameOnDeviceDetails(self.fileNameOnDeviceData);
        }

        //delete file name on device
        self.deleteDevice = function (gId) {
            var getselectedrowindexes = $("#" + gId).jqxGrid('getselectedrowindexes');

            if (getselectedrowindexes.length == 1) {
                $('#deleteDeviceID').modal('show');
                $("#standardMsgId").text(i18n.t('delete_standard_file_alert', { lng: lang }));
            } else if (getselectedrowindexes.length > 1) {                
                $('#deleteDeviceID').modal('show');
                $("#standardMsgId").text(i18n.t('mul_delete_standard_file_alert', { lng: lang }));
            } else {
                openAlertpopup(1, 'Please_select_item_standard');
            }
        }

        //confirmation popup for single data
        self.deleteFileNameOnDevice = function (gId) {
            deletedDataOnFileNameDevices(gId, self.fileNameOnDeviceData);
        }      

        // refresh grid on success
        self.refershgridonsuccess = function () {
            getFileNameOnDeviceDetails(self.fileNameOnDeviceData);
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        getFileNameOnDeviceDetails(self.fileNameOnDeviceData);

        seti18nResourceData(document, resourceStorage);
    };

    // deleted data
    function deletedDataOnFileNameDevices(gId, fileNameOnDeviceData) {
        var getselectedrowindexes = $("#" + gId).jqxGrid('getselectedrowindexes');

        var genericConfiguration = new Array();

        for (var i = 0; i < getselectedrowindexes.length; i++) {

            var rows = $("#" + gId).jqxGrid('getboundrows');
            var selectedRowData = rows[getselectedrowindexes[i]];

            var EGenericConfigurations = new Object();
            EGenericConfigurations.ConfigId = selectedRowData.ConfigId;
            EGenericConfigurations.ConfigName = selectedRowData.ConfigName;
            EGenericConfigurations.ConfigValue = selectedRowData.ConfigValue;
            EGenericConfigurations.Category = AppConstants.get('DEVICE_CONTENT_FILENAME');
            genericConfiguration.push(EGenericConfigurations);

        }

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.deletedRecordsCount == 1 && selectedRowData.ConfigName != " ") {
                        getFileNameOnDeviceDetails(fileNameOnDeviceData);
                        $("#" + gId).jqxGrid('clearselection');
                        var msg = i18n.t('user_friendly_name_deleted', { lng: lang }) + " " + selectedRowData.ConfigName + " " + i18n.t('deleted_successfuly', { lng: lang });
                        openAlertpopup(0, msg);
                    } else if ((data.deletedRecordsCount == 1 && selectedRowData.ConfigName != " ") || (data.deletedRecordsCount > 1)) {
                        getFileNameOnDeviceDetails(fileNameOnDeviceData);
                        $("#" + gId).jqxGrid('clearselection');
                        var msg = +data.deletedRecordsCount + " " + i18n.t('count_user_friendly_name_deleted', { lng: lang });
                        openAlertpopup(0, msg);
                    } else if (getselectedrowindexes.length == 1) {
                        openAlertpopup(1, 'no_user_friendly_names_deleted_for_single');
                        $("#" + gId).jqxGrid('clearselection');
                    } else {
                        openAlertpopup(1, 'no_user_friendly_names_deleted_for_multiple');
                        $("#" + gId).jqxGrid('clearselection');
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

        // prepare the data
        var source =
        {
            datatype: "json",
            localdata: fileNameOnDeviceData,
            datafields: [
                { name: 'ConfigId', map: 'ConfigId' },
                { name: 'ConfigName', map: 'ConfigName' },
                { name: 'ConfigValue', map: 'ConfigValue' },
                { name: 'Description', map: 'Description' },
            ],

        };
        var dataAdapter = new $.jqx.dataAdapter(source);
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }

        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            width: "100%",
            source: dataAdapter,
            sortable: true,
            filterable: true,
            selectionmode: 'checkbox',
            theme: AppConstants.get('JQX-GRID-THEME'),
            altrows: true,
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            enabletooltips: true,
            columnsResize: true,
            columns: [
                { text: '', datafield: 'ConfigId', hidden: true, width: 'auto' },
              {
                  text: i18n.t('user_friendly_nm', { lng: lang }), datafield: 'ConfigName', width: 'auto', minwidth: 160,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
              {
                  text: i18n.t('file_nm_on_terminal', { lng: lang }), datafield: 'ConfigValue', width: 'auto', minwidth: 180,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
              {
                  text: i18n.t('description', { lng: lang }), datafield: 'Description', width: 'auto', resizable: false, minwidth: 180,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
            ]
        });
        $("#" + gID).jqxGrid('updatebounddata');
    }

    function getFileNameOnDeviceDetails(fileNameOnDeviceData) {

        var category = AppConstants.get('DEVICE_CONTENT_FILENAME');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if(data.genericConfigurations)
                        data.genericConfigurations = $.parseJSON( data.genericConfigurations);
                    fileNameOnDeviceData(data.genericConfigurations);
                    jqxgridFileNameOnDevice(fileNameOnDeviceData(), 'jqxgridFileNameOnDevice');
                } 
            }
        }

        var method = 'GetConfigurationValues';
        var params = '{"token":"' + TOKEN() + '","category":"' + category + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }
});