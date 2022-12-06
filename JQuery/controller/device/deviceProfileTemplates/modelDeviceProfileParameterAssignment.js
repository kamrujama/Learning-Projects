define(["knockout", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    var selectedRowArrayForSwap = new Array();
    var UniqueParameterArr = new Array();
    var SelectSelectedPackageRow = new Array();
    var girdSelectedArrayForSwap = new Array();
    var selectedTemplateIdsToApplication = new Array();
    //--------------------------
    var state = null;
    checkFlag = 0;
    var getFilterValue = '';
    //---------------------
    backupForGrid = new Array();
    backupForTable = new Array();

    //function for move element in Array
    Array.prototype.moveUp = function (value) {
        var index = this.indexOf(value),
            newPos = index - 1;

        if (index === -1)
            throw new Error("Element not found in array");

        this.splice(index, 1);
        if (index === 0)
            newPos = this.length;
        this.splice(newPos, 0, value);
    };

    Array.prototype.moveDown = function (value) {
        var index = this.indexOf(value),
            newPos = index + 1;

        if (index === -1)
            throw new Error("Element not found in array");

        this.splice(index, 1);
        if (index >= this.length)
            newPos = 0;
        this.splice(newPos, 0, value);
    };

    var maxScheduleContentCount;
    return function getDetailsOfParameterAssignment() {


        var self = this;

        koUtil.getEditDeviceProfile.ApplicationName = koUtil.deviceEditTemplate.ApplicationName;
        koUtil.getEditDeviceProfile.ApplicationVersion = koUtil.deviceEditTemplate.ApplicationVersion;
        koUtil.getEditDeviceProfile.ApplicationId = koUtil.deviceEditTemplate.ApplicationId;
        self.applicationName = ko.observable(koUtil.deviceEditTemplate.ApplicationName);
        self.applicationVersion = ko.observable(koUtil.deviceEditTemplate.ApplicationVersion);
        self.movedArray = ko.observableArray();
        self.packageData = ko.observableArray();
        var leftRightMoveCheckFlagEnableDisableForParam = 1;

        state = null;
        checkFlag = 0;
        getFilterValue = '';


        //----disbaled buttons----
        $('#btnForMoveRightId').addClass('disabled');
        $('#btnForMoveleftId').addClass('disabled');
        $('#btnForAllMoveleftId').addClass('disabled');
        $('#btnMoveItemUpId').addClass('disabled');
        $('#btnMoveItemDownId').addClass('disabled');
        $("#btn_ParameterTemplate").addClass('disabled');


        self.templateFlag = ko.observable(false);
        self.parameterObservableModel = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        modelReposition();
        //hideControls();

        self.openPopup = function (popupName) {
            self.templateFlag(true);
            if (popupName == "modelParameterValuesForTemplateResult") {
                loadelement(popupName, 'device/deviceProfileTemplates');
                $('#modelViewTemplateId').modal('show');
            } else if (popupName == "modelDeviceProfileEditTemplate") {
                loadelement(popupName, 'device/deviceProfileTemplates');
                $('#modelViewTemplateId').modal('show');
            } else if (popupName == "modalAddTemplatFile") {
                loadelement(popupName, 'applicationsLibrary');
                $('#modelViewTemplateId').modal('show');
            }
        }

        self.unloadTempPopup = function (popupName) {
            self.parameterObservableModel('unloadTemplate');
            $('#modelViewTemplateId').modal('hide');

        };

        function loadelement(elementname, controllerId) {
            if (!ko.components.isRegistered(elementname)) {
                generateTemplate(elementname, controllerId);
            }
            self.parameterObservableModel(elementname);
        }

        function generateTemplate(tempname, controllerId) {
            //new template code
            var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
            var viewName = 'controller/' + controllerId + '/' + tempname + '.js';
            ko.components.register(tempname, {
                viewModel: { require: viewName },
                template: { require: 'plugin/text!' + htmlName }
            });
            // end new template code
        }

        function hideControls() {
            if (VHQFlag === false) {
                $('#overrideParametersDiv').hide();			//Override parameters value
                $('#btn_ParameterTemplate').hide();			//Apply button
                $('#btnCancelApplyTemplate').hide();		//Cencel button
            }
        }

        //-----clear filter for tempalet grid------
        self.clearfilterForTemplate = function (gID) {
            clearUiGridFilter(gID);
            $('#' + gID).jqxGrid('clearselection');
            $("#btnForMoveRightId").addClass('disabled');
            columnGroupClickLinkGridStyle('jqxGridForEditParameterTemplateId');
        }


        $('#devicePrfParameterAssgnmentHeader').mouseup(function () {
            $("#devicePrfParameterAssgnment").draggable({ disabled: true });
        });

        $('#devicePrfParameterAssgnmentHeader').mousedown(function () {
            $("#devicePrfParameterAssgnment").draggable({ disabled: false });
        });



        //-----------move data from available parametres to selected parameter--------------------
        self.rightParameterTemplate = function (gID) {
            //------get current state of grid--------
            state = $("#" + gID).jqxGrid('savestate');

            if (girdSelectedArrayForSwap.length > 0 && girdSelectedArrayForSwap != '') {

                var source = _.where(self.movedArray(), { TemplateName: girdSelectedArrayForSwap[0].TemplateName });
                if (source == '') {
                    var dataArray = self.movedArray();

                    //------------User is not allowed to select more than 3 content files per job----------              
                    if (dataArray.length >= maxScheduleContentCount) {
                        openAlertpopup(1, i18n.t('maximum_of_3_parameter_templates_can_be_assigned_to_an_application', { maxScheduleContentCount: maxScheduleContentCount }, { lng: lang }));
                    }
                    else {
                        $("#btnForMoveleftId").removeClass('disabled');
                        $("#btnForAllMoveleftId").removeClass('disabled');

                        self.movedArray.push(girdSelectedArrayForSwap[0]);
                        var selectedsource = _.where(self.packageData(), { TemplateName: girdSelectedArrayForSwap[0].TemplateName });
                        self.packageData.remove(selectedsource[0]);


                        $("#jqxGridForEditParameterTemplateId").jqxGrid('clear');
                        var str = '';
                        str += '<div id="jqxGridForEditParameterTemplateId"></div>';
                        $("#availableParameterTemplateId").empty();
                        $("#availableParameterTemplateId").append(str);
                        jqxGridforAvailableParameterTemplate(self.packageData, 'jqxGridForEditParameterTemplateId', self.openPopup);


                        //----------maintain state in grid-------
                        if (state != null) {
                            $("#" + gID).jqxGrid('loadstate', state);
                        }

                        girdSelectedArrayForSwap = [];

                        var selectedRowIndex = $("#" + gID).jqxGrid('selectedrowindex');
                        var data = $("#" + gID).jqxGrid('getrowdata', selectedRowIndex);
                        girdSelectedArrayForSwap.push(data);

                        //---------------------------------------------------------------------

                        $("#btnMoveItemUpId").addClass('disabled');
                        $("#btnMoveItemDownId").addClass('disabled');
                        $("#btn_ParameterTemplate").removeClass('disabled');
                        checkFlag
                        var datainfo = $("#" + gID).jqxGrid('getdatainformation');
                        if (self.packageData().length > 0) {
                            if (datainfo.rowscount > 0) {
                                $("#btnForMoveRightId").removeClass('disabled');
                                checkFlag = 0; //----------
                            } else {
                                $("#btnForMoveRightId").addClass('disabled');
                            }

                        } else {
                            $("#btnForMoveRightId").addClass('disabled');
                            checkFlag = 1; //----------------
                        }

                        var lenOfTable = self.movedArray().length;
                        var movdataArray = self.movedArray();
                        var selectedid = lenOfTable - 1;


                        $("#tbodySelectedpack").children('tr').removeClass('refselection');

                        var id = '#SelectPackrow' + selectedid + '';
                        $(id).addClass('refselection');
                        selectedRowArrayForSwap = [];

                        selectedRowArrayForSwap.push(movdataArray[selectedid]);
                        if (lenOfTable > 1) {
                            $("#btnMoveItemUpId").removeClass('disabled');
                        } else if (lenOfTable == 1) {
                            $("#btnMoveItemUpId").addClass('disabled');
                            $("#btnMoveItemDownId").addClass('disabled');
                        }

                        //tooltip for tabel
                        tooltipForTableData(self.movedArray);

                        var packgArr = new Array();
                        packgArr = self.packageData();

                        var tabelArr = new Array();
                        tabelArr = self.movedArray();
                        self.enableDisableBtnOnletRightMove();
                        //if (backupForGrid.length == packgArr.length) {
                        //    if (backupForGrid.length > 0) {
                        //        for (var i = 0; i < backupForGrid.length; i++) {
                        //            if (backupForGrid[i] == packgArr[i].TemplateId) {
                        //                $("#btn_ParameterTemplate").addClass('disabled');
                        //            } else {
                        //                $("#btn_ParameterTemplate").removeClass('disabled');
                        //            }
                        //        }
                        //    } else {
                        //        for (var i = 0; i < backupForTable.length; i++) {
                        //            if (backupForTable[i] == tabelArr[i].TemplateId) {
                        //                $("#btn_ParameterTemplate").addClass('disabled');
                        //            } else {
                        //                $("#btn_ParameterTemplate").removeClass('disabled');
                        //            }
                        //        }
                        //    }
                        //}
                    }
                } else {
                    openAlertpopup(1, 'no_row_selected');
                }
            } else {
                openAlertpopup(1, 'no_row_selected');
            }
        }

        //-----------select row from table---------------
        self.SelectSelectedPackageRow = function (data, index) {
            $("#tbodySelectedpack").children('tr').removeClass('refselection');

            var id = '#SelectPackrow' + index + '';
            $(id).addClass('refselection');
            selectedRowArrayForSwap = [];
            selectedRowArrayForSwap.push(data);

            var arr = self.movedArray();
            var selid = arr.length;
            selid = selid - 1;

            if ($("#SelectPackrow" + selid).hasClass('refselection')) {

                $("#btnMoveItemDownId").addClass('disabled');
                $("#btnMoveItemUpId").removeClass('disabled');
            } else {

                if ($("#SelectPackrow0").hasClass('refselection')) {
                    $("#btnMoveItemUpId").addClass('disabled');
                } else {
                    $("#btnMoveItemUpId").removeClass('disabled');
                }
                $("#btnMoveItemDownId").removeClass('disabled');
            }

            if (data) {
                $("#btnForMoveleftId").removeClass('disabled');
            }
        }

        //-----------move data from selected parameter to available parametres--------------------
        self.leftParameterTemplate = function (gID) {
            state = $("#" + gID).jqxGrid('savestate');
            if (selectedRowArrayForSwap.length > 0) {

                var l = self.movedArray.indexOf(selectedRowArrayForSwap[0]);

                if ($("#SelectPackrow0").hasClass('refselection')) {
                    l = 0;
                } else {
                    l = l - 1;
                }

                self.movedArray.remove(selectedRowArrayForSwap[0]);
                self.packageData.push(selectedRowArrayForSwap[0]);


                $("#jqxGridForEditParameterTemplateId").jqxGrid('clear');
                var str = '';
                str += '<div id="jqxGridForEditParameterTemplateId"></div>';
                $("#availableParameterTemplateId").empty();
                $("#availableParameterTemplateId").append(str);
                jqxGridforAvailableParameterTemplate(self.packageData, 'jqxGridForEditParameterTemplateId', self.openPopup);

                //------------------------------------------------------
                if (state != null) {
                    $("#" + gID).jqxGrid('loadstate', state);
                }
                //------------------------------------------------------

                selectedRowArrayForSwap = [];
                girdSelectedArrayForSwap = [];

                var movedArray = self.movedArray();
                selectedRowArrayForSwap.push(movedArray[l]);

                $("#btn_ParameterTemplate").removeClass('disabled');
                if (self.movedArray().length <= 0) {
                    $("#btnForMoveleftId").addClass('disabled');
                    $("#btnForAllMoveleftId").addClass('disabled');
                    //$("#btn_ParameterTemplate").addClass('disabled');
                }


                $("#tbodySelectedpack").children('tr').removeClass('refselection');
                $("#SelectPackrow" + l).addClass('refselection');

                var lenOfTable = self.movedArray().length;

                if (lenOfTable > 1) {
                    $("#btnMoveItemUpId").removeClass('disabled');
                } else {
                    $("#btnMoveItemUpId").addClass('disabled');
                    $("#btnMoveItemDownId").addClass('disabled');
                    $("#btnForMoveRightId").addClass('disabled');
                }

                //----------------------------------------------------
                if (checkFlag == 1) {
                    $("#btnForMoveRightId").addClass('disabled');
                    $('#' + gID).jqxGrid('clearselection');
                } else {
                    $("#btnForMoveRightId").removeClass('disabled');
                    var selectedRowIndex = $("#" + gID).jqxGrid('selectedrowindex');
                    var data = $("#" + gID).jqxGrid('getrowdata', selectedRowIndex);
                    girdSelectedArrayForSwap.push(data);
                }
                //-------------------------------------------------------------

                var packgArr = new Array();
                packgArr = self.packageData();

                //if (backupForGrid.length == packgArr.length) {
                //    for (var i = 0; i < backupForGrid.length; i++) {
                //        if (backupForGrid[i] == packgArr[i].TemplateId) {
                //            $("#btn_ParameterTemplate").addClass('disabled');
                //        } else {
                //            $("#btn_ParameterTemplate").removeClass('disabled');
                //        }
                //    }
                //} else {
                //    $("#btn_ParameterTemplate").removeClass('disabled');
                //}
                self.enableDisableBtnOnletRightMove();

            } else {
                openAlertpopup(1, 'no_row_selected');
            }
            columnGroupClickLinkGridStyle('jqxGridForEditParameterTemplateId');
        }


        //-----------move all parameter from selected parameter to available parametres--------------------
        self.allParameterTemplateMove = function (gID) {
            state = $("#" + gID).jqxGrid('savestate');
            var arr = self.movedArray();
            if (arr.length > 0) {
                for (i = 0; i < arr.length; i++) {
                    self.movedArray([]);
                    $('#btnForMoveRightId').addClass('disabled');
                    $('#btnForMoveleftId').addClass('disabled');
                    $('#btnForAllMoveleftId').addClass('disabled');
                    $('#btnMoveItemUpId').addClass('disabled');
                    $('#btnMoveItemDownId').addClass('disabled');
                    self.packageData.push(arr[i]);
                }
            }
            //$("#btn_ParameterTemplate").addClass('disabled');
            //$("#" + gID).jqxGrid('updatebounddata');

            //$("#" + gID).jqxGrid('refreshData');



            //----------------------------------------------------
            if (state != null) {
                $("#" + gID).jqxGrid('loadstate', state);
            }

            if (getFilterValue.length <= 0) {
                $("#" + gID).jqxGrid('updatebounddata');
            }

            //if (getSortInfo == '') {
            //    $("#" + gID).jqxGrid('updatebounddata');
            //}
            //-------------------------------------------------------------

            $('#' + gID).jqxGrid('clearselection');

            var packgArr = new Array();
            packgArr = self.packageData();

            //if (backupForGrid.length == packgArr.length) {
            //    for (var i = 0; i < backupForGrid.length; i++) {
            //        if (backupForGrid[i] == packgArr[i].TemplateId) {
            //            $("#btn_ParameterTemplate").addClass('disabled');
            //        } else {
            //            $("#btn_ParameterTemplate").removeClass('disabled');
            //        }
            //    }
            //} else {
            //    $("#btn_ParameterTemplate").removeClass('disabled');
            //}
            self.enableDisableBtnOnletRightMove();

            girdSelectedArrayForSwap = [];
            columnGroupClickLinkGridStyle('jqxGridForEditParameterTemplateId');
        }

        //----move up parameter-----
        self.moveItemsUP = function () {
            if (selectedRowArrayForSwap.length > 0) {
                var arr = self.movedArray();
                var index = getArrayIndexForKey(arr, 'TemplateName', selectedRowArrayForSwap[0].TemplateName);

                arr.moveUp(arr[index]);
                self.movedArray(arr);

                var arr = self.movedArray();
                var selid = arr.length;
                selid = selid - 1;

                //var l = selectedParameterTemplatesArr.indexOf(selectedRowArrayForSwap[0]);
                //if ($("#SelectPackrow0").hasClass('refselection')) {
                //    l = 0;
                //} else {
                //    l = l - 1;
                //}
                //$("#SelectPackrow" + l).addClass('refselection');

                if ($("#SelectPackrow" + selid).hasClass('refselection')) {
                    $("#btnMoveItemDownId").addClass('disabled');
                    $("#btnMoveItemUpId").removeClass('disabled');
                } else {
                    if ($("#SelectPackrow0").hasClass('refselection')) {
                        $("#btnMoveItemUpId").addClass('disabled');
                    } else {
                        $("#btnMoveItemUpId").removeClass('disabled');
                    }
                    $("#btnMoveItemDownId").removeClass('disabled');
                }
                self.enableDisableBtnOnletRightMove();
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
        }

        //----move down parameter-----
        self.moveItemsDown = function () {
            if (selectedRowArrayForSwap.length > 0) {
                var arr = self.movedArray();
                var index = getArrayIndexForKey(arr, 'TemplateName', selectedRowArrayForSwap[0].TemplateName);

                arr.moveDown(arr[index]);
                self.movedArray(arr);

                var arr = self.movedArray();
                var selid = arr.length;
                selid = selid - 1;

                //var l = selectedParameterTemplatesArr.indexOf(selectedRowArrayForSwap[0]);
                //$("#SelectPackrow" + l).addClass('refselection');

                if ($("#SelectPackrow" + selid).hasClass('refselection')) {
                    $("#btnMoveItemDownId").addClass('disabled');
                    $("#btnMoveItemUpId").removeClass('disabled');
                } else {
                    if ($("#SelectPackrow0").hasClass('refselection')) {
                        $("#btnMoveItemUpId").addClass('disabled');
                    } else {
                        $("#btnMoveItemUpId").removeClass('disabled');
                    }
                    $("#btnMoveItemDownId").removeClass('disabled');
                }
                self.enableDisableBtnOnletRightMove();

            } else {
                openAlertpopup(1, 'please_selct_row');
            }
        }



        self.enableDisableBtnOnletRightMove = function () {
            var CheckSameTempId = 0;
            var arrayTable = self.movedArray();

            if (backupForTable.length != arrayTable.length) {

                leftRightMoveCheckFlagEnableDisableForParam = 0;
            } else {
                for (var i = 0; i < arrayTable.length; i++) {
                    if (backupForTable[i] == arrayTable[i].TemplateId) {
                        CheckSameTempId++;
                    } else {
                        CheckSameTempId = 0;
                    }
                }
                if (backupForTable.length == CheckSameTempId) {
                    leftRightMoveCheckFlagEnableDisableForParam = 1;
                } else {
                    leftRightMoveCheckFlagEnableDisableForParam = 0;
                }

            }
            if (leftRightMoveCheckFlagEnableDisableForParam == 1) {
                $("#btn_ParameterTemplate").addClass('disabled');
            } else {
                $("#btn_ParameterTemplate").removeClass('disabled');
            }
        }

        function getArrayIndexForKey(arr, key, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][key] == val)
                    return i;
            }
            return -1;
        }
        self.onCheckOverrideDeviceParameterValues = function () {

        }
        self.assignDeviceParameterTemplatesDeviceProfile = function (parameterObservableModel, gID, restoreGridUI) {
            var templateID = selectedTemplateIdsToApplication;
            $('#overrideDeviceParameterValuesPopup').modal('hide');
            setDeviceParametreEditTemplateDetails(templateID, parameterObservableModel, gID, restoreGridUI, true);
        }
        self.cancelAssigningDeviceParameterTemplatesDeviceProfile = function () {
            $('#overrideDeviceParameterValuesPopup').modal('hide');
        }
        //--------set device parameter Template----------- 
        self.saveParametreEditTemplate = function (parameterObservableModel, gID, restoreGridUI) {
            backupForTable = [];
            var templateID = selectedTemplateIdsToApplication;
            var overrideTemplateAssignment = $("#chkOverrideDeviceParameterValues").is(':checked');
            if (overrideTemplateAssignment) {
                $('#overrideDeviceParameterValuesPopup').modal('show');
            } else {
                setDeviceParametreEditTemplateDetails(templateID, parameterObservableModel, gID, restoreGridUI, overrideTemplateAssignment);
            }

        }

        //------Get sysytem configuration-----
        getSystemConfigurationForEditParameterTemplate(koUtil.deviceEditTemplate.ApplicationId, self.movedArray, self.packageData, self.openPopup)

        seti18nResourceData(document, resourceStorage);
    }

    //----dispaly grid for Parameter Template Assignment for Application
    function jqxGridforAvailableParameterTemplate(packageData, gID, openPopup) {

        var source =
        {
            dataType: "json",
            localdata: packageData,
            datafields: [
                { name: 'TemplateId', map: 'TemplateId' },
                { name: 'TemplateName', map: 'TemplateName' },
                { name: 'Description', map: 'Description' },
                { name: 'IsLookupTemplate', map: 'IsLookupTemplate' }
            ]

        };

        var dataAdapter = new $.jqx.dataAdapter(source);

        var parameterRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var parameterToolipMessage = i18n.t('click_to_view_parameter_template', { lng: lang });

            return '<div style="padding-left:5px;padding-top:4px;cursor:pointer;"><a title="' + parameterToolipMessage + '"  id="imageId" style="text-decoration:underline;" height="60" width="50" >View</a></div>'
        }

        var selectRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var templateid = $("#jqxGridForEditParameterTemplateId").jqxGrid('getcellvalue', row, 'TemplateId');
            html = '<div style="margin-left: 10px; margin-top: 5px;"><input id="templateId' + templateid + '"  name="radioOptions" type="radio" onClick="getTemplateRadioButtonValue(' + row + ', event)" value="0"></div>';
            return html;
        }

        var buildFilterPanel = function (filterPanel, datafield) {
            wildfilterForUIGrid(filterPanel, datafield, dataAdapter, gID, true);
        }

        function templateNameRenderer(row, columnfield, value, defaulthtml, columnproperties) {
            return '<span style="margin: 4px; margin-top:7px; float: ' + columnproperties.cellsalign + ';">' + value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</span>';
        }

        $("#" + gID).jqxGrid(
            {
                width: "100%",
                height: "400px",
                source: dataAdapter,
                sortable: true,
                filterable: true,
                selectionmode: 'singlerow',
                theme: AppConstants.get('JQX-GRID-THEME'),
                altrows: true,
                autoshowcolumnsmenubutton: false,
                showsortmenuitems: false,
                editable: true,
                enabletooltips: true,
                columnsResize: true,

                columns: [
                    {
                        text: '', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafiel: 'isSelected', enabletooltips: false, 
                        minwidth: 40, maxwidth: 60, cellsrenderer: selectRenderer
                    },
                    { text: '', dataField: 'TemplateId', hidden: true, editable: false, width: 'auto' },
                    {
                        text: i18n.t('template_name', { lng: lang }), datafield: 'TemplateName', width: 'auto', minwidth: 140, maxwidth: 350, editable: false,
                        filtertype: "custom", cellsrenderer: templateNameRenderer,
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: i18n.t('content_description', { lng: lang }), datafield: 'Description', width: 'auto', minwidth: 140, editable: false,
                        filtertype: "custom",
                        createfilterpanel: function (datafield, filterPanel) {
                            buildFilterPanel(filterPanel, datafield);
                        }
                    },
                    {
                        text: '', columngroup: 'Parameters', datafield: 'View', menu: false, sortable: false, filterable: false, width: 'auto', minwidth: 60,
                        resizable: false, editable: false, enabletooltips: false, cellsrenderer: parameterRenderer
                    },
                    { text: '', columngroup: 'Parameters', filterable: false, sortable: false, menu: false, columntype: 'none', editable: false, datafield: 'DummyColumn', enabletooltips: false, minwidth: 60 }
                ],
                columngroups:
                    [
                        { text: i18n.t('btnParameters', { lng: lang }), datafield: 'Parameters', menu: false, sortable: false, enabletooltips: false, resizable: false, minwidth: 100, editable: false, name: 'Parameters' }
                    ]

            });


        columnGroupClickLinkGridStyle('jqxGridForEditParameterTemplateId');

        $("#" + gID).on("cellclick", function (event) {
            var column = event.args.column;
            var rowindex = event.args.rowindex;
            var columnindex = event.args.columnindex;
            var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);
            if (columnindex == 4) {
                koUtil.addOrEditTemplate = 1;
                koUtil.viewParameterTemplateOnDevice = true;
                koUtil.deviceViewParameterTemplate = rowData;
                koUtil.selectedTemplateId = rowData.TemplateId;
                koUtil.selectedTemplateName = rowData.TemplateName;
                koUtil.selectedTemplateDescription = rowData.Description;
                isLookupTemplate = rowData.IsLookupTemplate;
                openPopup('modalAddTemplatFile');
            } else if (columnindex == 0) {
                $("#templateId" + rowData.TemplateId).prop("checked", true);
                $("#btn_ParameterTemplate").removeClass('disabled');
                var selectedRow = new Object();
                selectedRow.TemplateId = rowData.TemplateId;
                selectedRow.TemplateName = rowData.TemplateName;
                selectedRow.Description = rowData.Description;
                selectedTemplateIdsToApplication = new Array();
                selectedTemplateIdsToApplication.push(selectedRow);
            }
        })

        //--disabled button btnForMoveRightId on sorting------
        $("#" + gID).bind("sort", function (event) {
            $('#btnForMoveRightId').addClass('disabled');
            $('#' + gID).jqxGrid('clearselection');
            checkFlag = 1;
        });

        //--disabled button btnForMoveRightId on filtering------
        $("#" + gID).on("filter", function (event) {
            $('#btnForMoveRightId').addClass('disabled');
            $('#' + gID).jqxGrid('clearselection');
            checkFlag = 1;
            state = $("#" + gID).jqxGrid('savestate');
            getFilterValue = $('#' + gID).jqxGrid('getfilterinformation');
            if (getFilterValue.length <= 0) {
                $("#" + gID).jqxGrid('updatebounddata');
            }
        });
    }

    function getSystemConfigurationForEditParameterTemplate(ApplicationId, movedArray, packageData, openPopup) {
        $("#loadingDiv").show();
        var category = AppConstants.get('SYSTEM');
        var configName = AppConstants.get('MAX_TEMPLATE_ALLOWED_PER_DEVICE');

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    if (data.systemConfiguration)
                        data.systemConfiguration = $.parseJSON(data.systemConfiguration);
                    maxScheduleContentCount = data.systemConfiguration.ConfigValue;

                    //--------------get device for Parameter Template--------
                    getDeviceParameterTemplateDetials(ApplicationId, movedArray, packageData, openPopup);
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                    $("#loadingDiv").hide();
                    Token_Expired();
                }
            }
            if (error) {
                $("#loadingDiv").hide();
            }
        }

        var method = 'GetSystemConfiguration';
        var params = '{"token":"' + TOKEN() + '","category":"' + category + '","configName":"' + configName + '"}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', false);
    }

    function getDeviceParameterTemplateDetials(applicationID, movedArray, packageData, openPopup) {
        var getDeviceParameterTemplatesReq = new Object();
        var deviceProfileUniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;

        getDeviceParameterTemplatesReq.ApplicationId = applicationID;
        getDeviceParameterTemplatesReq.UniqueDeviceId = deviceProfileUniqueDeviceId;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                    if (data && data.getDeviceParameterTemplatesResp) {
                        data.getDeviceParameterTemplatesResp = $.parseJSON(data.getDeviceParameterTemplatesResp);
                    }

                    //------Avilable parameters---------
                    if (data.getDeviceParameterTemplatesResp.AvailableParameterTemplates) {
                        packageData(data.getDeviceParameterTemplatesResp.AvailableParameterTemplates);
                        jqxGridforAvailableParameterTemplate(packageData(), 'jqxGridForEditParameterTemplateId', openPopup);

                        var arr = data.getDeviceParameterTemplatesResp.AvailableParameterTemplates;
                        for (var i = 0; i < arr.length; i++) {
                            backupForGrid[i] = arr[i].TemplateId;
                        }

                    } else {
                        jqxGridforAvailableParameterTemplate([], 'jqxGridForEditParameterTemplateId', openPopup);
                    }

                    //-----SelectedParameterTemplates---
                    if (data.getDeviceParameterTemplatesResp.SelectedParameterTemplates && data.getDeviceParameterTemplatesResp.SelectedParameterTemplates.length > 0) {
                        $("#btnForAllMoveleftId").removeClass('disabled');
                        movedArray(data.getDeviceParameterTemplatesResp.SelectedParameterTemplates);
                        tooltipForTableData(movedArray);

                        var arrtbl = data.getDeviceParameterTemplatesResp.SelectedParameterTemplates;
                        for (var i = 0; i < arrtbl.length; i++) {
                            backupForTable[i] = arrtbl[i].TemplateId;
                        }

                    }
                } else if (data.responseStatus.StatusCode == AppConstants.get('TOKEN_INVALID_OR_EXPIRED')) {
                    $("#loadingDiv").hide();
                    Token_Expired();
                }
            }
            if (error) {
                $("#loadingDiv").hide();
            }
        }

        var method = 'GetDeviceParameterTemplates';
        var params = '{"token":"' + TOKEN() + '","getDeviceParameterTemplatesReq":' + JSON.stringify(getDeviceParameterTemplatesReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);

    }

    function setDeviceParametreEditTemplateDetails(templateID, parameterObservableModel, gID, restoreGridUI, overrideTemplateAssignment) {

        var setDeviceParameterTemplatesForDeviceProfileReq = new Object();
        var templateIds = new Array();
        if (templateID == null || templateID.length == 0) {
            return;
        }
        setDeviceParameterTemplatesForDeviceProfileReq.TemplateId = templateID[0].TemplateId;
        setDeviceParameterTemplatesForDeviceProfileReq.ApplicationId = koUtil.deviceEditTemplate.ApplicationId;
        setDeviceParameterTemplatesForDeviceProfileReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        setDeviceParameterTemplatesForDeviceProfileReq.Override = overrideTemplateAssignment;
        setDeviceParameterTemplatesForDeviceProfileReq.TemplateName = templateID[0].TemplateName;
        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(0, 'p_t_edit_template_assignment');
                    if (_.isEmpty(deviceLiteData)) {
                        $("#modelParameterId").modal('hide');
                        parameterObservableModel('unloadTemplate');
                        gridFilterClear(gID);
                        restoreGridUI();
                        refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
                    } else {
                        $('#deviceProfileModel').modal('hide');
                        refreshDeviceProfileLitePage(AppConstants.get('PARAMETERS_REFRESH_DATA'));
                    }
                } else if (data.responseStatus.StatusCode == AppConstants.get('INSTANCE_ALREADY_EXISTS')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                } else if (data.responseStatus.StatusCode == AppConstants.get('EX_APPLY_TEMPLATE_FAILED')) {    //403
                    openAlertpopup(2, "pt_ex_apply_template_failed");
                }
            }
        }

        var method = 'SetDeviceParameterTemplatesForDeviceProfile';
        var params = '{"token":"' + TOKEN() + '","setDeviceParameterTemplatesForDeviceProfileReq":' + JSON.stringify(setDeviceParameterTemplatesForDeviceProfileReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

    function tooltipForTableData(movedArray) {
        var tootipArr = movedArray();
        for (var j = 0; j < tootipArr.length; j++) {
            var templateName = tootipArr[j].TemplateName;
            var description = tootipArr[j].Description;
            $("#packagespan" + j).prop('title', templateName);
            $("#versionspan" + j).prop('title', description);
        }
    }

});

function getTemplateRadioButtonValue(row, event) {
    if (event.preventDefault) {
        event.preventDefault();
    }
    $("#btn_ParameterTemplate").removeClass('disabled');
    var selectedRow = new Object();
    selectedRow.TemplateId = $("#jqxGridForEditParameterTemplateId").jqxGrid('getcellvalue', row, 'TemplateId');
    selectedRow.TemplateName = $("#jqxGridForEditParameterTemplateId").jqxGrid('getcellvalue', row, 'TemplateName');
    selectedRow.Description = $("#jqxGridForEditParameterTemplateId").jqxGrid('getcellvalue', row, 'Description');
    selectedTemplateIdsToApplication = new Array();
    selectedTemplateIdsToApplication.push(selectedRow);
}