define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {

    SelectedIdOnGlobale = new Array
    columnSortFilter = new Object();
    var lang = getSysLang();
    koUtil.GlobalColumnFilter = new Array();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function downloadLibararyappViewModel() {
        i18n.init({
            "lng": lang,
            "debug": true,
            "fallbackLang": 'en',
            "resGetPath": AppConstants.get('LOCALIZEDPATH') + '/__ns__-__lng__.json',
            ns: {
                namespaces: ['resource'],
                defaultNs: 'resource'
            }
        }, function (call) {
            $(document).i18n();
        });
             

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) { // 13 is enter key                                
                $('#btnRefresh').click();
            }
        });
        //Getting User Guid
        userrData = JSON.parse(sessionStorage.getItem("userrData"));
        userGuid = userrData[0].UserGuid;
        

        SelectedIdOnGlobale = new Array();
        checkALlPageId = 0;
        pagechangedcheck = 0;
        totalselectedRowCount = 0;
      
        var self = this;

        //Check rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            if (retval == true) {
                return false;
            } else {
                return true;
            }
        }

        self.templateFlag = ko.observable(false);
        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();
        self.observableModelPopupShowHide = ko.observable();

        setSelectionfromPth();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        loadelementForShowHide(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['BusinessName', 'MerchantName', 'BusinessEmail', 'AccountStatus', 'MerchantSince'];
        self.columnlist = ko.observableArray();

        //Load grid of uesrs
        var param = getMerchantParameters(false, columnSortFilter, null, null, 0, []);
        merchantGrid('jqxgridMerchant', param);

        //Clear filter
        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }

        //Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }
        function getSelectedIds() {
            return SelectedIdOnGlobale;
        }

        modelReposition();
        //Open Popup
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfields));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }
                loadelementForShowHide(popupName, 'genericPopup');
                $('#downloadModelShowHide').modal('show');
            } else if (popupName == "modelAddMerchant") {
                loadelement(popupName, 'administration');
                $('#merchantsModel').show();
                $('#viewMerchants').hide();
               
            } else if (popupName == "modelEditMerchant") {
                koUtil.isFromViewMerchant = false;
                var selecteItemIds = getSelectedUniqueId('jqxgridMerchant');
                var checkAll = checkAllSelecte('jqxgridMerchant');
                var unSelecteItemIds = getUnSelectedUniqueId('jqxgridMerchant');
                var datacount = getTotalRowcount('jqxgridMerchant');
                
                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'administration');
                        $('#merchantsModel').show();
                        $('#viewMerchants').hide();
                        editButtonClick('jqxgridMerchant');
                    }
                    else {
                        openAlertpopup(1, 'select_single_merchant_to_edit');
                        return;
                    }

                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'administration');
                        $('#merchantsModel').show();
                        $('#viewMerchants').hide();
                        editButtonClick('jqxgridMerchant');
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'Please_select_merchant_to_edit.');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'select_single_merchant_to_edit');
                        return;
                    }
                }
            } else if (popupName == "modelViewMerchant") {
                koUtil.isFromViewMerchant = true;
                loadelement(popupName, 'administration');
                $('#merchantsModel').show();
                $('#viewMerchants').hide();
            }
        }

        //Edit button click
        function editButtonClick(gId) {
            var selectedIds = getMultiSelectedData(gId);            
            globalVariableForEditMerchant = selectedIds;
            globalVariableForEditMerchant.gId = gId;
            selectedMerchantId = selectedIds[0].Id;
        }


        //Load Template
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTempalte(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //Load element for show/hide
        function loadelementForShowHide(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTempalte(elementname, controllerId);
            }
            self.observableModelPopupShowHide(elementname);
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
        }

        //Unload template for show/hide
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopupShowHide('unloadTemplate');
        }

        //Generate template
        function generateTempalte(tempname, controllerId) {
            //new template code
            var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
            var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
            var cunanem = tempname + '1';
            ko.components.register(tempname, {
                viewModel: { require: ViewName },
                template: { require: 'plugin/text!' + htmlName }
            });
            // end new template code
        }

        //Export to excel functionality
        /* self.exportToExcel = function (isExport, gId, exportflage) {
            var selectedMerchantItems = getSelectedUniqueId(gId);
            var unselectedMerchantItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelecte(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getMerchantParameters(true, columnSortFilter, selectedMerchantItems, unselectedMerchantItems, checkAll, visibleColumnsList);
            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                merchantsExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }

        } */

        self.exportToExcel = function (isExport, gId, exportflage) {
             var selectedMerchantItems = getSelectedUniqueId(gId);
             var unselectedMerchantItems = getUnSelectedUniqueId(gId);
             var checkAll = checkAllSelecte(gId);
             visibleColumnsList = GetExportVisibleColumn(gId);
             var param = getMerchantParameters(true, columnSortFilter, selectedMerchantItems, unselectedMerchantItems, checkAll, visibleColumnsList);
             function callbackFunction(data, error) {
                 if (data) {
                     if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						 openAlertpopup(1, 'export_Sucess');
					 }
					 
                 }
            }
			 var method = 'GetMerchants';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
		 }
		
		// function merchantsExport(param, gId, openPopup) {
            // $.ajax({
                // type: "POST",
                // url: GetVirtualPath() + "/Home/ExportMechants",
                // data: JSON.stringify(param),
                // contentType: 'application/json',
                // dataType: "json",
                // success: function (data) {
					
                    // window.location = GetVirtualPath() + "/Home/DownloadFile?fileName="+ data;
            // }});
            // // ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
        // }
		
        viewMerchantDetails = function (row) {
            selectedMerchantId = $("#jqxgridMerchant").jqxGrid('getcellvalue', row, 'Id');
            self.openPopup('modelViewMerchant');
        }
        function merchantGrid(gID, param) {

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
            var adStorage = InitGridStoragObj.adStorage;
            var source =
            {
                dataType: "json",
                dataFields: [
                         { name: 'isSelected', type: 'number' },
                         { name: 'Id', map: 'Id' },
                         { name: 'BusinessName', map: 'BusinessName' },
                         { name: 'MerchantName', map: 'MerchantName' },
                         { name: 'BusinessEmail', map: 'BusinessEmail' },
                         { name: 'MerchantEmail', map: 'MerchantEmail' },
                         { name: 'AccountStatus', map: 'AccountStatus' },
                         { name: 'MerchantSince', map: 'MerchantSince', type: 'date' },
                         { name: 'UpdatedDate', map: 'UpdatedDate', type: 'date' },
                         { name: 'LogoUrl', map: 'LogoUrl' }
                ],

                root: 'Merchants',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetMerchants",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getMerchantsResponse)
                        data.getMerchantsResponse = $.parseJSON(data.getMerchantsResponse);
                    else
                        data.getMerchantsResponse = [];

                    if (data.getMerchantsResponse && data.getMerchantsResponse.PaginationResponse) {
                        source.totalrecords = data.getMerchantsResponse.PaginationResponse.TotalRecords;
                        source.totalpages = data.getMerchantsResponse.PaginationResponse.TotalPages;
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;

                    }
                },
            };

            var dataAdapter = new $.jqx.dataAdapter(source,
                {
                    formatData: function (data) {
                        $('.all-disabled').show();
                        disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                        columnSortFilter = new Object();
                        columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'Merchants');
                        param.getMerchantsRequest.ColumnSortFilter = columnSortFilter;
                        koUtil.GlobalColumnFilter = columnSortFilter;
                        param.getMerchantsRequest.Pagination = getPaginationObject(param.getMerchantsRequest.Pagination, gID);
                        updatepaginationOnState(gID, gridStorage, param.getMerchantsRequest.Pagination, null, null);
                        data = JSON.stringify(param);
                        return data;
                    },
                    downloadComplete: function (data, status, xhr) {

                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                        if (data.getMerchantsResponse && data.getMerchantsResponse.Merchants) {
                            for (var i = 0; i < data.getMerchantsResponse.Merchants.length; i++) {
                                data.getMerchantsResponse.Merchants[i].MerchantSince = convertToLocaltimestamp(data.getMerchantsResponse.Merchants[i].MerchantSince);
                                data.getMerchantsResponse.Merchants[i].UpdatedDate = convertToLocaltimestamp(data.getMerchantsResponse.Merchants[i].UpdatedDate);
                            }
                            //if (data.getMerchantsResponse.PaginationResponse && data.getMerchantsResponse.PaginationResponse.HighLightedItemPage > 0) {
                            //    gridStorage[0].highlightedPage = data.getMerchantsResponse.PaginationResponse.HighLightedItemPage;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}

                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getMerchantsResponse = new Object();
                            data.getMerchantsResponse.Marchants = [];

                        }
                        $('.all-disabled').hide();

                    },
                    loadError: function (jqXHR, status, error) {
                        $('.all-disabled').hide();
                    }
                }
            );

            //Custom filter
            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            }
            var buildFilterPanelDate = function (filterPanel, datafield) {
                genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

            }
            var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
                genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
            }
            //for allcheck
            var rendered = function (element) {
                enablegridfunctions(gID, 'Id', element, gridStorage, true, 'pagerDivMerchants', false, 0, 'Id', null, null, null);
                return true;
            }

            var detailnrender = function (row, columnfield, value, defaulthtml, columnproperties) {
                var html = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;"><a style="text-decoration: underline" tabindex="0" title="Click to view Details"  onclick="viewMerchantDetails(' + row + ')" role="button" >View Details</a></div>';
                return html;
            }
            var merchantStatus = function (row, column, value, defaultHtml) {

                if (value == "Active") {
                    //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:5px;padding-top:7px;" >' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
                }
                if (value == "Inactive") {
                    // defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-cross" style="color:red"></i></span><span style="padding-left:5px;padding-top:7px;" >' + value + '</span></div>';
                    defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
                }
                return defaultHtml;
            }

            $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID, "60"),
                width: "100%",
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('ROWSPERPAGE'),
                filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: true,
                selectionmode: 'singlerow',
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                enabletooltips: true,
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, ['Details']);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },

                columns: [
                        {
                            text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                            datafield: 'isSelected', width: 40, renderer: function () {
                                return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                            }, rendered: rendered
                        },
                        { text: '', datafield: 'Id', hidden: true, editable: false, },
                        {
                            text: i18n.t('businessname', { lng: lang }), datafield: 'BusinessName', editable: false, minwidth: 100, filterable: true, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                         {
                             text: i18n.t('merchantName', { lng: lang }), datafield: 'MerchantName', editable: false, minwidth: 100, filterable: true, filtertype: "custom",
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanel(filterPanel, datafield);
                             }

                         },
                         {
                             text: i18n.t('merchantemail', { lng: lang }), datafield: 'MerchantEmail', enabletooltips: false, editable: false, minwidth: 150, filterable: true, filtertype: "custom", hidden: true,
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanel(filterPanel, datafield);
                             }
                         },
                          {
                              text: i18n.t('businessemail', { lng: lang }), datafield: 'BusinessEmail', enabletooltips: false, editable: false, minwidth: 150, filterable: true, filtertype: "custom",
                              createfilterpanel: function (datafield, filterPanel) {
                                  buildFilterPanel(filterPanel, datafield);
                              }
                          },

                        {
                            text: i18n.t('accountstatus', { lng: lang }), datafield: 'AccountStatus', enabletooltips: false, editable: false, minwidth: 150, filterable: true,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('merchantsince', { lng: lang }), datafield: 'MerchantSince', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelDate(filterPanel, datafield);

                            }
                        },
                         {
                             text: i18n.t('mch_modifiedon', { lng: lang }), datafield: 'UpdatedDate', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150, hidden: true,
                             filtertype: "custom",
                             createfilterpanel: function (datafield, filterPanel) {
                                 buildFilterPanelDate(filterPanel, datafield);

                             }
                         },
                         { text: i18n.t('marchant_Details', { lng: lang }), filterable: false, sortable: false, menu: false, datafield: 'Details', editable: false, minwidth: 100, width: 'auto', cellsrenderer: detailnrender }
                ]
            });
            getGridBiginEdit(gID, 'Id', gridStorage);
            callGridFilter(gID, gridStorage);
            callGridSort(gID, gridStorage, 'Id');


        }

    };



    

    function getMerchantParameters(isExport, columnSortFilter, selectedUserItems, unselectedUserItems, checkAll, visibleColumns) {
        var getMerchantsRequest = new Object();
        var Export = new Object();
        var Selector = new Object();
        var Pagination = new Object();
        getMerchantsRequest.EstateId = userGuid;
        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;
        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedUserItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.ExportReportType = 18;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.ExportReportType = 18;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedUserItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.ExportReportType = 18;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
                Export.ExportReportType = 18;
            }
        }

        var ColumnSortFilter = columnSortFilter;
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);
        getMerchantsRequest.Pagination = Pagination;
        getMerchantsRequest.ColumnSortFilter = ColumnSortFilter;
        getMerchantsRequest.Export = Export;
        getMerchantsRequest.Selector = Selector;
        var param = new Object();
        param.token = TOKEN();
        param.getMerchantsRequest = getMerchantsRequest;
        return param;
    }
    ///
});