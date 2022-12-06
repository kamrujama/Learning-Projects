isResetFilter = 0;
isColumnFilter = 0;
isDeviceSearchFilterApplied = 0;
isReset = false;
blankGridHeight = 0;
define(["knockout", "autho", "advancedSearchUtil", "sammy.min", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, autho, ADSearchUtil, Sammy, koUtil) {

    var lang = getSysLang();

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    deleteSaveAsFlag = 0;
    isFilterSearch = false;
    var isFirstTimeLoad = true;
    var isFromBlankGrid = false;
    columnfilterstring = '';

    return function DeviceSearchdViewModel() {
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

        //-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
        $('#btnStandardFileNo').focus();
        $('#reportConfirmatipnPopup').on('shown.bs.modal', function (e) {
            $('#reportConfirmatipnPopup_No').focus();

        });
        $('#reportConfirmatipnPopup').keydown(function (e) {
            if ($('#reportConfirmatipnPopup_No').is(":focus") && (e.which || e.keyCode) == 9) {
                e.preventDefault();
                $('#reportConfirmatipnPopup_yes').focus();
            }
        });
        //------------------------------------------------------------------------------------------------------------------------

        //columnSortFilterforreport = new Object();

        var self = this;
        //$("#mdlAdvancedForStanderdReport").draggable();

        //Draggable function
        $('#mdlAdvancedForStanderdReportHeader').mouseup(function () {
            $("#mdlAdvancedForStanderdReportContent").draggable({ disabled: true });
        });

        $('#mdlAdvancedForStanderdReportHeader').mousedown(function () {
            $("#mdlAdvancedForStanderdReportContent").draggable({ disabled: false });
        });

        //Draggable function
        $('#SaveAsModalHeader').mouseup(function () {
            $("#SaveAsModalContent").draggable({ disabled: true });
        });

        $('#SaveAsModalHeader').mousedown(function () {
            $("#SaveAsModalContent").draggable({ disabled: false });
        });
        ////////////////
        ADSearchUtil.resetAddSerchFlag = '';
        AdSearchObjForCustomeSavedReport = '';
        ClearAdSearchObjForReport = 0;

        $('#btnRefreshReports').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnRefreshReports').click();
            }
        });


        $('#btnSubscribe').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnSubscribe').click();
            }
        });


        $('#btnSaveCustomReport').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnSaveCustomReport').click();
            }
        });

        $('#btnSaveAs').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnSaveAs').click();
            }
        });

        $('#btnDeleteCustomReport').bind('keyup', function (e) {
            if (e.keyCode === 13) {
                $('#btnDeleteCustomReport').click();
            }
        });



        //Check Rights
        self.checkRights = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            return retval;
        }


        self.checkRightsForSubscribe = function (screenName, rightsFor) {
            var retval = autho.checkRightsBYScreen(screenName, rightsFor);
            var retvalForUser = autho.checkRightsBYScreen('Roles and Users', 'IsviewAllowed');
            var returnVal;
            if (retval == true && retvalForUser == true) {
                returnVal = true
            } else {
                returnVal = false
            }
            return returnVal;
        }
        columnSortFilterforeport = new Object();
        columnSortFilterforChildreport = new Object();

        self.reportName = ko.observable(koUtil.reportName);
        self.reportName(koUtil.reportId);
        self.AdvanceTemplateFlag = ko.observable(false);
        self.observableReportModelPopup = ko.observable();
        self.templateFlag = ko.observable(false);
        self.columnlist = ko.observableArray();
        self.gridIdForShowHide = ko.observable();
        self.checkAccessType = ko.observable('Private');
        self.displayCustome = ko.observable();
        self.allowADSearch = ko.observable(false);
        isAdvancedSavedSearchApplied = false;
        var reportId = koUtil.reportId;

        isFirstTimeLoad = true;
        isFromBlankGrid = false;

        if (koUtil.reportName == i18n.t('device_communication_history', { lng: lang })
            || koUtil.reportName == i18n.t('device_heartBeat_history', { lng: lang })
            || koUtil.reportName == i18n.t('device_parameters', { lng: lang })
            || koUtil.reportName == i18n.t('software_downloads_details', { lng: lang })
            || koUtil.reportName == i18n.t('device_software_status', { lng: lang })) {
            $("#btnRefreshReports").addClass('disabled');
            $("#btnRefreshReports").prop('disabled', true);
        } else {
            $("#btnRefreshReports").removeClass('disabled');
            $("#btnRefreshReports").prop('disabled', false);
        }

        if (koUtil.categoryName == 'Custom') {
            $("#btnSaveCustomReport").css("display", "inline")
            $("#btnDeleteCustomReport").css("display", "inline")
            var retval = self.checkRights('Reports and Charts', 'IsDeleteAllowed')
            if (retval == true) {
                //self.displayCustome(true);
                //$("#btnSaveCustomReport").removeAttr('disabled');
                $("#btnDeleteCustomReport").removeAttr('disabled');
                $("#deleteBtnSp").removeAttr('disabled');
                $("#savereportSp").removeAttr('disabled');
            } else {
                //$("#btnSaveCustomReport").prop("disabled", "true");
                //$("#btnDeleteCustomReport").prop("disabled", "true");
                //$("#deleteBtnSp").prop("disabled", "true");
                //$("#savereportSp").prop("disabled", "true");
                //$("#btnSaveCustomReport").prop("disabled", true);
                $("#btnDeleteCustomReport").prop("disabled", true);
                $("#deleteBtnSp").prop("disabled", true);
                $("#savereportSp").prop("disabled", true);
            }
        } else {
            $("#btnSaveCustomReport").css("display", "none");
            $("#btnDeleteCustomReport").css("display", "none");
        }

        JsonXmlData = '';
        loadelement('BlankCustomScreen', 'reports');
        compulsoryfieldsForReports = [];
        flageforDeviceZone = false;
        ADSearchUtil.SearchForChart = false;
        ADSearchUtil.SearchForGrid = true;
        // for adv search
        self.observableCriteria = ko.observable();

        loadCriteria('modalCriteria', 'genericPopup');

        self.observableAdvancedSearchModelPopup = ko.observable();

        loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        setScreenControls(AppConstants.get('REPORTS'));
        setMenuSelection();
        modelReposition();

        var DeviceSearch = new Object();

        ADSearchUtil.deviceSearchObj = DeviceSearch;

        ADSearchUtil.newAddedDataFieldsArr = [];
        ADSearchUtil.newAddedgridColumns = [];

        ADSearchUtil.AdScreenName = 'reportsScreen';

        self.expandCriteria = function () {
            if ($("#deviceCriteriaDiv").hasClass('hide') && $("#deviceColumnFilterDiv").hasClass('hide')) {
                if ($("#deviceCriteriaDiv")[0].innerText != "") {
                    $("#deviceCriteriaDiv").removeClass('hide');
                }
                if ($("#deviceColumnFilterDiv")[0].innerText != "") {
                    $("#deviceColumnFilterDiv").removeClass('hide');
                }
                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs"  role="button" tabindex="0"  title="Collapse"><i class="icon-angle-up"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            } else {
                $("#deviceCriteriaDiv").addClass('hide');
                $("#deviceColumnFilterDiv").addClass('hide');

                $("#expandQuickLinkDiv").empty();
                var str = '<a class="btn btn-default btn-xs"  role="button" tabindex="0"  title="Expand"><i class="icon-angle-down"></i></a>';
                $("#expandQuickLinkDiv").append(str);
            }
        }

        function loadCriteria(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {
                //new template code
                var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
                var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
                ko.components.register(elementname, {
                    viewModel: { require: ViewName },
                    template: { require: 'plugin/text!' + htmlName }
                });
            }
            self.observableCriteria(elementname);
        }
        function loadAdvancedSearchModelPopup(elementname, controllerId) {

            if (!ko.components.isRegistered(elementname)) {

                //new template code
                var htmlName = '../template/' + controllerId + '/' + elementname + '.html';
                var ViewName = 'controller/' + controllerId + '/' + elementname + '.js';
                ko.components.register(elementname, {
                    viewModel: { require: ViewName },
                    template: { require: 'plugin/text!' + htmlName }
                });
            }
            self.observableAdvancedSearchModelPopup(elementname);
        }

        self.openPopup = function (popupName, gId, status) {
            self.templateFlag(true);
            if (popupName == "modelShowHideCol") {
                self.gridIdForShowHide(gId);
                self.columnlist(genericHideShowColumn(gId, true, compulsoryfieldsForReports));

                if (visibleColumnsList.length == 0) {
                    var columns = self.columnlist();
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                }


                loadelement(popupName, 'genericPopup');
                $('#reprotModal').modal('show');

            } else if (popupName == "modelReportSubscription") {

                if (gId == 'jqxChildGridDetails') {

                    koUtil.SelectedChildReportId = childReportId;
                    koUtil.SelectedChildGridParam = SelectedChildReportParams;
                    koUtil.SelectedReportMongoEnabled = reportMongoEnabled;
                    showChildReportGrid = true;

                }
                else {
                    showChildReportGrid = false;
                    koUtil.SelectedChildReportId = '';
                    koUtil.SelectedChildGridParam = '';
                    koUtil.SelectedReportMongoEnabled = '';
                }


                self.unloadTempPopup('unloadTemplate');
                $("#blankCustomReport").css("display", "none");
                loadelement(popupName, 'reports');
                $('#reprotModal').modal('show');


                if (gId == 'jqxChildGridDetails') {

                    $('#openModalPopup').modal('hide');
                }
           

            } else if (popupName == 'modelAdvancedSearch') {
                self.AdvanceTemplateFlag(true);
                loadAdvancedSearchModelPopup(popupName, 'genericPopup');
                $('#AdvanceSearchModal').modal('show');
            }
        }

        self.saveReport = function () {
            var saveReportReq = new Object();
            saveReportReq.ColumnSortFilter = columnSortFilterforeport;
            if (ADSearchUtil.deviceSearchObj) {
                saveReportReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                saveReportReq.DeviceSearch.SearchCriteria = ADSearchUtil.SearchCriteria;
            } else {
                saveReportReq.DeviceSearch = null;
            }
            saveReportReq.SearchText = null;
            saveReportReq.SourceReportId = koUtil.reportId;
            saveReportReq.UnselectedItems = ["dummyCol"];

            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'rpt_Report_successfully_saved');
                    }
                }
            }


            var params = '{"token":"' + TOKEN() + '","saveReportReq":' + JSON.stringify(saveReportReq) + '}';
            ajaxJsonCall('SaveReport', params, callBackfunction, true, 'POST', true);

        }
        self.openCunfirmation = function () {
            $("#reportConfirmatipnPopup").modal('show');
        }
        self.deleteReport = function () {
            var deleteReportReq = new Object();
            deleteReportReq.ReportId = koUtil.reportId;
            var callBackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        deleteSaveAsFlag = 1;
                        $("#saveAsSuccessId").modal('show');
                        var msg = i18n.t('rpt_Report_successfully_deleted', { lng: lang });
                        $("#saveAsMesId").text(msg);
                    }
                }
            }


            var params = '{"token":"' + TOKEN() + '","deleteReportReq":' + JSON.stringify(deleteReportReq) + '}';
            ajaxJsonCall('DeleteReport', params, callBackfunction, true, 'POST', true);
        }
        self.closedSaveAs = function () {

            $("#errorSP").addClass('hide');
            self.checkAccessType('Private');
            $("#txtCustomReportName").val('');
            $("#SaveBtnOk").prop('disabled', true);

            $("#SaveAsModalContent").css('left', '');
            $("#SaveAsModalContent").css('top', '');
        }

        self.saveAsClick = function () {
            self.checkAccessType('Private');
            $("#txtCustomReportName").val('');
            $("#SaveAsModal").modal('show');
        }

        self.saved_value = ko.observable(""),
            self.saved_value.subscribe(function (newValue) {

                if (self.saved_value().trim() != '') {
                    $("#SaveBtnOk").removeAttr('disabled');
                } else {
                    $("#SaveBtnOk").prop('disabled', true);
                }
            });

        //Disable Save As button on escape key.
        $("#SaveAsModal").keydown(function (e) {
            if (e.keyCode === 27) {
                $("#SaveBtnOk").prop('disabled', true);
            }
        });

        //unload advance serach popup
        self.unloadAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvancedForStanderdReportContent");
            ClearAdSearchObjForReport = 1;
            loadAdvancedSearchModelPopup('unloadTemplate', 'genericPopup');
            //self.observableAdvancedSearchModelPopup('unloadTemplate');
            $("#AdvanceSearchModal").modal('hide');
            $("#mainPageBody").removeClass('modal-open-appendon');
            isAdpopup = '';
        }
        self.clearAdvancedSearch = function () {
            repositionAdvanceSearchPopUp("mdlAdvancedForStanderdReportContent");
            ClearAdSearchObjForReport = 0;
            self.observableAdvancedSearchModelPopup('unloadTemplate');
            loadAdvancedSearchModelPopup('modelAdvancedSearch', 'genericPopup');

        }

        //------open success confirmation popup on save As buttton---------
        self.openCustomReport = function () {
            if (deleteSaveAsFlag == 1) {
                var nestedRoutePath = getRouteUrl();

                $("#" + nestedRoutePath[3]).parent('li').remove();


                if ($("#customReportreportsAlerts").parent('li').children('ul').html() == '') {

                    $("#customReportreportsAlerts").parent('li').remove();
                } else {

                }
                window.location.replace("#BlankCustomScreen");

            } else {

            }
        }

        //focus on first textbox
        $('#saveAsSuccessId').on('shown.bs.modal', function () {
            $('#btnSaveAsId').focus();
        })

        self.AddCustomReport = function () {
            if ($("#txtCustomReportName").val().indexOf('%') === -1) {

                var changeName = $("#txtCustomReportName").val().replace(/\\/g, '/');

                $("#errorSP").addClass('hide');
                var checkchar = $("#txtCustomReportName").val();
                if ($("#txtCustomReportName").val().indexOf('#') === -1 && $("#txtCustomReportName").val().indexOf('<') === -1 && $("#txtCustomReportName").val().indexOf('>') === -1 && $("#txtCustomReportName").val().indexOf('/') === -1 && changeName.indexOf('/') === -1
                    && $("#txtCustomReportName").val().indexOf(':') === -1 && $("#txtCustomReportName").val().indexOf('*') === -1 &&
                    $("#txtCustomReportName").val().indexOf('?') === -1 && $("#txtCustomReportName").val().indexOf('"') === -1
                    && $("#txtCustomReportName").val().indexOf('|') === -1 && $("#txtCustomReportName").val().indexOf('.') === -1) {
                    // if (/^[a-zA-Z0-9   ]+$/.test(checkchar) || /^[!@#$%^&*()_+]+$/.test(checkchar)) {
                    $("#errorSP").addClass('hide');
                    ///new
                    var copyReportReq = new Object();

                    copyReportReq.ColumnSortFilter = columnSortFilterforeport;
                    copyReportReq.CustomReportName = $("#txtCustomReportName").val().trim();
                    if (ADSearchUtil.deviceSearchObj) {
                        copyReportReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                        copyReportReq.DeviceSearch.SearchCriteria = ADSearchUtil.SearchCriteria;
                    } else {
                        copyReportReq.DeviceSearch = null;
                    }

                    if (self.checkAccessType() == 'Private') {
                        copyReportReq.ReportAccessType = 0;
                    } else {
                        copyReportReq.ReportAccessType = 1;
                    }

                    copyReportReq.SearchText = ADSearchUtil.SearchText;
                    copyReportReq.SourceReportId = koUtil.reportId;
                    copyReportReq.UnselectedItems = ["dummyCol"];


                    $("#loadingDiv").show();
                    var callBackfunction = function (data, error) {
                        $("#loadingDiv").hide();
                        if (data) {
                            if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                                deleteSaveAsFlag = 0;
                                var msg = i18n.t('rpt_Report_successfully_saved', { lng: lang });
                                function callbackFunctionNew(data, error) {
                                    if (data) {
                                        var newid = 0;
                                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                                            if (data.getAllReportsResp)
                                                data.getAllReportsResp = $.parseJSON(data.getAllReportsResp);
                                            koUtil.reportData = data.getAllReportsResp;
                                            var arr = _.where(data.getAllReportsResp.CustomReports, { ReportName: $("#txtCustomReportName").val().trim() });
                                            var nestedRoutePath = getRouteUrl();
                                            newid = arr[0].ReportId;
                                            updateReportObj = new Object();
                                            updateReportObj.id = arr[0].ReportId;
                                            updateReportObj.name = arr[0].ReportName;
                                            updateReportObj.controlerId = 'reports';
                                            updateReportObj.parentId = nestedRoutePath[5];
                                            updateReportObj.rootParentId = nestedRoutePath[6];
                                            updateReportObj.reportType = 'Custom';
                                            updateReportObj.templateId = 'standardReports';
                                            updateReportArr.push(updateReportObj);
                                            var name = "'" + arr[0].ReportName + "'";
                                            var nameforcheck = arr[0].ReportName;
                                            var arrNew = new Array();//data.getAllReportsResp.CustomReports;
                                            for (var i = 0; i < data.getAllReportsResp.CustomReports.length; i++) {
                                                if (data.getAllReportsResp.CustomReports[i].CategoryName == nestedRoutePath[5].substr(7, nestedRoutePath[5].length - 7)) {
                                                    arrNew.push(data.getAllReportsResp.CustomReports[i]);
                                                }
                                            }
                                            arrNew.sort(function (a, b) { return a.ReportName.toUpperCase() > b.ReportName.toUpperCase() ? 1 : -1; })
                                            var rIndex = '';
                                            var rid = '';
                                            var initalindex = 0;

                                            if (arrNew.length == 1) {
                                                rIndex = 0;
                                                initalindex = 1;
                                            } else {

                                                for (var i = 0; i < arrNew.length; i++) {
                                                    if ("'" + arrNew[i].ReportName + "'" == name) {
                                                        if (i == 0) {
                                                            rIndex = 1;
                                                            initalindex = 1;
                                                        } else {
                                                            rIndex = i - 1;
                                                            initalindex = 0;
                                                        }

                                                    }

                                                }
                                            }

                                            rid = arrNew[rIndex].ReportId;
                                            var setid = "subChildChildernli" + rIndex;
                                            if (initalindex == 1) {

                                                if (arrNew.length == 1) {

                                                    rIndex = rIndex;
                                                    var parentid = 'customReport' + nestedRoutePath[5];
                                                    var str = '<li class="has-sub active active-1 expand"  > <span id="' + parentid + '"></span>';
                                                    str += ' <a class="arrow-open" id="' + nestedRoutePath[5] + 'sublink">';
                                                    var spni18nval = i18n.t(nestedRoutePath[5], { lng: lang });
                                                    str += '<span>' + spni18nval + '</span>';
                                                    str += '<b class="icon-angle-right pull-right arrow-adjust"></b>';
                                                    str += '</a>';
                                                    var ulid = "customeUl" + nestedRoutePath[5];
                                                    str += '<ul class="sub-menu" id="' + ulid + '" style="display: block;">';
                                                    str += '</ul>';
                                                    str += '</li>';
                                                    $("#customReport").children('ul').append(str);

                                                    //var str1 = '<li class="has-sub"><span>raj</span></li>';
                                                    var str1 = '<li class="has-sub" id=' + setid + ' ><a id=' + newid + ' ><span title="' + $("#txtCustomReportName").val().trim() + '" tabindex="0" class="hierarchy-name-txt" onclick="onclicksavedCustomeReports(' + name + ')"  >' + $("#txtCustomReportName").val() + '</span></a></li>';
                                                    var aid = "#" + nestedRoutePath[5] + "sublink";

                                                    $("#" + ulid).append(str1);
                                                } else {

                                                    rIndex = rIndex;
                                                    var str = '<li class="has-sub" id=' + setid + ' ><a id=' + newid + ' ><span title="' + $("#txtCustomReportName").val().trim() + '" tabindex="0" class="hierarchy-name-txt" onclick="onclicksavedCustomeReports(' + name + ')"  >' + $("#txtCustomReportName").val() + '</span></a></li>';
                                                    $("#" + rid).parent('li').before(str);
                                                }
                                            } else {

                                                rIndex = rIndex + 1;
                                                var str = '<li class="has-sub" id=' + setid + ' ><a id=' + newid + ' ><span title="' + $("#txtCustomReportName").val().trim() + '" tabindex="0" class="hierarchy-name-txt" onclick="onclicksavedCustomeReports(' + name + ')"  >' + $("#txtCustomReportName").val() + '</span></a></li>';
                                                $("#" + rid).parent('li').after(str);
                                            }
                                            var startindex = 0;
                                            $("#" + rid).parent('li').parent('ul').children('li').each(function (i) {
                                                $(this).prop("id", "subChildChildernli" + startindex);
                                                startindex = startindex + 1;
                                            });
                                            openAlertpopup(0, 'rpt_Report_successfully_saved');
                                        }
                                    }

                                }
                                var params = '{"token":"' + TOKEN() + '"}';
                                ajaxJsonCall('GetAllReports', params, callbackFunctionNew, true, 'POST', true);
                                //$("#saveAsMesId").text(msg);
                            } else if (data.responseStatus.StatusCode == AppConstants.get('CUSTOM_RPT_EXISTS')) {
                                openAlertpopup(1, 'rpt_Custom_Report_Name_Already_Exists');
                            }
                        }
                    }
 

                    var params = '{"token":"' + TOKEN() + '","copyReportReq":' + JSON.stringify(copyReportReq) + '}';
                    ajaxJsonCall('CopyReport', params, callBackfunction, true, 'POST', false);
                    $("#SaveAsModal").modal('hide');
                    $("#SaveAsModalContent").css('left', '');
                    $("#SaveAsModalContent").css('top', '');
                    ///
                } else {
                    $("#errorSP").removeClass('hide');
                }
            } else {
                $("#errorSP").removeClass('hide');
            }

        }
        self.unloadTempPopup = function (popupName) {
            $("#blankCustomReport").css("display", "none");
            loadelement('BlankCustomScreen', 'reports');
            $("#mainPageBody").removeClass('modal-open-appendon');
            $('#reprotModal').modal('hide');
            isAdpopup = '';

        };

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.observableReportModelPopup(elementname);
        }

        self.flagBlankGrid = ko.observable(false);

        self.clearfilter = function (gridId) {
            if (gridId == 'blankReportGrid') {
                $('#blankReportGrid').hide();
                var param = getParamForReport(false, columnSortFilterforeport, null, null, 0, reportId, ADSearchUtil.deviceSearchObj, []);
                reportByNameGrid('reportGrid', param, self.allowADSearch, self.flagBlankGrid, self.observableAdvancedSearchModelPopup);
            }
            else {
                checkclear = 1;
                isResetFilter = 1;
                $('#reportGrid').jqxGrid("clearfilters");
                $('#reportGrid').on("bindingcomplete", function () {
                    if (checkclear == 1) {
                        $('#reportGrid').jqxGrid("removesort");
                        checkclear = 0;
                    }
                });
                showHideSearchCriteria('Filter', 0, '');

                var adStorage = JSON.parse(sessionStorage.getItem("reprotGridadStorage"));
                if (adStorage && adStorage[0].isAdSearch == 0) {
                    if (!isEmpty(adStorage[0].adSearchObj)) {
                        $("#resetBtnForGrid").removeClass("hide");
                    } else {
                        $("#resetBtnForGrid").addClass("hide");
                    }
                }
            }
        }
        self.refreshGrid = function (gId) {
            if (gId == 'blankReportGrid') {
                $('#blankReportGrid').hide();
                var param = getParamForReport(false, columnSortFilterforeport, null, null, 0, reportId, ADSearchUtil.deviceSearchObj, []);
                reportByNameGrid('reportGrid', param, self.allowADSearch, self.flagBlankGrid, self.observableAdvancedSearchModelPopup);
            }
            else {
                gridRefresh(gId);
                $("#btnRefreshReports").blur();
            }
        }


        var param = getParamForReport(false, columnSortFilterforeport, null, null, 0, reportId, ADSearchUtil.deviceSearchObj, []);
        if (koUtil.reportName == i18n.t('device_communication_history', { lng: lang })
            || koUtil.reportName == i18n.t('device_heartBeat_history', { lng: lang })
            || koUtil.reportName == i18n.t('device_parameters', { lng: lang })
            || koUtil.reportName == i18n.t('software_downloads_details', { lng: lang })
            || koUtil.reportName == i18n.t('device_software_status', { lng: lang })) {
            blankReportByNameGrid('blankReportGrid', param, self.allowADSearch, self.flagBlankGrid, self.observableAdvancedSearchModelPopup);
            isFirstTimeLoad = false;
        } else {
            reportByNameGrid('reportGrid', param, self.allowADSearch, self.flagBlankGrid, self.observableAdvancedSearchModelPopup);
        }

        self.exportToExcel = function (gId) {
            var selectedItems = getSelectedUniqueId(gId);
            var unselectedItems = getUnSelectedUniqueId(gId);
            var checkall = checkAllSelected(gId);


            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                visibleColumnsList = GetExportVisibleColumn(gId);
                var param = getParamForReport(true, columnSortFilterforeport, selectedItems, unselectedItems, checkall, reportId, ADSearchUtil.deviceSearchObj, visibleColumnsList);
                reprtExport(param, gId);
            } else {
                openAlertpopup(1, 'no_data_to_export')

            }
        }

        self.exportChildReportToExcel = function (gId) {

            var datainfo = $("#" + gId).jqxGrid('getdatainformation');
            if (datainfo.rowscount > 0) {
                visibleColumnsList = GetExportVisibleColumn(gId);
                var param = getChildParamForReport(true, columnSortFilterforChildreport, reportId, visibleColumnsList);
                chilkdReptExport(param);
            } else {
                openAlertpopup(1, 'no_data_to_export')

            }
        }


        function chilkdReptExport(param) {
            var callbackFunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('REPORT_NOT_AVAILABLE')) {
                        openAlertpopup(1, 'report_not_available');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SQL_INJECTION_ERROR')) {
                        openAlertpopup(2, 'sql_injection_error');
                    }
                }
            }

            if (param.getChildReportByIdReq.IsMongoEnabled) {

                var mongomethod = 'GetReport';
                var mongoparams = JSON.stringify(param);
                ajaxJsonCall(mongomethod, mongoparams, callbackFunction, true, 'POST', true,true,'report');
            }
            else {

                var method = 'GetChildReportById';
                var params = JSON.stringify(param);
                ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
            }
        }


        function reprtExport(param, gId) {
            var callbackFunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(1, 'export_Sucess');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('REPORT_NOT_AVAILABLE')) {
                        openAlertpopup(1, 'report_not_available');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SQL_INJECTION_ERROR')) {
                        openAlertpopup(2, 'sql_injection_error');
                    }
                }
            }

            var method = 'GetReportByName';
            var params = JSON.stringify(param);
            ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
        }


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

    function blankReportByNameGrid(gID, param, allowADSearch, flagBlankGrid, modelPopup) {
        flagBlankGrid(true);
        ADSearchUtil.gridIdForAdvanceSearch = 'blankReportGrid';
        //calculate height of grid
        var gridheight = $(window).height();
        var percentValue;
        //if (gridheight > 600) {
        //    if ($(window).height() > 700) {
        //        percentValue = (30 / 100) * gridheight;
        //    } else {
        //        percentValue = (25 / 100) * gridheight;
        //    }


        //    gridheight = gridheight - 150;

        //    gridheight = gridheight - percentValue + 'px';


        //} else {
        //    gridheight = '400px';
        //}
        gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 82;
        //grid minimum height is set to 250px
        if (gridheight < 250) {
            gridheight = 250;
        }
        blankGridHeight = gridheight;

        var sourceDataFieldsArr = [];
        var gridColumnArr = new Array();
        var id = parseInt(koUtil.reportId);
        reportId = parseInt(koUtil.reportId);
        var firstTimeGridLoad = true;

        var source = '';
        if (koUtil.categoryName == 'Custom') {
            source = _.where(koUtil.reportData.CustomReports, { "ReportId": id });
        } else {
            source = _.where(koUtil.reportData.StandardReports, { "ReportId": id });
        }

        var xml = source[0].ReportDefinitionXML;

        JsonXmlData = $.xml2json(xml);

        var columnArr = new Array();

        if (JsonXmlData.FilterType == 'Device') {
            allowADSearch(true);
        } else {
            allowADSearch(false);
        }
        columnArr = JsonXmlData.Columns.Column;

        if (columnArr && !$.isArray(columnArr)) {
            columnArr = $.makeArray(columnArr);
        }

        var FilterSource = '';
        compulsoryfieldsForReports = [];

        for (var f = 0; f < columnArr.length; f++) {
            if (columnArr[f].VisiblityType == 'Mandatory') {
                compulsoryfieldsForReports.push(columnArr[f].Field);
            } else if (columnArr[f].VisiblityType == 'Hidden') {
                continue;
            } else {
                if (columnArr[f].VisiblityType == 'undefined') {
                    if ('un')
                        compulsoryfieldsForReports.push(columnArr[f].Field);
                }
            }

            if (columnArr[f].DisplayName.indexOf("*") >= 0) {
                flageforDeviceZone = true;
            }

            var coulmnObj = new Object();
            coulmnObj.text = i18n.t(columnArr[f].DisplayName, { lng: lang });//columnArr[f].DisplayName;
            coulmnObj.datafield = columnArr[f].Field;
            coulmnObj.editable = false;
            coulmnObj.minwidth = 150;
            //coulmnObj.width = 'auto';
            coulmnObj.enabletooltips = true;

            if (columnArr[f].ControlType == 'Link') {

                childReportParams = columnArr[f].ChildGridParam;
                childReportId = columnArr[f].ChildGridId;
                if (columnArr[f].ChildGridId == JsonXmlData.ChildGrid.ID)
                    ChildGridXML = JsonXmlData.ChildGrid;
            }


            if (columnArr[f].VisiblityType == 'Hidden')
                coulmnObj.hidden = true;

            if (columnArr[f].FilterType == "None") {
                coulmnObj.filterable = false;
                coulmnObj.sortable = false;
                coulmnObj.menu = false;
            } else {
                if (columnArr[f].Field == null || columnArr[f].Field == '') {
                    coulmnObj.filterable = false;
                    coulmnObj.sortable = false;
                    coulmnObj.menu = false;
                } else {

                    if (columnArr[f].FilterType == 'Date') {
                        coulmnObj.cellsformat = 'dd/MMM/yyyy hh:mm:ss tt';
                    }

                    coulmnObj.filtertype = "custom";
                    if (columnArr[f].FilterType == 'Text') {
                        coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                    } else if (columnArr[f].FilterType == 'MultiChoice') {
                        if (columnArr[f].ControlType == 'BOOL') {
                            coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                var FilterSource = AppConstants.get(datafield);
                                buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource, true);
                            };
                        } else {
                            coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                var FilterSource = AppConstants.get(datafield);
                                buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource, false);
                            };
                        }


                    } else if (columnArr[f].FilterType == 'Date') {
                        coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };

                    }
                }

            }
            gridColumnArr.push(coulmnObj);
        };

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;

        var source =
        {
            dataType: "json",
            dataFields: gridStorage[0].dataFields,
            contentType: 'application/json'
        };

        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    if (isFirstTimeLoad == false) {
                        $('#blankReportGrid').hide();
                        ///disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefreshReports']);

                        isFromBlankGrid = true;
                        columnSortFilterforeport = columnSortFilterFormatedDataForReports(columnSortFilterforeport, gID, gridStorage, 'DeviceSearchFilter');
                        param.getReportByNameReq.ColumnSortFilter = columnSortFilterforeport;
                        param.getReportByNameReq.DeviceSearch = null;
                        param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_NONE");
                        if (param.getReportByNameReq.DeviceSearch == null) {
                            isDeviceSearchFilterApplied = 0;
                        }
                        if (param.getReportByNameReq.DeviceSearch) {
                            isDeviceSearchFilterApplied = 1;
                        }
                        if (isDeviceSearchFilterApplied == 1 && param.getReportByNameReq.DeviceSearch == null) {
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_DEVICE_SEARCH");
                        }
                        if (isResetFilter == 1) {
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_COLUMNFILTER");
                        }

                        if (isReset == true) {
                            //isReset = false;
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_ALL");
                        }

                        if ((isDeviceSearchFilterApplied == 0 && isReset == true)) {
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_ALL");
                        }

                        if (isDeviceSearchFilterApplied == 0 && isResetFilter == 1) {
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_ALL");
                        }

                        if (isResetFilter = 1 && isDeviceSearchFilterApplied == 1) {
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_DEVICE_SEARCH");
                        }
                        if (param.getReportByNameReq.ColumnSortFilter == null && isReset == true) {
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_COLUMNFILTER");
                        }
                        //alert(ADSearchUtil.SearchText)
                        ///for staemangment
                        var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));

                        if (columnSortFilterforeport && columnSortFilterforeport.FilterList && columnSortFilterforeport.FilterList.length > 0) {
                            param.getReportByNameReq.DeviceSearch = null;
                        }
                        else {
                            if (adStorage[0].isAdSearch == 0) {
                                if (adStorage[0].adSearchObj) {
                                    ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
                                } else {
                                    ADSearchUtil.deviceSearchObj = null;
                                }
                            } else {
                                if (adStorage[0].quickSearchObj) {
                                    ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
                                } else {
                                    ADSearchUtil.deviceSearchObj = null;
                                }
                            }


                            if (ADSearchUtil.deviceSearchObj) {
                                param.getReportByNameReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                                param.getReportByNameReq.DeviceSearch.SearchCriteria = ADSearchUtil.SearchCriteria;
                            } else {
                                param.getReportByNameReq.DeviceSearch = null;
                            }
                        }
                        //if (ADSearchUtil.resetAddSerchFlag == 'reset') {
                        //    param.getReportByNameReq.FilterResetMode = ENUM.get("DEVICESEARCH");
                        //} else {
                        //    param.getReportByNameReq.FilterResetMode = ENUM.get("NONE");
                        //}

                        param.getReportByNameReq.Pagination = getPaginationObject(param.getReportByNameReq.Pagination, gID);

                        updatepaginationOnState(gID, gridStorage, param.getReportByNameReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage);

                        //param = JSON.stringify(param);
                        reportByNameGrid("reportGrid", param, allowADSearch, flagBlankGrid, modelPopup);
                    }
                }
            }
        );


        //for filter UI
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name, isBool) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name, isBool);
        }
        //for allcheck

        var gridCoulmns = [];
        gridCoulmns = gridColumnArr;

        gridStorage[0].columnsArr = gridCoulmns;

        $("#" + gID).jqxGrid(
            {

                width: "100%",
                height: gridHeightFunction(gID, "1"),
                pageable: true,
                editable: true,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('REPORTSROWPERPAGE'),
                filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: false,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                enabletooltips: true,
                autoshowfiltericon: true,
                columns: gridCoulmns,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    addDefaultfilterForReport(columnSortFilterforeport, gID);

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                },
            });

        $("#" + gID).on("bindingcomplete", function () {

            $('.jqx-grid-pager').css("display", "inline");
            $('.jqx-grid-pager').css("z-index", "-1");
            generateGenericPager('reportPaginationDiv', gID, false, flageforDeviceZone);

            if (gridStorage[0].isGridReady == 1) {
                gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
            }
        });

        callGridFilter(gID, gridStorage);
        $("#" + gID).on("sort", function () {
            $("#" + gID).jqxGrid('updatebounddata');
        });

        var localizationObj = {};
        localizationObj.emptydatastring = i18n.t("no_default_data_for_report", { lng: lang });
        $("#" + gID).jqxGrid('localizestrings', localizationObj);

    }

    function reportByNameGrid(gID, param, allowADSearch, flagBlankGrid, modelPopup) {
        flagBlankGrid(false);

        gridFilterClear(gID);
        //ADSearchUtil.resetAddSerchFlag = 'reset';
        updateAdSearchObj(gID, [], 2);


        ADSearchUtil.gridIdForAdvanceSearch = 'reportGrid';
        //calculate height of grid
        var gridheight = $(window).height();
        var percentValue;
        //if (gridheight > 600) {
        //    percentValue = (25 / 100) * gridheight;
        //    gridheight = gridheight - 150;

        //    gridheight = gridheight - percentValue + 'px';


        //} else {
        //    gridheight = '400px';
        //}
        if (koUtil.reportName == i18n.t('device_communication_history', { lng: lang })
            || koUtil.reportName == i18n.t('device_heartBeat_history', { lng: lang })
            || koUtil.reportName == i18n.t('device_parameters', { lng: lang })
            || koUtil.reportName == i18n.t('software_downloads_details', { lng: lang })
            || koUtil.reportName == i18n.t('device_software_status', { lng: lang })) {
            gridheight = blankGridHeight;
        } else {
            gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 12;
        }
        //grid minimum height is set to 250px
        if (gridheight < 250) {
            gridheight = 250;
        }
        var sourceDataFieldsArr = [];
        var gridColumnArr = new Array();
        var id = parseInt(koUtil.reportId);
        reportId = parseInt(koUtil.reportId);

        var source = '';
        if (koUtil.categoryName == 'Custom') {
            source = _.where(koUtil.reportData.CustomReports, { "ReportId": id });
        } else {
            source = _.where(koUtil.reportData.StandardReports, { "ReportId": id });
        }

        var xml = source.length > 0 ? source[0].ReportDefinitionXML : '';

        JsonXmlData = $.xml2json(xml);

        var columnArr = new Array();

        if (JsonXmlData.FilterType == 'Device') {
            allowADSearch(true);
        } else {
            allowADSearch(false);
        }
        columnArr = JsonXmlData.Columns.Column;

        if (columnArr && !$.isArray(columnArr)) {
            columnArr = $.makeArray(columnArr);
        }

        var FilterSource = '';
        compulsoryfieldsForReports = [];
        var severityRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {

            var isSeverityApplicableFlag = $("#" + gID).jqxGrid('getcellvalue', row, 'IsSeverityApplicable');
            if (value == "Low") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Low_severity"></div></a>' + value + '</span></div>';
            } else if (value == "High") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg high_Severity"></div></a>' + value + '</span></div>';
            } else if (value == "Medium") {
                defaultHtml = '<div style="padding-left:5px;padding-top:0px;"><span  title="' + value + '"><a  id="imageId" class="btn default" style="padding-left: 0px; height="60" width="50"><div class="iconImg Medium_severity"></div></a>' + value + '</span></div>';
            } else if (value == "Not Applicable") {
                defaultHtml = '<div style="padding-left:5px;padding-top:7px;" disabled="disabled"><a  id="imageId" class="btn default" style="padding-left: 0px; color: #18f008" height="60" width="50"></a>' + value + '</div>';
            }
            return defaultHtml;
        }

        var jobStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = dispalyTooltipAndIconRendererForReports(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        var deviceStatusRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = computedJobStatusTooltipIcon(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        var downloadProgressRenderer = function (row, column, value, defaultHtml) {
            defaultHtml = downloadProgressRendererForJobs(gID, row, column, value, defaultHtml);
            return defaultHtml;
        }

        var downloadTypesRenderer = function (row, column, value, defaultHtml) {
            var defaultHtml = '<div><span></span></div>';
            if (value == 'False') {
                defaultHtml = '<div style="padding-left:5px;padding-top:5px"><span>Manual</span></div>';
            } else if (value == 'True') {
                defaultHtml = '<div style="padding-left:5px;padding-top:5px"><span>Automatic</span></div>';
            }
            return defaultHtml;
        }

        for (var f = 0; f < columnArr.length; f++) {
            if (columnArr[f].VisiblityType == 'Mandatory') {
                compulsoryfieldsForReports.push(columnArr[f].Field);
            } else if (columnArr[f].VisiblityType == 'Hidden') {
                continue;
            } else {
                if (columnArr[f].VisiblityType == 'undefined') {
                    if ('un')
                        compulsoryfieldsForReports.push(columnArr[f].Field);
                }
            }

            if (columnArr[f].DisplayName.indexOf("*") >= 0) {
                flageforDeviceZone = true;
            }

            var coulmnObj = new Object();
            coulmnObj.text = i18n.t(columnArr[f].DisplayName, { lng: lang });//columnArr[f].DisplayName;
            coulmnObj.datafield = columnArr[f].Field;
            coulmnObj.editable = false;
            coulmnObj.minwidth = 150;
            //coulmnObj.width = 'auto';
            coulmnObj.enabletooltips = true;
            coulmnObj.resizable = true;
            if (columnArr[f].Field == 'CompJobStatus' || columnArr[f].Field == 'Status') {
                coulmnObj.cellsrenderer = jobStatusRenderer;
            } else if (columnArr[f].Field == 'Severity') {
                coulmnObj.cellsrenderer = severityRenderer;
            } else if (columnArr[f].Field == 'ComputedDeviceStatus' || columnArr[f].Field == 'PreviousDeviceStatus' || columnArr[f].Field == 'CurrentDeviceStatus') {
                coulmnObj.cellsrenderer = deviceStatusRenderer;
            } else if (columnArr[f].Field == 'PercentageOfDownload') {
                coulmnObj.cellsrenderer = downloadProgressRenderer;
            } else if (columnArr[f].Field == 'IsAutoDownloadJob') {
                coulmnObj.cellsrenderer = downloadTypesRenderer;
            }

            if (columnArr[f].ControlType == 'Link') {
                coulmnObj.enabletooltips = false;
                childReportParams = columnArr[f].ChildGridParam;
                childReportId = columnArr[f].ChildGridId;

                if (columnArr[f].ChildGridId == JsonXmlData.ChildGrid.ID)
                    ChildGridXML = JsonXmlData.ChildGrid;
            }


            if (columnArr[f].VisiblityType == 'Hidden')
                coulmnObj.hidden = true;

            if (columnArr[f].FilterType == "None") {
                coulmnObj.filterable = false;
                coulmnObj.sortable = false;
                coulmnObj.menu = false;
            } else {
                if (columnArr[f].Field == null || columnArr[f].Field == '') {
                    coulmnObj.filterable = false;
                    coulmnObj.sortable = false;
                    coulmnObj.menu = false;
                } else {

                    if (columnArr[f].FilterType == 'Date') {
                        coulmnObj.cellsformat = 'dd/MMM/yyyy hh:mm:ss tt';

                    }

                    coulmnObj.filtertype = "custom";
                    if (columnArr[f].FilterType == 'Text') {
                        coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                    } else if (columnArr[f].FilterType == 'MultiChoice') {
                        if (columnArr[f].ControlType == 'BOOL') {
                            coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                var FilterSource = AppConstants.get(datafield);
                                buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource, true);
                            };
                        } else {
                            coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                                var FilterSource = AppConstants.get(datafield);
                                buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource, false);
                            };
                        }
                    } else if (columnArr[f].FilterType == 'Date') {
                        coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };

                    }
                }

            }
            gridColumnArr.push(coulmnObj);

        };
        var perLength = 100 / gridColumnArr.length + "%";
        if (gridColumnArr.length <= 7) {
            for (var l = 0; l < gridColumnArr.length; l++) {
                var widthObj = new Object();
                gridColumnArr[l].width = perLength;
            }

        }

        var InitGridStoragObj = initGridStorageObj(gID);
        var gridStorage = InitGridStoragObj.gridStorage;
        var adStorage = InitGridStoragObj.adStorage;

        var source =
        {
            dataType: "json",
            dataFields: gridStorage[0].dataFields,
            root: 'ReportResults',
            type: "POST",
            data: param,
            url: AppConstants.get('API_URL') + "/GetReportByName",
            contentType: 'application/json',
            //sortcolumn: 'SERIALNUMBER',
            //sortdirection: 'asc',
            beforeprocessing: function (data) {
                if (data.getReportByNameResp)
                    data.getReportByNameResp = $.parseJSON(data.getReportByNameResp);
                else
                    data.getReportByNameResp = [];

                if (data.getReportByNameResp.PaginationResponse) {

                    source.totalrecords = data.getReportByNameResp.PaginationResponse.TotalRecords;
                    source.totalpages = data.getReportByNameResp.PaginationResponse.TotalPages;

                } else {
                    source = [];
                    source.totalrecords = 0;
                    source.totalpages = 0;
                }
            },

        };

        var dataAdapter = new $.jqx.dataAdapter(source,
            {
                formatData: function (data) {
                    if (!isAdvancedSavedSearchApplied || koUtil.isSearchCancelled() == true) {
                        $("#" + gID).jqxGrid('showloadelement');
                        $('.all-disabled').show();
                    } else {
                        $("#" + gID).jqxGrid('hideloadelement');
                    }
                    ///disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefreshReports']);
                    if (isFromBlankGrid == false) {
                        columnSortFilterforeport = columnSortFilterFormatedDataForReports(columnSortFilterforeport, gID, gridStorage, 'DeviceSearchFilter');

                        param.getReportByNameReq.ColumnSortFilter = columnSortFilterforeport;
                        param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_NONE");

                        var adStorage = JSON.parse(sessionStorage.getItem(gID + "adStorage"));
                        if (adStorage[0].isAdSearch == 0) {
                            if (adStorage[0].adSearchObj) {
                                ADSearchUtil.deviceSearchObj = adStorage[0].adSearchObj;
                            } else {
                                ADSearchUtil.deviceSearchObj = null;
                            }
                        } else {
                            if (adStorage[0].quickSearchObj) {
                                ADSearchUtil.deviceSearchObj = adStorage[0].quickSearchObj;
                            } else {
                                ADSearchUtil.deviceSearchObj = null;
                            }
                        }

                        if (ADSearchUtil.deviceSearchObj) {
                            param.getReportByNameReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                            param.getReportByNameReq.DeviceSearch.SearchCriteria = ADSearchUtil.SearchCriteria;
                        } else {
                            param.getReportByNameReq.DeviceSearch = null;
                        }

                        //if (param.getReportByNameReq.DeviceSearch == null && param.getReportByNameReq.ColumnSortFilter.FilterList==null) {
                        //    param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_NONE");
                        //} else if (param.getReportByNameReq.DeviceSearch == null) {
                        //    param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_DEVICE_SEARCH");
                        //} else if (param.getReportByNameReq.ColumnSortFilter.FilterList == null) {
                        //    param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_COLUMNFILTER");
                        //}

                        if (isReset == true) {
                            isReset = false;
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_ALL");
                        }
                        if (isResetFilter == 1) {
                            param.getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_COLUMNFILTER");
                        }

                        param.getReportByNameReq.Pagination = getPaginationObject(param.getReportByNameReq.Pagination, gID);

                        updatepaginationOnState(gID, gridStorage, param.getReportByNameReq.Pagination, ADSearchUtil.deviceSearchObj, adStorage);
                    }

                    data = JSON.stringify(param);
                    return data;
                },
                downloadComplete: function (data, status, xhr) {
                    if (data) {
                        enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefreshReports']);
                        if (koUtil.reportName == i18n.t('device_communication_history', { lng: lang })
                            || koUtil.reportName == i18n.t('device_heartBeat_history', { lng: lang })
                            || koUtil.reportName == i18n.t('device_parameters', { lng: lang })
                            || koUtil.reportName == i18n.t('software_downloads_details', { lng: lang })
                            || koUtil.reportName == i18n.t('device_software_status', { lng: lang })) {
                            $("#btnRefreshReports").prop('disabled', false);
                            $("#btnRefreshReports").removeClass('disabled');
                        }
                        if (data.getReportByNameResp) {
                            if (data.responseStatus.StatusCode == AppConstants.get('REPORT_NOT_AVAILABLE')) {
                                var nestedRoutePath = getRouteUrl();
                                var msg = 'Report  ' + nestedRoutePath[4] + ' ' + i18n.t("report_not_available", { lng: lang });
                                openAlertpopup(1, msg);
                            }

                            if (data.getReportByNameResp.ColumnSortFilter != null) {
                                if (data.getReportByNameResp.ColumnSortFilter.FilterList) {
                                    columnSortFilterforeport.FilterList = data.getReportByNameResp.ColumnSortFilter.FilterList;
                                    if ((isAdvancedSavedSearchApplied == false && isSearchReset == false) || isResetFilter == 1) {
                                        columnfilterstring = '';
                                        columnfilterstring = getColumnFilterSearchText(columnSortFilterforeport, gID);
                                        if (columnfilterstring == '') {
                                            showHideSearchCriteria('Filter', 0, columnfilterstring);
                                        } else {
                                            showHideSearchCriteria('Filter', 1, columnfilterstring);
                                        }
                                    } else {
                                        showHideSearchCriteria('Filter', 0, '');
                                    }
                                    fixeddayFilterArray = new Array();
                                    if (columnSortFilterforeport && columnSortFilterforeport.FilterList && columnSortFilterforeport.FilterList.length > 0) {
                                        for (var i = 0; i < columnSortFilterforeport.FilterList.length; i++) {
                                            if (columnSortFilterforeport.FilterList[i].ColumnType == 'Date' && columnSortFilterforeport.FilterList[i].IsFixedDateRange == false) {
                                                if ($.inArray(columnSortFilterforeport.FilterList[i].FilterColumn + gID + 'day', fixeddayFilterArray) < 0) {
                                                    fixeddayFilterArray.push(columnSortFilterforeport.FilterList[i].FilterColumn + gID + 'day');
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    columnSortFilterforeport.FilterList = null;
                                    showHideSearchCriteria('Filter', 0, '');
                                }
                                if (data.getReportByNameResp.ColumnSortFilter.GridId != null) {
                                    columnSortFilterforeport.GridId = data.getReportByNameResp.ColumnSortFilter.GridId;
                                } else {
                                    columnSortFilterforeport.GridId = null;
                                }
                                if (data.getReportByNameResp.ColumnSortFilter.SortList) {
                                    columnSortFilterforeport.SortList = data.getReportByNameResp.ColumnSortFilter.SortList;
                                } else {
                                    columnSortFilterforeport.SortList = null;
                                }
                                //columnSortFilterforeport = data.getReportByNameResp.ColumnSortFilter;
                            } else {
                                showHideSearchCriteria('Filter', 0, '');
                            }

                            if (!_.isEmpty(ADSearchUtil.deviceSearchObj)) {
                                if (ADSearchUtil.deviceSearchObj.SearchID > 0) {

                                    if (data.getReportByNameResp.AdvancedSearch && data.getReportByNameResp.AdvancedSearch.SearchText) {
                                        showHideSearchCriteria('Search', 1, data.getReportByNameResp.AdvancedSearch.SearchText);
                                    } else {
                                        if (ADSearchUtil.deviceSearchObj.SearchText != "") {
                                            $("#deviceCriteriaDiv").removeClass('hide');
                                            $("#resetBtnForGrid").removeClass("hide");
                                        } else {
                                            showHideSearchCriteria('Search', 0, '');
                                        }
                                    }
                                } else {
                                    if (ADSearchUtil.resetAddSerchFlag == '') {
                                        if (data.getReportByNameResp.AdvancedSearch) {
                                            AdSearchObjForCustomeSavedReport = data.getReportByNameResp.AdvancedSearch;
                                            updateAdSearchObj(gID, ADSearchUtil.deviceSearchObj, 0);
                                            ClearAdSearchObjForReport = 1;

                                            if (data.getReportByNameResp.AdvancedSearch.SearchText) {
                                                showHideSearchCriteria('Search', 1, data.getReportByNameResp.AdvancedSearch.SearchText);
                                            }
                                        } else {
                                            if (ADSearchUtil.deviceSearchObj.SearchText != "") {
                                                $("#deviceCriteriaDiv").removeClass('hide');
                                                $("#resetBtnForGrid").removeClass("hide");
                                            } else {
                                                showHideSearchCriteria('Search', 0, '');
                                            }
                                            AdSearchObjForCustomeSavedReport = '';
                                        }
                                    }
                                }
                            } else {
                                if (ADSearchUtil.resetAddSerchFlag == '') {
                                    if (data.getReportByNameResp.AdvancedSearch) {
                                        AdSearchObjForCustomeSavedReport = data.getReportByNameResp.AdvancedSearch;
                                        ClearAdSearchObjForReport = 1;

                                        if (data.getReportByNameResp.AdvancedSearch.SearchText) {
                                            showHideSearchCriteria('Search', 1, data.getReportByNameResp.AdvancedSearch.SearchText);
                                        } else {
                                            showHideSearchCriteria('Search', 0, '');
                                        }
                                    } else {
                                        showHideSearchCriteria('Search', 0, '');
                                    }
                                } else {
                                    showHideSearchCriteria('Search', 0, '');
                                    AdSearchObjForCustomeSavedReport = '';
                                }
                            }
                        }

                        if ($("#deviceCriteriaDiv").hasClass('hide') && $("#deviceColumnFilterDiv").hasClass('hide')) {
                            $("#criteriabtnDiv").css("display", "none");
                        } else {
                            $("#criteriabtnDiv").css("display", "inline");
                        }

                        if (data.getReportByNameResp.ReportResults) {
                            var id = parseInt(koUtil.reportId);
                            var source = '';
                            if (koUtil.categoryName == 'Custom') {
                                source = _.where(koUtil.reportData.CustomReports, { "ReportId": id });
                            } else {
                                source = _.where(koUtil.reportData.StandardReports, { "ReportId": id });
                            }
                            var xml = source[0].ReportDefinitionXML;

                            IsMongoEnabled = source[0].IsMongoEnabled;


                            JsonXmlData = $.xml2json(xml);

                            var columnArr = new Array();
                            columnArr = JsonXmlData.Columns.Column;
                            if (columnArr && !$.isArray(columnArr)) {
                                columnArr = $.makeArray(columnArr);
                            }
                            //for (var c = 0; c < data.getReportByNameResp.ReportResults.length; c++) {
                            //    data.getReportByNameResp.ReportResults[c]['Col10'] = jsonDateConversion(data.getReportByNameResp.ReportResults[c]['Col10'], 'DD/MMM/YYYY hh:mm:ss A');//'Date(1432741705000+0530)';
                            //}

                            var sourceFildeArr = new Array();
                            if (data.getReportByNameResp.ReportResults.length > 0) {

                                var taskIds = new Array();
                                for (var c = 0; c < data.getReportByNameResp.ReportResults.length; c++) {
                                    var fieldObj = new Object();
                                    for (var j = 0; j < columnArr.length; j++) {
                                        var field = columnArr[j].Field;
                                        fieldObj = fieldObj;
                                        k = j + 1;

                                        if (columnArr[j].FilterType == 'Date') {
                                            if (data.getReportByNameResp.ReportResults[c]['Col' + k] != '') {
                                                var newDate = new Date(data.getReportByNameResp.ReportResults[c]['Col' + k]);
                                                var yearTodisplay = newDate.getFullYear();

                                                if (yearTodisplay < '2001') {
                                                    data.getReportByNameResp.ReportResults[c]['Col' + k] = '';
                                                } else {
                                                    var checkDate = data.getReportByNameResp.ReportResults[c]['Col' + k].split(' ');
                                                    if (checkDate[1] && columnArr[j].Field != "MANUFACTUREDATE*") {
                                                        data.getReportByNameResp.ReportResults[c]['Col' + k] = moment(data.getReportByNameResp.ReportResults[c]['Col' + k]).format(LONG_DATETIME_FORMAT_AMPM).trim();
                                                    } else {
                                                        data.getReportByNameResp.ReportResults[c]['Col' + k] = moment(data.getReportByNameResp.ReportResults[c]['Col' + k]).format(LONG_DATE_FORMAT).trim();
                                                    }
                                                }
                                            }
                                        }

                                        if (columnArr[j].ControlType == 'Link') {
                                            var ChildGridParams = childReportParams.split(',');
                                            var UserKeyId = data.getReportByNameResp.ReportResults[c][ChildGridParams[0]];
                                            var userCount = data.getReportByNameResp.ReportResults[c]['Col' + k].trim();
                                            UserKeyId = "'" + UserKeyId + "'";

                                            fieldObj[field] = '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="View Details" tabindex="0"  id="UserCountId" class="UserCountClass" style="text-decoration:underline;"  onClick=openGetUserCountDetails(' + UserKeyId + ')>' + userCount + '</a></div>';
                                            //fieldObj[field] = '<div style="padding-left:5px;padding-top:7px;cursor:pointer;"> <a title="View Details"  id="UserCountId" style="text-decoration:underline;"  onClick=openGetUserCountDetails(' + UserKeyId + ')>' + userCount + '</a></div>';
                                        } else {
                                            fieldObj[field] = data.getReportByNameResp.ReportResults[c]['Col' + k].trim();
                                        }

                                        // fieldObj[field] = data.getReportByNameResp.ReportResults[c]['Col' + k];

                                    }

                                    sourceFildeArr.push(fieldObj);

                                }

                            }

                            ///formation of sourcefieldarr
                            sourceDataFieldsArr = [];
                            for (var f = 0; f < columnArr.length; f++) {
                                var fieldObj = new Object();
                                fieldObj.name = columnArr[f].Field;
                                fieldObj.map = columnArr[f].Field;
                                if (columnArr[f].FilterType == 'Date') {
                                    fieldObj.type = 'date';
                                }

                                sourceDataFieldsArr.push(fieldObj);
                            };
                            var fieldObj = new Object();
                            fieldObj.name = 'isSelected';
                            fieldObj.type = 'number';
                            sourceDataFieldsArr.push(fieldObj);

                            source.dataFields = sourceDataFieldsArr;
                            data.getReportByNameResp.ReportResults = sourceFildeArr

                        } else {
                            data.getReportByNameResp.ReportResults = [];
                        }

                        if (isAdvancedSavedSearchApplied && koUtil.isSearchCancelled() == false) {
                            $("#searchInProgress").modal('hide');
                            $("#AdvanceSearchModal").modal('hide');
                            koUtil.isHierarchyModified(false);
                            koUtil.isAttributeModified(false);
                            modelPopup('unloadTemplate');
                        } else {
                            $('.all-disabled').hide();
                        }
                        $("#" + gID).jqxGrid('hideloadelement');
                        isAdvancedSavedSearchApplied = false;
                        koUtil.isSearchCancelled(false);
                    }
                },
                loadError: function (jqXHR, status, error) {
                    $('.all-disabled').hide();
                }

            }
        );

        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelDate = function (filterPanel, datafield) {
            genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);
        }
        var buildFilterPanelMultiChoice = function (filterPanel, datafield, name, isBool) {
            genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name, isBool);
            //genericBuildFilterPanelMultiChoiceForReport(filterPanel, datafield, dataAdapter, gID, name, columnSortFilterforeport);

        }

        var gridCoulmns = [];
        gridCoulmns = gridColumnArr;
        gridStorage[0].columnsArr = gridCoulmns;

        $("#" + gID).jqxGrid(
            {

                width: "100%",
                //height: gridheight,
                height: gridHeightFunction(gID, "1"),
                pageable: true,
                editable: false,
                source: dataAdapter,
                altRows: true,
                virtualmode: true,
                pageSize: AppConstants.get('REPORTSROWPERPAGE'),
                filterable: true,
                sortable: true,
                columnsResize: true,
                columnsreorder: false,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                autoshowcolumnsmenubutton: false,
                rowsheight: 32,
                enabletooltips: true,
                autoshowfiltericon: true,
                columns: gridCoulmns,
                rendergridrows: function () {
                    return dataAdapter.records;
                },

                ready: function () {
                    callOnGridReadyForReport(gID, gridStorage, columnSortFilterforeport)
                    if (isFromBlankGrid == false) {
                        addDefaultfilterForReport(columnSortFilterforeport, gID);
                    } else {
                        isFromBlankGrid = false;
                        addDefaultfilterForReport(columnSortFilterforeport, gID);
                    }

                    var columns = genericHideShowColumn(gID, true, []);
                    koUtil.gridColumnList = new Array();
                    for (var i = 0; i < columns.length; i++) {
                        koUtil.gridColumnList.push(columns[i].columnfield);
                    }
                    visibleColumnsList = koUtil.gridColumnList;
                    var gridheight = $(window).height();
                    if (koUtil.reportName == i18n.t('device_communication_history', { lng: lang })
                        || koUtil.reportName == i18n.t('device_heartBeat_history', { lng: lang })
                        || koUtil.reportName == i18n.t('device_parameters', { lng: lang })
                        || koUtil.reportName == i18n.t('software_downloads_details', { lng: lang })
                        || koUtil.reportName == i18n.t('device_software_status', { lng: lang })) {
                        gridheight = blankGridHeight;
                    } else {
                        gridheight = (gridheight - $("#" + gID).offset().top) - $(".fixed-footer").height() - 50;
                    }
                    $("#" + gID).jqxGrid({ height: gridheight });
                },
            });

        $("#" + gID).on("bindingcomplete", function () {

            $('.jqx-grid-pager').css("display", "inline");
            $('.jqx-grid-pager').css("z-index", "-1");
            generateGenericPager('reportPaginationDiv', gID, false, flageforDeviceZone);

            if (gridStorage[0].isGridReady == 1) {
                //alert('isGridReady   ' + gridStorage[0].isGridReady);
                gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
            }
        });

        callGridFilter(gID, gridStorage);
        $("#" + gID).on("sort", function () {
            $("#" + gID).jqxGrid('updatebounddata');
        });
    }

    function createdeviceSearchObject(advanceSearchObj) {
        var deviceSearch = new Object();
        //FIll Hierarchy data
        deviceSearch.GroupIds = new Array();
        deviceSearch.HierarchyIdsWithChildren = new Array();
        deviceSearch.HierarchyIdsWithoutChildren = new Array();
        deviceSearch.SearchModels = new Array();
        deviceSearch.SearchElements = new Array();
        if (advanceSearchObj.AdvancedSearchHierarcy) {
            deviceSearch.IsHierarchiesSelected = true;
            for (var i = 0; i < advanceSearchObj.AdvancedSearchHierarcy.length; i++) {
                if (advanceSearchObj.AdvancedSearchHierarcy[i].IncludeChildren) {
                    deviceSearch.HierarchyIdsWithChildren.push(advanceSearchObj.AdvancedSearchHierarcy[i].HierarchyId);
                } else {
                    deviceSearch.HierarchyIdsWithoutChildren.push(advanceSearchObj.AdvancedSearchHierarcy[i].HierarchyId);
                }
            }
        }
        else {
            deviceSearch.IsHierarchiesSelected = false;
            for (var j = 0; j < advanceSearchObj.AdvancedSearchGroup.length; j++) {
                deviceSearch.GroupIds.push(advanceSearchObj.AdvancedSearchGroup[j].GroupId);
            }
        }
        if (advanceSearchObj.AdvancedSearchModel)
            deviceSearch.SearchModels = advanceSearchObj.AdvancedSearchModel;
        if (advanceSearchObj.AdvanedSearchElement)
            deviceSearch.SearchElements = advanceSearchObj.AdvanedSearchElement;
        deviceSearch.IsPrivateSearch = advanceSearchObj.IsPrivateSearch;
        deviceSearch.IsOnlyDeleteBlacklisted = false;
        deviceSearch.SearchType = ENUM.get("DEVICESEARCH");
        deviceSearch.SearchCriteria = deviceSearch.SearchText = advanceSearchObj.SearchText;
        deviceSearch.SearchID = 0;
        deviceSearch.SearchName = advanceSearchObj.SearchName;
        deviceSearch.DeviceStatus = new Array();
        if (advanceSearchObj.AdvancedSearchStatus) {
            for (var k = 0; k < advanceSearchObj.AdvancedSearchStatus.length; k++) {
                deviceSearch.DeviceStatus.push(advanceSearchObj.AdvancedSearchStatus[k].DeviceStatus);
            }
        }

        return deviceSearch;
    }

    function showHideSearchCriteria(searchType, displayType, searchText) {
        if (searchType == 'Search') {
            if (displayType == 0) {
                $("#deviceCriteriaDiv").empty();
                $("#deviceCriteriaDiv").addClass('hide');
            } else {
                $("#resetBtnForGrid").removeClass("hide");
                $("#deviceCriteriaDiv").removeClass('hide');
                $("#deviceCriteriaDiv").empty();
                $("#deviceCriteriaDiv").append(searchText);
            }
        } else if (searchType == 'Filter') {
            if (displayType == 0) {
                $("#deviceColumnFilterDiv").empty();
                $("#deviceColumnFilterDiv").addClass('hide');
            } else {
                $("#deviceColumnFilterDiv").removeClass('hide');
                $("#deviceColumnFilterDiv").empty();
                $("#deviceColumnFilterDiv").append("Column Filter : " + searchText);
            }
        }
    }


    function columnSortFilterFormatedDataForReports(ColumnSortFilter, gridId, gridStorage, grididforfilter) {
        isFilterSearch = true;
        var columnArr = new Array();
        var isDateFilterAdded = false;
        columnArr = JsonXmlData.Columns.Column;
        if (columnArr && !$.isArray(columnArr)) {
            columnArr = $.makeArray(columnArr);
        }
        var filterInfo = $("#" + gridId).jqxGrid('getfilterinformation');
        var sortInfo = $("#" + gridId).jqxGrid('getsortinformation');


        if (filterInfo.length > 0) {
            var filterList = new Array();
            var columnFilter;
            for (i = 0; i < filterInfo.length; i++) {
                columnFilter = new Object();
                columnFilter.FilterValue = '';
                for (var k = 0; k < filterInfo[i].filter.getfilters().length; k++) {
                    var checkval = filterInfo[i].filter.getfilters()[k].value;
                    var source = _.where(checkval, { ColumnType: 'Date' });

                    if (source != '') {
                        isDateFilterAdded = true;
                        columnFilter.ColumnType = source[0].ColumnType;
                        if ($.inArray(filterInfo[i].filtercolumn + gridId + 'day', fixeddayFilterArray) < 0) {
                            fixeddatechecKInternal = filterInfo[i].filtercolumn + gridId + 'Int';
                            columnFilter.FilterDays = 0;
                            if (source[0].FilterDays != undefined && source[0].FilterDays != 0) {
                                columnFilter.FilterDays = source[0].FilterDays;
                            }
                            fixeddayFilter = '';
                            columnFilter.IsFixedDateRange = true;
                            if (columnFilter.FilterDays != 0 && source[0].IsFixedDateRange != undefined) {
                                columnFilter.IsFixedDateRange = source[0].IsFixedDateRange;
                            }
                        } else {

                            fixeddayFilter = filterInfo[i].filtercolumn + gridId + 'day';
                            columnFilter.FilterDays = source[0].FilterDays;
                            fixeddatechecKInternal = '';
                            columnFilter.IsFixedDateRange = false;
                        }

                        columnFilter.FilterValue = source[0].FilterValue;
                        columnFilter.FilterValueOptional = source[0].FilterValueOptional;

                    } else {
                        source = _.where(checkval, { ColumnType: 'BOOL' });
                        if (source != '') {
                            columnFilter.ColumnType = source[0].ColumnType;
                            columnFilter.FilterValue = source[0].FilterValue + '^';
                        } else {
                            columnFilter.FilterValue += filterInfo[i].filter.getfilters()[k].value + '^';
                        }

                    }
                }
                if (source == '') {
                    columnFilter.FilterValue = columnFilter.FilterValue.substring(0, columnFilter.FilterValue.length - 1)
                }
                var custfiltercolumn = $("#" + gridId).jqxGrid('getcolumn', filterInfo[i].filtercolumn);
                columnFilter.FilterColumn = filterInfo[i].filtercolumn;
                var xmlsource = _.where(columnArr, { Field: filterInfo[i].filtercolumn });
                columnFilter.FilterTableColumn = (xmlsource[0].DisplayName == AppConstants.get('CreatedBy') || xmlsource[0].DisplayName == AppConstants.get('ModifiedBy') ||
                    xmlsource[0].DisplayName == AppConstants.get('ScheduledBy') || xmlsource[0].DisplayName == AppConstants.get('ClosedBy') ||
                    xmlsource[0].DisplayName == AppConstants.get('User')
                    ? filterInfo[i].filtercolumn : xmlsource[0].TableName + '.' + filterInfo[i].filtercolumn);
                columnFilter.ColumnType = xmlsource[0].FilterType;

                columnFilter.FilterValue = columnFilter.FilterColumn === 'IsAutoDownloadJob' ?
                    (columnFilter.FilterValue === AppConstants.get('Manual') ? 'False' : 'True') : columnFilter.FilterValue;

                if (!_.isEmpty(columnFilter.FilterValue)) {
                    filterList.push(columnFilter);
                }
            }

            if (koUtil.reportName == i18n.t('device_communication_history', { lng: lang }) && isFromBlankGrid) {
                if (isDateFilterAdded == false) {
                    var filterObject = new Object();

                    filterObject.ColumnType = "Date";
                    filterObject.FilterColumn = "MessageProcessedOn";
                    filterObject.FilterDays = 1;
                    filterObject.FilterTableColumn = "DeviceCommunicationHistory.MessageProcessedOn";
                    filterObject.FilterValue = moment().subtract(1, 'days').format('MM/DD/YYYY');
                    filterObject.FilterValueOptional = moment().format('MM/DD/YYYY');
                    filterObject.IsFixedDateRange = false;
                    fixeddayFilter = 'MessageProcessedOnreprotGridday';
                    fixeddatechecKInternal = '';
                    fixeddayFilterArray.push(fixeddayFilter);
                    filterList.push(filterObject);
                }
            }

            ColumnSortFilter.FilterList = filterList;
        }
        else {
            ColumnSortFilter.FilterList = null;
            gridStorage[0].filterflage = 0;
            var updatedGridStorage = JSON.stringify(gridStorage);
            window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
        }

        if (sortInfo.sortcolumn == 'undefined' || sortInfo.sortcolumn == null) {
            if (ColumnSortFilter.SortList) {
                ColumnSortFilter.SortList = ColumnSortFilter.SortList;
            }
        }
        else {
            var SortList = new Array();
            var ColumnSort = new Object();
            ColumnSort.SortColumn = sortInfo.sortcolumn;//custSortColumn.text;
            var xmlsource = _.where(columnArr, { Field: sortInfo.sortcolumn });

            ColumnSort.SortTableColumn = (xmlsource[0].DisplayName == AppConstants.get('CreatedBy') || xmlsource[0].DisplayName == AppConstants.get('ModifiedBy') ||
                xmlsource[0].DisplayName == AppConstants.get('ScheduledBy') || xmlsource[0].DisplayName == AppConstants.get('ClosedBy') ||
                xmlsource[0].DisplayName == AppConstants.get('User')) ? sortInfo.sortcolumn : xmlsource[0].TableName + '.' + sortInfo.sortcolumn;
            if (sortInfo.sortdirection.ascending) {
                ColumnSort.SortOrder = "ascending";
            } else {
                ColumnSort.SortOrder = "descending";
            }
            SortList.push(ColumnSort);
            ColumnSortFilter.SortList = SortList;

            if (koUtil.reportName == i18n.t('device_communication_history', { lng: lang }) && isFromBlankGrid) {
                if (isDateFilterAdded == false) {
                    var filterObject = new Object();
                    var filterList = new Array();

                    filterObject.ColumnType = "Date";
                    filterObject.FilterColumn = "MessageProcessedOn";
                    filterObject.FilterDays = 1;
                    filterObject.FilterTableColumn = "DeviceCommunicationHistory.MessageProcessedOn";
                    filterObject.FilterValue = moment().subtract(1, 'days').format('MM/DD/YYYY');
                    filterObject.FilterValueOptional = moment().format('MM/DD/YYYY');
                    filterObject.IsFixedDateRange = false;
                    fixeddayFilter = 'MessageProcessedOnreprotGridday';
                    fixeddatechecKInternal = '';
                    fixeddayFilterArray.push(fixeddayFilter);
                    filterList.push(filterObject);
                    ColumnSortFilter.FilterList = filterList;
                }
            }
        }

        return ColumnSortFilter;
    }

    function getParamForReport(isExport, columnSortFilterreprot, selectedDevices, unselectedDevices, checkAll, reportId, deviceSearchObj, visibleColumns) {
        var getReportByNameReq = new Object();
        var Pagination = new Object();
        var Selector = new Object();
        var DeviceSearch = new Object();
        var HierarchyIdsWithChildren = new Object();

        HierarchyIdsWithChildren.long = 0;

        Pagination.PageNumber = 1;
        Pagination.RowsPerPage = AppConstants.get('REPORTSROWPERPAGE'),

            Selector.SelectedItemIds = null;
        Selector.UnSelectedItemIds = null;

        DeviceSearch.DeviceStatus = null;
        DeviceSearch.GroupIds = null;
        DeviceSearch.HierarchyIdsWithChildren = HierarchyIdsWithChildren;
        DeviceSearch.HierarchyIdsWithoutChildren = null;
        DeviceSearch.IsHierarchiesSelected = false;
        DeviceSearch.IsOnlyDeleteBlacklisted = false;
        DeviceSearch.SearchCriteria = null;
        DeviceSearch.SearchElements = null;
        DeviceSearch.SearchID = 0;
        DeviceSearch.SearchModels = null;
        DeviceSearch.SearchName = null;
        DeviceSearch.SearchText = null;
        DeviceSearch.SearchType = 0;

        var ColumnSortFilter = new Object();
        var FilterList = new Array();
        var coulmnfilter = new Object();
        coulmnfilter.FilterColumn = null;
        coulmnfilter.FilterValue = null;
        FilterList.push(coulmnfilter);
        ColumnSortFilter.FilterList = null;
        ColumnSortFilter.SortList = null;


        var Export = new Object();
        Export.VisibleColumns = visibleColumns;

        if (isExport == true) {
            Export.IsAllSelected = false;
            Export.IsExport = true;

        } else {
            Export.IsAllSelected = false;
            Export.IsExport = false;
        }

        getReportByNameReq.ColumnSortFilter = columnSortFilterreprot;

        if (deviceSearchObj == null) {
            getReportByNameReq.DeviceSearch = null;
        } else {
            getReportByNameReq.DeviceSearch = deviceSearchObj;
        }
        getReportByNameReq.Export = Export;
        getReportByNameReq.Pagination = Pagination;
        getReportByNameReq.ReportId = reportId;
        //if (isResetFilter == 1) {
        //    getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_COLUMNFILTER");
        //} else {
        isResetFilter = 0;
        getReportByNameReq.FilterResetMode = ENUM.get("FILTER_RESET_MODE_NONE");
        // }
        var param = new Object();
        param.token = TOKEN();
        param.getReportByNameReq = getReportByNameReq;
        return param;
    }



    function getFilterSource(datafield) {
        var FilterSource = '';
        if (datafield == 'ModelName') {
            FilterSource = 'Model';
        } else if (datafield == 'ComputedDeviceStatus') {
            FilterSource = 'Device Status';
        }
        else if (datafield == 'SYNCSTATUS') {
            FilterSource = 'SyncStatus';
        }
        return FilterSource;
    }





});



