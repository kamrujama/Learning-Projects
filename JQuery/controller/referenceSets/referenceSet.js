define(["knockout", "koUtil", "autho", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, koUtil, autho) {
    var lang = getSysLang();
    GridID = "";
    SelectedIdOnGlobale = new Array
    UnSelectedIdOnGlobale = new Array();
    selectedDataArr = new Array();
    unSelectedDataArr = new Array();
    koUtil.GlobalColumnFilter = new Array();

    checkALlPageId = 0;
    pagechangedcheck = 0;
    totalselectedRowCount = 0;
    columnSortFilterForReferenceSet = {};
    referencesetContainers = [
        {
            'id': 'generalBreadCrumb',
            'isActive': true,
            'menuName': 'General'
        },
        {
            'id': 'operationsBreadCrumb',
            'isActive': false,
            'menuName': 'Assignments'
        },
        {
            'id': 'modelsBreadCrumb',
            'isActive': false,
            'menuName': 'Models'
        },
        {
            'id': 'deviceAttributesBreadCrumb',
            'isActive': false,
            'menuName': 'Device Attributes'
        }
    ];
    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    var systemConfiguartion = new Object();

    return function DashBoardViewModel() {

        var self = this;

        $('#btnRefresh').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefresh').click();
            }
        });

        $('#add_reference').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#add_reference').click();
            }
        });

        $('#edit_reference').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#edit_reference').click();
            }
        });

        $('#btnDeleteRef').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnDeleteRef').click();
            }
        });

        $('#btnCopyRef').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnCopyRef').click();
            }
        });

        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#downloadModel').on('shown.bs.modal', function (e) {
            $('#downloadModel_No').focus();

        });
        $('#downloadModel').keydown(function (e) {
            if ($('#downloadModel_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#downloadModel_Yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        self.columnlist = ko.observableArray();
        self.gridIdForShowHide = ko.observable();
        self.templateFlag = ko.observable(false);
        self.isCopyCall = ko.observable(false);
        self.isSaveCall = ko.observable(false);
        self.observableModelPopup = ko.observable();
        var initialGridColumns = ["isSelected", "Name", "ParentReferenceSet", "SupportedPackages", "SupportedModels", "Status", "IsLocked", "ModifiedOn", "userName"];
        var compulsoryfields = ['Name'];
        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');

        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }

        this.isLock =  ko.observable(false);
        if(!referenceSetParameterTemplateLock)
        {
            $('#btnLockRef').hide();
			$('#btnUnlockRef').hide();
        }

        setMenuSelection();
        modelReposition();
        self.openPopup = function (popupName, gId, isEdit) {            
            self.templateFlag(true);
            if (popupName == "modelEditReference") {  
                var selecteItemIds = getSelectedUniqueId('ReferenceSetGrid');
                if (isEdit === true) {       
                    if (isReferenceSetLocked('ReferenceSetGrid', 1, selecteItemIds)) {
                        return;
                    }
                    self.isSaveCall(true);
                    self.isCopyCall(false);
                } else {
                    self.isCopyCall(true);
                    self.isSaveCall(false);
                }
               
                if (selecteItemIds.length == 1) {                    
                     loadelement(popupName, 'referenceSets');
                     $('#addReference').modal('show');
                     editButtonClick('ReferenceSetGrid');
                } else if (selecteItemIds.length == 0) {
                    openAlertpopup(1, 'please_select_a_reference_set');
                    return;
                } else if (selecteItemIds.length > 1) {
                    if (isEdit === true) {
                        openAlertpopup(1, 'please_select_only_one_reference_set_to_edit');
                    } else {
                        openAlertpopup(1, 'select_single_Ref_copy');
                    }

                    return;
                }
            }
            else if (popupName == "modelAddReference") {
                globalSelectedFolderPackages = [];
                loadelement(popupName, 'referenceSets');
                $('#addReference').modal('show');
            } else if (popupName == "modelShowHideCol") {
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
                $('#addReference').modal('show');
            } else if (popupName == "modelExportSucess") {
                loadelement(popupName, 'genericPopup');
                $('#addReference').modal('show');
            } else if (popupName == "modelViewConflictDetails") {
                loadelement(popupName, 'genericPopup');
                $('#addReference').modal('show');
            }

        }
        self.hideInfoPopup = function () {
            $("#referenceSetinformationPopup").modal('hide');
        }
        
        function isReferenceSetLocked(gID, operationType,seletedItemIds) {
            var pageinfo = $("#" + gID).jqxGrid('getpaginginformation');
            var startrow = !_.isEmpty(pageinfo) ? Number(pageinfo.pagenum) * Number(pageinfo.pagesize) : 0; 
            var count = 0;
            for (var i = startrow; i < startrow + pageinfo.pagesize; i++) {
                var value = $("#" + gID).jqxGrid('getcellvalue', i, "isSelected");
                if (value > 0) {
                    var data = $("#" + gID).jqxGrid('getrowdata', i);
                    count++;
                    if (!_.isEmpty(data) && data.IsLocked) {
                        if (operationType === 1) {
                            return false;
                        } else if (operationType === 2) {
                            if (seletedItemIds.length > 1 ) {
                                openAlertpopup(1, 'reference_set_delete_Locked_multipledevices');
                            } else {
                                openAlertpopup(1, 'reference_set_delete_Locked');
                            }
                        }
                        return true;
                    } else {
                        if (count == seletedItemIds.length) {
                             return false;
                        } 
                    }                 
                }
            }
        }
        function editButtonClick(gID) {
            var pageinfo = $("#" + gID).jqxGrid('getpaginginformation');
            var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
            var selectedarr = new Array();
            for (var i = startrow; i < startrow + pageinfo.pagesize; i++) {
                var value = $("#" + gID).jqxGrid('getcellvalue', i, "isSelected");
                if (value > 0) {
                    var refrenceSetObj = new Object();
                    refrenceSetObj.selectedReferenceSetName = $("#" + gID).jqxGrid('getcellvalue', i, "Name");
                    refrenceSetObj.selectedReferenceSetId = $("#" + gID).jqxGrid('getcellvalue', i, "ReferenceSetId");
                    refrenceSetObj.selectedReferenceSetLockStatus = $("#" + gID).jqxGrid('getcellvalue', i, "IsLocked");
                    selectedarr.push(refrenceSetObj);
                    globalVariableForEditReferenceSet = selectedarr;
                    globalVariableForEditReferenceSet.gID = gID;
                    globalVariableForEditReferenceSet.isCopyReferenceset = self.isCopyCall();
                    globalVariableForEditReferenceSet.isEditReferenceset = self.isSaveCall();
                }
            }
        }
        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableModelPopup(elementname);
        }

        //unload template
        self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
            $('#addReference').modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
            checkIsPopUpOPen();
            globalPackageDownloadOptions = [];
            globalAdvancedOptionsApplications = [];
        }

        self.columnlist = ko.observableArray();
        self.checkname = ko.observable();

        self.clearfilter = function () {
            $("#ReferenceSetGrid").jqxGrid("clearfilters");
            $("#ReferenceSetGrid").jqxGrid('updatebounddata');
        }


        function getSelectedIds() {
            var pageinfo = $("#ReferenceSetGrid").jqxGrid('getpaginginformation');
            var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
            var selectedarr = new Array();
            for (var i = startrow; i < startrow + pageinfo.pagesize; i++) {
                var value = $('#ReferenceSetGrid').jqxGrid('getcellvalue', i, "isSelected");
                if (value > 0) {
                    var selectedid = $('#ReferenceSetGrid').jqxGrid('getcellvalue', i, "PackageId");
                    selectedarr.push(selectedid);
                }
            }
            return selectedarr;
        }



        self.deleteReferenceSetClick = function (gridId) {
            var selecteItemIds = getSelectedUniqueId(gridId);
            if (selecteItemIds.length == 1 || selecteItemIds.length > 1) {                
                if (isReferenceSetLocked('ReferenceSetGrid', 2, selecteItemIds)) {
                    return;
                } else {                  
                    self.openConfirmationPopup();
                }
            } else if (selecteItemIds.length == 0) {
                openAlertpopup(1, 'please_select_a_reference_set');
                return;
            }
        }

        self.lockReferenceSetClick = function (gridId, isLock) {

            var selecteItemIds = getSelectedUniqueId(gridId);
            if(selecteItemIds.length == 1)
            {
                var pageinfo = $("#" + gridId).jqxGrid('getpaginginformation');
                var startrow = Number(pageinfo.pagenum) * Number(pageinfo.pagesize);
                var selectedarr = new Array();
                for (var i = startrow; i < startrow + pageinfo.pagesize; i++) {
                    var value = $("#" + gridId).jqxGrid('getcellvalue', i, "isSelected");
                    if (value > 0) {
                        var selectedReferenceSetLockStatus = $("#" + gridId).jqxGrid('getcellvalue', i, "IsLocked");
                        if(selectedReferenceSetLockStatus == isLock)
                        {
                            openAlertpopup(1, isLock ? 'already_unlock_reference_set' : 'already_lock_reference_set');
                            return;
                        }
                    }
                }
            }

            self.isLock(isLock);

            if (selecteItemIds.length >= 1) {     
                if(isLock)
                {
                    $('#UnlockRFSConfirmMsg').hide();
                    $('#LockRFSConfirmMsg').show();    
                }
                else
                {
                    $('#UnlockRFSConfirmMsg').show();
                    $('#LockRFSConfirmMsg').hide();  
                }       
                $('#lockRFSConfirmation').modal('show');
            } else if (selecteItemIds.length == 0) {
                openAlertpopup(1, 'please_select_a_reference_set');
                return;
            }
        }

        self.exportToExcel = function (isExport, gId, exportflage) {
            var selectedReferencesetItems = getSelectedUniqueId(gId);
            var unselectedReferencesetItems = getUnSelectedUniqueId(gId);
            var checkAll = checkAllSelected(gId);
            visibleColumnsList = GetExportVisibleColumn(gId);
            var param = getReferenceParameters(true, columnSortFilterForReferenceSet, selectedReferencesetItems, unselectedReferencesetItems, checkAll, visibleColumnsList)

            self.exportGridId = ko.observable(gId);
            self.exportSucess = ko.observable();
            self.exportflage = ko.observable();
            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                referenceSetExport(param, gId, self.openPopup);
            } else {
                openAlertpopup(1, 'no_data_to_export');
            }
        }

        function referenceSetExport(param, gId, openPopup) {
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    }
                }
            }
            var method = 'GetReferenceSets';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.deleteReference = function (gridId) {
            var selectedReferenceSetItems = getSelectedUniqueId(gridId);
            var unselectedReferenceSetItems = getUnSelectedUniqueId(gridId);
            var checkAll = checkAllSelected(gridId);
            var deleteReferenceSetReq = new Object();
            var Selector = new Object();

            if (checkAll == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unselectedReferenceSetItems;
            } else {
                Selector.SelectedItemIds = selectedReferenceSetItems;
                Selector.UnSelectedItemIds = null;
            }

            deleteReferenceSetReq.Selector = Selector;
            deleteReferenceSetReq.ColumnSortFilter = koUtil.GlobalColumnFilter;

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridFilterClear('ReferenceSetGrid');
                        $('#downloadModel').modal('hide');
                        openAlertpopup(0, 'reference_set_delete_success');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('ReferenceSet_Mapped_To_Device')) {
                        openAlertpopup(2, 'delete_reference_set_mapped_to_device');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('ReferenceSet_Mapped_To_Hierarchy')) {
                        openAlertpopup(2, 'delete_reference_set_mapped_to_hierarchy');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_ASSIGNED_HIERARCHY')) {                                           //319
                        conflictHierarchyParameters.TemplateHierarchyReferenceSet = data.deleteReferenceSetResp.TemplateHierarchyReferenceSet;
                        conflictHierarchyParameters.ActionMode = "DeleteReferenceSet";
                        conflictHierarchyParameters.InfoMessage = i18n.t("template_of_this_app_or_package_assigned_hierarchy_del_referenceset", { lng: lang });
                        self.openPopup('modelViewConflictDetails');
                    }
                }
            }

            var method = 'DeleteReferenceSet';
            var params = '{"token":"' + TOKEN() + '","deleteReferenceSetReq":' + JSON.stringify(deleteReferenceSetReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.lockReference = function (gridId) {
            var selectedReferenceSetItems = getSelectedUniqueId(gridId);
            var unselectedReferenceSetItems = getUnSelectedUniqueId(gridId);
            var checkAll = checkAllSelected(gridId);
            var lockUnlockReferenceSetReq = new Object();
            var Selector = new Object();

            if (checkAll == 1) {
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unselectedReferenceSetItems;
            } else {
                Selector.SelectedItemIds = selectedReferenceSetItems;
                Selector.UnSelectedItemIds = null;
            }

            lockUnlockReferenceSetReq.Selector = Selector;
            lockUnlockReferenceSetReq.IsLock =  self.isLock();

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridFilterClear('ReferenceSetGrid');
                        $('#lockRFSConfirmation').modal('hide');
                        openAlertpopup(0, self.isLock() ? 'ReferenceSetLocked' : 'ReferenceSetUnlocked');
                    }
                }
            }

            var method = 'LockUnlockReferenceSet';
            var params = '{"token":"' + TOKEN() + '","lockUnlockReferenceSetReq":' + JSON.stringify(lockUnlockReferenceSetReq) + '}';
            ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
        }

        self.clearfilter = function (gridId) {
            gridFilterClear(gridId);
        }
        self.refreshGrid = function (gridId) {
            gridRefresh(gridId);
        }

        self.openConfirmationPopup = function () {
            $('#downloadModel').modal('show');

        }

        self.agCancel = function () {
            agCancel();
        }

        function addgroup() {
            $(".confirmationTitle").addClass("confirmationShow");
        }
        function agCancel() {

            $(".confirmationTitle").removeClass("confirmationShow");
        }

        self.resizeColumns = function (gId) {
            $("#modalResizeResetColumnsConfirmation").modal('show');
            $("#resizeResetColumnsConfirmationMessage").text(i18n.t('save_resized_columns_confirmation', { lng: lang }));

            globalGridColumns = new Object();
            globalGridColumns.gId = gId;
            globalGridColumns.gridName = 'ReferenceSets';
            globalGridColumns.isColumnResized = true;
            globalGridColumns.gridColumns = initialGridColumns;
        }

        self.resetColumns = function (gId) {
            $("#modalResizeResetColumnsConfirmation").modal('show');
            $("#resizeResetColumnsConfirmationMessage").text(i18n.t('reset_resized_columns_confirmation', { lng: lang }));

            globalGridColumns = new Object();
            globalGridColumns.gId = gId;
            globalGridColumns.gridName = 'ReferenceSets';
            globalGridColumns.isColumnResized = false;
            globalGridColumns.gridColumns = [];
        }

        var param = getReferenceParameters(false, columnSortFilterForReferenceSet, null, null, 0, []);
        referenceSetGrid('ReferenceSetGrid', param);

        // get system configuration values
        //getSystemConfigurationForReferenceSet();
        seti18nResourceData(document, resourceStorage);
    }

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

    function getSystemConfigurationForReferenceSet() {
        var category = AppConstants.get('SYSTEM');
        var configName = AppConstants.get('MAX_PACKAGES_PER_REFERENCESET');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.systemConfiguration)
                        data.systemConfiguration = $.parseJSON(data.systemConfiguration);

                    systemConfiguartion = data.systemConfiguration.ConfigValue;
                    koUtil.maxReferenceSetConfigValue(systemConfiguartion);
                }
            }
        }

        var method = 'GetSystemConfiguration';
        var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);

    }


    //for grid

    function referenceSetGrid(gID, param) {


        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;

        var gridheight = $(window).height();
        var percentValue;
        if (gridheight > 600) {
            percentValue = (20 / 100) * gridheight;
            gridheight = gridheight - 150;

            gridheight = gridheight - percentValue + 'px';


        } else {
            gridheight = '400px';
        }

        var gridColumns = [];
        var source =
            {
                dataType: "json",
                dataFields: [
                    { name: 'ReferenceSetId', map: 'ReferenceSetId' },
                    { name: 'Name', map: 'Name' },
                    { name: 'SupportedPackages', map: 'SupportedPackages' },
                    { name: 'SupportedModels', map: 'SupportedModels' },
                    { name: 'Status', map: 'Status' },
                    { name: 'ModifiedOn', map: 'ModifiedOn', type: 'date' },
                    { name: 'userName', map: 'userName' },
                    { name: 'isSelected', type: 'number' },
                    { name: 'IsLocked', map: 'IsLocked' },
                    { name: 'ParentReferenceSet', map: 'ParentReferenceSet>Name'}
                ],
                root: 'ReferenceSets',
                type: "POST",
                data: param,

                url: AppConstants.get('API_URL') + "/GetReferenceSets",
                contentType: 'application/json',
                beforeprocessing: function (data) {
                    if (data.getReferenceSetsResp) {
                        data.getReferenceSetsResp = $.parseJSON(data.getReferenceSetsResp);
                    }
                    else
                        data.getReferenceSetsResp = [];
                    if (data.getReferenceSetsResp && data.getReferenceSetsResp.PaginationResponse) {
                        source.totalrecords = data.getReferenceSetsResp.PaginationResponse.TotalRecords;
                        source.totalpages = data.getReferenceSetsResp.PaginationResponse.TotalPages;
                    } else {
                        var PaginationResponse = new Object();
                        PaginationResponse.TotalRecords = 0
                        source.totalrecords = PaginationResponse.TotalRecords;
                    }
                },
            };


        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    $('.all-disabled').show();
                    disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    columnSortFilter = new Object();
                    columnSortFilter = columnSortFilterFormatedData(columnSortFilterForReferenceSet, gID, gridStorage, 'ReferenceSet');

                    koUtil.GlobalColumnFilter = columnSortFilter;
                    param.getReferenceSetsReq.ColumnSortFilter = columnSortFilter;

                    param.getReferenceSetsReq.Pagination = getPaginationObject(param.getReferenceSetsReq.Pagination, gID);

                    updatepaginationOnState(gID, gridStorage, param.getReferenceSetsReq.Pagination, null, null);
                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
                    if (data) {
                        //if (data.getReferenceSetsResp) {
                        //    data.getReferenceSetsResp = $.parseJSON(data.getReferenceSetsResp);
                        //}
                        if (data.getReferenceSetsResp && data.getReferenceSetsResp.ReferenceSets) {
                            for (var i = 0; i < data.getReferenceSetsResp.ReferenceSets.length; i++) {
                                data.getReferenceSetsResp.ReferenceSets[i].ModifiedOn = convertToLocaltimestamp(data.getReferenceSetsResp.ReferenceSets[i].ModifiedOn);
                            }
                        }
                        if (data.getReferenceSetsResp) {
                            if (data.getReferenceSetsResp.PaginationResponse) {
                                source.totalrecords = data.getReferenceSetsResp.PaginationResponse.TotalRecords;
                                source.totalpages = data.getReferenceSetsResp.PaginationResponse.TotalPages;
                                //if (data.getReferenceSetsResp.ReferenceSets) {
                                //    //for (var h = 0; h < data.getReferenceSetsResp.ReferenceSets.length; h++) {
                                //    //if (data.getReferenceSetsResp.ReferenceSets[h].ReferenceSetId == data.getReferenceSetsResp.PaginationResponse.HighLightedItemId) {
                                //    gridStorage[0].highlightedPage = data.getReferenceSetsResp.PaginationResponse.HighLightedItemPage;
                                //    var updatedGridStorage = JSON.stringify(gridStorage);
                                //    window.sessionStorage.setItem(gID + 'gridStorage', updatedGridStorage);
                                //    //}
                                //    //}
                                //}

                            } else {
                                source.totalrecords = 0;
                                source.totalpages = 0;
                                data.getReferenceSetsResp = new Object();
                                data.getReferenceSetsResp.ReferenceSets = [];
                            }
                        } else {

                            source.totalrecords = 0;
                            source.totalpages = 0;
                            data.getReferenceSetsResp = new Object();
                            data.getReferenceSetsResp.ReferenceSets = [];

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

        var rendered = function (element) {
            enablegridfunctions(gID, 'ReferenceSetId', element, gridStorage, true, 'pagerDivReferenceSet', false, 0, 'ReferenceSetId', null, null, null);
            return true;
        }
        var statusTypeRenderer = function (row, columnfield, value, columnproperties) {
            var html = '<div><span></span></div>';
            //if (value == 'Active') {
            //   // html = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-checkmark" style="padding-right:5px;padding-left:5px;color:green"></i></span><span style="padding-left:5px;padding-top:7px;"' + value + '">' + value + '</span></div>';
            //     defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
            //} else {
            //    //html = '<div style="padding-left:5px;padding-top:7px;"><span ><i class="icon-cross" style="padding-right:5px;padding-left:5px;color:red"></i></span><span style="padding-left:5px;padding-top:7px;"' + value + '">' + value + '</span> </div>';
            //     defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';

            //}
            if (value == "Active") {
                // defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg statusActive-success"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
                // defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg statusActive-success"></div></a>' + value + '</span></div>';
                defaultHtml = '<div style="padding-left:13px;padding-top:7px;"><span  title="' + value + '"><i class="icon-checkmark" style="color:green"></i></span><span style="padding-left:7px;padding-top:7px;">' + value + '</span></div>';
            }
            if (value == "Inactive") {
                //defaultHtml = '<div style="padding-left:5px;padding-top:7px;"><span ><div class=" iconImg inactive_Orange"></div></span><span style="padding-left:5px;padding-top:7px;" title="' + text + '' + value + '">' + value + '</span></div>';
                //defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + text + '' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg inactive_Orange"></div></a>' + value + '</span></div>';
                defaultHtml = '<div style="padding-left:13px;padding-top:7px;"><span  title="' + value + '"><i class="icon-cross" style="color:red"></i></span><span style="padding-left:7px;padding-top:7px;">' + value + '</span></div>';
            }
            return defaultHtml;
        }

        var lockRenderer = function (row, columnfield, value, columnproperties) {
            var defaultHtml = '<div><span></span></div>';  
            var lockToolTip = i18n.t('reference_set_locked_tooltip', { lng: lang })
            var unLockToolTip = i18n.t('reference_set_unlocked_tooltip', { lng: lang })
            if (value == true) {                
                defaultHtml = '<div style="padding-left:20px;padding-top:5px;font-size:20px;"><span  title="' + lockToolTip +'"><i class="icon icon-lock2" style="color: #696969"></i></span><span style="padding-left:7px;padding-top:7px;"></span></div>';
            } else {
                defaultHtml = '<div style="padding-left:20px;padding-top:5px;font-size:20px;"><span  title="' + unLockToolTip+'"><i class="icon icon-unlocked" style="color: #696969"></i></span><span style="padding-left:7px;padding-top:7px;"></span></div>';
            }           
            return defaultHtml;
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

        gridColumns = [
            {
                text: '', menu: false, sortable: false, resizable: false, draggable: false, filterable: false, columntype: 'checkbox', enabletooltips: false,
                datafield: 'isSelected', width: 40,
                renderer: function () {
                    return '<div><div style="margin-left: 10px; margin-top: 5px;"></div></div>';
                },
                rendered: rendered
            },
            { text: '', hidden: true, datafield: 'ReferenceSetId', editable: false, width: 250 },
            {
                text: i18n.t('rs_refrence_set', { lng: lang }), datafield: 'Name', editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            {
                text: i18n.t('parent_reference_set', { lng: lang }), datafield: 'ParentReferenceSet', editable: false, minwidth: 100,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanel(filterPanel, datafield);
                }
            },
            { text: i18n.t('rs_packages', { lng: lang }), datafield: 'SupportedPackages', editable: false, minwidth: 150, menu: false, sortable: false, filterable: false },
            { text: i18n.t('rs_models', { lng: lang }), datafield: 'SupportedModels', editable: false, minwidth: 100, menu: false, sortable: false, filterable: false },
            {
                text: i18n.t('rs_statsus', { lng: lang }), datafield: 'Status', editable: false, minwidth: 100, cellsrenderer: statusTypeRenderer, enabletooltips: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'ReferenceSet Status');
                }
            },
            {
                text: i18n.t('rs_locked', { lng: lang }), datafield: 'IsLocked', editable: false, width: 100, cellsrenderer: lockRenderer,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelMultiChoice(filterPanel, datafield, 'Lock Status');
                }
            },
            {
                text: i18n.t('p_t_copy_modifiedon', { lng: lang }), datafield: 'ModifiedOn', cellsformat: LONG_DATETIME_GRID_FORMAT, minwidth: 180, filterable: true, editable: false,
                filtertype: "custom",
                createfilterpanel: function (datafield, filterPanel) {
                    buildFilterPanelDate(filterPanel, datafield);

                }
            },

            { text: i18n.t('p_t_copy_modifiedby', { lng: lang }), datafield: 'FullName', editable: false, minwidth: 150, menu: false, sortable: false, filterable: false, },
        ];
        gridColumns = setUserPreferencesColumns('ReferenceSets', userResizedColumns, gridColumns);

        $("#" + gID).jqxGrid(
            {

                width: "100%",
                height: gridHeightFunction(gID, "1"),
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
                autoshowfiltericon: true,
                columns: gridColumns,
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
                }                
            });

        getGridBiginEdit(gID, 'ReferenceSetId', gridStorage);
        callGridFilter(gID, gridStorage);
        callGridSort(gID, gridStorage, 'ReferenceSetId');
    }

    function getReferenceParameters(isExport, columnSortFilterForReferenceSet, selectedReferenceSetItems, unselectedReferenceSetItems, checkAll, visibleColumns) {
        var GetReferenceSetsReq = new Object();

        GetReferenceSetsReq.HierarchyId = 0;
        GetReferenceSetsReq.IsActive = false;

        var Export = new Object();
        var Selector = new Object();

        Export.VisibleColumns = visibleColumns;

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            Selector.UnSelectedItemIds = unselectedReferenceSetItems;           
            if (isExport == true) {
                Export.IsAllSelected = true;
                GetReferenceSetsReq.FetchMode = ENUM.get("Export");;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                GetReferenceSetsReq.FetchMode = ENUM.get("Page");
                Export.IsExport = false;
            }
        } else {
            Selector.SelectedItemIds = selectedReferenceSetItems;
            Selector.UnSelectedItemIds = null;
            if (isExport == true) {
                Export.IsAllSelected = false;
                GetReferenceSetsReq.FetchMode = ENUM.get("Export");;
                Export.IsExport = true;
            } else {
                Export.IsAllSelected = false;
                GetReferenceSetsReq.FetchMode = ENUM.get("Page");
                Export.IsExport = false;
            }
        }

        GetReferenceSetsReq.Export = Export;
        var ColumnSortFilter = columnSortFilterForReferenceSet;
        GetReferenceSetsReq.ColumnSortFilter = ColumnSortFilter
        var FilterList = new Array();
        var coulmnfilter = new Object();

        var Pagination = new Object();
        Pagination.HighLightedItemId = null
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        GetReferenceSetsReq.Pagination = Pagination;
        GetReferenceSetsReq.Selector = Selector;

        var param = new Object();
        param.token = TOKEN();
        param.getReferenceSetsReq = GetReferenceSetsReq;

        return param;
    }


   function GetReferenceSets(isExport) {

        var GetReferenceSetsReq = new Object();
        GetReferenceSetsReq.FetchMode = 0;
        GetReferenceSetsReq.HierarchyId = 0;
        GetReferenceSetsReq.IsActive = false;

        var ColumnSortFilter = new Object();
        GetReferenceSetsReq.ColumnSortFilter = ColumnSortFilter;

        var Export = new Object();
        Export.DynamicColumns = new Array();

        if (isExport == true) {
            Export.IsExport = true;
            Export.IsAllSelected = false;
        } else {
            Export.IsExport = false;
            Export.IsAllSelected = false;
        }

        GetReferenceSetsReq.Export = Export;
        var Pagination = new Object();
        Pagination.HighLightedItemId = null;
        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('ROWSPERPAGE');
        GetReferenceSetsReq.Pagination = Pagination;

        var Selector = new Object();
        GetReferenceSetsReq.Selector = Selector;

        var callBackfunction = function (data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                }
            }
        }

        var method = 'GetReferenceSets';
        var params = '{"token":"' + TOKEN() + '","getReferenceSetsReq":' + JSON.stringify(GetReferenceSetsReq) + '}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
    }

});