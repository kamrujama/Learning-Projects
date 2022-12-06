define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil) {

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function deviceprofileApplicationViewModel() {

        var self = this;
        var uniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        self.isExport = ko.observable(false);
        GetDeviceApplicationAttribute(uniqueDeviceId, 'jqxgridDeviceProfileApplication');
        //open popup
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();

        var modelName = 'unloadTemplate';
        loadelement(modelName, 'genericPopup');

        //Clear Filter
        self.clearfilter = function (gId) {
            clearUiGridFilter(gId);
        }

        //Export to excel
        self.exportToExcel = function (gID, data) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                //$("#loadingDiv").show();
                //$("#" + gID).jqxGrid('exportdata', 'csv', 'Application_attributes');
                //openAlertpopup(1, 'export_Information');
                //$("#loadingDiv").hide();
                self.isExport = ko.observable(true);
                GetDeviceApplicationAttribute(uniqueDeviceId, 'jqxgridDeviceProfileApplication');
            }


        }


        function jqxgridDeviceProfGroupAssign(deviceProfileAppData, gId) {
            ParentData = [];
            var childData = [];
            if (deviceProfileAppData && deviceProfileAppData.length != 0 && !$.isEmptyObject(deviceProfileAppData)) {
                var dataSetContent=[];
                dataSetContent = $.makeArray(deviceProfileAppData.DataSet);
                for (var i = 0; i < dataSetContent.length; i++) {
                    if (dataSetContent && dataSetContent[i].DataSetContent != undefined) {

                        if (dataSetContent[i].DataSetContent.ApplicationAttributes != undefined) {

                        if (dataSetContent[i].DataSetContent.ApplicationAttributes.length == undefined) {
                            dataSetContent[i].DataSetContent.ApplicationAttributes = $.makeArray(dataSetContent[i].DataSetContent.ApplicationAttributes);
                        }
                            ParentData= ParentData.concat(dataSetContent[i].DataSetContent.ApplicationAttributes);
                        }
                    }
                }
               
            }


            if (ParentData) {
                childData = new Array();
                for (var i = 0; i < ParentData.length; i++) {
                    var childAppData = {};
                    if (ParentData[i].AppName != undefined) {
                        childAppData.AppName = ParentData[i].AppName;
                        if (ParentData[i].ApplAtrb != undefined) {
                            if (ParentData[i].ApplAtrb.length == undefined) {
                                ParentData[i].ApplAtrb = $.makeArray(ParentData[i].ApplAtrb);
                            }
                            childAppData.ApplAtrb = ParentData[i].ApplAtrb
                        }

                        childData.push(childAppData);
                    }
                }
            }

            var source = {
                datafields: [{ name: 'AppName' }],
                root: "ApplicationAttributes",
                datatype: "json",
                localdata: ParentData
            };
            var ParentAdapter = new $.jqx.dataAdapter(source);
            appDetails = childData;
            var nestedGrids = new Array();
            // create nested grid.
            var initrowdetails = function (index, parentElement, gridElement, record) {
                var id = record.uid.toString();
                var grid = $($(parentElement).children()[0]);

                nestedGrids[index] = grid;
                var appDetailsbyid = [];
                for (var m = 0; m < appDetails.length; m++) {
                    if (appDetails[m].AppName == record.AppName) {
                        if (appDetails[m].ApplAtrb != undefined) {
                            for (var n = 0; n < appDetails[m].ApplAtrb.length; n++) {
                                appDetailsbyid.push(appDetails[m].ApplAtrb[n]);
                            }
                        }
                    }
                }
                var childsource = {
                    datafields: [
                        { name: 'Name', type: 'string', map: 'Name' },
                        { name: 'Value', type: 'string', map: 'Value' },
                        { name: 'Instance', type: 'string', map: 'Instance' },
                    ],

                    datatype: "json",
                    localdata: appDetailsbyid
                }
                var nestedGridAdapter = new $.jqx.dataAdapter(childsource);

                //Custom filter
                var buildFilterPanelNestedGrid = function (filterPanel, datafield, row) {

                    wildfilterForApplicationView(filterPanel, datafield, nestedGridAdapter, grid);
                    var rows = $("#" + gId).jqxGrid('getrows');
                    for (var i = 0; i < rows.length; i++) {
                        var testgridid = "#gridmenugrid" + i;
                        $(testgridid + " ul li:first").css("display", "none")
                        $(testgridid + " ul li:nth-child(2)").css("display", "none")
                        $(testgridid + " ul li:nth-child(3)").css("display", "none")
                        $(testgridid).css("background-color", "transparent");
                    }
                }

                if (grid != null) {

                    grid.jqxGrid({
                        source: nestedGridAdapter,
                        width: "98%",
                        columnsResize: true,
                        columnsreorder: false,
                        selectionmode: 'singlerow',
                        theme: AppConstants.get('JQX-GRID-THEME'),
                        showsortmenuitems: false,
                        enabletooltips: true,
                        rowsheight: 32,
                        altrows: true,
                        height: "145",
                        sortable: true,
                        filterable: true,
                        autoshowcolumnsmenubutton: false,
                        //virtualmode: true,
                        altrows: true,
                        columns: [
                            {
                                text: 'Attribute Name', datafield: 'Name', minwidth: '340',
                                filtertype: "custom",
                                createfilterpanel: function (datafield, filterPanel) {
                                    buildFilterPanelNestedGrid(filterPanel, datafield);
                                }
                            },
                            {
                                text: 'Attribute Value', datafield: 'Value', minwidth: '310',
                                filtertype: "custom",
                                createfilterpanel: function (datafield, filterPanel) {
                                    buildFilterPanelNestedGrid(filterPanel, datafield);
                                }
                            },
                            {
                                text: 'Instance', datafield: 'Instance', minwidth: '330',
                                filtertype: "custom",
                                createfilterpanel: function (datafield, filterPanel) {
                                    buildFilterPanelNestedGrid(filterPanel, datafield);
                                }
                            },
                        ]
                    });

                    appViewNestedGrid = grid;
                    $(grid).on("cellclick", function (event) {
                        //koUtil.isParentAppOrBundle = 0;
                        var column = event.args.column;
                        var rowindex = event.args.rowindex;
                        var columnindex = event.args.columnindex;
                        var rowData = $(grid).jqxGrid('getrowdata', rowindex);
                        if (columnindex == 2 && rowData.IsParameterizationEnabled) {
                            openPopup('modelViewChildDownloadLibrary')
                            //$('#downloadModel').modal('show');
                            koUtil.rowIdDownloadChild = rowindex;
                            koUtil.gridIdDownloadChild = grid;

                            koUtil.applicationIDAppChild = rowData.Name;
                            koUtil.applicationNameAppChild = rowData.Value;
                            koUtil.applicationVersionAppChild = rowData.Instance;
                        }
                    });

                }
            }

            var bundelRenderer = function (row, column, value) {
                return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div><div class="btn-mg" style="float:right"><a class="btn" onclick="clearAppViewGrid()"  role="button"  title="Reset"><i class="icon-reset-filter"></i></a></div>';

            }

            var renderer = function (row, column, value) {
                return '<div style="float:left"><span style="margin-left: 4px; margin-top: 9px; float: left;">' + value + '</span></div>';

            }

            //Custom filter
            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, source, gId);
            }
            $(" #gridmenu" + gId + " ul li:first").css("display", "none")
            $(" #gridmenugridmenu" + gId + " ul li:nth-child(2)").css("display", "none")
            $(" #gridmenugridmenu" + gId + " ul li:nth-child(3)").css("display", "none")
            $(" #gridmenugridmenu" + gId + " ul li:nth-child(4)").css("display", "none")
            $(" #gridmenugridmenu" + gId + "").css("background-color", "transparent");


            // creage jqxgrid
            $("#" + gId).jqxGrid(
                {
                    width: "100%",
                    height: "100%",
                    source: source,
                    rowdetails: true,
                    selectionmode: 'none',
                    theme: AppConstants.get('JQX-GRID-THEME'),
                    autoshowcolumnsmenubutton: false,
                    sortable: true,
                    initrowdetails: initrowdetails,
                    rowdetailstemplate: { rowdetails: "<div id='grid' ></div>", rowdetailsheight: 165, rowdetailshidden: true },
                    ready: function () {
                        $("#" + gId).jqxGrid('showrowdetails', 0);
                        var gridheight = $(window).height();
                        gridheight = (gridheight - $("#" + gId).offset().top) - $(".fixed-footer").height() - 50;
                        $("#" + gId).jqxGrid({ height: gridheight });

                        $(".jqx-enableselect.jqx-widget-content").css('z-index', 9998);
                    },
                    columns: [
                        {
                            text: i18n.t('app_name', { lng: lang }), datafield: 'AppName', width: "100%", sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: bundelRenderer
                        },

                    ]
                });

        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        function GetDeviceApplicationAttribute(uniqueDeviceId, gID) {
            var uniqueDeviceId = uniqueDeviceId;
            var getDeviceApplicationAttributesReq = new Object();
            getDeviceApplicationAttributesReq.uniqueDeviceId = uniqueDeviceId;
            var Export = new Object();
            Export.DynamicColumns = null;
            Export.VisibleColumns = null;
            Export.IsAllSelected = false;
            Export.ExportReportType = 0;
            Export.IsExport = self.isExport();
            getDeviceApplicationAttributesReq.Export = Export;
            var callBackfunction = function (data, error) {
                if (data) {
                    if (self.isExport() == true) {
                        self.isExport(false);
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            openAlertpopup(1, 'export_Sucess');
                        }
                    } else {
                        if (data.deviceApplicationAttribute) {                            
                            var JsonXmlData1 = $.xml2json(data.deviceApplicationAttribute.ApplicationAttributesXMLData);
                            jqxgridDeviceProfGroupAssign(JsonXmlData1, gID);
                        } else {
                            var JsonXmlData1 = [];
                            jqxgridDeviceProfGroupAssign(JsonXmlData1, gID);
                        }
                    }
                } else if (error) {
                    openAlertpopup(2, 'network_error');
                }
            }

            var params = '{"token":"' + TOKEN() + '","getDeviceApplicationAttributesReq":' + JSON.stringify(getDeviceApplicationAttributesReq) + '}';
            ajaxJsonCall('GetDeviceApplicationAttribute', params, callBackfunction, true, 'POST', true);
        }

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


});
