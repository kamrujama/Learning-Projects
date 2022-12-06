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

    return function merchantsViewModel() {
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

        if (IsAcquirerCommerceEnabled) {
            $("#btnActivateEmail").removeClass('hide');
        }

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
        self.observableModelPopup = ko.observable();
        self.observableModelPopupShowHide = ko.observable();

        setMenuSelection();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        loadelementForShowHide(modelname, 'genericPopup');
        self.gridIdForShowHide = ko.observable();
        var compulsoryfields = ['name', 'email'];
        self.columnlist = ko.observableArray();

        merchantGrid('jqxgridMerchant');

        //Clear filter
        self.clearfilter = function (gId) {
            gridFilterClear(gId);
        }

        //Refresh Grid
        self.refreshGrid = function (gId) {
            gridRefresh(gId);
        }

        modelReposition();
        //Open Popup
        self.openPopup = function (popupName, gId) {
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
                loadelement(popupName, 'merchants');
                $('#viewMerchants').hide();
                $('#merchantsModel').show();

            } else if (popupName == "modelEditMerchant") {
                koUtil.isFromViewMerchant = false;
                var checkAll = checkAllSelected(gId);
                var selecteItemIds = getSelectedUniqueId(gId);
                var unSelecteItemIds = getUnSelectedUniqueId(gId);
                var datacount = getTotalRowcount(gId);

                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        loadelement(popupName, 'merchants');
                        $('#viewMerchants').hide();
                        $('#merchantsModel').show();
                        editButtonClick(gId);
                    } else {
                        openAlertpopup(1, 'select_single_merchant_to_edit');
                    }
                } else {
                    if (selecteItemIds.length == 1) {
                        loadelement(popupName, 'merchants');
                        $('#viewMerchants').hide();
                        $('#merchantsModel').show();
                        editButtonClick(gId);
                    } else if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'Please_select_merchant.');
                    } else if (selecteItemIds.length > 1) {
                        openAlertpopup(1, 'select_single_merchant_to_edit');
                    }
                }
            } else if (popupName == "modeDeleteMerchant") {
                var checkAll = checkAllSelected(gId);
                var selecteItemIds = getSelectedUniqueId(gId);
                var unSelecteItemIds = getUnSelectedUniqueId(gId);
                var selectedData = getMultiSelectedData(gId)
                var datacount = getTotalRowcount(gId);

                if (checkAll == 1) {
                    if (unSelecteItemIds.length == datacount - 1) {
                        $('#deleteMerchantDiv').modal('show');
                        $('#viewMerchants').hide();
                    } else {
                        openAlertpopup(1, 'select_single_merchant_to_edit');
                    }
                } else {
                    if (selecteItemIds.length == 0) {
                        openAlertpopup(1, 'Please_select_merchant');
                        return;
                    }

                    if (selecteItemIds.length == 1) {
                        if (selectedData[0].commerceEnabled == "Yes") {
                            openAlertpopup(1, 'cp_enabled_merchant_cannot_be_deleted');
                            return;
                        }
                        $('#deleteMerchantMsg').text(i18n.t('delete_selected_merchant', { merchantName: selectedData[0].name }, { lng: lang }));
                    } else {
                        openAlertpopup(1, 'select_single_merchant_to_edit');
                        return;
                    }
                    $('#deleteMerchantDiv').modal('show');
                }
            } else if (popupName == "modelViewMerchant") {
                koUtil.isFromViewMerchant = true;
                loadelement(popupName, 'merchants');
                $('#merchantsModel').show();
                $('#viewMerchants').hide();
            } else if (popupName == "merchantEmailTemplate") {
                loadelement(popupName, 'merchants');
                $('#merchantsModel').show();
                $('#viewMerchants').hide();
            }
        }

        //Edit button click
        function editButtonClick(gId) {
            globalVariableForSelectedMerchants = new Array();
            var selectedIds = getMultiSelectedData(gId);
            globalVariableForSelectedMerchants = selectedIds;
            globalVariableForSelectedMerchants.gId = gId;
        }

        self.deleteMerchantsClick = function (gId) {
            var checkAll = checkAllSelected(gId);
            var selecteItemIds = getSelectedUniqueId(gId);
            var unSelecteItemIds = getUnSelectedUniqueId(gId);
            deleteMerchants(selecteItemIds[0]);
        }


        //Load Template
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //Load element for show/hide
        function loadelementForShowHide(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopupShowHide(elementname);
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId) {
            self.observableModelPopup('unloadTemplate');
        }

        //Unload template for show/hide
        self.unloadTempPopup = function (popupName, gId) {
            self.observableModelPopupShowHide('unloadTemplate');
        }

        //Generate template
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

        self.exportToExcel = function (gID) {
            var dataInfo = $("#" + gID).jqxGrid('getdatainformation');
            if (dataInfo.rowscount <= 0) {
                openAlertpopup(1, 'no_data_to_export');
            } else {
                $("#loadingDiv").show();
                exportjqxcsvData(gID,'Merchants');          
                openAlertpopup(1, 'export_Information');
                $("#loadingDiv").hide();
            }
        }

        function merchantGrid(gID) {

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
                         { name: 'id', map: 'id' },
                         { name: 'logo', map: 'logo' },
                         { name: 'name', map: 'name' },
                         { name: 'email', map: 'email' },
                         { name: 'website', map: 'website' },
                         { name: 'createdOn', map: 'createdOn', type: 'date' },
                         { name: 'modifiedOn', map: 'modifiedOn', type: 'date' },
                         { name: 'commerceEnabled', map: 'commerceEnabled' }
                ],

                root: 'data',
                type: "GET",
                cache: true,
                url: AppConstants.get('GATEWAY_API_URL') + "/merchants?customerId=" + customerID,
                beforeSend: function (request) {
                    request.setRequestHeader("Authorization", TOKEN());
                },
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data && data.metadata) {
                        source.totalrecords = data.metadata.count;
                        source.totalpages = (data.metadata.count % data.metadata.limit) == 0 ? (data.metadata.count / data.metadata.limit) : Math.floor((data.metadata.count / data.metadata.limit) + 1);
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
                        data.data = new Object();
                        data.data = [];
                    }
                },
            };

            var dataAdapter = new $.jqx.dataAdapter(source,
                {
                    formatData: function (data) {
                        $('.all-disabled').show();
                        disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                        var param = '';
                        var columnSortFilter = '';
                        columnSortFilter = getColumnSortFilterQuery(columnSortFilter, gID, gridStorage);
                        var paginationObject = new Object();
                        var pagination = getPaginationObject(paginationObject, gID);
                        var recordsPerPage = AppConstants.get('ROWSPERPAGE');
                        var skipIndex = 0;
                        if (pagination.PageNumber == 1) {
                            skipIndex = 0;
                        } else {
                            skipIndex = (pagination.PageNumber * recordsPerPage) - (recordsPerPage);
                        }
                        if (columnSortFilter == '') {
                            param = columnSortFilter + "limit=" + recordsPerPage + "&offset=" + skipIndex;
                        } else {
                            param = columnSortFilter + "&limit=" + recordsPerPage + "&offset=" + skipIndex;
                        }
                        updatepaginationOnState(gID, gridStorage, pagination.PageNumber, null, null);
                        return param;
                    },
                    downloadComplete: function (data, status, xhr) {
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

                        if (data && data.data && data.data.length > 0) {
                            for (var i = 0; i < data.data.length; i++) {
                                data.data[i].createdOn = convertToLocaltimestamp(data.data[i].createdOn);
                                data.data[i].commerceEnabled = data.data[i].commerceEnabled ? 'Yes' : 'No';
                            }
                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.data = new Object();
                            data.data = [];
                        }
                                                
                        $('.all-disabled').hide();

                    },
                    loadError: function (jqXHR, status, error) {
                        $('.all-disabled').hide();
                        ajaxErrorHandlerForWebAPI(jqXHR, status, error);
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                        if (jqXHR.status == AppConstants.get('GET_NO_CONTENT')) {                           //204
                            dataAdapter.totalrecords = 0;
                        }
                    }
                }
            );

            var buildFilterPanel = function (filterPanel, datafield) {
                genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
            }
            var buildFilterPanelDate = function (filterPanel, datafield) {
                genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);

            }
            var buildFilterPanelMultiChoice = function (filterPanel, datafield, name) {
                genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name);
            }

            var rendered = function (element) {
                enablegridfunctions(gID, 'id', element, gridStorage, true, 'pagerDivMerchants', false, 0, 'id', null, null, null);
                return true;
            }

            var logoRenderer = function (row, column, value) {
                var rowData = $("#" + gID).jqxGrid("getrowdata", row);
                var logoURL = rowData ? rowData.logo : '';
                if (logoURL) {
                    return '<img style="margin:5px;height:50px;width:50px" src="' + logoURL + '">';
                }
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
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 50,
                enabletooltips: true,
                autoshowfiltericon: true,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    //callOnGridReady(gID, gridStorage);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;

                    if (!IsAcquirerCommerceEnabled) {
                        $("#" + gID).jqxGrid('hidecolumn', 'commerceEnabled');
                    }
                },

                columns: [
                        {
                            text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false, exportable: false,
                            datafield: 'isSelected', width: 40, renderer: function () {
                                return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                            }, rendered: rendered
                        },
                        {
                            text: i18n.t('merchants_merchant_logo', { lng: lang }), datafield: 'logo', editable: false, minwidth: 80, width: 'auto', menu: false, filterable: false, sortable: false, exportable: false,
                            cellsrenderer: logoRenderer
                        },
                        {
                            text: i18n.t('merchants_business_name', { lng: lang }), datafield: 'name', editable: false, minwidth: 100, filterable: true, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('merchants_commerce_enabled', { lng: lang }), datafield: 'commerceEnabled', editable: false, minwidth: 100, filterable: true, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelMultiChoice(filterPanel, datafield, 'Enable Automatic Download');
                            }

                        },
                        {
                            text: i18n.t('merchants_business_email', { lng: lang }), datafield: 'email', enabletooltips: false, editable: false, minwidth: 150, filterable: true, filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanel(filterPanel, datafield);
                            }
                        },
                        {
                            text: i18n.t('merchants_merchant_since', { lng: lang }), datafield: 'createdOn', cellsformat: LONG_DATETIME_GRID_FORMAT, enabletooltips: false, editable: false, minwidth: 150,
                            filtertype: "custom",
                            createfilterpanel: function (datafield, filterPanel) {
                                buildFilterPanelDate(filterPanel, datafield);

                            }
                        },
                ]
            });
            getGridBiginEdit(gID, 'id', gridStorage);
            callGridFilter(gID, gridStorage);
            callGridSort(gID, gridStorage, 'id');
        }

        function deleteMerchants(selectedMerchantId) {
            $("#loadingDiv").show();
            function callbackFunction(data, response) {
                if (response) {
                    if (response.status == AppConstants.get('DELETE_NO_CONTENT')) {    //204
                        openAlertpopup(0, 'Merchant_deleted_successfully');
                        $('#deleteMerchantDiv').modal('hide');
                        gridFilterClear('jqxgridMerchant');
                    }
                }
                $("#loadingDiv").hide();
            }

            var method = 'merchants/' + selectedMerchantId + '?customerId=' + customerID;
            var params = null;
            ajaxJsonCallWebAPI(method, params, callbackFunction, true, 'DELETE', false);
        }

    };

});