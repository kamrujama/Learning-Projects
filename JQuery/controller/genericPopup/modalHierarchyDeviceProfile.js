define(["knockout", "advancedSearchUtil", "koUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "chosen", "appEnum"], function (ko, ADSearchUtil, koUtil) {
    var lang = getSysLang();

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

    return function HeirarchyViewModel() {

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

        $("#hierarchyUl>li").keyup(function (objEvent) {
            $("#hierarchyUl>li:focus").click();
        });

        self.hierarchyFullPath = ko.observableArray();
        if (ADSearchUtil.HierarchyPathArr() != null && ADSearchUtil.HierarchyPathArr().length > 0) {
            self.hierarchyFullPath(ADSearchUtil.HierarchyPathArr());
        }

        self.HierarchypathForSet = ko.observableArray();
        self.HierarchyLevels = ko.observableArray();
        self.selectedHierarchyData = ko.observableArray();
        self.selectedHierarchyIDs = ko.observableArray();
        self.filter = ko.observable('');
        self.filterStorage = ko.observableArray();
        existFilter = '';
        filterlevel = 0;

        //Hierarchy object
        var hierarchyConstructor = function (name, hierarchies, Level) {
            this.Name = ko.observable(name);
            this.hierarchies = ko.observableArray(hierarchies);
            this.Level = ko.observable(Level);
        }

        init();
        function init() {
            //heirarchyData is fetched from GetHierarchyLevels call in index.js
            for (var i = 0; i < heirarchyData.length; i++) {
                self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
            }

            var width = 240;
            var count = self.HierarchyLevels().length;
            width = width * count;
            $("#mainHierarchyViewDivDevice").css("cssText", 'width:' + width + 'px !important;');

            //hierarchy path of device
            var edithierarchyArr = koUtil.deviceHierarchy().split(' >> ');
            var path = null;
            var editsource = null;
            if (edithierarchyArr && edithierarchyArr.length > 0) {
                for (var i = 0; i < edithierarchyArr.length; i++) {
                    edithierarchyArr[i] = edithierarchyArr[i].trim();
                    if (editsource == null || editsource.length == 0) {
                        path = edithierarchyArr[i].trim();
                        for (var j = 0; j < userGlobalData.userHierarchies.length; j++) {
                            if (userGlobalData.userHierarchies[j] != null && userGlobalData.userHierarchies[j].HierarchyName == path) {
                                editsource = userGlobalData.userHierarchies[j];
                                break;
                            }
                        }
                    } else {
                        break;
                    }
                }
            }

            if (editsource != null) {
                ADSearchUtil.selectedHierarchyIDs = new Array();
                setHierarchySelectionByLevel(editsource, edithierarchyArr, 0, self.selectedHierarchyData, self.selectedHierarchyIDs);
            }
        }

        function setHierarchySelectionByLevel(data, hierarchyNames, index, selectedHierarchyData, selectedHierarchyIDs) {
            var id = data.Id;
            var level = data.HierarchyLevel ? data.HierarchyLevel.Level : data.Level;

            //heirarchyData is fetched from GetHierarchyLevels call in index.js
            var start = 0;
            index == 0 ? (start = 0) : (start = index + 1);
            for (var i = start; i < heirarchyData.length; i++) {
                heirarchyData[i].hierarchies = [];
            }
            getHierarhiesForSelectedLevel(id, level, hierarchyNames, index, selectedHierarchyData, selectedHierarchyIDs);
        }

        function getHierarhiesForSelectedLevel(id, level, hierarchyNames, index, selectedHierarchyData, selectedHierarchyIDs) {
            var hierarchy = new Object();
            hierarchy.Id = id;
            var hierarchyArrayRoot = new Array();
            var hierarchyArray = new Array();
            var rootHierarchyDataIndex = level - heirarchyData[0].Level;

            var responsefunction = function (data, error) {
                if (data) {
                    if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

                        if (data.hierarchyList) {
                            data.hierarchyList = $.parseJSON(data.hierarchyList);

                            //setting the root hierarchy children
                            if (data.hierarchyList && data.hierarchyList.length > 0) {
                                var objRoot = new Object();
                                objRoot.Description = data.hierarchyList[0].Description;
                                objRoot.HierarchyFullPath = data.hierarchyList[0].HierarchyFullPath;
                                objRoot.HierarchyIdFullPath = data.hierarchyList[0].HierarchyIdFullPath;
                                objRoot.HierarchyName = data.hierarchyList[0].HierarchyName;
                                objRoot.IPAddressRangeEnd = data.hierarchyList[0].IPAddressRangeEnd;
                                objRoot.IPAddressRangeStart = data.hierarchyList[0].IPAddressRangeStart;
                                objRoot.Id = data.hierarchyList[0].Id;
                                objRoot.IsChildExists = data.hierarchyList[0].IsChildExists;
                                objRoot.Level = data.hierarchyList[0].Level;
                                objRoot.LocationId = data.hierarchyList[0].LocationId;
                                objRoot.ParentId = data.hierarchyList[0].ParentId;
                                objRoot.TimeZoneId = data.hierarchyList[0].TimeZoneId;
                                hierarchyArrayRoot.push(objRoot);
                                if (index === 0) {
                                    heirarchyData[rootHierarchyDataIndex].hierarchies = hierarchyArrayRoot;
                                }

                                self.selectedHierarchyIDs = jQuery.grep(self.selectedHierarchyIDs, function (value) {
                                    return (value != data.hierarchyList[0].Id && value != null);
                                });

                                //set root hierarchy selection
                                var source = _.where(selectedHierarchyData, { id: objRoot.Id });
                                if (!source || source.length === 0) {
                                    selectedHierarchyData.push(objRoot);
                                }
                                selectedHierarchyIDs.push(data.hierarchyList[0].Id);
                                if ($.inArray(objRoot.Id, ADSearchUtil.selectedHierarchyIDs) == -1) {
                                    setSelectionForHierarchy(objRoot);
                                }
                                for (var h = 0; h < data.hierarchyList.length; h++) {
                                    if (heirarchyData[index].Level != data.hierarchyList[h].Level) {
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
                                        hierarchyArray.push(obj);
                                        heirarchyData[(obj.Level - heirarchyData[0].Level)].hierarchies = hierarchyArray;

                                        self.selectedHierarchyIDs = jQuery.grep(self.selectedHierarchyIDs, function (value) {
                                            return (value != data.hierarchyList[h].Id && value != null);
                                        });

                                        var itemIndex = h;
                                        if ($.inArray(data.hierarchyList[itemIndex].HierarchyName.trim(), hierarchyNames) > -1) {
                                            if (hierarchyNames[data.hierarchyList[itemIndex].Level - 1] == data.hierarchyList[itemIndex].HierarchyName.trim()) {
                                                var selectedChildHierarchy = new Object();
                                                selectedChildHierarchy.Description = data.hierarchyList[itemIndex].Description;
                                                selectedChildHierarchy.HierarchyFullPath = data.hierarchyList[itemIndex].HierarchyFullPath;
                                                selectedChildHierarchy.HierarchyIdFullPath = data.hierarchyList[itemIndex].HierarchyIdFullPath;
                                                selectedChildHierarchy.HierarchyName = data.hierarchyList[itemIndex].HierarchyName;
                                                selectedChildHierarchy.IPAddressRangeEnd = data.hierarchyList[itemIndex].IPAddressRangeEnd;
                                                selectedChildHierarchy.IPAddressRangeStart = data.hierarchyList[itemIndex].IPAddressRangeStart;
                                                selectedChildHierarchy.Id = data.hierarchyList[itemIndex].Id;
                                                selectedChildHierarchy.IsChildExists = data.hierarchyList[itemIndex].IsChildExists;
                                                selectedChildHierarchy.Level = data.hierarchyList[itemIndex].Level;
                                                selectedChildHierarchy.LocationId = data.hierarchyList[itemIndex].LocationId;
                                                selectedChildHierarchy.ParentId = data.hierarchyList[itemIndex].ParentId;
                                                selectedChildHierarchy.TimeZoneId = data.hierarchyList[itemIndex].TimeZoneId;

                                                var source = _.where(selectedHierarchyData, { id: selectedChildHierarchy.Id });
                                                if (!source || source.length === 0) {
                                                    selectedHierarchyData.push(selectedChildHierarchy);
                                                }
                                                if ($.inArray(selectedChildHierarchy.Id, selectedHierarchyIDs) == -1) {
                                                    selectedHierarchyIDs.push(selectedChildHierarchy.Id);
                                                }
                                                if ($.inArray(selectedChildHierarchy.Id, ADSearchUtil.selectedHierarchyIDs) == -1) {
                                                    setSelectionForHierarchy(selectedChildHierarchy);
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        setSelectedHierarchyActive(heirarchyData, objRoot, selectedChildHierarchy, id, level, index, selectedHierarchyData, selectedHierarchyIDs);

                        //call GetHierarchies till the leaf node level of device hierarchy full path
                        if (index < hierarchyNames.length - 1) {
                            setHierarchySelectionByLevel(selectedChildHierarchy, hierarchyNames, (index + 1), selectedHierarchyData, selectedHierarchyIDs);
                        }
                    }
                }
            }
            var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
            ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', true);
        }

        function setSelectedHierarchyActive(heirarchyData, data, childData, id, level, index, selectedHierarchyData, selectedHierarchyIDs) {
            self.HierarchyLevels([]);
            for (var i = 0; i < heirarchyData.length; i++) {
                self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
            }

            if (data === null || data === undefined) {
                srollSelectedHierarchyTop(ADSearchUtil.selectedHierarchyIDs);
                return;
            }

            var selarr = selectedHierarchyIDs();
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
                obj.Level = (i === 0 || childData === undefined) ? data.Level : childData.Level;
                hierarchyLipostionArr.push(obj);
            }
            srollSelectedHierarchyTop(selarr);
        }

        function setSelectionForHierarchy(data) {

            if (data != undefined && data.Id != undefined) {
                if ($.inArray(data.Id, ADSearchUtil.selectedHierarchyIDs) == -1) {
                    ADSearchUtil.selectedHierarchyIDs.push(data.Id);
                }
            }
        }

        function srollSelectedHierarchyTop(selectedHierarchyIDs) {
            for (var i = 0; i < selectedHierarchyIDs.length; i++) {
                $("#" + selectedHierarchyIDs[i] + "Li").parent('ul').each(function () {
                    $(this).children('li').removeClass('active');
                });

                $("#" + selectedHierarchyIDs[i] + "Li").addClass('active');
                if (hierarchyLipostionArr != '') {
                    var source = _.where(hierarchyLipostionArr, { id: selectedHierarchyIDs[i] });
                    if (source != '') {
                        if ($("#" + selectedHierarchyIDs[i] + "Li").parent('ul').parent('div').html() != undefined) {
                            var divId = $("#" + selectedHierarchyIDs[i] + "Li").parent('ul').parent('div')[0].id;
                            var pos = $("#" + selectedHierarchyIDs[i] + "Li").index();
                            pos = pos * 37;
                            $("#" + divId).scrollTop(pos);
                        }
                    }
                }
            }
        }

        self.getHierarchy = function (data) {

            //to scroll selected hierarchy to top
            AppliedValue = '';
            var divId = $("#" + data.Id + "Li").parent('ul').parent('div')[0].id;
            var position = $("#" + divId).scrollTop();

            var source = _.where(hierarchyLipostionArr, { Id: data.Id });
            if (!source || source.length === 0) {
                var obj = new Object();
                obj.id = data.Id;
                obj.position = position;
                obj.Level = data.Level;
                hierarchyLipostionArr.push(obj);
            }
            
            var indexOfSelectedId = $.inArray(data.Id, ADSearchUtil.selectedHierarchyIDs);
            if (indexOfSelectedId == -1) {
                ADSearchUtil.selectedHierarchyIDs.push(data.Id);
            } else {
                ADSearchUtil.selectedHierarchyIDs.splice(indexOfSelectedId + 1);
            }
            self.HierarchypathForSet(data);

            function callback(heirarchyData) {
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
                    self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
                }
                srollSelectedHierarchyTop(ADSearchUtil.selectedHierarchyIDs);
            }

            ADSearchUtil.getHierarchy(data.Id, data.Level, callback, data.IsChildExists);
        }

        self.editHierarchyForDeviceProfile = function (cancelHierarchy) {
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
                        cancelHierarchy();
                        refreshDeviceProfileLitePage(AppConstants.get('HIERARCHY_REFRESH_DATA'));
                    } else if (data.responseStatus.StatusCode == AppConstants.get('SELECTED_DEVICE_MODIFIED')) {                                //147
                        cancelHierarchy();
                        openAlertpopup(1, 'selected_device_modified');
                    } else if (data.responseStatus.StatusCode == AppConstants.get('EX_UPDATE_DEVICESTATUS_FAILED_FOR_PERIPHERAL_DEVICES')) {    //415
                        openAlertpopup(2, 'ex_update_devicestatus_failed_for_single_peripheral_device');
                        gridRefreshClearSelection(gID);
                        cancelHierarchy();
                    }
                }

            }
            var method = 'UpdateDevice';
            var params = '{"token":"' + TOKEN() + '","updateDeviceReq":' + JSON.stringify(updateDeviceReq) + '}';
            ajaxJsonCall(method, params, callbackfunction, true, 'POST', true);
        }

        self.cancelHierarchy = function () {
            deviceLiteData = new Object();
            $('#deviceProfileModel').modal('hide');
        }

        /***** Panel Filter *****/
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
        /***** Panel Filter *****/

        seti18nResourceData(document, resourceStorage);
    }
});