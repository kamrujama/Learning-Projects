define(["knockout", "autho", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, autho, koUtil) {
    return function appViewModel() {

        var self = this;

        
        self.observableModelPopupParent = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        
        modelReposition();
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelViewChildDownloadLibrary") {
                loadelement(popupName, 'genericPopup');
                $('#downloadModelParent').modal('show');
            }
        }
        self.unloadTempPopupParent = function (popupName) {
            self.observableModelPopupParent('unloadTemplate');
            $('#downloadModelParent').modal('hide');
            checkIsPopUpOPen();
        }


        self.clearfilterApplicationParent = function (gridId) {
            clearUiGridFilter(gridId);
            $('#' + gridId).jqxGrid('clearselection');
        }

        self.exportToExcelApplicationParent = function (gridId) {
            var dataInfo = $("#" + gridId).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                $("#" + gridId).jqxGrid('exportdata', 'csv', 'Application');
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }

      

        $('#modelViewParentDownloadLibHeader').mouseup(function () {
            $("#modelViewParentDownloadLibContent").draggable({ disabled: true });
        });

        $('#modelViewParentDownloadLibHeader').mousedown(function () {
            $("#modelViewParentDownloadLibContent").draggable({ disabled: false });
        });


        //  AplicationViewPopup(koUtil.rowIdDownload, koUtil.gridIdDownload);

        if (koUtil.isDownloadlibAddpackage == 0) {
            var gID = koUtil.gridIdDownload;
            var row = koUtil.rowIdDownload;
            var packageID = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageId');
            var packagemode = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageMode');
            var aplicationName = $("#" + gID).jqxGrid('getcellvalue', row, 'PackageName');
            var mainPopupGid = 'jqxgridViewParentDownloadLib';

            $("#packageNameAppln").text(aplicationName);

            if (packagemode == 'Package' || packagemode == '1') {
                $("#showHideRestBtnParentModel").show();
                var getApplicationsForPackageReq = aplicationGridModel(packageID, gID);
                getAvailablePackages1(getApplicationsForPackageReq, mainPopupGid, false, self.openPopup);
            } else {
                $("#showHideRestBtnParentModel").hide();
                GetBundlesForPackage1(packageID, mainPopupGid, false, self.openPopup);
            }

        } else if (koUtil.isDownloadlibAddpackage == 1) {
            packageID= koUtil.addPackgeId;
            packagemode = koUtil.addPackgeMode;
            var downloadAddPackageGid = 'addPackage';
            if (packagemode == 'Package' || packagemode == '1') {
                $("#showHideRestBtnParentModel").show();
                var getApplicationsForPackageReq = aplicationGridModel(packageID, gID);
                getAvailablePackages1(getApplicationsForPackageReq, downloadAddPackageGid, false, self.openPopup);
            } else {
                $("#showHideRestBtnParentModel").hide();
                GetBundlesForPackage1(packageID, downloadAddPackageGid, false, self.openPopup);
            }
        } else if (koUtil.isDownloadlibAddpackage == 2) {
            $("#ParentViewModel").modal("hide");
            $("#gridDiv").modal("hide");
            $("#footerDiv").modal("hide");
            packageID = koUtil.editPackgeId;
            packagemode = koUtil.editPackgeMode;
            var editPackageGid = koUtil.editPackageGid;
            if (packagemode == 'Package' || packagemode == '1') {
                $("#showHideRestBtnParentModel").show();
                var getApplicationsForPackageReq = aplicationGridModel(packageID, gID);
                getAvailablePackages1(getApplicationsForPackageReq, editPackageGid, false, self.openPopup);
            } else {
                $("#showHideRestBtnParentModel").hide();
                GetBundlesForPackage1(packageID, editPackageGid, false, self.openPopup);
            }
        }
       


        function getAvailablePackages1(getApplicationsForPackageReq, gId, isFromReferenceSet, openPopup) {
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data && data.getApplicationsForPackageResp) {
                            data.getApplicationsForPackageResp = $.parseJSON(data.getApplicationsForPackageResp);
                        }
                        availableApplicationGrid1(gId, data.getApplicationsForPackageResp.Applications, isFromReferenceSet, openPopup);
                    }
                }
            }

            var method = 'GetApplicationsForPackage';
            var params = '{"token":"' + TOKEN() + '","getApplicationsForPackageReq":' + JSON.stringify(getApplicationsForPackageReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }


        //Grid function
        function availableApplicationGrid1(gId, Applicationsdata, isFromReferenceSet, openPopup) {
            //alert(JSON.stringify(Applicationsdata));
            var source =
               {
                   dataType: "json",
                   dataFields: [
                        { name: 'ApplicationName', map: 'ApplicationName' },
                        { name: 'ApplicationVersion', map: 'ApplicationVersion' },
                        { name: 'IsParameterizationEnabled', map: 'IsParameterizationEnabled' },
                        { name: 'ApplicationId', map: 'ApplicationId' },
                   ],
                   root: 'Applications',
                   contentType: 'application/json',
                   localdata: Applicationsdata

               };

            var parameterRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
                if (value == true) {
                    var applicationID = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationId');
                    var applicationName = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationName');
                    var applicationVersion = $("#" + gId).jqxGrid('getcellvalue', row, 'ApplicationVersion');
                    var isParameterizationEnabled = $("#" + gId).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
                    if (isParameterizationEnabled == true) {
                        var html = '<div style="text-align:center;"><a  title="View Application"  style="text-decoration: underline;">View</a></div>';
                    } else {
                        var html = '';
                    }
                } else {
                    return "";
                }
                return html;
            }
            var buildFilterPanel = function (filterPanel, datafield) {
                wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gId, true);
            }

            var dataAdapter = new $.jqx.dataAdapter(source);
            $("#" + gId).jqxGrid(
            {
                width: "100%",
                editable: true,
                source: dataAdapter,
                altRows: true,
                pageSize: 5,
                filterable: true,
                sortable: true,
                columnsResize: true,
                height: "200px",
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                rowdetails: false,
                rowdetailstemplate: false,
                columns: [
                    {
                        text: i18n.t('app_name', { lng: lang }), filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }, dataField: 'ApplicationName', editable: false, minwidth: 100,
                    },
                    {
                        text: i18n.t('app_version', { lng: lang }), filtertype: "custom", dataField: 'ApplicationVersion', editable: false, minwidth: 100,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('ParameterDefination', { lng: lang }), filtertype: "custom", datafield: 'IsParameterizationEnabled', editable: false, filterable: false, sortable: false, menu: false, minwidth: 100, cellsrenderer: parameterRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                ]
            });
            if (isFromReferenceSet == true) {
                $("#" + gId).jqxGrid('hidecolumn', "IsParameterizationEnabled");
            }

            $("#" + gId).on("cellclick", function (event) {
                var column = event.args.column;
                var rowindex = event.args.rowindex;
                var columnindex = event.args.columnindex;
                var rowData = $("#" + gId).jqxGrid('getrowdata', rowindex);
                if (columnindex == 2 && rowData.IsParameterizationEnabled == true) {
                    openPopup('modelViewChildDownloadLibrary')
                    //$('#downloadModel').modal('show');
                    koUtil.rowIdDownloadChild = rowindex;
                    koUtil.gridIdDownloadChild = "#" + gId;

                    koUtil.applicationIDAppChild = rowData.ApplicationId;
                    koUtil.applicationNameAppChild = rowData.ApplicationName;
                    koUtil.applicationVersionAppChild = rowData.ApplicationVersion;
                    koUtil.isParentAppOrBundle = 1;
                    //  var isParameterizationEnabled = $("#" + gId).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
                   
                } else {
                }
            });
        }



        //For Bundle
        function GetBundlesForPackage1(packageID, gId, isFromReferenceSet, openPopup) {
            var getBundlesForPackageReq = new Object();
            getBundlesForPackageReq.PackageId = packageID;

            if (gId == "jqxgridDownloadlib") {
                getBundlesForPackageReq.State = 0;
            } else if (gId == 'addPackage') {
                getBundlesForPackageReq.State = 1;
            } else {
                getBundlesForPackageReq.State = 0;
            }
            function callbackFunction(data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        AplicationViewGrid1(data, gId, isFromReferenceSet,openPopup);
                    } 
                }
            }
            var method = 'GetBundlesForPackage';
            var params = '{"token":"' + TOKEN() + '","getBundlesForPackageReq":' + JSON.stringify(getBundlesForPackageReq) + '}';
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }


        //Bundle Call
        function AplicationViewGrid1(data, gId, isFromReferenceSet, openPopup) {
            if (data.getBundlesForPackageResp) {
                data.getBundlesForPackageResp = $.parseJSON(data.getBundlesForPackageResp);
            }
            ParentData = data.getBundlesForPackageResp.SubPackageDetails;
            
          
            var source =
            {
                datafields: [
                    { name: 'BundleName' },
                    { name: 'BundleVersion' },
                    { name: 'PackageId' }
                ],
                root: "SubPackageDetails",
                datatype: "json",
                localdata: ParentData
            };
            var ParentAdapter = new $.jqx.dataAdapter(source);
            
            var childDataAdapter = null;
            
            var nestedGrids = new Array();
            // create nested grid.
            var initrowdetails = function (index, parentElement, gridElement, record) {
                var id = record.uid.toString();
                var grid = $($(parentElement).children()[0]);
                // child grid initialization
                var childData;
                if (data.getBundlesForPackageResp.SubPackageDetails) {
                    childData = data.getBundlesForPackageResp.SubPackageDetails[index].applicationDetails;
                }
                var childsource =
            {
                datafields: [
                    { name: 'ApplicationId', type: 'string', map: 'ApplicationId' },
                    { name: 'ApplicationName', type: 'string', map: 'ApplicationName' },
                    { name: 'ApplicationVersion', type: 'string', map: 'ApplicationVersion' },
                    { name: 'IsParameterizationEnabled', type: 'string', map: 'IsParameterizationEnabled' }
                ],
                root: "ApplicationDetails",
                datatype: "json",
                localdata: childData
            };

                childDataAdapter = new $.jqx.dataAdapter(childsource, { autoBind: true });
                appDetails = childDataAdapter.records;
                // end child grid initialization 
                nestedGrids[index] = grid;
                var appDetailsbyid = [];
                for (var m = 0; m < appDetails.length; m++) {
                    appDetailsbyid.push(appDetails[m]);
                }
                var childsource = {
                    datafields: [
                        { name: 'ApplicationId', type: 'string' },
                        { name: 'ApplicationName', type: 'string' },
                        { name: 'ApplicationVersion', type: 'string' },
                        { name: 'IsParameterizationEnabled', type: 'string' }
                    ],

                    datatype: "json",
                    localdata: appDetailsbyid
                }
                var nestedGridAdapter = new $.jqx.dataAdapter(childsource);
                var childAplicationrender = function (row, columnfield, value, defaulthtml, columnproperties) {
                    var applicationID = $(grid).jqxGrid('getcellvalue', row, 'ApplicationId');
                    var applicationName = $(grid).jqxGrid('getcellvalue', row, 'ApplicationName');
                    var applicationVersion = $(grid).jqxGrid('getcellvalue', row, 'ApplicationVersion');
                    var isParameterizationEnabled = $(grid).jqxGrid('getcellvalue', row, 'IsParameterizationEnabled');
                    if (isParameterizationEnabled == true) {
                        var html = '<div style="text-align:center;" ><a style="height:100px;cursor:pointer;text-align:center;text-decoration: underline;"   title="View Application"   role="button" >View</a></div>';
                    } else {
                        var html = '';
                    }
                    return html;
                }
                //Custom filter
                var buildFilterPanelNestedGrid = function (filterPanel, datafield,row) {
                    
                    wildfilterForApplicationView(filterPanel, datafield, nestedGridAdapter, grid);
                    var rows = $("#" + gId).jqxGrid('getrows');
                    for (var i = 0; i < rows.length; i++) {
                        var testgridid = "#gridmenugrid" + i;
                        $(testgridid + " ul li:first").css("display", "none")
                        $(testgridid + " ul li:nth-child(2)").css("display", "none")
                        $(testgridid + " ul li:nth-child(3)").css("display", "none")
                        $(testgridid + " ul li:nth-child(4)").css("display", "none")
                        $(testgridid).css("background-color", "transparent");


                    }


                }


                if (grid != null) {

                    grid.jqxGrid({
                        source: nestedGridAdapter, width: "99%", height: 100, sortable: true, filterable: true, autoshowcolumnsmenubutton: false, showsortmenuitems: false,
                        columns: [
                          {
                              text: i18n.t('app_name', { lng: lang }), datafield: 'ApplicationName', minwidth: 100, editable: false,
                              filtertype: "custom",
                              createfilterpanel: function (datafield, filterPanel) {
                                  buildFilterPanelNestedGrid(filterPanel, datafield);
                              }
                          },
                          {
                              text: i18n.t('app_version', { lng: lang }), datafield: 'ApplicationVersion', minwidth: 100, editable: false,
                              filtertype: "custom",
                              createfilterpanel: function (datafield, filterPanel) {
                                  buildFilterPanelNestedGrid(filterPanel, datafield);
                              }
                          },
                          { text: i18n.t('parameter_definition', { lng: lang }), datafield: 'IsParameterizationEnabled', minwidth: 100, menu: false, editable: false, filterable: false, sortable: false, cellsrenderer: childAplicationrender }
                        ]
                    });
                    if (isFromReferenceSet == true) {
                        $(grid).jqxGrid('hidecolumn', "IsParameterizationEnabled");
                    }

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

                            koUtil.applicationIDAppChild = rowData.ApplicationId;
                            koUtil.applicationNameAppChild = rowData.ApplicationName;
                            koUtil.applicationVersionAppChild = rowData.ApplicationVersion;
                        }                         
                    });

                    //TFS #8190 Bug Fix COmmenting this Code
                    //$("#" + gId).on("cellclick", function (event) {
                    //        var column = event.args.column;
                    //        var rowindex = event.args.rowindex;
                    //        var columnindex = event.args.columnindex;
                    //        var rowData = $(grid).jqxGrid('getrowdata', rowindex);
                    //        if (columnindex == 2) {
                    //            var modelname = 'unloadTemplate';
                    //            loadelement(modelname, 'genericPopup');
                    //            openPopup('modelViewChildDownloadLibrary');
                    //            koUtil.rowIdDownloadChild = rowindex;
                    //            koUtil.gridIdDownloadChild = "#" + gId;

                    //            koUtil.applicationIDAppChild = rowData.ApplicationId;
                    //            koUtil.applicationNameAppChild = rowData.ApplicationName;
                    //            koUtil.applicationVersionAppChild = rowData.ApplicationVersion;
                    //        } 
                    //    });
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
                autoheight: true,
                source: source,
                rowdetails: true,
                selectionmode: 'none',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                sortable: true,
                initrowdetails: initrowdetails,
                rowdetailstemplate: { rowdetails: "<div id='grid' style='padding-top:13px' ></div>", rowdetailsheight: 150, rowdetailshidden: true },
                ready: function () {
                    //$("#" + gId).jqxGrid('showrowdetails', 0);
                },
                columns: [
                      {
                          text: i18n.t('bundle_name', { lng: lang }), datafield: 'BundleName', minwidth: 100, sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: bundelRenderer
                      },
                      {
                          text: i18n.t('bundle_version', { lng: lang }), datafield: 'BundleVersion', minwidth: 100, sortable: false, editable: false, filterable: false, menu: false, cellsrenderer: renderer,
                      },
                ]
            });
        }
        //Load Element
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupParent(elementname);
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