function openGetUserCountDetails(UserKeyId) {
    $('#openModalPopup').modal('show');
    GetAuditLogReportDeviceDetails(UserKeyId);
}

function getChildParamForReport(isExport, columnSortFilterreprot, reportId, visibleColumns) {


    var getChildReportByIdReq = new Object();
    getChildReportByIdReq.ColumnSortFilter = columnSortFilterreprot;
    getChildReportByIdReq.ReportId = reportId;

    var Export = new Object();
    Export.VisibleColumns = visibleColumns;

    if (isExport == true) {
        Export.IsAllSelected = false;
        Export.IsExport = true;

    } else {
        Export.IsAllSelected = false;
        Export.IsExport = false;
    }

    getChildReportByIdReq.ReportId = reportId;
    getChildReportByIdReq.ChildReportId = childReportId;
    getChildReportByIdReq.ChildReportParams = SelectedChildReportParams;
    getChildReportByIdReq.IsMongoEnabled = IsMongoEnabled;
    //var Pagination1 = new Object();
    //Pagination1.PageNumber = 1;
    //Pagination1.RowsPerPage = AppConstants.get('REPORTSROWPERPAGE');
    //getChildReportByIdReq.Pagination = Pagination1;
    getChildReportByIdReq.Export = Export;

    var param = new Object();
    param.token = TOKEN();
    param.getChildReportByIdReq = getChildReportByIdReq;


    return param;
}

