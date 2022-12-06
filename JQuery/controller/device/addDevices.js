define(["knockout", "autho", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, autho, koUtil) {

    var lang = getSysLang();
    var modelFilterArray = new Array();
    var ProtocolFilterArray = new Array();
    return function appViewModel() {
        $('#loader1').show();
  
        modelFilterArray = [];
        ProtocolFilterArray = [];
        koUtil.deviceNameForAddDevice = [];
        var self = this;


        $('#fileImportBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#fileImportBtn').click();
            }
        });

        $('#manualAddBtn').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#manualAddBtn').click();
            }
        });

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        self.checkImportRights = function () {
            var retval = (autho.checkRightsBYScreen('Devices', 'IsModifyAllowed') && autho.checkRightsBYScreen('Import', 'IsModifyAllowed'));
            return retval;
        }

		selectedMenuOption = 'addDevices';
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();
        ///
        setMenuSelection();
        // for open popup
        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');
        modelReposition();
        self.openPopup = function (popupName) {
            self.templateFlag(true);
            if (popupName == "modelAddDeviceFileImport") {
                jqxgirdForAddDevicesDetails(koUtil.deviceNameForAddDevice, 'jqxgridAddDevice');
                loadelement(popupName, 'device');
                $('#modelAddDeviceID').modal('show');
            } else if (popupName == "modelAddDeviceManually") {
                loadelement(popupName, 'device');
                $('#modelAddDeviceID').modal('show');
            } else if (popupName == "modelSoftwareAssignment") {
                loadelement(popupName, 'device');
                $('#modelAddDeviceID').modal('show');
            }
        }
        
        self.addDatatoGrid = function () {
            jqxgirdForAddDevicesDetails(koUtil.deviceNameForAddDevice, 'jqxgridAddDevice');
        }

        // unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup(popupName);
            $('#modelAddDeviceID').modal('hide')
            checkIsPopUpOPen();           
           jqxgirdForAddDevicesDetails(koUtil.deviceNameForAddDevice, 'jqxgridAddDevice');
           
        }

        //Export to Excel
        self.exportToExcel = function (gID) {
            var datainfo = $("#" + gID).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                exportjqxcsvData(gID,'Add_Device'); 
               openAlertpopup(1, 'export_Information');
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        //clear filter
        self.clearfilter = function (gID) {
            $("#" + gID).jqxGrid('clearselection');
            $("#" + gID).jqxGrid('updatebounddata');
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        jqxgirdForAddDevicesDetails(koUtil.deviceNameForAddDevice, 'jqxgridAddDevice');

        setTimeout(function () {
            $('#loader1').hide();
        }, 1000);

        seti18nResourceData(document, resourceStorage);
    };

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

    function jqxgirdForAddDevicesDetails(deviceNameForAddDevice, gID) {       
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (20 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';


        } else {
            gridheight = '400px';
        }

        //var gridheight = $(window).height();
        //gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 75;
       

        //$("#" + gID).jqxGrid({ height: gridheight });


        // prepare the data
        var source =
        {
            dataType: "json",
            localdata: deviceNameForAddDevice,
            datafields: [
                { name: 'UniqueDeviceId', map: 'UniqueDeviceId' },
                { name: 'SerialNumber', map: 'SerialNumber',type: 'string' },
                { name: 'DeviceId', map: 'DeviceId', type: 'string' },
                { name: 'HierarchyFullPath', map: 'HierarchyFullPath', type: 'string' },
                { name: 'ModelName', map: 'ModelName', type: 'string' },
                { name: 'Protocol', map: 'Protocol', type: 'string' },
            ],

        };
        var dataAdapter = new $.jqx.dataAdapter(source);

        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
        }

        var buildFilterPanelMultiChoice = function (filterPanel, datafield, checkArr) {
            multichoiceFilterUISide(filterPanel, datafield, dataAdapter, gID, checkArr, true);
        }

        // get value of a column name model and set value in filter
        var modelRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            var obj = new Object();
            obj.ControlValue = value;
            obj.Id = 0;
            obj.Name = '';
            obj.Value = value;
            var source = _.where(modelFilterArray, { ControlValue: value });
            if (source == '') {
                modelFilterArray.push(obj);
            }
        }
        //for device profile
        var SerialNoRendere = function (row, columnfield, value, defaulthtml, columnproperties) {
            var html = genericSerialRendere(row, columnfield, value, defaulthtml, columnproperties, gID);
            return html;
        }
        // get value of a column name model and set value in filter
        var protocolRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            var obj = new Object();
            obj.ControlValue = value;
            obj.Id = 0;
            obj.Name = '';
            obj.Value = value;
            var source = _.where(ProtocolFilterArray, { ControlValue: value });
            if (source == '') {
                ProtocolFilterArray.push(obj);
            }
        }

        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            width: "100%",
            height: gridHeightFunction(gID,"60"),
            source: dataAdapter,
            sortable: true,
            filterable: true,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            altrows: true,
            autoshowcolumnsmenubutton: false,
            showsortmenuitems: false,
            rowsheight: 32,
            editable: false,
            enabletooltips: true,
            columnsResize: true,
            ready: function () {

                var gridheight = $(window).height();
                gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
                $("#" + gID).jqxGrid({ height: gridheight });


            },
            columns: [
                 { text: '', dataField: 'UniqueDeviceId', hidden: true, editable: false, width: 'auto' },
              {
                  text: i18n.t('serial', { lng: lang }), datafield: 'SerialNumber', minwidth: 80, editable: false,
                  filtertype: "custom", cellsrenderer: SerialNoRendere,
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
              {
                  text: i18n.t('device_id', { lng: lang }), datafield: 'DeviceId', minwidth: 90, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
              {
                  text: i18n.t('hierarchy_path', { lng: lang }), datafield: 'HierarchyFullPath',  minwidth: 100, editable: false,
                  filtertype: "custom", cellsrenderer: HierarchyPathRenderer,
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  }
              },
              {
                  text: i18n.t('model', { lng: lang }), datafield: 'ModelName',  minwidth: 70, editable: false, cellsrenderer: modelRenderer,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanelMultiChoice(filterPanel, datafield, modelFilterArray);
                  }
              },
              //{
              //    text: i18n.t('protocol', { lng: lang }), datafield: 'Protocol', width: 'auto', resizable: false, minwidth: 130, editable: false, cellsrenderer: protocolRenderer,
              //    filtertype: "custom",
              //    createfilterpanel: function (datafield, filterPanel) {
              //        buildFilterPanelMultiChoice(filterPanel, datafield, ProtocolFilterArray);
              //    }
              //},
            ]
        });

        // Showing row count result(s)
        $("#" + gID).jqxGrid('updatebounddata');
        var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
        var rowCount = dataInfo.rowscount;
        $("#countDeviceID").text(rowCount);       

        $("#" + gID).bind("bindingcomplete", function (event) {            
            $("#countDeviceID").text(rowCount);            
        });

        $("#" + gID).on("filter", function (event) {          
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            var rowCount = dataInfo.rowscount;
            $("#countDeviceID").text(rowCount);
        });
    }

});