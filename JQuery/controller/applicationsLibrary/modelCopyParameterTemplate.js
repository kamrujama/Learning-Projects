define(["knockout", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko) {
    var columnSortFilter = new Array();
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    return function modelViewApplicatonsParameterTemplate() {


        var self = this;

        //Draggable function
        $('#mdlCopyTempHeader').mouseup(function () {
            $("#mdlCpyTemplate").draggable({ disabled: true });
        });

        $('#mdlCopyTempHeader').mousedown(function () {
            $("#mdlCpyTemplate").draggable({ disabled: false });
        });
        /////////

        $("#copyTemplate").text(i18n.t('copy_parameter_template_for_application', { lng: lang }) + selectedApplicationName + ' Version: ' + selectedApplicationVersion);
        selectedCopyTemplate = new Object();
        //for parameterTemplate
        var param = paramTemplateByVersionparameters(false, columnSortFilter, null, null, 0);
        paramTemplateByVersionGrid('paramTemplateByVersionGrid', param);

        //Export copy template///
        self.exportToExcel = function (isExport, gId, exportflage) {
            var selectedParamVersionItems = getSelectedUniqueId(gId);
            var unselectedParamVersionItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = paramTemplateByVersionparameters(true, columnSortFilter, selectedParamVersionItems, unselectedParamVersionItems, checkAll, visibleColumnsList);

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                getParameterbyVersionExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        self.clearfilter = function (gId) {
            gridFilterClear(gId);
            selectedCopyTemplate = new Object();
            $("#copyTemplateSave").prop('disabled', true);
        }

        function getParameterbyVersionExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetParamTemplatesByAppVersions';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }
        self.isCopyExistingVersion = ko.observable(false);
        self.checkCopyTemplateName = ko.observable();
        self.checkCopyTemplateName.subscribe(function (newValue) {
            if (newValue != null || newValue.trim() != '') {
                if ($("#copyTemplateName").val().trim() != '' && selectedCopyTemplate.TemplateId!=undefined) {
                    $("#copyTemplateSave").removeAttr('disabled');
                } else {
                    $("#copyTemplateSave").prop('disabled', true);
                }
            } else {
                $("#copyTemplateSave").prop('disabled', true);
            }
        });

        self.handleCopyDescriptionChange = function () {
            var descriptionVal = $('#copyDescription').val();
            if ($("#copyTemplateName").val().trim() != '') {
                $("#copyTemplateSave").removeAttr('disabled');
            }
        }

        self.closeConfirmation = function () {
            $("#copyCommonParametersConfirmation").modal('hide');
        }

        self.copyTemplateSaveClick = function (gId, unloadTempPopup, isValidationRequired) {
            if (copytemplateSelection==1) {
                copyApplicationTemplateFromExistingVersion(gId, unloadTempPopup);
            } else if (copytemplateSelection==2) {
                CopyApplicationTemplateFromAnotherVersion(gId, unloadTempPopup, isValidationRequired);
            }
        }
        //set title
        if (copytemplateSelection==1) {
            $("#notAvailTemplates").text(i18n.t('select_templates_from_existing_templates', { lng: lang }));
            self.isCopyExistingVersion(true);
        } else if (copytemplateSelection==2) {
            $("#notAvailTemplates").text(i18n.t('select_templates_from_other_versions', { lng: lang }));
            self.isCopyExistingVersion(false);
        }
        //Save button click
        function CopyApplicationTemplateFromAnotherVersion(gId, unloadTempPopup, isValidationRequired) {

            var copyTemplateFromAnotherVersionReq = new Object();
            var application = new Object();
            var templateDetails = new Array();


            var selectedIds = getSelectedUniqueId(gId);
            var unselectedIds = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);

            application.DestinationAppId = selectedApplicationId;
            application.DestinationAppName = selectedApplicationName;
            application.DestinationAppVersion = selectedviesion;
            copyTemplateFromAnotherVersionReq.Application = application;

            if (checkAll == 1) {
                copyTemplateFromAnotherVersionReq.TemplateDetails = null;
                copyTemplateFromAnotherVersionReq.UnselectedItemIds = unselectedIds;
            } else {
                var selectedIds = getMultiSelectedData(gId);
                for (var i = 0; i < selectedIds.length; i++) {
                    var tempObj = new Object();
                    tempObj.TemplateId = selectedIds[i].TemplateId;
                    tempObj.TemplateName = selectedIds[i].TemplateName;
                    tempObj.ApplicationId = selectedIds[i].ApplicationId;
                    tempObj.SourceAppName = selectedIds[i].ApplicationName;
                    tempObj.SourceAppVersion = selectedIds[i].ApplicationVersion;
                    templateDetails.push(tempObj)
                }
                copyTemplateFromAnotherVersionReq.TemplateDetails = templateDetails;
                copyTemplateFromAnotherVersionReq.UnselectedItemIds = null;
            }
            copyTemplateFromAnotherVersionReq.IsValidationRequired = isValidationRequired;

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'p_t_copy_success');
                        unloadTempPopup();
                        $("#copyCommonParametersConfirmation").modal('hide');
                        gridFilterClear('templateGrid');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_TEMPLATE')) {
                        openAlertpopup(1, 'p_t_copy_duplicate');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_COMMON_PARAMETERS_TEMPLATE')) {
                        $("#copyCommonParametersConfirmation").modal('show');
                        $("#successMsg").text(i18n.t('p_t_copy_common_parameters', { application: selectedApplicationName + " Version " + selectedApplicationVersion }, { lng: lang }));
                    }
                }
            }

            var params = '{"token":"' + TOKEN() + '","copyTemplateFromAnotherVersionReq":' + JSON.stringify(copyTemplateFromAnotherVersionReq) + '}'
            ajaxJsonCall('CopyTemplateFromAnotherVersion', params, callBackfunction, true, 'POST', true);

        }

        seti18nResourceData(document, resourceStorage);
    }

    function copyApplicationTemplateFromExistingVersion(gId, unloadTempPopup) {

        var copyTemplateFromExistingVersionReq = new Object();
        copyTemplateFromExistingVersionReq.TemplateID = selectedCopyTemplate.TemplateId;
        copyTemplateFromExistingVersionReq.ApplicationID = ApplicationIdForTemplate;
        copyTemplateFromExistingVersionReq.Templatename = $("#copyTemplateName").val();
        copyTemplateFromExistingVersionReq.Description = $('#copyDescription').val();

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'p_t_copy_success');
                    unloadTempPopup();
                    gridFilterClear('templateGrid');
                } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_TEMPLATE')) {
                    openAlertpopup(1, 'p_t_copy_duplicate');
                }
            }
        }
        var params = '{"token":"' + TOKEN() + '","copyTemplateFromExistingVersionReq":' + JSON.stringify(copyTemplateFromExistingVersionReq) + '}'
        ajaxJsonCall('CopyTemplateFromExistingVersion ', params, callBackfunction, true, 'POST', true);

    }

    // for parameter template
    //for grid
    function paramTemplateByVersionparameters(isExport, columnSortFilter, selectedParamVersionItems, unselectedParamVersionItems, checkAll, visibleColumns) {
        selectedParamVersionItems = getSelectedUniqueId('templateGrid');
        unselectedParamVersionItems = getUnSelectedUniqueId('templateGrid');
        var checkAll = checkAllSelected('templateGrid');

        var getParamTemplatesByAppVersionsReq = new Object();
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
            Selector.UnSelectedItemIds = unselectedParamVersionItems;
            if (isExport == true) {
                Export.IsAllSelected = true;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        } else {
            if (selectedParamVersionItems.length == 0) {
                Selector.SelectedItemIds = null;
            } else {
                Selector.SelectedItemIds = selectedParamVersionItems;
            }
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                Export.IsExport = false;
            }
        }

        var ColumnSortFilter = columnSortFilter;
        getParamTemplatesByAppVersionsReq.ColumnSortFilter = ColumnSortFilter;
        getParamTemplatesByAppVersionsReq.Export = Export;
        getParamTemplatesByAppVersionsReq.ApplicationId = selectedApplicationId;
        getParamTemplatesByAppVersionsReq.Pagination = Pagination;
        getParamTemplatesByAppVersionsReq.Selector = Selector;
        if(copytemplateSelection==1){
            getParamTemplatesByAppVersionsReq.IsSameVersion=true;
        }else{
            getParamTemplatesByAppVersionsReq.IsSameVersion = false;
        }

        var param = new Object();
        param.token = TOKEN();
        param.getParamTemplatesByAppVersionsReq = getParamTemplatesByAppVersionsReq;

        return param;

    }
    function paramTemplateByVersionGrid(gID, param) {
        var gridStorageArr = new Array();
        var gridStorageObj = new Object();
        gridStorageObj.checkAllFlag = 0;
        gridStorageObj.counter = 0;
        gridStorageObj.filterflage = 0;
        gridStorageObj.selectedDataArr = [];
        gridStorageObj.unSelectedDataArr = [];
        gridStorageObj.singlerowData = [];
        gridStorageObj.multiRowData = [];
        gridStorageObj.TotalSelectionCount = null;
        gridStorageObj.highlightedRow = null;
        gridStorageObj.highlightedPage = null;
        gridStorageArr.push(gridStorageObj);
        var gridStorage = JSON.stringify(gridStorageArr);
        window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
        var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'isSelected', type: 'number' },
                    { name: 'TemplateName', map: 'TemplateName' },
                    { name: 'ApplicationVersion', map: 'ApplicationVersion' },
                    { name: 'ApplicationId', map: 'ApplicationId' },
                    { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                    { name: 'ModifiedBy', map: 'ModifiedBy' },
                    { name: 'TemplateId', map: 'TemplateId' },
                    { name: 'ApplicationName', map: 'ApplicationName' },


                ],
                root: 'ApplicationParamterTemplates',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetParamTemplatesByAppVersions",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data && data.getParamTemplatesByAppVersionsResp) {
                        data.getParamTemplatesByAppVersionsResp = $.parseJSON(data.getParamTemplatesByAppVersionsResp);
                    }
                    else
                        data.getParamTemplatesByAppVersionsResp = [];

                    if (data.getParamTemplatesByAppVersionsResp && data.getParamTemplatesByAppVersionsResp.PaginationResponse) {
                        source.totalrecords = data.getParamTemplatesByAppVersionsResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getParamTemplatesByAppVersionsResp.PaginationResponse.TotalPages;
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
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilter, gID, gridStorage, 'ParamTemplatesByAppVersions');
                    param.getParamTemplatesByAppVersionsReq.ColumnSortFilter = columnSortFilter;
                    param.getParamTemplatesByAppVersionsReq.Pagination = getPaginationObject(param.getParamTemplatesByAppVersionsReq.Pagination, gID);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    if (data) {
                        if (data.getParamTemplatesByAppVersionsResp && data.getParamTemplatesByAppVersionsResp.ApplicationParamterTemplates) {
                            if (data.getParamTemplatesByAppVersionsResp.ApplicationParamterTemplates.length > 0) {
                                for (var i = 0; i < data.getParamTemplatesByAppVersionsResp.ApplicationParamterTemplates.length; i++) {
                                    data.getParamTemplatesByAppVersionsResp.ApplicationParamterTemplates[i].ModifiedOn = convertToLocaltimestamp(data.getParamTemplatesByAppVersionsResp.ApplicationParamterTemplates[i].ModifiedOn);
                                }
                            }
                        }

                        if (data.getParamTemplatesByAppVersionsResp && data.getParamTemplatesByAppVersionsResp.PaginationResponse) {
                            //if (data.getParamTemplatesByAppVersionsResp.PaginationResponse.HighLightedItemPage > 0) {
                            //    gridStorage[0].highlightedPage = data.getParamTemplatesByAppVersionsResp.PaginationResponse.HighLightedItemPage;
                            //    var updatedGridStorage = JSON.stringify(gridStorage);
                            //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                            //}
                        } else {
                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getParamTemplatesByAppVersionsResp = new Object();
                            data.getParamTemplatesByAppVersionsResp.ApplicationParamterTemplates = [];
                        }
                        $('.all-disabled').hide();
                    }
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                    openAlertpopup(2, 'network_error');
                }
            }
        );


        //for allcheck
        var rendered = function (element) {
            enablegridfunctions(gID, 'TemplateId', element, gridStorage, true, 'pagerDivParamTemplate', false, 0, 'TemplateId', null, null, null);
            return true;
        }

        var selectRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            html = '<div style="margin-left: 10px; margin-top: 5px;"><input name="radioOptions" type="radio" onClick="getTemplateRBValue(' + row + ')" value="0"></div>';
            return html;
        }


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
        copyComponentSection = false;
        if (copytemplateSelection==1) {
            copyComponentSection=false
        } else  if (copytemplateSelection==2){
            copyComponentSection=true
        }

        $("#" + gID).jqxGrid(
            {
                width: "100%",
                height: "300px",
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
                autoshowfiltericon: true,

                columns: [
                    {
                        text: '', menu: false, sortable: false, columnsResize: false, hidden: copyComponentSection, filterable: false, columntype: 'custom', datafile: 'isSelected', enabletooltips: false,
                        width: 40, cellsrenderer: selectRenderer,
                    },

                    {
                        text: '', menu: false, sortable: false, filterable: false, columntype: 'checkbox', enabletooltips: false, resizable: false, draggable: false, hidden: !copyComponentSection,
                        datafield: 'isSelected', width: 40, renderer: function () {
                            return '<div style="margin-left: 10px; margin-top: 5px;"><div></div></div>';
                        }, rendered: rendered
                    },
                    { text: '', dataField: 'TemplateId', hidden: true, editable: false, width: 'auto' },
                    {
                        text: i18n.t('p_t_copy_name', { lng: lang }), dataField: 'TemplateName', editable: false, minwidth: 150, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('p_t_copy_appversion', { lng: lang }), datafield: 'ApplicationVersion', editable: false, minwidth: 100, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('p_t_copy_modifiedon', { lng: lang }), datafield: 'ModifiedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, width: 'auto', filterable: true, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanelDate(filterPanel, datafield);

                        }
                    },
                    {
                        text: i18n.t('p_t_copy_modifiedby', { lng: lang }), dataField: 'ModifiedBy', filterable: false, sortable: false, menu: false, editable: false, minwidth: 100, width: 'auto',
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },

                ]
            });
        getGridBiginEdit(gID, 'TemplateId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'TemplateId');

        //click on check box save button is enabled
        $("#" + gID).bind('change', function (event) {
            if (copytemplateSelection == 2) {
                var chekCount = getMultiSelectedData(gID);
                $('#copyTemplateSave').removeAttr('disabled');
                if (chekCount == 0) {
                    $('#copyTemplateSave').prop('disabled', true);
                }
            }

        });
    }
});
function getTemplateRBValue(row) {
    if (selectedCopyTemplate != undefined) {
        selectedCopyTemplate.TemplateId = $("#paramTemplateByVersionGrid").jqxGrid('getcellvalue', row, 'TemplateId');
    }
    if ($("#copyTemplateName").val().trim() != '') {
        $('#copyTemplateSave').removeAttr('disabled');
    } else {
        $('#copyTemplateSave').prop('disabled', true);
    }
}