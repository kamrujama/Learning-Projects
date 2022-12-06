define(["knockout", "autho", "koUtil", "spinner"], function (ko, autho, koUtil) {
    var lang = getSysLang();
    var columnSortFilterForSubscriptionList = new Object();
    var columnSortFilterForMySubscription = new Object();

    koUtil.GlobalColumnFilter = new Array();
    visibleColumnsForSubscriptionList = new Array();
    visibleColumnsForMySubscription = new Array();

    return function subscriptionListViewModel() {

        var self = this;

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefresh').click();
            }
        });

        $('#btnAddSubscription').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnAddSubscription').click();
            }
        });

        $('#btnEditSubscription').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnEditSubscription').click();
            }
        });

        $('#btnDeleteSubscription').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnDeleteSubscription').click();
            }
        });

        $('#btnRefreshMySubscriptions').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefreshMySubscriptions').click();
            }
        });

        $('#btnUnsubscribe').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnUnsubscribe').click();
            }
        });


        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#deleteSubscriptionId').on('shown.bs.modal', function (e) {
            $('#deleteSubscriptionId_No').focus();

        });
        $('#deleteSubscriptionId').keydown(function (e) {
            if ($('#deleteSubscriptionId_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#deleteSubscriptionId_Yes').focus();
            }
        });
        $('#unsubscribeListId').on('shown.bs.modal', function (e) {
            $('#unsubscribeListId_No').focus();

        });
        $('#unsubscribeListId').keydown(function (e) {
            if ($('#unsubscribeListId_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#unsubscribeListId_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------


        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        self.checkRightsForSubscribe = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            var retvalForUser = autho.checkRightsBYScreen('Roles and Users', 'IsviewAllowed');
            var returnVal
            if (retval == true && retvalForUser == true) {
                returnVal = true
            } else {
                returnVal = false
            }
            return returnVal;
        }

        self.observableModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['CreatedOn'];
        self.columnlist = ko.observableArray();

        setScreenControls(AppConstants.get('MY_SUBSCRIPTIONS'));
        setMenuSelection();
        modelReposition();
        //Show/Hide Columns , Edit Subscription
        self.openPopup = function (popupName, gId,isEdit) {
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

                loadelement(popupName, 'genericPopup');
                $('#modelAddSubcription').modal('show');
            } else if (popupName == "modelAddSubscription" && isEdit == false) {
                koUtil.editFlag = 0;
                loadelement(popupName, 'reports');
                $('#modelAddSubcription').modal('show');

            } else if (popupName == "modelAddSubscription" && isEdit == true) {
                koUtil.editFlag = 1;
                var selecteItemIds = getSelectedUniqueId(gId);
                var checkAll = checkAllSelected(gId);
                var unSelecteItemIds = getUnSelectedUniqueId(gId);

                koUtil.SubscriptionSelectedata = getMultiSelectedData(gId);
                var datacount = getTotalRowcount(gId);

                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'reports');
                        $('#modelAddSubcription').modal('show');
                    } else {
                        openAlertpopup(1, 'rpt_Please_select_a_single_subscription_to_edit');
                        return;
                    }
                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'reports');
                        $('#modelAddSubcription').modal('show');
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'rpt_Please_select_a_subscription_to_edit');
                        return;
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'rpt_Please_select_a_single_subscription_to_edit');
                        return;
                    }
                   
                }
            }
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        // unload template
        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup(popupName);
            $("#mainPageBody").removeClass('modal-open-appendon');
            $('#modelAddSubcription').modal('hide');
            isAdpopup = '';
        };

        var param = getSubscriptionListDetails(false,columnSortFilterForSubscriptionList,null,null,null, []);
        jqxgridSubscriptionList(param, 'jqxGridSubscriptionList');

        var param = getMySubscriptionsDetails(columnSortFilterForMySubscription);
        jqxgridMySubscriptions(param, 'jqxGridMySubscriptionList');


        //Tab click
        self.subscriptionGridDetails = function () {
            $("#jqxGridMySubscriptionList").jqxGrid({ autoshowloadelement: false });
            $("#jqxGridMySubscriptionList").jqxGrid('updatebounddata');
            visibleColumnsList = visibleColumnsForMySubscription;
            //setSingleCustomWidth("ReportName", "jqxGridMySubscriptionList");
        }

        //Tab click
        self.subscriptionListClicked = function () {
            $("#jqxGridSubscriptionList").jqxGrid({ autoshowloadelement: false });
            $("#jqxGridSubscriptionList").jqxGrid('updatebounddata');
            visibleColumnsList = visibleColumnsForSubscriptionList;
            //setSingleCustomWidth("ReportName", "jqxGridSubscriptionList");
        }

        //Refresh
        self.refreshGrid = function (gId) {

            gridRefresh(gId);
        }

        //Delete
        self.deleteSubscription = function (gId) {
            var selectedIds = getMultiSelectedData(gId);
            
            if (selectedIds.length >= 1) {

                $("#deleteSubscriptionId").modal('show');
            } else {
                openAlertpopup(1, 'rpt_select_atleast_one_subscription_to_delete');
            }
        }

        //Unsubscribe
        self.unsubscribeList = function (gId) {
            var selectedIds = getMultiSelectedData(gId);
            if (selectedIds.length >= 1) {
                $("#unsubscribeListId").modal('show');
            } else {
                openAlertpopup(1, 'rpt_select_atleast_one_subscription_to_unsubscribe');
            }
        }

        self.confirmUnsubscribList = function (gId) {
            unsubscribeDetails(gId);
        }

        self.confirmDeleteList = function (gId) {
            deleteDetails(gId);
        }

        //Reset filter or Show all Data
        self.clearfilter = function (gridId) {
            gridFilterClear(gridId);
        }

        //Subscription List Export to Excel
        self.exportToExcel = function (isExport, gId) {
            var selectedSubscriptionListItems = getSelectedUniqueId(gId);
            var unselectedSubscriptionListItems = getUnSelectedUniqueId(gId);
            var checkall = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getSubscriptionListDetails(isExport, columnSortFilterForSubscriptionList, selectedSubscriptionListItems, unselectedSubscriptionListItems, checkall, visibleColumnsList);
           
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                subscriptionListExport(param, gId);
            } else {
                openAlertpopup(1, 'no_data_to_export')

            }
        }

        //My Subscription Export to Excel
        self.mySubsExportToExcel = function (isExport, gId) {
            var selectedMySubscriptionItems = getSelectedUniqueId(gId);
            var unselectedMySubscriptionItems = getUnSelectedUniqueId(gId);
            var checkall = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getMySubscriptionsDetails(isExport, columnSortFilterForMySubscription, selectedMySubscriptionItems, unselectedMySubscriptionItems, checkall, visibleColumnsList);

            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                mySubscriptionExport(param, gId);
            } else {
                openAlertpopup(1, 'no_data_to_export')

            }
        }
        seti18nResourceData(document, resourceStorage);
    }//End subscriptionListViewModel

    function subscriptionListExport(param, gId) {
        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetAllSubscriptions';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function mySubscriptionExport(param, gId) {
        var callbackFunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'export_Sucess');
                } 
            }
        }

        var method = 'GetMySubscriptions';
        var params = JSON.stringify(param);
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function generateTemplate(tempname, controllerId) {
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

    function jqxgridSubscriptionList(param, gID) {

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
        //////////////

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;

        //var gridStorageArray = new Array();
        //var gridSubListObj = new Object();

        //gridSubListObj.checkAllFlag = 0;
        //gridSubListObj.counter = 0;
        //gridSubListObj.filterflage = 0;
        //gridSubListObj.selectedDataArr = [];
        //gridSubListObj.unSelectedDataArr = [];
        //gridSubListObj.singlerowData = [];
        //gridSubListObj.multiRowData = [];
        //gridSubListObj.TotalSelectionCount = null;
        //gridSubListObj.highlightedRow = null;
        //gridSubListObj.highlightedPage = null;
        //gridStorageArray.push(gridSubListObj);

        //var gridStorage = JSON.stringify(gridStorageArray);
        //window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        //var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        // prepare the data
        var source =
        {
            datatype: "json",
            datafields: [
                 { name: 'ReportId', map: 'ReportId' },
                { name: 'SubscriptionName', map: 'SubscriptionName' },
                { name: 'ReportName', map: 'ReportName' },
                { name: 'Verbose', map: 'Verbose' },
                { name: 'CreatedByUserName', map: 'CreatedByUserName' },
                { name: 'CreatedOn', map: 'CreatedOn',type: 'date' },
                { name: 'isSelected', type: 'number' },
                { name: 'SubscriptionId', map: 'SubscriptionId' },
            ],
            root: 'ReportSubscriptions',
            type: "POST",
            data: param,

            url: AppConstants.get('API_URL') + "/GetAllSubscriptions",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getAllSubscriptionsResp)
                    data.getAllSubscriptionsResp = $.parseJSON(data.getAllSubscriptionsResp);
                else
                    data.getAllSubscriptionsResp = [];

                if (data.getAllSubscriptionsResp && data.getAllSubscriptionsResp.PaginationResponse) {
                    source.totalrecords = data.getAllSubscriptionsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getAllSubscriptionsResp.PaginationResponse.TotalPages;
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForSubscriptionList, gID, gridStorage, 'SubScriptionList');

                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getAllSubscriptionsReq.ColumnSortFilter = columnSortFilter;

                    param.getAllSubscriptionsReq.Pagination = getPaginationObject(param.getAllSubscriptionsReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    //if (data.getAllSubscriptionsResp)
                    //    data.getAllSubscriptionsResp = $.parseJSON(data.getAllSubscriptionsResp);

                    if (data.getAllSubscriptionsResp && data.getAllSubscriptionsResp.ReportSubscriptions) {
                        for (var i = 0; i < data.getAllSubscriptionsResp.ReportSubscriptions.length; i++) {
                            data.getAllSubscriptionsResp.ReportSubscriptions[i].CreatedOn = convertToLocaltimestamp(data.getAllSubscriptionsResp.ReportSubscriptions[i].CreatedOn);
                        }
                        //if (data.getAllSubscriptionsResp.PaginationResponse && data.getAllSubscriptionsResp.PaginationResponse.HighLightedItemPage > 0) {
                        //    gridStorage[0].highlightedPage = data.getAllSubscriptionsResp.PaginationResponse.HighLightedItemPage;
                        //    var updatedGridStorage = JSON.stringify(gridStorage);
                        //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                        //}

                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.getAllSubscriptionsResp = new Object();
                        data.getAllSubscriptionsResp.ReportSubscriptions = [];

                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );

        //for allcheck 
        var rendered = function (element) {
            
            enablegridfunctions(gID, 'SubscriptionId', element, gridStorage, true, 'pagerDivSubscriptionList', false, 0, 'SubscriptionId', null, null, null);
            return true;
        }

        //For Filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }

        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            height: gridHeightFunction(gID, "1"),
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
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            enabletooltips: true,
            rowsheight: 32,
            rendergridrows: function () {
                return dataAdapter.records;
            },

            ready: function () {
                callOnGridReady(gID, gridStorage);

                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
                visibleColumnsForSubscriptionList = visibleColumnsList;
            },
            columns: [

                 {
                     text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                     datafield: 'isSelected', width: 40, renderer: function () {
                         return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                     }, rendered: rendered
                 },
                 { text: '', datafield: 'ReportId', hidden: true,  },

                {

                    text: i18n.t('rpt_Subscription_Name', { lng: lang }), datafield: 'SubscriptionName', minwidth: 90, editable: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('rpt_Report_Name', { lng: lang }), datafield: 'ReportName', minwidth: 90, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

              {
                  text: i18n.t('rpt_Recurrence', { lng: lang }), datafield: 'Verbose', minwidth: 90,  editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
               {
                   text: i18n.t('rpt_Created_By', { lng: lang }), datafield: 'CreatedByUserName', minwidth: 90,  editable: false,
                   filtertype: "custom",
                   createfilterpanel: function (datafield, filterPanel) {
                       buildFilterPanel(filterPanel, datafield);
                   },
               },
                {
                    text: i18n.t('rpt_Created_On', { lng: lang }), datafield: 'CreatedOn', minwidth: 90,  cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    },
                }
            ]
        });
        getGridBiginEdit(gID, 'SubscriptionId', gridStorage);

        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'SubscriptionId');

    }
    //end subscription list grid

    function getSubscriptionListDetails(isExport, columnSortFilterForSubscriptionList, selectedSubscriptionListItems, unselectedSubscriptionListItems, checkall, visibleColumns) {

        var getAllSubscriptionsReq = new Object();
        var FilterList = new Array();

        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();

        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;

        if (checkall == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedSubscriptionListItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
              
            } else {
                
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedSubscriptionListItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
               
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
                
            }
        }


        var ColumnSortFilter = columnSortFilterForSubscriptionList;
        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        getAllSubscriptionsReq.ColumnSortFilter = columnSortFilterForSubscriptionList;
        getAllSubscriptionsReq.Export = Export;
        getAllSubscriptionsReq.Pagination = Pagination;
        getAllSubscriptionsReq.Selector = Selector;       

        var param = new Object();
        param.token = TOKEN();
        param.getAllSubscriptionsReq = getAllSubscriptionsReq;
        return param;
    }
    


    function getMySubscriptionsDetails(isExport, columnSortFilterForMySubscription, selectedMySubscriptionItems, unselectedMySubscriptionItems, checkall, visibleColumns) {

        var getMySubscriptionsReq = new Object();
        var SortList = new Array();
        var Export = new Object();
        var Pagination = new Object();
        var Selector = new Object();

        Export.DynamicColumns = null;
        Export.VisibleColumns = visibleColumns;

        if (checkall == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedMySubscriptionItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;

            } else {

                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedMySubscriptionItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;

            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;

            }
        }

        var ColumnSortFilter = columnSortFilterForMySubscription;
        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');

        Selector.SelectedItemIds = null;
        Selector.UnSelectedItemIds = null;

        getMySubscriptionsReq.ColumnSortFilter = columnSortFilterForMySubscription;
        getMySubscriptionsReq.Export = Export;
        getMySubscriptionsReq.Pagination = Pagination;
        getMySubscriptionsReq.Selector = Selector;
        
        var param = new Object();
        param.token = TOKEN();
        param.getMySubscriptionsReq = getMySubscriptionsReq;
        return param;

    }

    //start My Subscriptions grid
    function jqxgridMySubscriptions(param, gID) {
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
        //////////////
        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;

        //var gridstoragearray = new array();
        //var gridsublistobj = new object();

        //gridsublistobj.checkallflag = 0;
        //gridsublistobj.counter = 0;
        //gridsublistobj.filterflage = 0;
        //gridsublistobj.selecteddataarr = [];
        //gridsublistobj.unselecteddataarr = [];
        //gridsublistobj.singlerowdata = [];
        //gridsublistobj.multirowdata = [];
        //gridsublistobj.totalselectioncount = null;
        //gridsublistobj.highlightedrow = null;
        //gridsublistobj.highlightedpage = null;
        //gridstoragearray.push(gridsublistobj);

        //var gridstorage = json.stringify(gridstoragearray);
        //window.sessionstorage.setitem(gid + 'gridstorage', gridstorage);
        //var gridstorage = json.parse(sessionstorage.getitem(gid + "gridstorage"));

        //for allcheck 
        var rendered = function (element) {

            enablegridfunctions(gID, 'SubscriptionId', element, gridStorage, true, 'pagerDivMySubscriptionList', false, 0, 'SubscriptionId', null, null, null);
            return true;
        }

        //For filter
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

        }

        // prepare the data
        var source =
        {
            datatype: "json",
            datafields: [
                { name: 'SubscriptionName', map: 'SubscriptionName' },
                { name: 'ReportName', map: 'ReportName' },
                { name: 'Verbose', map: 'Verbose' },
                { name: 'CreatedByUserName', map: 'CreatedByUserName' },
                { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
                { name: 'isSelected', type: 'number' },
                { name: 'SubscriptionId', map: 'SubscriptionId' },
            ],
            root: 'ReportSubscriptions',
            type: "POST",
            data: param,
            url: AppConstants.get('API_URL') + "/GetMySubscriptions",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data.getMySubscriptionsResp)
                    data.getMySubscriptionsResp = $.parseJSON(data.getMySubscriptionsResp);
                else
                    data.getMySubscriptionsResp = [];

                if (data.getMySubscriptionsResp && data.getMySubscriptionsResp.PaginationResponse) {
                    source.totalrecords = data.getMySubscriptionsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getMySubscriptionsResp.PaginationResponse.TotalPages;
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
                   columnSortFilter = columnSortFilterFormatedData(columnSortFilterForMySubscription, gID, gridStorage, 'SubScriptionList');
                   param.getMySubscriptionsReq.ColumnSortFilter = columnSortFilter;
                   param.getMySubscriptionsReq.Pagination = getPaginationObject(param.getMySubscriptionsReq.Pagination, gID);
                   data = JSON.stringify(param);
                   return data;
               },
               downloadComplete: function (data, status, xhr) {
                   enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                   //if (data.getMySubscriptionsResp)
                   //    data.getMySubscriptionsResp = $.parseJSON(data.getMySubscriptionsResp);

                   if (data.getMySubscriptionsResp && data.getMySubscriptionsResp.ReportSubscriptions) {
                       for (var i = 0; i < data.getMySubscriptionsResp.ReportSubscriptions.length; i++) {
                           data.getMySubscriptionsResp.ReportSubscriptions[i].CreatedOn = convertToLocaltimestamp(data.getMySubscriptionsResp.ReportSubscriptions[i].CreatedOn);
                       }
                       //if (data.getMySubscriptionsResp.PaginationRespons && data.getMySubscriptionsResp.PaginationResponse.HighLightedItemPage > 0) {
                       //    gridStorage[0].highlightedPage = data.getMySubscriptionsResp.PaginationResponse.HighLightedItemPage;
                       //    var updatedGridStorage = JSON.stringify(gridStorage);
                       //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                       //}

                   } else {
                       source.totalrecords = 0;
                       source.totalpages = 0;
                       data.getMySubscriptionsResp = new Object();
                       data.getMySubscriptionsResp.ReportSubscriptions = [];

                   }
                   $('.all-disabled').hide();
               },
               loadError: function (jqXHR, status, error) {
                   $('.all-disabled').hide();
               }
           }
       );


        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }

        // create jqxgrid.
        $("#" + gID).jqxGrid(
        {
            height: gridHeightFunction(gID, "1"),
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
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            enabletooltips: true,
            rowsheight: 32,
            rendergridrows: function () {
                return dataAdapter.records;
            },

            ready: function () {
                callOnGridReady(gID, gridStorage);

                var columns = genericHideShowColumn(gID, true, []);
                koUtil.gridColumnList = new Array();
                for (var i = 0; i < columns.length; i++) {
                    koUtil.gridColumnList.push(columns[i].columnfield);
                }
                visibleColumnsList = koUtil.gridColumnList;
                visibleColumnsForMySubscription = visibleColumnsList;

                
            },
            columns: [
                 {
                     text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false,
                     datafield: 'isSelected', width: 40, renderer: function () {
                         return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                     }, rendered: rendered
                 },

                {

                    text: i18n.t('rpt_Subscription_Name', { lng: lang }), datafield: 'SubscriptionName', minwidth: 90, editable: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    },
                },

              {
                  text: i18n.t('rpt_Report_Name', { lng: lang }), datafield: 'ReportName', minwidth: 90, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },

              {
                  text: i18n.t('rpt_Recurrence', { lng: lang }), datafield: 'Verbose', minwidth: 90, editable: false,
                  filtertype: "custom",
                  createfilterpanel: function (datafield, filterPanel) {
                      buildFilterPanel(filterPanel, datafield);
                  },
              },
               {
                   text: i18n.t('rpt_Created_By', { lng: lang }), datafield: 'CreatedByUserName', minwidth: 90, editable: false,
                   filtertype: "custom",
                   createfilterpanel: function (datafield, filterPanel) {
                       buildFilterPanel(filterPanel, datafield);
                   },
               },
                {
                    text: i18n.t('rpt_Created_On', { lng: lang }), datafield: 'CreatedOn', minwidth: 90, cellsformat: LONG_DATETIME_GRID_FORMAT, editable: false, 
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanelDate(filterPanel, datafield);
                    },
                }
            ]
        });
        getGridBiginEdit(gID, 'SubscriptionId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'SubscriptionId');
    }

    function unsubscribeDetails(gId) {
        var unSubscribeFromReportsReq = new Object();
        var Selector = new Object();
        //Getting User Guid
        userrData = JSON.parse(sessionStorage.getItem("userrData"));
        userGuid = userrData[0].UserGuid;

        var selectedMySubscriptionItems = getSelectedUniqueId(gId);
        var unselectedMySubscriptionItems = getUnSelectedUniqueId(gId);
        var checkall = checkAllSelected(gId);
        var IsAllSelected;


        if (checkall == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedMySubscriptionItems;
            IsAllSelected = true;
        } else {
            Selector.SelectedItemIds = selectedMySubscriptionItems;
            Selector.UnSelectedItemIds = null;
            IsAllSelected = false;
        }

        unSubscribeFromReportsReq.IsAllSelected = IsAllSelected;
        unSubscribeFromReportsReq.Selector = Selector;
        unSubscribeFromReportsReq.UserId = userGuid;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'Report_successfully_unsubscribed');
                    gridFilterClear('jqxGridMySubscriptionList');
                } 
            }
            $("#loadingDiv").hide();
        }
        
        var method = 'UnSubscribeFromReports';
        var params = '{"token":"' + TOKEN() + '","unSubscribeFromReportsReq":' + JSON.stringify(unSubscribeFromReportsReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

    }


    //delete
    function deleteDetails(gId) {
        //Getting User Guid 
        userrData = JSON.parse(sessionStorage.getItem("userrData"));
        userGuid = userrData[0].UserGuid;

        var deleteReportSubscriptionReq = new Object();
        var Selector = new Object();
        var selectedMySubscriptionItems = getSelectedUniqueId(gId);
        var unselectedMySubscriptionItems = getUnSelectedUniqueId(gId);
        var checkall = checkAllSelected(gId);
        var IsAllSelected;

        if (checkall == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedMySubscriptionItems;
            IsAllSelected = true;
        } else {
            Selector.SelectedItemIds = selectedMySubscriptionItems;
            Selector.UnSelectedItemIds = null;
            IsAllSelected = false;
        }


        deleteReportSubscriptionReq.IsAllSelected = IsAllSelected;
        deleteReportSubscriptionReq.Selector = Selector;
        deleteReportSubscriptionReq.UserId = userGuid;

        deleteReportSubscriptionReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'rpt_Subscriptions_successfully_deleted');
                   
                    gridRefreshClearSelection('jqxGridSubscriptionList');
                } 
            }
            $("#loadingDiv").hide();
        }
        
        var method = 'DeleteReportSubscription';
        var params = '{"token":"' + TOKEN() + '","deleteReportSubscriptionReq":' + JSON.stringify(deleteReportSubscriptionReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

    }


}); 

