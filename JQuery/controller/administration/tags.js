define(["knockout", "koUtil", "autho", "spinner"], function (ko, koUtil, autho) {
    var lang = getSysLang();

    return function tagsViewModel() {

        var self = this;
        columnSortFilterForTags = new Object();

        $('#btnRefreshTags').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefreshTags').click();
            }
        });

        $('#btnAddTags').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnAddTags').click();
            }
        });

        $('#btnDeleteTags').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnDeleteTags').click();
            }
        });

        $('#btnResetTags').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnResetTags').click();
            }
        });


        //-------------------------------------------------------------FOCUS ON CONFO POP UP-----------------------------------------------
        $('#deleteTagsDiv').on('shown.bs.modal', function (e) {
            $('#btnDeleteTags_No').focus();

        });
        $('#deleteTagsDiv').keydown(function (e) {
            if ($('#btnDeleteTags_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#btnDeleteTags_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        //Check rights
        self.retval = false;
        checkRights();
        function checkRights() {
            var isDownloadLibraryEdit = autho.checkRightsBYScreen('Download Library', 'IsModifyAllowed');
            var isContentLibraryEdit = autho.checkRightsBYScreen('Content Library', 'IsModifyAllowed');
            self.retval = (isDownloadLibraryEdit == true && isContentLibraryEdit == true) ? true : false;
            return self.retval;
        }

        self.tags = ko.observableArray();
        self.templateFlag = ko.observable(false);
        self.observableModelPopup = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        setMenuSelection();

        //TODO: need to check this
        self.openPopup = function (popupName, gId) {
            self.templateFlag(true);
            if (popupName == "modelAddTags") {
                loadelement(popupName, 'administration');
                $('#modelAddTag').modal('show');
                $('#addFileNameID').on('shown.bs.modal', function () {
                    $('#txtTagName').focus();
                });
            }
        }

        self.unloadTempPopup = function (popupName) {
            self.observableModelPopup('unloadTemplate');
            $('#modelAddTag').modal('hide');
        }

        //Load grid of uesrs
        var param = getTagsParameters(false, columnSortFilterForTags, null, null, 0, []);
        tagsGrid('jqxgridTags', param);

        self.clearFilter = function (gId) {
            gridFilterClear(gId);
        }

        self.refreshGrid = function (gId) {
            gridRefresh(gId);
		}

		self.exportToExcel = function (gId) {
			var selecteItemIds = getSelectedUniqueId(gId);
			var unSelectedItemIds = getUnSelectedUniqueId(gId);
			var checkAll = checkAllSelected(gId);
			visibleColumnsList = GetExportVisibleColumn(gId);
			var param = getTagsParameters(true, columnSortFilterForTags, selecteItemIds, unSelectedItemIds, checkAll, visibleColumnsList);

			var datainfo = $("#" + gId).jqxGrid('getdatainformation');
			if (datainfo.rowscount > 0) {
				tagsExport(param, gId, self.openPopup);
			} else {
				openAlertpopup(1, 'no_data_to_export');
			}
		}

		function tagsExport(param, gId, openPopup) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(1, 'export_Sucess');
					}
				}
			}
			var method = 'GetTags';
			var params = JSON.stringify(param);
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

        ///Getting parameter of Users
        function getTagsParameters(isExport, columnSortFilterForTags, selectedTagItems, unselectedTagItems, checkAll, visibleColumns) {
            var getTagsReq = new Object();
            var Export = new Object();
            var Selector = new Object();
            var Pagination = new Object();

            Pagination.HighLightedItemId = null
            Pagination.PageNumber = 1;
            Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
            Export.DynamicColumns = null;
            Export.VisibleColumns = visibleColumns;
            if (checkAll == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unselectedTagItems;
                if (isExport == true) {
                    Export.IsAllSelected = true;
                    Export.IsExport = true;
                } else {
                    Export.IsAllSelected = false;
                    Export.IsExport = false;
                }
            } else {
                Selector.SelectedItemIds = selectedTagItems;
                Selector.UnSelectedItemIds = null;
                if (isExport == true) {
                    Export.IsAllSelected = false;
                    Export.IsExport = true;
                } else {
                    Export.IsAllSelected = false;
                    Export.IsExport = false;
                }
            }

            var ColumnSortFilter = columnSortFilterForTags;
            var FilterList = new Array();
            var coulmnfilter = new Object();
            coulmnfilter.FilterColumn = null;
            coulmnfilter.FilterValue = null;
            FilterList.push(coulmnfilter);
            getTagsReq.Pagination = Pagination;
            getTagsReq.ColumnSortFilter = ColumnSortFilter;
            getTagsReq.Export = Export;
            getTagsReq.Selector = Selector;
            var param = new Object();
            param.token = TOKEN();
            param.getTagsReq = getTagsReq;
            return param;
        }

        self.deleteTagsConfirmation = function (gId) {
            var selectedData = getMultiSelectedData(gId);
            var checkAll = checkAllSelected(gId);
            if (checkAll == 1) {
                $('#deleteTagsDiv').modal('show');
                $("#deleteTagsText").text(i18n.t('delete_multiple_tags', { lng: lang }));
            } else {
                if (selectedData.length == 1) {
                    var tagName = selectedData[0].TagName;
                    $('#deleteTagsDiv').modal('show');
                    $("#deleteTagsText").text(i18n.t('delete_single_tag', { tagName: tagName }, { lng: lang }));
                } else if (selectedData.length > 1) {
                    $('#deleteTagsDiv').modal('show');
                    $("#deleteTagsText").text(i18n.t('delete_multiple_tags', { lng: lang }));
                } else {
                    openAlertpopup(1, 'please_select_a_tag');
                }
            }
        }

        self.deleteTags = function (gId) {
            var selecteItemIds = getSelectedUniqueId(gId);
            var unSelectedItemIds = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);

            var Selector = new Object();
            if (checkAll == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unSelectedItemIds;
            } else {
                Selector.SelectedItemIds = selecteItemIds;
                Selector.UnSelectedItemIds = null;
            }

            deleteTags(gId, self.tags, Selector,checkAll);
        }

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
		}

        seti18nResourceData(document, resourceStorage);
    };

    function deleteTags(gId, tags, selector,checkAll) {

        var deleteTagsReq =  new Object();
        deleteTagsReq.Selector = selector;
        deleteTagsReq.IsAllSelected=false;
		if(checkAll==1){
            deleteTagsReq.IsAllSelected=true;
		}

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
					gridRefreshClearSelection(gId);
					openAlertpopup(0, 'tags_delete_success');
                }
            }
        }

        var method = 'DeleteTags';
        var params = '{"token":"' + TOKEN() + '","deleteTagsReq":' + JSON.stringify(deleteTagsReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function generateTemplate(tempname, controllerId) {
        var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
        var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
        ko.components.register(tempname, {
            viewModel: { require: viewName },
            template: { require: 'plugin/text!' + htmlName }
        });
    }

    function tagsGrid(gID, param) {
        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (25 / 100) * gridheight;
            gridheight = gridheight - 150;
            gridheight = gridheight - percentValue + 'px';
        } else {
            gridheight = '400px';
        }

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var source =
        {
            dataType: "json",
            //localdata: tags,
            datafields: [
                { name: 'isSelected', type: 'number' },
                { name: 'TagId', map: 'TagId' },
                { name: 'TagName', map: 'TagName' },
                { name: 'Category', map: 'Category' },
                { name: 'CreatedBy', map: 'CreatedByUserName' },
                { name: 'CreatedOn', map: 'CreatedOn', type: 'date' },
                { name: 'ModifiedBy', map: 'ModifiedByUserName' },
                { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' }
            ],
            root: 'Tags',
            type: "POST",
            data: param,
            url: AppConstants.get('API_URL') + "/GetTags",
            contentType: 'application/json',
            beforeprocessing: function (data) {
                if (data && data.getTagsResp) {
                    data.getTagsResp = $.parseJSON(data.getTagsResp);
                }
                else
                    data.getTagsResp = [];

                if (data.getTagsResp && data.getTagsResp.PaginationResponse) {
                    source.totalrecords = data.getTagsResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getTagsResp.PaginationResponse.TotalPages;
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForTags, gID, gridStorage, 'Tags');
                    param.getTagsReq.ColumnSortFilter = columnSortFilter;
                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getTagsReq.Pagination = getPaginationObject(param.getTagsReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getTagsReq.Pagination, null, null);

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);

					if (data.getTagsResp && data.getTagsResp.Tags) {
						for (var i = 0; i < data.getTagsResp.Tags.length; i++) {
							data.getTagsResp.Tags[i].CreatedOn = convertToLocaltimestamp(data.getTagsResp.Tags[i].CreatedOn);
							data.getTagsResp.Tags[i].ModifiedOn = convertToLocaltimestamp(data.getTagsResp.Tags[i].ModifiedOn);
                        }
                    } else {
                        source.totalrecords = 0;
                        source.totalpages = 0;
						data.getTagsResp = new Object();
						data.getTagsResp.Tags = [];

                    }
                    $('.all-disabled').hide();
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }
            }
        );

        var rendered = function (element) {
            enablegridfunctions(gID, 'TagId', element, gridStorage, true, 'pagerDivTags', false, 0, 'TagId', null, null, null);
            return true;
        }

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);
        }

        $("#" + gID).jqxGrid(
            {
                height: gridHeightFunction(gID),
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
                rowsheight: 32,
                enabletooltips: true,
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
                },
                autoshowfiltericon: true,
                columns: [
                    {
                        text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columnsResize: false, columntype: 'checkbox', enabletooltips: false,
                        datafield: 'isSelected', minwidth: 40, maxwidth: 41, renderer: function () {
                            return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                        }, rendered: rendered
                    },
                    {
                        text: i18n.t('tag_name', { lng: lang }), datafield: 'TagName', editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('Category_lbl', { lng: lang }), datafield: 'Category', editable: false,
                        filtertype: "custom",hidden:true,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
						text: i18n.t('created_by', { lng: lang }), datafield: 'CreatedBy', editable: false, filterable: false, sortable: false, menu: false
                    },
                    {
                        text: i18n.t('createdOn', { lng: lang }), datafield: 'CreatedOn', cellsformat: LONG_DATETIME_GRID_FORMAT,
                        editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);
                        }
                    }
                ]
            });

		getGridBiginEdit(gID, 'TagId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'TagId');
    }
});