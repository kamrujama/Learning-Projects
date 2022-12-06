var isHierarchySelected = false;
var firstChangedHierarchyLevel = null;
define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "chosen", "appEnum"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();
    changedFirstHierarchyLevel = null;
    advHierarchyDataRootIndex = 0;

    //Localization
    ko.validation.init({
        decorateElement: true,
        errorElementClass: 'err',
        insertMessages: false
    });

    ko.bindingHandlers.singleClick = {
        init: function (element, valueAccessor, c, viewModel) {
            var handler = valueAccessor(),
                delay = 400,
                clickTimeout = false;

            $(element).click(function (event) {
                if (clickTimeout !== false) {
                    clearTimeout(clickTimeout);
                    clickTimeout = false;
                } else {
                    clickTimeout = setTimeout(function () {
                        clickTimeout = false;
                        handler(viewModel, event);
                    }, delay);
                }
            });
        }
    };

    treeviwHierarchyStoredData = new Array();

    return function HeirarchyViewModel() {
        initcountforloading = 0;
        setcountforloading = 0;

        var config = {
            '.chosen-select': {},
            '.chosen-select-deselect': { allow_single_deselect: true },
            '.chosen-select-no-single': { disable_search_threshold: 10 },
            '.chosen-select-no-results': { no_results_text: 'Oops, nothing found!' },
            '.chosen-select-width': { width: "95%" }
        }

        for (var selector in config) {
            $(selector).chosen(config[selector]);
        }

        var self = this;

        var isCallNotInProgress = true;

        $("#hierarchyUl>li").keyup(function (objEvent) {
            $("#hierarchyUl>li:focus").click();
        });
      
        ADSearchUtil.AdScreenName = !_.isEmpty(deviceLiteData) ? deviceLiteData.Source : ADSearchUtil.AdScreenName;
        ADSearchUtil.checkexistParent = [];
        self.hierarchyFullPath = ko.observableArray();
        if (ADSearchUtil.HierarchyPathArr() != null && ADSearchUtil.HierarchyPathArr().length > 0) {
            self.hierarchyFullPath(ADSearchUtil.HierarchyPathArr());
        }

        //Add/Set buttons for different screens
        self.hierarchyTabVisible = ko.observable(false);
        self.visibleSetBtn = ko.observable(false);
        self.visibleSelectBtn = ko.observable(false);
        self.visibleSelectBtnForDeviceProfile = ko.observable(false);
        self.visibleAddDeviceSelectBtn = ko.observable(false);
        self.visibleSelectBtnForAddUser = ko.observable(false);
        self.hierarchyFooter = ko.observable(false);

        self.HierarchypathForSet = ko.observableArray();
        self.flageaddBtn = ko.observable(true);
        self.flagSelectMultipleHierarchy = ko.observable(false);
        self.flagetree = ko.observable(false);
        self.isNotSearchAdmin = !koUtil.isSearchAdmin();
        self.UserHiearchies = ko.observableArray([]);
        self.selectedUserHierarchy = ko.observable();
        self.HierarchyLevels = ko.observableArray();
        self.selectedHierarchyData = ko.observableArray();
        self.selectedHierarchyIDs = ko.observableArray();
        self.currentObjHierarchyFullPath = ko.observable();
        self.hierarchytreeviewdata = ko.observableArray();

        var hierarchyConstructor = function (name, hierarchies, Level) {
            this.Name = ko.observable(name);
            this.hierarchies = ko.observableArray(hierarchies);
            this.Level = ko.observable(Level);
        }

        var treeviewDataCunstructor = function (data) {
            this.Id = ko.observable(data.Id);
            this.Description = ko.observable(data.Description);
            this.HierarchyFullPath = ko.observable(data.HierarchyFullPath);
            this.HierarchyIdFullPath = ko.observable(data.HierarchyIdFullPath);
            this.HierarchyName = ko.observable(data.HierarchyName);
            this.IPAddressRangeEnd = ko.observable(data.IPAddressRangeEnd);
            this.IPAddressRangeStart = ko.observable(data.IPAddressRangeStart);
            this.IsChildExists = ko.observable(data.IsChildExists);
            this.Level = ko.observable(data.Level);
            this.LocationId = ko.observable(data.LocationId);
            this.ParentId = ko.observable(data.ParentId);
            this.TimeZoneId = ko.observable(data.TimeZoneId);
            this.Childern = ko.observableArray(data.Childern);
        }

        var treeviewinitData = {};

        init();
        function init() {
            showHideControls();
            self.HierarchyLevels([]);
            if (_.isEmpty(heirarchyData)) {
                callHierarchyPanel();
            } else if (_.isEmpty(koUtil.UserData())) {
                fetchRootHierarchyData();
            } else {
                loadHierarchyPanel(heirarchyData);
            }
        }

        function showHideControls() {
            if (ADSearchUtil.AdScreenName == 'addUser' || ADSearchUtil.AdScreenName == 'editUserScreen') {
                self.hierarchyFooter(true);
                $("#cancelBtn").show();
                self.visibleSetBtn(false);
                self.visibleSelectBtn(false);
                self.visibleSelectBtnForDeviceProfile(false);
                self.hierarchyTabVisible(false);
                self.visibleAddDeviceSelectBtn(false);
                self.flageaddBtn(true);
                self.flagSelectMultipleHierarchy(true);
                self.visibleSelectBtnForAddUser(true);
            } else if (ADSearchUtil.AdScreenName == 'addDeviceManually') {
                self.hierarchyFooter(true);
                $("#cancelBtn").show();
                self.visibleSetBtn(false);
                self.visibleSelectBtn(false);
                self.visibleSelectBtnForDeviceProfile(false);
                self.hierarchyTabVisible(false);
                self.visibleAddDeviceSelectBtn(true);
                self.flageaddBtn(false);
            } else if (ADSearchUtil.AdScreenName == 'editHierarchy') {
                self.hierarchyFooter(true);
                $("#cancelBtn").show();
                self.visibleSetBtn(true);
                self.visibleSelectBtn(false);
                self.visibleSelectBtnForDeviceProfile(false);
                self.hierarchyTabVisible(false);
                self.visibleAddDeviceSelectBtn(false);
                self.flageaddBtn(false);
            } else if (ADSearchUtil.AdScreenName == 'deviceProfile') {
                self.hierarchyFooter(true);
                $("#cancelBtn").show();
                self.visibleSetBtn(false);
                self.visibleSelectBtn(false);
                self.visibleSelectBtnForDeviceProfile(true);
                self.hierarchyTabVisible(false);
                self.visibleAddDeviceSelectBtn(false);
                self.flageaddBtn(false);
            } else {
                self.hierarchyFooter(false);
                self.hierarchyTabVisible(true);
                $("#cancelBtn").hide();
                self.visibleSetBtn(false);
                self.visibleSelectBtn(false);
                self.visibleSelectBtnForDeviceProfile(false);
                self.visibleAddDeviceSelectBtn(false);
                self.flageaddBtn(true);
            }
        }

        //if heirarchyData is not yet available
        function callHierarchyPanel() {
            setTimeout(function () {
                if (_.isEmpty(heirarchyData)) {
                    callHierarchyPanel();
                } else if (_.isEmpty(koUtil.UserData())) {
                    fetchRootHierarchyData();
                } else {
                    loadHierarchyPanel(heirarchyData);
                }
            }, 1000);
        }

        //if logged-in user hierarchy data is not yet available
        function fetchRootHierarchyData() {
            setTimeout(function () {
                if (_.isEmpty(koUtil.UserData())) {
                    fetchRootHierarchyData();
                } else {
                    loadHierarchyPanel(heirarchyData);
                }
            }, 2000);
        }

        function loadHierarchyPanel(heirarchyLevelData) {
            ADSearchUtil.loadInitialUserData();                      
            if (!_.isEmpty(heirarchyLevelData) && heirarchyLevelData.length > 0) {
                //to assign logged-in user hierarchy data to self.selectedUserHierarchy  
                GetUserHierarchyData(self.UserHiearchies);
                for (var i = 0; i < heirarchyLevelData.length; i++) {
                    self.HierarchyLevels.push(new hierarchyConstructor(heirarchyLevelData[i].Name, heirarchyLevelData[i].hierarchies, heirarchyLevelData[i].Level));
                }
                var mlength = 240;
                var cl = heirarchyLevelData.length;
                mlength = mlength * cl;
                $("#mainHierarchyViewDivModal").css("cssText", 'width:' + mlength + 'px !important;');

                var data = (!_.isEmpty(heirarchyLevelData[0].hierarchies) && heirarchyLevelData[0].hierarchies.length > 0) ? heirarchyLevelData[0].hierarchies[0] : null;
                if (!_.isEmpty(data)) {
                    var indexOfSelectedId = $.inArray(data.Id, ADSearchUtil.selectedHierarchyIDs);
                    if (indexOfSelectedId == -1) {
                        ADSearchUtil.selectedHierarchyIDs.push(data.Id);
                    }
                    else {
                        ADSearchUtil.selectedHierarchyIDs.splice(indexOfSelectedId + 1);
                    }
                    self.HierarchypathForSet(data);
                    fetchHierarchies(heirarchyLevelData[0].hierarchies[0].Id, heirarchyLevelData[0].Level, true);
                }
            }
        }

        function GetUserHierarchyData(UserHiearchies) {
            if (userGlobalData && userGlobalData.userHierarchies && userGlobalData.userHierarchies.length > 0) {
                //list view
                for (i = 0; i < userGlobalData.userHierarchies.length; i++) {
                    if (userGlobalData.userHierarchies[i] != null) {
                        UserHiearchies.push(userGlobalData.userHierarchies[i]);
                    }
                }
                self.selectedUserHierarchy(userGlobalData.userHierarchies[0]);

                //tree view
                treeviewinitData = {
                    Id: userGlobalData.userHierarchies[0].Id,
                    Description: userGlobalData.userHierarchies[0].Description,
                    HierarchyFullPath: userGlobalData.userHierarchies[0].HierarchyName,
                    HierarchyIdFullPath: userGlobalData.userHierarchies[0].HierarchyIdFullPath,
                    HierarchyName: userGlobalData.userHierarchies[0].HierarchyName,
                    IPAddressRangeEnd: userGlobalData.userHierarchies[0].IPAddressRangeEnd,
                    IPAddressRangeStart: userGlobalData.userHierarchies[0].IPAddressRangeStart,
                    Id: userGlobalData.userHierarchies[0].Id,
                    IsChildExists: true,
                    Level: userGlobalData.userHierarchies[0].Level,
                    LocationId: userGlobalData.userHierarchies[0].LocationId,
                    ParentId: userGlobalData.userHierarchies[0].ParentId,
                    TimeZoneId: userGlobalData.userHierarchies[0].TimeZoneId,
                    Childern: []
                }

                self.hierarchytreeviewdata([new treeviewDataCunstructor(treeviewinitData)]);

                treeviwHierarchyStoredData = self.hierarchytreeviewdata();
            }
        }

        function fetchHierarchies(id, level, IsChildExists) {
            var hierarchy = new Object();
            hierarchy.Id = id;
            var hierarchyArr = new Array();
            if (heirarchyData[level] != undefined) {
                heirarchyData[level].hierarchies = [];
            }
            var responsefunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        if (data.hierarchyList) {
                            data.hierarchyList = $.parseJSON(data.hierarchyList);
                            for (var h = 0; h < data.hierarchyList.length; h++) {
                                if (id != data.hierarchyList[h].Id) {
                                    var obj = new Object();
                                    obj.Description = data.hierarchyList[h].Description;
                                    obj.HierarchyFullPath = data.hierarchyList[h].HierarchyFullPath;
                                    obj.HierarchyIdFullPath = data.hierarchyList[h].HierarchyIdFullPath;
                                    obj.HierarchyName = data.hierarchyList[h].HierarchyName;
                                    obj.IPAddressRangeEnd = data.hierarchyList[h].IPAddressRangeEnd;
                                    obj.IPAddressRangeStart = data.hierarchyList[h].IPAddressRangeStart;
                                    obj.Id = data.hierarchyList[h].Id;
                                    obj.IsChildExists = data.hierarchyList[h].IsChildExists;
                                    obj.Level = data.hierarchyList[h].Level;
                                    obj.LocationId = data.hierarchyList[h].LocationId;
                                    obj.ParentId = data.hierarchyList[h].ParentId;
                                    obj.TimeZoneId = data.hierarchyList[h].TimeZoneId;
                                    hierarchyArr.push(obj);
                                    heirarchyData[(level - heirarchyData[0].Level) + 1].hierarchies = hierarchyArr;
                                } else {
                                    var obj = new Object();
                                    obj.Description = data.hierarchyList[h].Description;
                                    obj.HierarchyFullPath = data.hierarchyList[h].HierarchyFullPath;
                                    obj.HierarchyIdFullPath = data.hierarchyList[h].HierarchyIdFullPath;
                                    obj.HierarchyName = data.hierarchyList[h].HierarchyName;
                                    obj.IPAddressRangeEnd = data.hierarchyList[h].IPAddressRangeEnd;
                                    obj.IPAddressRangeStart = data.hierarchyList[h].IPAddressRangeStart;
                                    obj.Id = data.hierarchyList[h].Id;
                                    obj.IsChildExists = data.hierarchyList[h].IsChildExists;
                                    obj.Level = data.hierarchyList[h].Level;
                                    obj.LocationId = data.hierarchyList[h].LocationId;
                                    obj.ParentId = data.hierarchyList[h].ParentId;
                                    obj.TimeZoneId = data.hierarchyList[h].TimeZoneId;
                                    for (var i = 0; i < heirarchyData[level - heirarchyData[0].Level].hierarchies.length; i++) {
                                        if (heirarchyData[level - heirarchyData[0].Level].hierarchies[i].Id == obj.Id) {
                                            heirarchyData[level - heirarchyData[0].Level].hierarchies[i] = obj;
                                        }
                                    }
                                }
                            }
                        }
                        if (IsChildExists != undefined) {
                            if (!IsChildExists) {
                                if (heirarchyData[(level - heirarchyData[0].Level) + 1] == undefined) {
                                } else {
                                    heirarchyData[(level - heirarchyData[0].Level) + 1].hierarchies = [];
                                }
                            }
                        }

                        //hierarchy panels construction
                        self.HierarchyLevels([]);
                        for (var i = 0; i < heirarchyData.length; i++) {
                            self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
                        }
                        ADSearchUtil.selectedHierarchyIDs = new Array();
                        ADSearchUtil.selectedHierarchyIDs.push(id);
                        setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);
                    }
                }
                else if (error) {
                    $("#saveBtnsForEditHierarchy").hide();
                    $("#selectHierarchyBtns").hide();
                    $("#selectHierarchyForAddDevice").hide();
                    $("#selectHierarchyBtnsForDeviceProfile").hide();
                    $("#saveBtnsForEditHierarchy").hide();
                }
            }
            var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
            ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', true);
        }

        //getHierarchyforEdit(editsource[0].Id, editsource[0].Level, self.selectedHierarchyData)
        self.filter = ko.observable('');
        self.filterStorage = ko.observableArray();
        existFilter = '';
        filterlevel = 0;
        self.storeLevel = function (level) {
            var id = level + 'hielevelFilter';
            if ($('#' + id).hasClass('show')) {
                $('#' + id).removeClass('show').addClass("hide").blur();;
            } else {
                $('#' + id).removeClass('hide').addClass('show').focus();
            }
            if (existFilter != '' && existFilter != id) {
                $('#' + existFilter).removeClass('show').addClass("hide").blur();
            }
            existFilter = id;
            filterlevel = level;
            if (self.filterStorage[level] != undefined) {
                self.filter(self.filterStorage[level]);
            } else {
                self.filterStorage[level] = self.filter();
            }
            for (var i = 0; i < globalLevelHierarchyObject.length; i++) {
                if (globalLevelHierarchyObject[i].TextIndexObj.SearchTxt && globalLevelHierarchyObject[i].Level == level - 1) {
                    $('#' + id).val(globalLevelHierarchyObject[i].TextIndexObj.SearchTxt);
                }
            }
        }
        self.filteredList = function (hierarchies) {
            var filter = self.filter(),
                arr = [];
            if (hierarchies.length > 0) {
                if (filter && filter != '') {
                    if (filterlevel == hierarchies[0].Level) {
                        var filtericonid = filterlevel + 'hielevelFIcon';
                        //self.filterStorage[filterlevel] = self.filter();
                        //if (self.filterStorage[filterlevel] != '') {
                        //    $('#' + filtericonid).removeClass('icon-default').addClass("icon-default-select");
                        //} else {
                        //    $('#' + filtericonid).removeClass('icon-default-select').addClass("icon-default");
                        //}
                        var source = _.where(globalLevelHierarchyObject, { Level: filterlevel });
                        if (source && source.length > 0) {
                            if (source[0].TextIndexObj.SearchTxt != '') {
                                $('#' + filtericonid).removeClass('icon-default').addClass("icon-default-select");
                            } else {
                                $('#' + filtericonid).removeClass('icon-default-select').addClass("icon-default");
                            }
                        }
                        ko.utils.arrayForEach(hierarchies, function (item) {
                            var ivalue = item.HierarchyName;
                            if (ivalue && ivalue.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                                arr.push(item);
                            }

                        });
                    } else {
                        filter = self.filterStorage[hierarchies[0].Level];
                        var filtericonid = hierarchies[0].Level + 'hielevelFIcon';
                        //if (filter != '') {
                        //    $('#' + filtericonid).removeClass('icon-default').addClass("icon-default-select");
                        //} else {
                        //    $('#' + filtericonid).removeClass('icon-default-select').addClass("icon-default");
                        //}
                        var source = _.where(globalLevelHierarchyObject, { Level: hierarchies[0].Level });
                        if (source && source.length > 0) {
                            if (source[0].TextIndexObj.SearchTxt && source[0].TextIndexObj.SearchTxt != '') {
                                $('#' + filtericonid).removeClass('icon-default').addClass("icon-default-select");
                            } else {
                                $('#' + filtericonid).removeClass('icon-default-select').addClass("icon-default");
                            }
                        }
                        ko.utils.arrayForEach(hierarchies, function (item) {
                            var ivalue = item.HierarchyName;
                            if (ivalue && ivalue.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
                                arr.push(item);
                            }

                        });
                    }

                } else {
                    arr = hierarchies;
                }
            }

            return arr;

        };
        self.changeHierarchyData = function (data) {
            function changeHierarchyCallback() {

            }
            changeHierarchy(data, changeHierarchyCallback);
        }

        function changeHierarchy(data, changeHierarchyCallback) {
            var id = data.Id;
            var level = data.HierarchyLevel.Level;
            changedFirstHierarchyLevel = level;
            for (var i = 0; i < heirarchyData.length; i++) {
                heirarchyData[i].hierarchies = [];
            }
            function callback(heirarchyData) {
                self.HierarchyLevels([]);
                for (var i = 0; i < heirarchyData.length; i++) {
                    if (heirarchyData[i].Level >= level) {
                        self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
                    }
                }

                self.HierarchypathForSet(data);
                self.selectedUserHierarchy(data);
                ADSearchUtil.selectedHierarchyIDs = new Array();
                ADSearchUtil.selectedHierarchyIDs.push(id);
                setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);
                self.hierarchytreeviewdata([new treeviewDataCunstructor(data)]);
                treeviwHierarchyStoredData = self.hierarchytreeviewdata();

                for (var i = 0; i < heirarchyData.length; i++) {
                    if (heirarchyData[i].hierarchies && heirarchyData[i].hierarchies.length > 0) {
                        advHierarchyDataRootIndex = i;
                        break;
                    }
                }
                return changeHierarchyCallback();
            }
            ADSearchUtil.changeHierarchy(id, level, callback, true);
        }

        self.editHierarchy = function (gID, cancelHierarchy) {
            var hierarchyId = self.HierarchypathForSet().Id;
            var updateDeviceReq = new Object();
            var Selector = new Object();
            var Device = new Object();

            var selectedDevices = 0;
            var selectedDeviceSearchItems = getSelectedUniqueId(gID);
            var unselectedDeviceSearchItems = getUnSelectedUniqueId(gID);
            var totalDevices = getTotalRowcount(gID);
            var checkAll = checkAllSelected(gID);

            if (checkAll == 1) {
                updateDeviceReq.DeviceSearch = ADSearchUtil.deviceSearchObj;
                Selector.SelectedItemIds = null;
                Selector.UnSelectedItemIds = unselectedDeviceSearchItems;
                selectedDevices = (!_.isEmpty(unselectedDeviceSearchItems) && unselectedDeviceSearchItems.length > 0) ? (totalDevices - unselectedDeviceSearchItems.length) : totalDevices;
            } else {
                updateDeviceReq.DeviceSearch = null;
                Selector.SelectedItemIds = selectedDeviceSearchItems;
                Selector.UnSelectedItemIds = null;
                selectedDevices = (!_.isEmpty(selectedDeviceSearchItems) && selectedDeviceSearchItems.length > 0) ? selectedDeviceSearchItems.length : 0;
            }

            Device.HierarchyId = hierarchyId;
            updateDeviceReq.Device = Device;
            updateDeviceReq.ColumnSortFilter = koUtil.GlobalColumnFilter;
            updateDeviceReq.Selector = Selector;
            var callbackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'hierarchy_successfully_updated');
                        gridRefreshClearSelection(gID);
                        cancelHierarchy();
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {                                //147
                        $('#updateDeviceId').modal('show');
                        $("#updateDeviceTextId").text(i18n.t('some_devices_refresh', { lng: lang }));
                    } else if (data.responseStatus.StatusCode == AppConstants.get('EX_UPDATE_DEVICESTATUS_FAILED_FOR_PERIPHERAL_DEVICES')) {    //415
                        if (selectedDevices === 1) {
                            openAlertpopup(2, 'ex_update_devicestatus_failed_for_single_peripheral_device');
                        } else {
                            openAlertpopup(2, 'ex_update_devicestatus_failed_for_peripheral_devices');
                        }
                        gridRefreshClearSelection(gID);
                        cancelHierarchy();
                    }
                }
            }
            var method = 'UpdateDevice';
            var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
            ajaxJsonCall(method, params, callbackfunction, true, 'POST', true)
        }

        self.editHierarchyForDeviceProfile = function (refereshHierarchyfordeviceProfile, cancelHierarchy) {
            var hierarchyId = self.HierarchypathForSet().Id;
            var updateDeviceReq = new Object();
            var Selector = new Object();
            var Device = new Object();
            var SubStatus = new Object();
            var uniqueDeviceIds = new Array();

            SubStatus.SubStatusId = 0;
            SubStatus.SubStatusName = "";

            uniqueDeviceIds.push(koUtil.deviceProfileUniqueDeviceId);

            Selector.SelectedItemIds = uniqueDeviceIds;
            Selector.UnSelectedItemIds = null;

            Device.HierarchyId = hierarchyId;
            updateDeviceReq.Device = Device;
            updateDeviceReq.Selector = Selector;
            updateDeviceReq.SubStatus = SubStatus;

            var callbackfunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        openAlertpopup(0, 'hierarchy_updated_success');
                        //refereshHierarchyfordeviceProfile();
                        cancelHierarchy();
                        refreshDeviceProfileLitePage(AppConstants.get('HIERARCHY_REFRESH_DATA'));
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {
                        cancelHierarchy();
                        openAlertpopup(1, 'selected_device_modified');
                    }
                }

            }
            var method = 'UpdateDevice';
            var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
            ajaxJsonCall(method, params, callbackfunction, true, 'POST', true);
        }

        self.setHierarchy = function (cancelHierarchy) {
            isHierarchyChange = true;
            $('#saveBtn').removeAttr('disabled');
            //$('#addBtn').removeAttr('disabled');
            $("#hierarchyModel").modal('hide');
            var arr = self.HierarchypathForSet();
            $("#hierarchyValue").val(self.HierarchypathForSet().HierarchyFullPath);
            $('#levelLabel').hide();
            $('#valueLabel').hide();
            $("#hierarchyValidationID").hide();

            koUtil.hierarchyIdForAddDevice = self.HierarchypathForSet().Id;

            $("#valueHierarchy").val(self.HierarchypathForSet().HierarchyName);

            for (i = 0; i < heirarchyData.length; i++) {
                if (heirarchyData[i].Level == self.HierarchypathForSet().Level) {
                    $("#levelUser").val(heirarchyData[i].Name)
                }
            }
            cancelHierarchy();
        }

        self.selectHierarchies = function (cancelHierarchy) {

            var HierarchyPathArr = self.hierarchyFullPath();
            koUtil.hierarchiesForAdd.removeAll();
            $("#itemTbodyHierarchies").empty();

            if (HierarchyPathArr.length > 0) {
                for (var i = 0; i < HierarchyPathArr.length; i++) {
                    koUtil.hierarchiesForAdd.push(HierarchyPathArr[i]);
                    var row = $("<tr />")
                    $("#itemTbodyHierarchies").append(row);
                    row.append($("<td>" + HierarchyPathArr[i].HierarchyName + "</td>"));
                    row.append($("<td>" + FindHierarchyLevelName(HierarchyPathArr[i].Level) + "</td>"));
                    isHierarchyChange = true;
                }
            }

            if (HierarchyPathArr.length == 0) {
                isHierarchyChange = false;
            }

            if (ADSearchUtil.AdScreenName == "addUser") {
                mandatoryFieldCheckForAddUser(isHierarchyChange);
            } else if (ADSearchUtil.AdScreenName == "editUserScreen") {
                mandatoryFieldCheckForEditUser(isHierarchyChange);
            }

            $("#hierarchyModel").modal('hide');
            cancelHierarchy();
        }

        function mandatoryFieldCheckForAddUser(isHierarchyChange) {
            if (IsVFSSOUser || IsForgeRockUser) {
                if ($.trim($("#firstNameVFSSO").val()).length == 0 || $.trim($("#lastNameVFSSO").val()).length == 0 || $.trim($("#emailIdVFSSO").val()).length == 0 || isHierarchyChange == false
                    || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            } else if (IsADFSUser) {
                if ($.trim($("#loginNameADFS").val()).length == 0 || $.trim($("#firstNameADFS").val()).length == 0 || $.trim($("#lastNameADFS").val()).length == 0 || isHierarchyChange == false
                    || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            } else {
                if ($.trim($("#loginName").val()).length == 0 || $.trim($("#firstName").val()).length == 0 || $.trim($("#lastName").val()).length == 0 || isHierarchyChange == false
                    || $("#roleTypeId").val() == null) {
                    $('#addBtn').prop('disabled', true);
                } else {
                    $('#addBtn').prop('disabled', false);
                }
            }
        }

        function mandatoryFieldCheckForEditUser(isHierarchyChange) {
            if ($.trim($("#loginName").val()).length == 0 || $.trim($("#firstName").val()).length == 0 || $.trim($("#lastName").val()).length == 0 ||
                ($("#rolesEditDropdown").is(':visible') && $("#editRoleTypeId").val() == null) || isHierarchyChange == false) {
                $('#saveBtn').prop('disabled', true);
            } else {
                $('#saveBtn').prop('disabled', false);
            }
        }

        //Cancel Hierarchy 
        self.cancelHierarchy = function () {
            $("#modalHierarchy").modal('hide');
        }

        self.addFromTreeView = function (flage) {
            if (flage == 'tree') {
                isHierarchySelected = false;
            }
            if (flage == 'tree' || flage == 'add') {
                self.flagetree(true);
                if (flage == 'add') {
                    if (flage == 'add' && treeviwHierarchyStoredData && treeviwHierarchyStoredData.ParentId >= 0) {
                        self.setHierarchyFullPathToCriteria(treeviwHierarchyStoredData, undefined, 'treeView');
                    } else {
                        openAlertpopup(1, 'Pl_sel_hierarchy');
                    }
                }
            } else {
                self.flagetree(false);
            }
        }

        self.getHierarchy = function (data) {

            ///for scrollposition
            AppliedValue = '';
            var divId = $("#" + data.Id + "Li").parent('ul').parent('div')[0].id;
            var position = $("#" + divId).scrollTop();
            var obj = new Object();
            obj.id = data.Id;
            obj.position = position;
            obj.Level = data.Level;
            hierarchyLipostionArr.push(obj);
            ///
            var indexOfSelectedId = $.inArray(data.Id, ADSearchUtil.selectedHierarchyIDs);
            if (indexOfSelectedId == -1) {
                ADSearchUtil.selectedHierarchyIDs.push(data.Id);
            }
            else {
                ADSearchUtil.selectedHierarchyIDs.splice(indexOfSelectedId + 1);
            }

            self.HierarchypathForSet(data);
            function clback(heirarchyData) {
                self.HierarchyLevels([]);
                var l = data.Level + 1;

                for (var i = 0; i < heirarchyData.length; i++) {
                    if (i >= l) {
                        heirarchyData[i].hierarchies = [];
                        var source = _.where(hierarchyLipostionArr, { Level: l });
                        hierarchyLipostionArr = jQuery.grep(hierarchyLipostionArr, function (value) {
                            var ind = hierarchyLipostionArr.indexOf(source[0]);
                            return (value != hierarchyLipostionArr[ind] && value != null);
                        });
                    }

                    if (changedFirstHierarchyLevel != null) {
                        if (heirarchyData[i].Level >= changedFirstHierarchyLevel) {
                            self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
                        }
                    }
                    else {
                        self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
                    }
                }
                setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);
            }
            ADSearchUtil.getHierarchy(data.Id, data.Level, clback, data.IsChildExists);
        }        

        self.setHierarchyFullPathToCriteria = function (data) {
            if (self.isNotSearchAdmin == true)
                return;
            if (ADSearchUtil.AdScreenName == "editHierarchy" || ADSearchUtil.AdScreenName == "deviceProfile")
                return;

            var objHierarchyFullPath = new Object();
            objHierarchyFullPath.HierarchyFullPath = data.HierarchyFullPath;
            objHierarchyFullPath.HierarchyId = data.Id;
            objHierarchyFullPath.IncludeChildren = data.IsChildExists;
            objHierarchyFullPath.IsChildExists = data.IsChildExists;
            objHierarchyFullPath.Level = data.Level;
            objHierarchyFullPath.HierarchyName = data.HierarchyName;
            objHierarchyFullPath.ParentId = data.ParentId;

            self.currentObjHierarchyFullPath(objHierarchyFullPath);

            var source = _.where(ADSearchUtil.HierarchyPathArr(), { HierarchyFullPath: data.HierarchyFullPath });

            if (isCallNotInProgress == true) {
                if (source != '') {
                    if (ADSearchUtil.AdScreenName == "addDeviceManually")
                        setHierarchyOndoubleClick();
                    else
                        openAlertpopup(1, 'Hierarchy_data_already_selected');
                } else if (self.flagSelectMultipleHierarchy()) {
                    isCallNotInProgress = false;
                    validateHierarchyforUser(objHierarchyFullPath);
                } else {
                    koUtil.isHierarchyModified(true);
                    ADSearchUtil.HierarchyPathArr.push(objHierarchyFullPath);
                    self.hierarchyFullPath(ADSearchUtil.HierarchyPathArr());
                }
            }
        }

        function setHierarchyOndoubleClick() {
            isHierarchyChange = true;
            $('#saveBtn').removeAttr('disabled');
            //$('#addBtn').removeAttr('disabled');
            $("#hierarchyModel").modal('hide');
            var arr = self.currentObjHierarchyFullPath();
            $("#hierarchyValue").val(self.currentObjHierarchyFullPath().HierarchyFullPath);
            $('#levelLabel').hide();
            $('#valueLabel').hide();
            $("#hierarchyValidationID").hide();

            koUtil.hierarchyIdForAddDevice = self.currentObjHierarchyFullPath().HierarchyId;

            $("#valueHierarchy").val(self.currentObjHierarchyFullPath().HierarchyName);

            for (i = 0; i < heirarchyData.length; i++) {
                if (heirarchyData[i].Level == self.currentObjHierarchyFullPath().Level) {
                    $("#levelUser").val(heirarchyData[i].Name)
                }
            }
            $("#modalHierarchy").modal('hide');
        }

        self.removeHierarchyPathFromCriteria = function (data) {
            var source = _.where(self.hierarchyFullPath(), { HierarchyFullPath: data.HierarchyFullPath });
            self.hierarchyFullPath.remove(source[0]);

        }

        self.hideinfoyesno = function () {
            $("#informationYesNoPopup").modal('hide');
        }

        self.deleteChildrenHierarchies = function () {
            $("#informationYesNoPopup").modal('hide');
            ADSearchUtil.HierarchyPathArr.removeAll();
            ADSearchUtil.HierarchyPathArr.push(self.currentObjHierarchyFullPath());

            self.hierarchyFullPath(ADSearchUtil.HierarchyPathArr());
        }

        function validateHierarchyforUser(objHierarchyFullPath) {
            var ValidateHierarchyForUserReq = new Object();
            var InExistingHierarchiesArray = new Array();
            InExistingHierarchiesArray = self.hierarchyFullPath();
            ValidateHierarchyForUserReq.HierarchyIds = new Array();
            var hierarchyCount = InExistingHierarchiesArray.length;
            if (InExistingHierarchiesArray && InExistingHierarchiesArray.length > 0) {
                if (InExistingHierarchiesArray.length >= maximumHierarchiesPerUser) {
                    openAlertpopup(1, 'Maximum_Hierarchies_Per_User', {
                        hierarchyCount: hierarchyCount
                    });
                    isCallNotInProgress = true;
                    return
                }

                for (var i = 0; i < InExistingHierarchiesArray.length; i++) {
                    ValidateHierarchyForUserReq.HierarchyIds.push(InExistingHierarchiesArray[i].HierarchyId)
                }
            }

            ValidateHierarchyForUserReq.NewHierarchy = objHierarchyFullPath.HierarchyId;

            var responsefunction = function (data, error) {
                setcountforloading = setcountforloading + 1;
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                        ADSearchUtil.HierarchyPathArr.push(objHierarchyFullPath);
                        self.hierarchyFullPath(ADSearchUtil.HierarchyPathArr());
                    } else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_HIERARCHY')) {
                        openAlertpopup(1, 'Duplicate_Hierarchy');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('PARENT_HIERARCHY_ALREADY_SELECTED')) {
                        openAlertpopup(1, 'Parent_hierarchy_already_selected');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('CHILD_HIERARCHY_ALREADY_SELECTED')) {
                        openAlertYesNopopup('Child_hierarchy_already_selected');
                    }
                }
                isCallNotInProgress = true;
            }
            var params = '{"token":"' + TOKEN() + '","validateHierarchyForUserReq":' + JSON.stringify(ValidateHierarchyForUserReq) + '}';
            ajaxJsonCall('ValidateHierarchyForUser', params, responsefunction, true, 'POST', false)
        }

        function openAlertYesNopopup(msg) {
            $("#informationYesNoPopup").modal("show");
            //$("#infoYesNoHead").addClass('c-green');
            //$("#infoYesNoHead").removeClass('c-blue');
            //$("#infoYesNoHead").removeClass('c-red');
            //$("#infoyesnoicon").removeClass('icon-information c-blue');
            //$("#infoyesnoicon").removeClass('icon-times-circle c-red');
            //$("#infoyesnoicon").addClass('icon-checkmark c-green');
            //$("#infoBtnYes").removeClass('btn-danger');
            //$("#infoBtnYes").removeClass('btn-primary');
            //$("#infoBtnYes").addClass('btn-success');
            $("#infoYesNoMessage").text(i18n.t(msg, { lng: lang }));
        }

        function setforeidtHierarchy(data, flag, selectedHierarchyData, selectedHierarchyIDs) {

            if (data != undefined && data.Id != undefined) {
                if ($.inArray(data.Id, ADSearchUtil.selectedHierarchyIDs) == -1) {
                    ADSearchUtil.selectedHierarchyIDs.push(data.Id);
                }
            }
            self.HierarchypathForSet(data);
            function clback(heirarchyData) {

                $("#loadingDiv").show()
                self.HierarchyLevels([]);
                var l = data.Level + 1;

                for (var i = 0; i < heirarchyData.length; i++) {
                    if (i >= l) {
                        heirarchyData[i].hierarchies = [];
                    }
                    if (i <= advHierarchyDataRootIndex) {
                        if (heirarchyData[i].hierarchies.length > 0) {
                            self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
                        }
                    }
                    else {
                        self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
                    }

                }
                //if (flag == 1) {

                //    var selarr = self.selectedHierarchyIDs();

                //    //alert('' + JSON.stringify(selarr))
                //    //setHierarchySelect(selarr);
                //    for (var i = 0; i < selarr.length; i++) {
                //        var id = '#' + selarr[i] + 'Li';
                //        $(id).addClass('active');
                //    }
                //} else {

                //}
                $('#' + heirarchyData[advHierarchyDataRootIndex].hierarchies[0].Id + 'Li').addClass('active');
                var selarr = self.selectedHierarchyIDs();

                for (var i = 0; i < selarr.length; i++) {
                    var divId = '';
                    var position = 0;
                    if ($("#" + selarr[i] + "Li").parent('ul').parent('div').html() != undefined) {
                        divId = $("#" + selarr[i] + "Li").parent('ul').parent('div')[0].id;
                        position = $("#" + divId).scrollTop();

                    }
                    var obj = new Object();
                    obj.id = selarr[i];
                    obj.position = position;
                    obj.Level = data.Level;
                    hierarchyLipostionArr.push(obj);
                    //alert('' + JSON.stringify(selarr))
                }
                setHierarchySelect(selarr);
                hierarchyLipostionArr = [];
                getHierarchyforEdit(data.Id, data.Level, selectedHierarchyData, selectedHierarchyIDs);
            }
            ADSearchUtil.getHierarchy(data.Id, data.Level, clback, data.IsChildExists);
        }

        function getHierarchyforEdit(id, level, selectedHierarchyData, selectedHierarchyIDs) {
            $("#loadingDiv").show()
            var hierarchy = new Object();
            hierarchy.Id = id;

            var hierarchyArr = new Array();
            var responsefunction = function (data, error) {
                setcountforloading = setcountforloading + 1;
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data.hierarchyList) {
                            data.hierarchyList = $.parseJSON(data.hierarchyList);
                            for (var h = 0; h < data.hierarchyList.length; h++) {
                                if (level != data.hierarchyList[h].Level) {
                                    //for (var t = 0; t < edithierarchyArr.length; t++) {
                                    if ($.inArray(data.hierarchyList[h].HierarchyName.trim(), edithierarchyArr) != -1) {
                                        if (edithierarchyArr && edithierarchyArr.length > 0) {
                                            if (edithierarchyArr[data.hierarchyList[h].Level - 1] == data.hierarchyList[h].HierarchyName.trim()) {
                                                var obj = new Object();
                                                obj.Description = data.hierarchyList[h].Description;
                                                obj.HierarchyFullPath = data.hierarchyList[h].HierarchyFullPath;
                                                obj.HierarchyIdFullPath = data.hierarchyList[h].HierarchyIdFullPath;
                                                obj.HierarchyName = data.hierarchyList[h].HierarchyName;
                                                obj.IPAddressRangeEnd = data.hierarchyList[h].IPAddressRangeEnd;
                                                obj.IPAddressRangeStart = data.hierarchyList[h].IPAddressRangeStart;
                                                obj.Id = data.hierarchyList[h].Id;
                                                obj.IsChildExists = data.hierarchyList[h].IsChildExists;
                                                obj.Level = data.hierarchyList[h].Level;
                                                obj.LocationId = data.hierarchyList[h].LocationId;
                                                obj.ParentId = data.hierarchyList[h].ParentId;
                                                obj.TimeZoneId = data.hierarchyList[h].TimeZoneId;
                                                selectedHierarchyData.push(obj);

                                                //if ($.inArray(data.hierarchyList[h].Id, selectedHierarchyIDs()) < 0) {

                                                selectedHierarchyIDs.push(data.hierarchyList[h].Id);

                                                setforeidtHierarchy(obj, 0, selectedHierarchyData, selectedHierarchyIDs);
                                                //}
                                                //break;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
            ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', false)
        }
        seti18nResourceData(document, resourceStorage);
    };
});
function hasChildElement(elm) {
    var child, rv;

    if (elm.children) {
        // Supports `children`
        rv = elm.children.length !== 0;
    } else {
        // The hard way...
        rv = false;
        for (child = element.firstChild; !rv && child; child = child.nextSibling) {
            if (child.nodeType == 1) { // 1 == Element
                rv = true;
            }
        }
    }
    return rv;
}
function gettreeviewHierarchy(self, id) {
    isHierarchySelected = true;
    var hierarchy = new Object();
    if ($(self).parent('div').children('i').first().hasClass("icon-angle-down")) {
        hierarchy.Id = id;
        var responsefunction = function (data, error) {
            if (data) {
                if (data.hierarchyList)
                    data.hierarchyList = $.parseJSON(data.hierarchyList);

                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $('.treeviewactive').removeClass('treeviewactive');
                    $(self).addClass('treeviewactive');
                    $(self).parent('div').next('div').empty();
                    var str = '';
                    str += '<ul id="Ul2" style="list-style-type:none">';
                    for (var i = 0; i < data.hierarchyList.length; i++) {

                        if (data.hierarchyList[i].Id != id) {
                            var iconclass = "";

                            if (data.hierarchyList[i].IsChildExists == true) {
                                iconclass = "icon-angle-right";
                            }
                            var thisid = "" + data.hierarchyList[i].Id + "";
                            str += '<li class="">';
                            str += '<div id=' + thisid + ' style="width:250px;padding:3px 10px">';
                            str += '<i style="font-size:17px;margin-right:5px;cursor:pointer" onclick="expandtreeview(this,this.parentElement.id)" class="' + iconclass + '"></i>'
                            if (data.hierarchyList[i].IsChildExists) {
                                str += '<i class="folder"></i>';

                            } else {
                                str += '<i class="folderopen"></i>';
                            }


                            str += '<span class="hierarchy-name-txt" tabindex="0"  title="' + data.hierarchyList[i].HierarchyName + '" onclick="gettreeviewHierarchy(this,this.parentElement.id)">' + data.hierarchyList[i].HierarchyName + '</span>';
                            str += '</div>';
                            if (data.hierarchyList[i].IsChildExists) {
                                str += '<div style="display:none">';
                                str += '</div>';
                            }
                            str += ' </li>';
                        } else {
                            treeviwHierarchyStoredData = data.hierarchyList[i];
                        }
                    }
                    str += '</ul>';
                    if (treeviwHierarchyStoredData.IsChildExists) {
                        $(self).parent('div').next('div').css("display", "inline");
                        $(self).parent('div').children('i').first().removeClass('icon-angle-right');
                        $(self).parent('div').children('i').first().addClass('icon-angle-down');
                    }
                    $(self).parent('div').next('div').append(str);



                }
            }
        }
        if (treeviwHierarchyStoredData && treeviwHierarchyStoredData.Id != id) {
            var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
            ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', true);
        } else {
            $(self).parent('div').next('div').children('ul').css("display", "none");
            $(self).parent('div').children('i').first().removeClass('icon-angle-down');
            $(self).parent('div').children('i').first().addClass('icon-angle-right');
        }
    } else {

        hierarchy.Id = id;
        var responsefunction = function (data, error) {
            if (data) {
                if (data.hierarchyList)
                    data.hierarchyList = $.parseJSON(data.hierarchyList);

                if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                    $('.treeviewactive').removeClass('treeviewactive');
                    $(self).addClass('treeviewactive');
                    $(self).parent('div').next('div').empty();
                    var str = '';
                    str += '<ul id="Ul2" style="list-style-type:none">';
                    for (var i = 0; i < data.hierarchyList.length; i++) {

                        if (data.hierarchyList[i].Id != id) {
                            var iconclass = "";

                            if (data.hierarchyList[i].IsChildExists == true) {
                                iconclass = "icon-angle-right";
                            }
                            var thisid = "" + data.hierarchyList[i].Id + "";
                            str += '<li class="">';
                            str += '<div id=' + thisid + ' style="width:250px;padding:3px 10px">';
                            str += '<i style="font-size:17px;margin-right:5px;cursor:pointer" onclick="expandtreeview(this,this.parentElement.id)" class="' + iconclass + '"></i>'
                            if (data.hierarchyList[i].IsChildExists) {
                                str += '<i class="folder"></i>';

                            } else {
                                str += '<i class="folderopen"></i>';
                            }


                            str += '<span class="hierarchy-name-txt" tabindex="0"  title="' + data.hierarchyList[i].HierarchyName + '" onclick="gettreeviewHierarchy(this,this.parentElement.id)">' + data.hierarchyList[i].HierarchyName + '</span>';
                            str += '</div>';
                            if (data.hierarchyList[i].IsChildExists) {
                                str += '<div style="display:none">';
                                str += '</div>';
                            }
                            str += ' </li>';
                        } else {
                            treeviwHierarchyStoredData = data.hierarchyList[i];
                        }
                    }
                    str += '</ul>';
                    if (treeviwHierarchyStoredData.IsChildExists) {
                        $(self).parent('div').next('div').css("display", "inline");
                        $(self).parent('div').children('i').first().removeClass('icon-angle-right');
                        $(self).parent('div').children('i').first().addClass('icon-angle-down');
                    }
                    $(self).parent('div').next('div').append(str);



                }
            }
        }
        if ($(self).parent('div').next('div').children('ul').length == 0) {

            var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
            ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', true);
        } else {
            $(self).parent('div').children('i').first().removeClass('icon-angle-right');
            $(self).parent('div').children('i').first().addClass('icon-angle-down');
            $(self).parent('div').next('div').children('ul').css("display", "");
        }
    }
}

function expandtreeview(self, id) {
    //if ($(self).parent('div').next('div').children('ul').html() == undefined) {

    //} else {

    if ($(self).hasClass('icon-angle-right')) {

        gettreeviewHierarchy(self, id);

    } else if ($(self).hasClass('icon-angle-down')) {
        $(self).removeClass('icon-angle-down');
        $(self).addClass('icon-angle-right');
        $(self).parent('div').next('div').children('ul').css("display", "none");
    }
    //}
}