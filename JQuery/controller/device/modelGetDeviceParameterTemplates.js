define(["knockout", "koUtil", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen"], function (ko, koUtil, ADSearchUtil) {
    var lang = getSysLang();

    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

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

    var selectedRowArrayForSwap = new Array();
    var gridSeletedRowArryForParameter = new Array();
    var selectedTemplateIdsToApplication = new Array();

    var state = null;
    checkFlag = 0;
    var getFilterValue = '';
    return function getDetailsOfDeviceParameterTemplate() {
       
        var self = this;
        
        self.applicationName = ko.observable(koUtil.deviceEditTemplate.ApplicationName);
        self.applicationVersion = ko.observable(koUtil.deviceEditTemplate.ApplicationVersion);
        self.movedArray = ko.observableArray();
        self.packageData = ko.observableArray();

        state = null;
        checkFlag = 0;
        getFilterValue = '';

        //----disbaled buttons----
        $('#btnForMoveRightId').addClass('disabled');
        $('#btnForMoveleftId').addClass('disabled');
        $('#btnForAllMoveleftId').addClass('disabled');
        $('#btnMoveItemUpId').addClass('disabled');
        $('#btnMoveItemDownId').addClass('disabled');
        $("#btnSaveTemplateAssignment").addClass('disabled');

        self.templateFlag = ko.observable(false);
        self.parameterObservableModel = ko.observable();

        var modelname = 'unloadTemplate';
        loadelement(modelname, 'genericPopup');
        modelReposition();
        self.openPopup = function (popupName) {
            self.templateFlag(true);
            if (popupName == "modelViewParameterResult") {
                loadelement(popupName, 'device');
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
            $("#modelViewTemplateId").modal('hide');
            checkIsPopUpOPen();
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

        //-----clear filter for tempalet grid------
        self.clearFilter = function (gID) {
            clearUiGridFilter(gID);
            $('#' + gID).jqxGrid('clearselection');
            $("#btnForMoveRightId").addClass('disabled');
            columnGroupClickLinkGridStyle('jqxgridParameterTemplatesDeviceSearch');
        }


        $('#mdlGetDeviceTemplateHeader').mouseup(function () {
            $("#mdlGetDeviceTemplate").draggable({ disabled: true });
        });

        $('#mdlGetDeviceTemplateHeader').mousedown(function () {
            $("#mdlGetDeviceTemplate").draggable({ disabled: false });
        });




        //-----------move data from available parametres to selected parameter--------------------
        self.rightParameterTemplate = function (gID) {

            //------get current state of grid--------
            state = $("#" + gID).jqxGrid('savestate');

            if (gridSeletedRowArryForParameter.length > 0 && gridSeletedRowArryForParameter != '') {
                var source = _.where(self.movedArray(), { TemplateName: gridSeletedRowArryForParameter[0].TemplateName });
                if (source == '') {
                    var dataArray = self.movedArray();
                    //------------User is not allowed to select more than 3 content files per job----------              
                    if (dataArray.length > maxScheduleContentCount) {
                        openAlertpopup(1, i18n.t('maximum_of_3_parameter_templates_can_be_assigned_to_an_application', { maxScheduleContentCount: maxScheduleContentCount }, { lng: lang }));
                    }
                    else {
                        $("#btnForMoveleftId").removeClass('disabled');
                        $("#btnForAllMoveleftId").removeClass('disabled');

                        self.movedArray.push(gridSeletedRowArryForParameter[0]);
                        var selectedsource = _.where(self.packageData(), { TemplateName: gridSeletedRowArryForParameter[0].TemplateName });
                        self.packageData.remove(selectedsource[0]);

                        $("#jqxgridParameterTemplatesDeviceSearch").jqxGrid('clear');
                        var str = '';
                        str += '<div id="jqxgridParameterTemplatesDeviceSearch"></div>';
                        $("#availableParameterTemplateId").empty();
                        $("#availableParameterTemplateId").append(str);
                        jqxGridforAvailableParameterTemplate(self.packageData, 'jqxgridParameterTemplatesDeviceSearch', self.openPopup);

                        //----------maintain state in grid-------
                        if (state != null) {
                            $("#" + gID).jqxGrid('loadstate', state);
                        }
                        gridSeletedRowArryForParameter = [];

                        var selectedRowIndex = $("#" + gID).jqxGrid('selectedrowindex');
                        var data = $("#" + gID).jqxGrid('getrowdata', selectedRowIndex);
                        gridSeletedRowArryForParameter.push(data);

                        //---------------------------------------------------------------------

                        $("#btnMoveItemUpId").addClass('disabled');
                        $("#btnMoveItemDownId").addClass('disabled');
                        $("#btnSaveTemplateAssignment").removeClass('disabled');

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
                        //selectedRowArrayForSwap = [];                       
                    }
                } else {
                    openAlertpopup(1, 'no_row_selected');
                }
            } else {
                openAlertpopup(1, 'no_row_selected');
            }
            columnGroupClickLinkGridStyle('jqxgridParameterTemplatesDeviceSearch');
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

            if (index == 0) {
                if (selid == 0) {
                    $("#btnMoveItemDownId").addClass('disabled');
                    $("#btnMoveItemUpId").addClass('disabled');
                } else {
                    $("#btnMoveItemDownId").removeClass('disabled');
                    $("#btnMoveItemUpId").addClass('disabled');
                }
            } else if (index == selid) {
                $("#btnMoveItemDownId").addClass('disabled');
                $("#btnMoveItemUpId").removeClass('disabled');

            } else {
                $("#btnMoveItemDownId").removeClass('disabled');
                $("#btnMoveItemUpId").removeClass('disabled');
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
                $("#jqxgridParameterTemplatesDeviceSearch").jqxGrid('clear');
                var str = '';
                str += '<div id="jqxgridParameterTemplatesDeviceSearch"></div>';
                $("#availableParameterTemplateId").empty();
                $("#availableParameterTemplateId").append(str);
                jqxGridforAvailableParameterTemplate(self.packageData, 'jqxgridParameterTemplatesDeviceSearch', self.openPopup);

                //------------------------------------------------------
                if (state != null) {
                    $("#" + gID).jqxGrid('loadstate', state);
                }
                //------------------------------------------------------

                selectedRowArrayForSwap = [];
                gridSeletedRowArryForParameter = [];

                var movedArray = self.movedArray();
                selectedRowArrayForSwap.push(movedArray[l]);

                if (self.movedArray().length <= 0) {
                    $("#btnForMoveleftId").addClass('disabled');
                    $("#btnForAllMoveleftId").addClass('disabled');
                    $("#btnSaveTemplateAssignment").addClass('disabled');
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
                    gridSeletedRowArryForParameter.push(data);
                }
                //-------------------------------------------------------------

            } else {
                openAlertpopup(1, 'no_row_selected');
            }

            columnGroupClickLinkGridStyle('jqxgridParameterTemplatesDeviceSearch');
        }

        //-----------move all parameter from selected parameter to available parametres--------------------
        self.allParameterTemplateMove = function (gID) {
            state = $("#" + gID).jqxGrid('savestate');
            var arr = self.movedArray();
            if (arr.length > 0) {
                for (i = 0; i < arr.length ; i++) {
                    self.movedArray([]);
                    self.packageData.push(arr[i]);
                }

                $('#btnForMoveRightId').addClass('disabled');
                $('#btnForMoveleftId').addClass('disabled');
                $('#btnForAllMoveleftId').addClass('disabled');
                $('#btnMoveItemUpId').addClass('disabled');
                $('#btnMoveItemDownId').addClass('disabled');
                $("#btnSaveTemplateAssignment").addClass('disabled');
                //$("#" + gID).jqxGrid('updatebounddata');       

                //----------------------------------------------------
                if (state != null) {
                    $("#" + gID).jqxGrid('loadstate', state);
                }
                if (getFilterValue == '') {
                    $("#" + gID).jqxGrid('updatebounddata');
                }

                //-------------------------------------------------------------

                $('#' + gID).jqxGrid('clearselection');
            }
            gridSeletedRowArryForParameter = [];
            columnGroupClickLinkGridStyle('jqxgridParameterTemplatesDeviceSearch');
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

            } else {
                openAlertpopup(1, 'please_selct_row');
            }
        }

        function getArrayIndexForKey(arr, key, val) {
            for (var i = 0; i < arr.length; i++) {
                if (arr[i][key] == val)
                    return i;
            }
            return -1;
        }
        self.onCheckOverrideParameterValues = function () {            
        }
        self.assignDeviceParameterTemplates = function (parameterObservableModel, gID) {
            var selectedItemIds = getSelectedUniqueId(gID);
            var templateID = selectedTemplateIdsToApplication;
            $('#overrideParameterValuesPopup').modal('hide');
            setDeviceParameterTemplates(gID, selectedItemIds, templateID, true, ADSearchUtil.deviceSearchObj, parameterObservableModel);            
        }
        self.cancelAssigningDeviceParameterTemplates = function () {
            $('#overrideParameterValuesPopup').modal('hide');
        }
        //--------set device parameter Template----------- 
        self.saveAssignedParameterTemplate = function (parameterObservableModel, gID) {
            var selectedItemIds = getSelectedUniqueId(gID);
            var templateID = selectedTemplateIdsToApplication;
            var overRideTemplateAssignment = $("#chkOverrideParameterValues").is(':checked');
            if (overRideTemplateAssignment) {
                $('#overrideParameterValuesPopup').modal('show');
            } else {
                setDeviceParameterTemplates(gID, selectedItemIds, templateID, overRideTemplateAssignment, ADSearchUtil.deviceSearchObj, parameterObservableModel);
            }           
        }

        //------Get sysytem configuration-----      
        getSystemConfigurationForEditParameterTemplate(koUtil.deviceEditTemplate.ApplicationId, self.movedArray, self.packageData, self.openPopup);
        seti18nResourceData(document, resourceStorage);
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
                    getDeviceParameterTemplates(ApplicationId, movedArray, packageData, openPopup);
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

    function getDeviceParameterTemplates(applicationID, movedArray, packageData, openPopup) {
        var getDeviceParameterTemplatesReq = new Object();
        getDeviceParameterTemplatesReq.ApplicationId = applicationID;
        getDeviceParameterTemplatesReq.UniqueDeviceId = 0;

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {


                    if (data && data.getDeviceParameterTemplatesResp) {
                        data.getDeviceParameterTemplatesResp = $.parseJSON(data.getDeviceParameterTemplatesResp);
                    }

                    //------Avilable parameters---------
                    if (data.getDeviceParameterTemplatesResp.AvailableParameterTemplates) {
                        //getDeviceParameterArr = data.getDeviceParameterTemplatesResp.AvailableParameterTemplates;
                        packageData(data.getDeviceParameterTemplatesResp.AvailableParameterTemplates);
                        jqxGridforAvailableParameterTemplate(packageData(), 'jqxgridParameterTemplatesDeviceSearch', openPopup);
                    } else {
                        jqxGridforAvailableParameterTemplate([], 'jqxgridParameterTemplatesDeviceSearch', openPopup);
                    }

                    //-----SelectedParameterTemplates---
                    //if (data.getDeviceParameterTemplatesResp.SelectedParameterTemplates.length > 0) {
                    //    //selectedParameterTemplatesArr = data.getDeviceParameterTemplatesResp.SelectedParameterTemplates;
                    //    $("#btnForAllMoveleftId").removeClass('disabled');
                    //    movedArray(data.getDeviceParameterTemplatesResp.SelectedParameterTemplates);
                    //    tooltipForTableData(movedArray);
                    //}

                    //------Get sysytem configuration-----
                    //getSystemConfigurationForEditParameterTemplate();
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
					  { name: 'IsLookupTemplate', map: 'IsLookupTemplate' },
                  ],

              };

        var dataAdapter = new $.jqx.dataAdapter(source);

        var selectRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var templateId = $("#jqxgridParameterTemplatesDeviceSearch").jqxGrid('getcellvalue', row, 'TemplateId');
            html = '<div style="margin-left: 10px; margin-top: 5px;"><input id="templateIdDeviceSearch' + templateId + '"  name="radioOptions" type="radio" onClick="getTemplateRadioButtonValueDeviceSearch(' + row + ', event)" value="0"></div>';
            return html;
        }

        var parameterRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var parameterToolipMessage = i18n.t('click_to_view_parameter_template', { lng: lang });
            return '<div style="padding-left:5x;padding-top:7px;cursor:pointer;"> <a title="' + parameterToolipMessage + '"  style="text-decoration:underline;" height="60" width="50" >View</a></div>'
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
                { text: '', dataField: 'TemplateId', hidden: true, editable: false, width: 'auto' },
                {
                    text: '', menu: false, sortable: false, columnsResize: false, filterable: false, columntype: 'custom', datafile: 'isSelected', enabletooltips: false,
                    minwidth: 40, maxwidth: 60, cellsrenderer: selectRenderer,
                },
                {
                    text: i18n.t('template_name', { lng: lang }), datafield: 'TemplateName', width: 'auto', minwidth: 140, maxwidth: 350, editable: false,
                    filtertype: "custom",cellsrenderer:templateNameRenderer,
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('content_description', { lng: lang }), datafield: 'Description', width: 'auto', minwidth: 140, maxwidth: 354, editable: false,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }

                },
                {
                    text: '', columngroup: 'Parameters', datafield: 'View', menu: false, sortable: false, filterable: false, width: 'auto', minWidth: 60,
                    resizable: false, editable: false, enabletooltips: false, cellsrenderer: parameterRenderer,
                },
                {   text: '', columngroup: 'Parameters', filterable: false, sortable: false, menu: false, columntype: 'none', editable: false, datafield: 'DummyColumn', enabletooltips: false, minwidth: 60,  },
            ],
            columngroups:
            [
              { text: i18n.t('btnParameters', { lng: lang }), datafield: 'Parameters', menu: false, sortable: false, enabletooltips: false,  resizable: false, minwidth: 100, editable: false, name: 'Parameters' }
            ]

        });

        columnGroupClickLinkGridStyle('jqxgridParameterTemplatesDeviceSearch');
        //$("#" + gID).bind('rowselect', function (event) {
        //    $("#btnForMoveRightId").removeClass('disabled');
        //    var selectedRow = new Object();
        //    selectedRow.TemplateId = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateId');
        //    selectedRow.TemplateName = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'TemplateName');
        //    selectedRow.Description = $("#" + gID).jqxGrid('getcellvalue', event.args.rowindex, 'Description');

        //    gridSeletedRowArryForParameter = new Array();
        //    gridSeletedRowArryForParameter.push(selectedRow);
        //});

        $("#" + gID).on("cellclick", function (event) {
            var column = event.args.column;
            var rowindex = event.args.rowindex;
            var columnindex = event.args.columnindex;
            var rowData = $("#" + gID).jqxGrid('getrowdata', rowindex);

            if (columnindex == 1) {
                $("#templateIdDeviceSearch" + rowData.TemplateId).prop("checked", true);
                $("#btnSaveTemplateAssignment").removeClass('disabled');
                var selectedRow = new Object();
                selectedRow.TemplateId = rowData.TemplateId;
                selectedRow.TemplateName = rowData.TemplateName;
                selectedRow.Description = rowData.Description;
                selectedTemplateIdsToApplication = new Array();
                selectedTemplateIdsToApplication.push(selectedRow);
            } else if (columnindex == 4) {                
                //openPopup('modelDeviceProfileEditTemplate')
                koUtil.addOrEditTemplate = 1;
                koUtil.viewParameterTemplateOnDevice = true;
                koUtil.deviceViewParameterTemplate = rowData;
                koUtil.selectedTemplateName = rowData.TemplateName;
                koUtil.selectedTemplateDescription= rowData.Description;
				koUtil.selectedTemplateId = rowData.TemplateId;
				isLookupTemplate = rowData.IsLookupTemplate;
                openPopup('modalAddTemplatFile');
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
            state = $("#" + gID).jqxGrid('savestate');
            $('#' + gID).jqxGrid('clearselection');
            $('#btnForMoveRightId').addClass('disabled');
            checkFlag = 1;
            getFilterValue = $('#' + gID).jqxGrid('getfilterinformation');
        });
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

    function setDeviceParameterTemplates(gID, selectedItemIds, templateID, overRideTemplateAssignment, deviceSearchObj, parameterObservableModel) {

        var setDeviceParameterTemplatesForDeviceSearchReq = new Object();
        var Selector = new Object();

        if (templateID == null || templateID.length == 0) {
            openAlertpopup(1, 'please_select_a_template');
        }

        var unSelectedItemIds = getUnSelectedUniqueId(gID);
        var checkAll = checkAllSelected(gID);

        if (checkAll == 1) {
            Selector.SelectedItemIds = null;
            if (unSelectedItemIds.length > 0) {
                Selector.UnSelectedItemIds = unSelectedItemIds;
            } else {
                Selector.UnSelectedItemIds = null;
            }
        } else {
            Selector.SelectedItemIds = selectedItemIds;
            Selector.UnSelectedItemIds = null;
        }
        setDeviceParameterTemplatesForDeviceSearchReq.TemplateId = templateID[0].TemplateId;
        setDeviceParameterTemplatesForDeviceSearchReq.ApplicationId = koUtil.deviceEditTemplate.ApplicationId;
        setDeviceParameterTemplatesForDeviceSearchReq.DeviceSearch = deviceSearchObj;
        setDeviceParameterTemplatesForDeviceSearchReq.Selector = Selector;
        setDeviceParameterTemplatesForDeviceSearchReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
        setDeviceParameterTemplatesForDeviceSearchReq.Override = overRideTemplateAssignment;
        setDeviceParameterTemplatesForDeviceSearchReq.TemplateName = templateID[0].TemplateName;        

        function callbackFunction(data, error) {
            if (data) {
                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    openAlertpopup(1, 'Population_of_the_application_parameters_submitted_successfully');
                    $("#modelDeviceParameterId").modal('hide');
                    gridFilterClear('jqxgridForEditParameterTemplate');
                    parameterObservableModel('unloadTemplate');
                } else if (data.responseStatus.StatusCode == AppConstants.get('POPULATION_OF_THE_APPLICATION_PARAMETERS_IN_PROGRESS')) {
                    openAlertpopup(1, 'Population_of_the_application_parameters_submitted_successfully');
                } else if (data.responseStatus.StatusCode == AppConstants.get('INSTANCE_ALREADY_EXISTS')) {
                    openAlertpopup(2, data.responseStatus.StatusMessage);
                } else if (data.responseStatus.StatusCode == AppConstants.get('EX_APPLY_TEMPLATE_FAILED')) {    //403
                    openAlertpopup(2, "pt_ex_apply_template_failed");
                }
            }
        }

        var method = 'SetDeviceParameterTemplatesForDeviceSearch';
        var params = '{"token":"' + TOKEN() + '","setDeviceParameterTemplatesForDeviceSearchReq":' + JSON.stringify(setDeviceParameterTemplatesForDeviceSearchReq) + '}';
        ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
    }

});

function getTemplateRadioButtonValueDeviceSearch(row, event) {
    if (event.preventDefault) {
        event.preventDefault();
    }
    $("#btnSaveTemplateAssignment").removeClass('disabled');
    var selectedRow = new Object();
    selectedRow.TemplateId = $("#jqxgridParameterTemplatesDeviceSearch").jqxGrid('getcellvalue', row, 'TemplateId');
    selectedRow.TemplateName = $("#jqxgridParameterTemplatesDeviceSearch").jqxGrid('getcellvalue', row, 'TemplateName');
    selectedRow.Description = $("#jqxgridParameterTemplatesDeviceSearch").jqxGrid('getcellvalue', row, 'Description');
    selectedTemplateIdsToApplication = new Array();
    selectedTemplateIdsToApplication.push(selectedRow);
}