function GetAuditLogReportDeviceDetails(UserKeyId) {

    var self = this;
    var getChildReportByIdReq = new Object();
    var childReportParamsCol = new Array();
    var ChildGridParams = childReportParams.split(',');

    for (var i = 0; i < ChildGridParams.length; i++) {
        var ChildReportParam = new Object();
        ChildReportParam.ParamName = ChildGridParams[i];
        ChildReportParam.ParamValue = UserKeyId;
        childReportParamsCol.push(ChildReportParam);
    }
    getChildReportByIdReq.ReportId = reportId;
    getChildReportByIdReq.ChildReportId = childReportId;
    getChildReportByIdReq.ChildReportParams = childReportParamsCol;
    getChildReportByIdReq.IsMongoEnabled = IsMongoEnabled;
    reportMongoEnabled = IsMongoEnabled;
    SelectedChildReportParams = childReportParamsCol;
    var Pagination1 = new Object();
    Pagination1.PageNumber = 1;
    Pagination1.RowsPerPage = AppConstants.get('REPORTSROWPERPAGE');
    getChildReportByIdReq.Pagination = Pagination1;

    var param = new Object();
    param.token = TOKEN();
    param.getChildReportByIdReq = getChildReportByIdReq;

    $('#childGridArea').empty();
    $('#childGridArea').html('<div id="jqxChildGridDetails"></div><div id="reportChildPaginationDiv"></div>')
    getChildReportByIdGrid('jqxChildGridDetails', param);

}

