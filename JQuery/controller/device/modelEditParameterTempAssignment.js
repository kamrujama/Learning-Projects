define(["knockout", "autho", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum"], function (ko, autho, ADSearchUtil, koUtil) {

    selectedModels = new Array();
    var lang = getSysLang();
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });


    var initialAttributeData = deviceAttributesData;


    var selectedRowArrayForSwap = new Array();
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
    ///

    return function UserProfileViewModel() {
      
        var self = this;
       
        
        ///Close popup of Application
        self.closeApplicationView = function () {
            $("#childApplicationView").modal('hide');
        }

        //Close popups of grids
        $("#addReference").on('scroll.bs.modal', function () {
            //$("#jqxgridAvailablePackage").jqxGrid('closemenu');

        });
        //focus on first textbox
        $('#addReference').on('shown.bs.modal', function () {
            $('#referenceName').focus();
        })

        $('#mdlEditParamAssgnmntHeader').mouseup(function () {
            $("#mdlEditParamAssgnmnt").draggable({ disabled: true });
        });

        $('#mdlEditParamAssgnmntHeader').mousedown(function () {
            $("#mdlEditParamAssgnmnt").draggable({ disabled: false });
        });

        //Disable buttons
        $("#btnForMoveleft").addClass('disabled');
        $("#btnForAllMoveleft").addClass('disabled');
        $("#btnForMoveRight").addClass('disabled');

        self.checksample = ko.observable();
        self.observableModelPopup = ko.observable();

        self.movedArray = ko.observableArray();
        self.AttributeData = ko.observableArray(initialAttributeData);
        self.removeAttributeData = ko.observableArray();
        self.visibleAttDLL = ko.observable(false);
        self.showAttDLL = function () {
            self.visibleAttDLL(true);
        }


        self.referenceName = ko.observable('').extend({
            required: {
                params: true,
                message: i18n.t('please_selct_reference_set', {
                    lng: lang
                })
            }
        });

        $("#referenceName").on("keypress keyup paste", function (e) {
            var textMax = 50;
            var textLength = $('#referenceName').val().length;
            var textRemaining = textMax - textLength;
        });

        $("#referenceName").on('change keyup paste', function () {
            if ($("#referenceName").val().trim() != "") {
                $('#addBtn').removeAttr('disabled');
            }
        });


        self.addBtnEnabled = function () {
            $('#addBtn').removeAttr('disabled');
        }

        isAdpopup = 'open';

        var itemsdata = [];
        self.items = ko.observableArray(itemsdata);
        self.selectedOption = ko.observable();
        self.selectedOption.subscribe(function (newValue) {
            if (newValue) {
                var retval = attributValidation(self.items());
                if (retval == null || retval == '') {
                    var selectedsource = _.where(self.AttributeData(), { AttributeName: newValue });
                    self.AttributeData.remove(selectedsource[0]);
                    self.removeAttributeData.push(selectedsource[0]);
                    $('#deviceAttributDDL').val('-Select-').prop("selected", "selected");
                    if (selectedsource[0].ControlType == 'MultiCombo') {
                        self.items.push({ name: newValue, ControlType: true, deviceId: selectedsource[0].DeviceSearchAttributeOperators[0].DeviceSearchAttributesId, DeviceSearchAttributeOperators: selectedsource[0].DeviceSearchAttributeOperators, DisplayName: selectedsource[0].DisplayName });
                    } else if (selectedsource[0].ControlType == 'TextBox') {
                        self.items.push({ name: newValue, ControlType: false, deviceId: selectedsource[0].DeviceSearchAttributeOperators[0].DeviceSearchAttributesId, DeviceSearchAttributeOperators: selectedsource[0].DeviceSearchAttributeOperators, DisplayName: selectedsource[0].DisplayName });
                    }

                } else {
                    openAlertpopup(1, 'Please enter some value');

                    $('#deviceAttributDDL').val('-Select-').prop("selected", "selected");
                }

            } else {

            }
            self.addBtnEnabled();
        });

        self.removeItems = function (item) {
            self.items.remove(item);
            var selectedsource = _.where(self.removeAttributeData(), { AttributeName: item.name });
            self.removeAttributeData.remove(selectedsource[0]);
            self.AttributeData.push(selectedsource[0]);
        }

        self.addItem = function () {
            this.items.push({ name: "New item", operator: 'vhqnew' });
        };

		self.closeAppView = function () {
            $("#ApplicationView").modal('hide');
        }

        //checkerror
        function attributValidation(items) {
            var retval = '';

            if (items.length > 0) {
                var id = '#txtAttrValue' + (items.length - 1) + '';


                if ($(id).val() == null || $(id).val() == '') {
                    retval += 'empty';
                } else {
                    retval = '';
                }
            }
            return retval;
        }

        function checkerror(chekVal) {
            var retval = '';
            var arr = self.items();

            var referenceSetName = $("input#referenceName");
            referenceSetName.val(referenceSetName.val().replace(/^\s+/, ""));

            if ($("#referenceName").val().trim() == "") {

                retval += 'reference name';
                self.referenceName(null);

                $("#please_enter_reference_set_name").show();
            } else if (arr.length > 0) {
                for (var i = 0; i < arr.length; i++) {
                    if ($("#txtAttrValue" + i).val() == "") {
                        openAlertpopup(1, 'please_enter_attribute_val');
                        retval += 'blank attribute value';
                    }
                }

            }
            else {
                retval += '';
            }
            return retval;
        }

        function selectedList(movedArray) {
            var packageIdsList = new Array();
            var packageIdObj;
            for (var i = 0; i < movedArray.length; i++) {
                packageIdObj = new Object();
                packageIdObj.PackageId = movedArray[i].PackageId;
                packageIdObj.PackageName = movedArray[i].PackageName;
                packageIdObj.TotalRows = 0;
                packageIdsList.push(packageIdObj);
            }
            return packageIdsList;
        }


        function modelListFunction(selectedModels) {
            var modelsList = new Array();
            var modelObj;
            for (var i = 0; i < selectedModels.length; i++) {
                modelObj = new Object();
                modelObj.ModelId = selectedModels[i].ModelId;
                modelObj.ModelName = selectedModels[i].ModelName;
                modelsList.push(modelObj);
            }
            return modelsList;
        }

        function attributeArrayClick(items, attributeData) {
            var attrList = new Array();
            var modelObj;


            for (var i = 0; i < items.length; i++) {
                modelObj = new Object();
                var id = "#attributeName" + [i];
                var attributeName = $(id).text();

                modelObj.AttributeId = items[i].deviceId;
                modelObj.AttributeName = items[i].name;
                modelObj.ComparsionOperator = $("#contorlId" + [i]).find('option:selected').text();//$("#attributeValue" + [i]).val();
                modelObj.AttributeValue = $("#txtAttrValue" + [i]).val();
                attrList.push(modelObj)
            }
            return attrList;
        }

        //Add reference on button click
        self.addReferenceSet = function (observableModelPopup, gId) {
            var str = $('#attributeName0').text() + " " + $("#contorlId0").find('option:selected').text() + " " + $("#txtAttrValue0").val();
            var strCriteria = '';
            $("#itemTbody").find('tr').each(function (i) {
                strCriteria += $("#attributeName" + i).text() + ' ' + $("#contorlId" + i).find('option:selected').text() + ' ' + $("#txtAttrValue" + i).val() + ';';

            });

            var retval = checkerror();
            var acSelectedList = selectedList(self.movedArray());

            //Model
            var selectedData = new Array();
            selectedData = getMultiSelectedData(gId);
            selectedModelsIds = getSelectedUniqueId(gId);
            var modelDataArr = new Array();
            for (i = 0; i < selectedModelsIds.length; i++) {
                var source = _.where(selectedData, { ModelId: selectedModelsIds[i] });
                var obj = new Object();
                obj.ModelId = source[0].ModelId;
                obj.ModelName = source[0].ModelName;
                modelDataArr.push(obj);
            }
            var modelList = modelListFunction(selectedModels);
            var attributeArray = attributeArrayClick(self.items(), self.AttributeData());
            if (self.movedArray().length <= 0) {
                openAlertpopup(1, 'select_the_packages');
                return;
            }

            if (retval == null || retval == "") {
                var addReferenceSetReq = new Object();

                var referenceSetObj = new Object();
                var referenceSetPackages = new Array();
                var referenceSetModels;
                referenceSetObj.Name = $("#referenceName").val();
                referenceSetObj.Criteria = strCriteria;// "OS Version Contains 3333333";
                var referenceSet = referenceSetObj;
                referenceSetPackages = acSelectedList;
                referenceSetModels = modelDataArr;
                deviceAttributes = attributeArray
                var callBackfunction = function (data, error) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        gridFilterClear('jqxgridReferenceSet');
                        openAlertpopup(0, 'ReferenceSetadded');
                        observableModelPopup('unloadTemplate');
                        $("#mainPageBody").removeClass('modal-open-appendon');
                        isAdpopup = '';
                        $('#addReference').modal('hide');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('REFERENCE_SET_NAME_ALREADY_EXISTS')) {
                        openAlertpopup(2, 'ReferenceSetDuplicate');
                        self.modelData([]);
                    } else if (data.responseStatus.StatusCode == AppConstants.get('CONFLICTS_IN_PACKAGE_FILE_TYPE')) {
                        openAlertpopup(2, 'RefConflictFiletype');
                        self.modelData([]);
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SQL_INJECTION_ERROR')) {
                        openAlertpopup(2, 'sql_injection_error');
                        self.modelData([]);
                    } else if (data.responseStatus.StatusCode == AppConstants.get('CONFLICTS_IN_PACKAGES')) {

                    } else if (error) {
                        self.modelData([]);
                    }
                }
                if (modelDataArr.length <= 0) {
                    openAlertpopup(1, 'please_select_model');
                } else {
                    var method = 'AddReferenceSet';
                    var params = '{"token":"' + TOKEN() + '","referenceSet":' + JSON.stringify(referenceSet) + ',"referenceSetPackages":' + JSON.stringify(referenceSetPackages) + ',"referenceSetModels":' + JSON.stringify(referenceSetModels) + ',"deviceAttributes":' + JSON.stringify(deviceAttributes) + '}';
                    ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
                }

            }
        }


        //Swapping data functions
        self.availableParameterTemplatesData = ko.observableArray();
        getDeviceParameterTemplates(self.availableParameterTemplatesData);

        self.modelData = ko.observableArray();
        self.rightPackages = function () {

            if (selectedRowArrayForSwap.length > 0) {
                self.movedArray.push(selectedRowArrayForSwap[0]);
                var selectedsource = _.where(self.packageData(), { PackageName: selectedRowArrayForSwap[0].PackageName });
                self.packageData.remove(selectedsource[0]);
                $("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
                $("#jqxgridAvailablePackage").jqxGrid('clearselection');
                selectedRowArrayForSwap = [];
                getModel(self.movedArray, self.modelData, 1);

                $("#btnForMoveleft").removeClass('disabled');
                $("#btnForAllMoveleft").removeClass('disabled');
                if (self.packageData().length <= 0) {

                    $("#btnForMoveRight").addClass('disabled');

                } else {
                    $("#btnForMoveRight").removeClass('disabled');
                }
                var tootipArr = self.movedArray()
                for (var j = 0; j < tootipArr.length; j++) {
                    var filename = tootipArr[j].fileName;
                    var packeagetooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename
                    $("#packagespan" + j).prop('title', packeagetooltip);
                    $("#versionspan" + j).prop('title', packeagetooltip);
                }
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
            self.addBtnEnabled();
        }


        self.SelectSelectedPackageRow = function (data, index) {
            $("#tbodySelectedpack").children('tr').css('background-color', '');
            var id = '#SelectPackrow' + index + '';
            $(id).css('background-color', 'darkgray');
            selectedRowArrayForSwap = [];
            selectedRowArrayForSwap.push(data);
        }

        self.allPackagesMove = function () {
            var arr = self.movedArray();
            if (arr.length > 0) {
                for (i = 0; i < arr.length ; i++) {
                    self.movedArray([]);
                    $("#btnForMoveleft").addClass('disabled');
                    $("#btnForAllMoveleft").addClass('disabled');
                    self.packageData.push(arr[i]);
                    $("#btnForMoveRight").removeClass('disabled');
                }

            }
            $("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
            $("#jqxgridAvailablePackage").jqxGrid('clearselection');
            getModel(self.movedArray, self.modelData, 1);
            self.addBtnEnabled();
        }
        self.leftPackages = function () {
            if (selectedRowArrayForSwap.length > 0) {
                self.movedArray.remove(selectedRowArrayForSwap[0]);
                self.packageData.push(selectedRowArrayForSwap[0]);
                $("#jqxgridAvailablePackage").jqxGrid('updatebounddata');
                $("#jqxgridAvailablePackage").jqxGrid('clearselection');
                selectedRowArrayForSwap = [];
                getModel(self.movedArray, self.modelData, 1);
                if (self.movedArray().length <= 0) {
                    $("#btnForMoveleft").addClass('disabled');
                    $("#btnForAllMoveleft").addClass('disabled');
                }
                if (self.packageData().length <= 0) {
                    $("#btnForMoveRight").addClass('disabled');
                } else {
                    $("#btnForMoveRight").removeClass('disabled');
                }
            } else {
                openAlertpopup(1, 'please_selct_row');

            }
            self.addBtnEnabled();
        }



        self.moveItemsUP = function () {
            if (selectedRowArrayForSwap.length > 0) {
                var arr = self.movedArray();
                var index = getArrayIndexForKey(arr, 'PackageName', selectedRowArrayForSwap[0].PackageName);
                arr.moveUp(arr[index]);
                self.movedArray(arr);
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
            self.addBtnEnabled();
        }
        self.moveItemsDown = function () {
            if (selectedRowArrayForSwap.length > 0) {
                var arr = self.movedArray();
                var index = getArrayIndexForKey(arr, 'PackageName', selectedRowArrayForSwap[0].PackageName);
                arr.moveDown(arr[index]);
                self.movedArray(arr);
            } else {
                openAlertpopup(1, 'please_selct_row');
            }
            self.addBtnEnabled();
        }
        ///

        self.clearfilter = function (gridID) {
            gridFilterClear(gridID);
        }
        seti18nResourceData(document, resourceStorage);
    }

    function getArrayIndexForKey(arr, key, val) {
        for (var i = 0; i < arr.length; i++) {
            if (arr[i][key] == val)
                return i;
        }
        return -1;
    }

    function getDeviceParameterTemplates(availableParameterTemplatesData) {

        // prepare the data
        var getDeviceParameterTemplatesReq = new Object();
        getDeviceParameterTemplatesReq.ApplicationId = selectedEditApplicationId;
        if (ADSearchUtil.AdScreenName == 'deviceSearch') {
        }else{
            getDeviceParameterTemplatesReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
        }
        

        var callBackfunction = function (data, error) {
            if (data) {
                if (data && data.getDeviceParameterTemplatesResp) {
                    data.getDeviceParameterTemplatesResp = $.parseJSON(data.getDeviceParameterTemplatesResp);
                }
                availableParameterTemplatesData(data.packages);
                availableParameterTemplatesGrid(availableParameterTemplatesData());

            } else if (error) {
                packageData(null);
            }
        }

        var method = 'GetDeviceParameterTemplates';
        var params = '{"token":"' + TOKEN() + '","PackageType":"' + PackageType + '","IsEnabledForAutomation":"' + IsEnabledForAutomation + '"}';
        ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

    }


    function availableParameterTemplatesGrid(availableParameterTemplatesData) {
        var self = this;
        var filterObj;
        var selectedArray = new Array();
        var selectedRowID;
        var HighlightedRowID;
        var rowsToColor = [];
        var RowID;
        var localData;

        var source =
        {
            dataType: "observablearray",
            localdata: availableParameterTemplatesData,
            dataFields: [
                 { name: 'TemplateId', map: 'TemplateId' },
                 { name: 'TemplateName', map: 'TemplateName' },
				 { name: 'Description', map: 'Description' },
				 { name: 'IsLookupTemplate', map: 'IsLookupTemplate' },
            ],

        };

        var cellclass = function (row, columnfield, value) {
            if (value == HighlightedRowID) {
                RowID = row;
                return 'red';
            }
        }

        var cellclassSub = function (row, columnfield, value) {
            if (row == RowID) {
                return 'red';
            }
        }
        var rowColorFormatter = function (cellValue, options, rowObject) {
            if (cellValue == HighlightedRowID)
                rowsToColor[rowsToColor.length] = options.rowId;
            return cellValue;
        }
        var dataAdapter = new $.jqx.dataAdapter(source);

        //Custom filter
        var buildFilterPanel = function (filterPanel, datafield) {
            genericBuildFilterPanel(filterPanel, datafield, dataAdapter, "jqxgridAvailablePackage");
        }

        var versionRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var filename = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'FileName');
            var versiontooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename
            defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;" ><span  title="' + versiontooltip + '" >' + value + '</a></div>';
            return defaulthtml;
        }
        var packageRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var filename = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'FileName');
            var packagetooltip = i18n.t('File_name', { lng: lang }) + ' : ' + filename
            defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;" ><span  title="' + packagetooltip + '" >' + value + '</a></div>';
            return defaulthtml;
        }

        var aplicationRenderer = function (row, columnfield, value, defaulthtml, columnproperties) {
            var isAutomation = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'IsEnabledForAutomation');
            var packageID = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'PackageId');
            var packagemode = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'PackageMode');
            var packageName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', row, 'PackageName');
            var gID = "jqxgridAvailablePackage";
            var isFromReferenceSet = true;
            if (isAutomation == 'true') {
                var appdetaltooltip = i18n.t('app_details_tooltip', { lng: lang })
                defaulthtml = '<div  style="height:100px;cursor:pointer;text-align:center;padding-top:7px;float:left;" ><a style="text-decoration: underline" title="' + appdetaltooltip + '"  onclick=AplicationViewPopupFromReferenceSet(' + row + ',"' + gID + '",' + isFromReferenceSet + ') role="button" >View</a></div>';
                return defaulthtml;
            } else {
                return " ";
            }
        }

        $("#jqxgridAvailablePackage").jqxGrid(
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
            rowsheight: 32,
            autoshowcolumnsmenubutton: false,

            columns: [

                 { text: '', dataField: 'TemplateId', hidden: true, editable: false, minwidth: 0 },
                {
                    text: i18n.t('p_t_assign_name', { lng: lang }), dataField: 'TemplateName', editable: false,  cellsrenderer: packageRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                {
                    text: i18n.t('p_t_assign_desc', { lng: lang }), dataField: 'Description', editable: false,  cellsrenderer: versionRenderer,
                    filtertype: "custom",
                    createfilterpanel: function (datafield, filterPanel) {
                        buildFilterPanel(filterPanel, datafield);
                    }
                },
                { text: i18n.t('p_t_assign_params', { lng: lang }), filterable: false, sortable: false, menu: false, datafield: 'PackageMode', editable: false, minwidth: 100,  cellsrenderer: aplicationRenderer },
            ]
        });


        $("#jqxgridAvailablePackage").bind('rowselect', function (event) {
            $("#btnForMoveRight").removeClass('disabled');
            var selectedRow = new Object();
            selectedRow.PackageId = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'TemplateId');
            selectedRow.PackageName = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'TemplateName');
            selectedRow.FileVersion = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'Description');
            selectedRow.IsEnabledForAutomation = $("#jqxgridAvailablePackage").jqxGrid('getcellvalue', event.args.rowindex, 'IsEnabledForAutomation');
            selectedRowArrayForSwap = new Array();
            selectedRowArrayForSwap.push(selectedRow);
        });
    }


    //end grid

    function packageIdsListClick(movedArray) {
        var packageIdsList = new Array();
        var packageIdObj
        for (var i = 0; i < movedArray.length; i++) {
            packageIdObj = new Object();
            packageIdObj.PackageId = movedArray[i].PackageId;
            packageIdsList.push(packageIdObj);
        }

        return packageIdsList;
    }

  
});