function columnSortFilterFormatedDataForChildReports(ColumnSortFilter, gridId, gridStorage) {
    isFilterSearch = true;
    var columnArr = new Array();
    var isDateFilterAdded = false;
    columnArr = ChildGridXML.Columns.Column;

    if (columnArr && !$.isArray(columnArr)) {
        columnArr = $.makeArray(columnArr);
    }
    var filterInfo = $("#" + gridId).jqxGrid('getfilterinformation');
    var sortInfo = $("#" + gridId).jqxGrid('getsortinformation');


    if (filterInfo.length > 0) {
        var filterList = new Array();
        var columnFilter;
        for (i = 0; i < filterInfo.length; i++) {
            columnFilter = new Object();
            columnFilter.FilterValue = '';
            for (var k = 0; k < filterInfo[i].filter.getfilters().length; k++) {
                var checkval = filterInfo[i].filter.getfilters()[k].value;
                var source = _.where(checkval, { ColumnType: 'Date' });

                if (source != '') {
                    isDateFilterAdded = true;
                    columnFilter.ColumnType = source[0].ColumnType;
                    if ($.inArray(filterInfo[i].filtercolumn + gridId + 'day', fixeddayFilterArray) < 0) {
                        fixeddatechecKInternal = filterInfo[i].filtercolumn + gridId + 'Int';
                        columnFilter.FilterDays = 0;
                        if (source[0].FilterDays != undefined && source[0].FilterDays != 0) {
                            columnFilter.FilterDays = source[0].FilterDays;
                        }
                        fixeddayFilter = '';
                        columnFilter.IsFixedDateRange = true;
                        if (columnFilter.FilterDays != 0 && source[0].IsFixedDateRange != undefined) {
                            columnFilter.IsFixedDateRange = source[0].IsFixedDateRange;
                        }
                    } else {

                        fixeddayFilter = filterInfo[i].filtercolumn + gridId + 'day';
                        columnFilter.FilterDays = source[0].FilterDays;
                        fixeddatechecKInternal = '';
                        columnFilter.IsFixedDateRange = false;
                    }

                    columnFilter.FilterValue = source[0].FilterValue;
                    columnFilter.FilterValueOptional = source[0].FilterValueOptional;

                } else {
                    source = _.where(checkval, { ColumnType: 'BOOL' });
                    if (source != '') {
                        columnFilter.ColumnType = source[0].ColumnType;
                        columnFilter.FilterValue = source[0].FilterValue + '^';
                    } else {
                        columnFilter.FilterValue += filterInfo[i].filter.getfilters()[k].value + '^';
                    }

                }
            }
            if (source == '') {
                columnFilter.FilterValue = columnFilter.FilterValue.substring(0, columnFilter.FilterValue.length - 1)
            }
            var custfiltercolumn = $("#" + gridId).jqxGrid('getcolumn', filterInfo[i].filtercolumn);
            columnFilter.FilterColumn = filterInfo[i].filtercolumn;
            var xmlsource = _.where(columnArr, { Field: filterInfo[i].filtercolumn });
            columnFilter.FilterTableColumn = (xmlsource[0].DisplayName == AppConstants.get('CreatedBy') || xmlsource[0].DisplayName == AppConstants.get('ModifiedBy') ||
                xmlsource[0].DisplayName == AppConstants.get('ScheduledBy') || xmlsource[0].DisplayName == AppConstants.get('ClosedBy') ||
                xmlsource[0].DisplayName == AppConstants.get('User')
                ? filterInfo[i].filtercolumn : xmlsource[0].TableName + '.' + filterInfo[i].filtercolumn);
            columnFilter.ColumnType = xmlsource[0].FilterType;

            columnFilter.FilterValue = columnFilter.FilterColumn === 'IsAutoDownloadJob' ?
                (columnFilter.FilterValue === AppConstants.get('Manual') ? 'False' : 'True') : columnFilter.FilterValue;

            if (!_.isEmpty(columnFilter.FilterValue)) {
                filterList.push(columnFilter);
            }
        }

        ColumnSortFilter.FilterList = filterList;
    }
    else {
        ColumnSortFilter.FilterList = null;
        gridStorage[0].filterflage = 0;
        var updatedGridStorage = JSON.stringify(gridStorage);
        window.sessionStorage.setItem(gridId + 'gridStorage', updatedGridStorage);
    }

    if (sortInfo.sortcolumn == 'undefined' || sortInfo.sortcolumn == null) {
        if (ColumnSortFilter.SortList) {
            ColumnSortFilter.SortList = ColumnSortFilter.SortList;
        }
    }
    else {
        var SortList = new Array();
        var ColumnSort = new Object();
        ColumnSort.SortColumn = sortInfo.sortcolumn;//custSortColumn.text;
        var xmlsource = _.where(columnArr, { Field: sortInfo.sortcolumn });

        ColumnSort.SortTableColumn = (xmlsource[0].DisplayName == AppConstants.get('CreatedBy') || xmlsource[0].DisplayName == AppConstants.get('ModifiedBy') ||
            xmlsource[0].DisplayName == AppConstants.get('ScheduledBy') || xmlsource[0].DisplayName == AppConstants.get('ClosedBy') ||
            xmlsource[0].DisplayName == AppConstants.get('User')) ? sortInfo.sortcolumn : xmlsource[0].TableName + '.' + sortInfo.sortcolumn;
        if (sortInfo.sortdirection.ascending) {
            ColumnSort.SortOrder = "ascending";
        } else {
            ColumnSort.SortOrder = "descending";
        }
        SortList.push(ColumnSort);
        ColumnSortFilter.SortList = SortList;

    }

    return ColumnSortFilter;
}
function getChildReportByIdGrid(gID, param) {
    var sourceDataFieldsArr = [];
    var gridColumnArr = new Array();
    var columnArr = new Array();
    columnArr = ChildGridXML.Columns.Column;

    if (columnArr && !$.isArray(columnArr)) {
        columnArr = $.makeArray(columnArr);
    }


    for (var f = 0; f < columnArr.length; f++) {

        var coulmnObj = new Object();
        coulmnObj.text = i18n.t(columnArr[f].DisplayName, { lng: lang });//columnArr[f].DisplayName;
        coulmnObj.datafield = columnArr[f].Field;
        coulmnObj.editable = false;
        coulmnObj.minwidth = 150;
        //coulmnObj.width = 'auto';
        coulmnObj.enabletooltips = true;
        if (columnArr[f].FilterType == "None") {
            coulmnObj.filterable = false;
            coulmnObj.sortable = false;
            coulmnObj.menu = false;
        } else {
            if (columnArr[f].Field == null || columnArr[f].Field == '') {
                coulmnObj.filterable = false;
                coulmnObj.sortable = false;
                coulmnObj.menu = false;
            } else {

                if (columnArr[f].FilterType == 'Date') {
                    coulmnObj.cellsformat = 'dd/MMM/yyyy hh:mm:ss tt';
                }

                coulmnObj.filtertype = "custom";
                if (columnArr[f].FilterType == 'Text') {
                    coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanel(filterPanel, datafield); };
                } else if (columnArr[f].FilterType == 'MultiChoice') {
                    if (columnArr[f].ControlType == 'BOOL') {
                        coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                            var FilterSource = AppConstants.get(datafield);
                            buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource, true);
                        };
                    } else {
                        coulmnObj.createfilterpanel = function (datafield, filterPanel) {
                            var FilterSource = AppConstants.get(datafield);
                            buildFilterPanelMultiChoice(filterPanel, datafield, FilterSource, false);
                        };
                    }


                } else if (columnArr[f].FilterType == 'Date') {
                    coulmnObj.createfilterpanel = function (datafield, filterPanel) { buildFilterPanelDate(filterPanel, datafield); };

                }
            }
        }
        gridColumnArr.push(coulmnObj);
    };

    var perLength = 100 / gridColumnArr.length + "%";
    if (gridColumnArr.length <= 4) {
        for (var l = 0; l < gridColumnArr.length; l++) {
            var widthObj = new Object();
            gridColumnArr[l].width = perLength;
        }

    }

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
    gridStorageObj.dataFields = sourceDataFieldsArr;
    gridStorageArr.push(gridStorageObj);
    var gridStorage = JSON.stringify(gridStorageArr);
    window.sessionStorage.setItem(gID + 'gridStorage', gridStorage);
    var gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

    var source =
    {
        dataType: "json",
        dataFields: gridStorage[0].dataFields,
        root: 'ReportResults',
        type: "POST",
        data: param,
        url: AppConstants.get('API_URL') + "/GetChildReportById",
        contentType: 'application/json',
        beforeprocessing: function (data) {


            var tempResponse;
            if (data.getChildReportByIdResp)
                tempResponse = $.parseJSON(data.getChildReportByIdResp);
            else
                data.getChildReportByIdResp = [];

            if (tempResponse.EnableExport) {
                $('#btnChildExportToExcel').show();

            }
            else {

                $('#btnChildExportToExcel').hide();

            }

            if (tempResponse.PaginationResponse) {

                source.totalrecords = tempResponse.PaginationResponse.TotalRecords;
                source.totalpages = tempResponse.PaginationResponse.TotalPages;

            } else {
                source = [];
                source.totalrecords = 0;
                source.totalpages = 0;
            }


        },

    };


    if (param.getChildReportByIdReq && param.getChildReportByIdReq.IsMongoEnabled) {

        source.url = AppConstants.get('MONGO_API_URL') + "/report/GetReport"
    }

    var dataAdapter = new $.jqx.dataAdapter(source,
        {
            formatData: function (data) {
                $('.all-disabled').show();
                columnSortFilterforChildreport = columnSortFilterFormatedDataForChildReports(columnSortFilterforChildreport, gID, gridStorage, 'DeviceSearchFilter');
                param.getChildReportByIdReq.ColumnSortFilter = columnSortFilterforChildreport;
                param.getChildReportByIdReq.Pagination = getPaginationObject(param.getChildReportByIdReq.Pagination, gID);


                data = JSON.stringify(param);
                return data;
            },
            downloadComplete: function (data, status, xhr) {
                $('.all-disabled').hide();



                if (data && data.getChildReportByIdResp) {
                    data.getChildReportByIdResp = $.parseJSON(data.getChildReportByIdResp);
                }

                if (data.getChildReportByIdResp.ReportResults) {
                    var columnArr = new Array();
                    columnArr = ChildGridXML.Columns.Column;

                    if (columnArr && !$.isArray(columnArr)) {
                        columnArr = $.makeArray(columnArr);
                    }

                    var sourceFildeArr = new Array();
                    for (var c = 0; c < data.getChildReportByIdResp.ReportResults.length; c++) {
                        var fieldObj = new Object();
                        for (var j = 0; j < columnArr.length; j++) {
                            var field = columnArr[j].Field;
                            k = j + 1;
                            fieldObj[field] = data.getChildReportByIdResp.ReportResults[c]['Col' + k];
                        }
                        sourceFildeArr.push(fieldObj);
                    }

                    ///formation of sourcefieldarr
                    sourceDataFieldsArr = [];
                    for (var f = 0; f < columnArr.length; f++) {
                        var fieldObj = new Object();
                        fieldObj.name = columnArr[f].Field;
                        fieldObj.map = columnArr[f].Field;
                        sourceDataFieldsArr.push(fieldObj);
                    };
                    var fieldObj = new Object();
                    fieldObj.name = 'isSelected';
                    fieldObj.type = 'number';
                    sourceDataFieldsArr.push(fieldObj);

                    source.dataFields = sourceDataFieldsArr;
                    data.getChildReportByIdResp.ReportResults = sourceFildeArr;

                } else {
                    data.getChildReportByIdResp.ReportResults = [];
                }
            },
            loadError: function (jqXHR, status, error) {
                $('.all-disabled').hide();
            }

        }
    );

    //var buildFilterPanel = function (filterPanel, datafield) {
    //    wildfilterForUIGrid(filterPanel, datafield, dataAdapter, 'jqxChildGridDetails', true);
    //}

    var buildFilterPanel = function (filterPanel, datafield) {
        genericBuildFilterPanel(filterPanel, datafield, dataAdapter, gID);
    }
    var buildFilterPanelDate = function (filterPanel, datafield) {
        genericBuildFilterPanelFordate(filterPanel, datafield, dataAdapter, gID);
    }
    var buildFilterPanelMultiChoice = function (filterPanel, datafield, name, isBool) {
        genericBuildFilterPanelMultiChoice(filterPanel, datafield, dataAdapter, gID, name, isBool);
    }

    var gridCoulmns = [];
    gridCoulmns = gridColumnArr;

    gridStorage[0].columnsArr = gridCoulmns;

    $("#" + gID).jqxGrid(
        {

            width: "100%",
            height: gridHeightFunction(gID, "1"),
            pageable: true,
            editable: true,
            source: dataAdapter,
            altRows: true,
            virtualmode: true,
            pageSize: AppConstants.get('REPORTSROWPERPAGE'),
            filterable: true,
            sortable: true,
            columnsResize: true,
            columnsreorder: false,
            selectionmode: 'singlerow',
            theme: AppConstants.get('JQX-GRID-THEME'),
            autoshowcolumnsmenubutton: false,
            rowsheight: 32,
            enabletooltips: true,
            autoshowfiltericon: true,
            columns: gridCoulmns,
            rendergridrows: function () {
                return dataAdapter.records;
            },

            ready: function () {
                addDefaultfilterForReport(columnSortFilterforChildreport, gID);

            },
        });

    $("#" + gID).on("bindingcomplete", function () {

        $('.jqx-grid-pager').css("display", "inline");
        $('.jqx-grid-pager').css("z-index", "-1");
        generateGenericPager('reportChildPaginationDiv', gID, false, flageforDeviceZone);

        if (gridStorage[0].isGridReady == 1) {
            gridStorage[0].isgridState = $("#" + gID).jqxGrid('savestate');
        }
    });

    callGridFilter(gID, gridStorage);
    $("#" + gID).on("sort", function () {
        $("#" + gID).jqxGrid('updatebounddata');
    });



}