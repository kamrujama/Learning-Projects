define(["knockout", "koUtil", "autho", "advancedSearchUtil", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "chosen", "soapclient"], function (ko, koUtil, autho, ADSearchUtil) {
	var isModifyAllowed;
	var lang = getSysLang();
	columnSortFilter = new Object();

    var hierarchyId = "";
	var parentId = "";
	var description = "";
	var level = "";
	var hierarchyName = "";
	var iPAddressRangeStart = "";
	var iPAddressRangeEnd = "";
	var locationId = "";
	var timeZoneId = "";
	var entityUid = "";
	var entityType = "";
	var operation = 0;
	globalSelectedUserHierarchy = null;
	firstChangedHierarchyLevel = null;
	hierarchyDataRootIndex = 0;
	isAddEditHierarchy = false;
	//Localization
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function alertHistoryViewModel() {


		///Chosen
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

		//Chosen dropdown
		ko.bindingHandlers.chosen = {
			init: function (element) {
				ko.bindingHandlers.options.init(element);
				$(element).chosen({ disable_search_threshold: 10 });
			},
			update: function (element, valueAccessor, allBindings) {
				ko.bindingHandlers.options.update(element, valueAccessor, allBindings);
				$(element).trigger('chosen:updated');
			}
		};

		$(".chosen-results").css("max-height", "122px");
		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#hierarchyDelete').on('shown.bs.modal', function (e) {
			$('#hierarchyDelete_No').focus();

		});
		$('#hierarchyDelete').keydown(function (e) {
			if ($('#hierarchyDelete_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#hierarchyDelete_Yes').focus();
			}
		});

		$('#setHierarchyModel').on('shown.bs.modal', function (e) {
			$('#setHierarchyModel_No').focus();

		});
		$('#setHierarchyModel').keydown(function (e) {
			if ($('#setHierarchyModel_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#setHierarchyModel_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		var self = this;
		ADSearchUtil.loadInitialUserData();
		self.maximumHierarchyLevel = ko.observable();
		self.maximumHierarchyLevel(heirarchyData[heirarchyData.length - 1].Level);
		self.changedFirstHierarchyId = ko.observable();
		self.HierarchypathForSet = ko.observableArray();
		self.HierarchyLevels = ko.observableArray();
        self.selectedHierarchyIDs = ko.observableArray();
        self.selectedHierarchyData = ko.observableArray();
        self.isVisible = ko.observable(isCustomerEnabledforVerifoneCentral);

        var edithierarchyArr = [];

		if (koUtil.lastFetchedHierarchyFullPath) {
			$('#setPreviousSelection').modal('show');
			$("#setPreviousHierarchySelection").text(i18n.t('previous_hierarchy_selection', { lng: lang }));
		} else {
			refreshInitialData();
		}
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
				if (filter != undefined) {
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
							if (ivalue.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
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
							if (ivalue.toLowerCase().indexOf(filter.toLowerCase()) !== -1) {
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
		self.setPreviousSelection = function () {
			if (koUtil.lastFetchedHierarchyFullPath) {
				edithierarchyArr = koUtil.lastFetchedHierarchyFullPath.split('>>');
				var path = null;
				var editsource = null;
				for (var i = 0; i < edithierarchyArr.length; i++) {
					edithierarchyArr[i] = edithierarchyArr[i].trim();
					if (editsource == null || editsource.length == 0) {
						path = edithierarchyArr[i].trim();
						editsource = _.where(heirarchyData[hierarchyDataRootIndex].hierarchies, { HierarchyName: path });
					}
				}
				if (editsource != null && editsource.length > 0) {
					setforeidtHierarchy(editsource[0], 0, self.selectedHierarchyData, self.selectedHierarchyIDs);
				}
				else {
					refreshInitialData();
				}
			} else {
				refreshInitialData();
			}
			koUtil.isAddHierarchyFlag = false;
			if (edithierarchyArr.length > 1) {
				operation = 2;
				koUtil.isEditHierarchyFlag = true;
			} else {
				koUtil.isEditHierarchyFlag = false;
			}
			$("#addBtn").prop('disabled', true);
			$("#saveBtn").prop('disabled', true);
			$('#setPreviousSelection').modal('hide');
		}

		self.setInitialSelection = function () {
			refreshInitialData();
			koUtil.lastFetchedHierarchyFullPath = '';
			koUtil.isAddHierarchyFlag = false;
			koUtil.isEditHierarchyFlag = false;
			$("#addBtn").prop('disabled', true);
			$("#saveBtn").prop('disabled', true);
			$('#setPreviousSelection').modal('hide');
		}
		checkRightsHierarchies();
		$("#addBtn").hide();

		$('#btnRefresh').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#btnRefresh').click();
			}
		});

		$('#manageHierarchyLevelId').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#manageHierarchyLevelId').click();
			}
		});

		$('#uploadHierarchyFile').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#uploadHierarchyFile').click();
			}
		});

		$('#cancelBtn').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#cancelBtn').click();
			}
		});

		$('#saveBtn').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#saveBtn').click();
			}
		});
		$('#addBtn').bind('keyup', function (e) {
			if (e.keyCode === 13) {
				$('#addBtn').click();
			}
		});

		self.UserHiearchies = ko.observableArray();
		self.selectedUserHierarchy = ko.observable();
		GetUser(self.UserHiearchies);

		//Check rights
		self.checkRights = function (screenName, rightsFor) {
			var retval = autho.checkRightsBYScreen(screenName, rightsFor);
			return retval;
		}

		//Check Rights for Hierarchies
		function checkRightsHierarchies() {
			SetUserInputAccessForAdd(false);
			var retval = autho.checkRightsBYScreen('Groups and Hierarchies', 'IsDeleteAllowed');
			var retvalLevel = autho.checkRightsBYScreen('Groups and Hierarchies', 'IsModifyAllowed');
			if (retvalLevel == false) {
				$("#cancelBtn").prop("disabled", true);
			} else {
				$("#cancelBtn").prop("disabled", false);
			}
			isModifyAllowed = retvalLevel;
			if (retvalLevel == true) {
				SetUserInputAccessForAdd(true)
			}

			if (retval == true || retvalLevel == true) {
				$("#manageHierarchyLevelId").prop("disabled", false);
			} else {
				$("#manageHierarchyLevelId").prop("disabled", true);
			}
			return retval;
		}

		function SetUserInputAccessForAdd(bState) {
			if (bState == true) {
				$("#manageHierarchyLevelId").prop("disabled", false);
				$("#uploadHierarchyFile").prop("disabled", false);
			} else {
				$("#manageHierarchyLevelId").prop("disabled", true);
				$("#uploadHierarchyFile").prop("disabled", true);
			}

		}


		self.TimeZoneId = ko.observable();
		//open popup
		self.observableModelPopup = ko.observable();
		self.description = ko.observable();
		self.ipStartingAddress = ko.observable();
		self.ipEndingAddress = ko.observable();
		self.locationIdentifier = ko.observable();
		self.timeZone = ko.observable();
		self.timeZoneValue = ko.observable();
		self.entityUid = ko.observable();
		self.entityType = ko.observable();

		setMenuSelection();

		self.deleteflage = ko.observable(false);


		var modelName = 'unloadTemplate';
		loadelement(modelName, 'genericPopup');
		self.templateFlag = ko.observable(false);
		self.gridIdForShowHide = ko.observable();

		self.getTimeZoneArray = ko.observableArray(getAllTimeZones);
		self.getEntityTypes = ko.observableArray(getMultiCoiceFilterArr('EntityType'));

		modelReposition();

		self.openPopup = function (popupName, gId) {
			self.templateFlag(true);
			if (popupName == "modelUploadHierarchyFile") {
				loadelement(popupName, 'administration');
				$('#downloadModel').modal('show');
			} else if (popupName == "modelHierarchyLevels") {
				loadelement(popupName, 'administration');
				$('#downloadModel').modal('show');
			}

		}

		self.unloadTempPopup = function (popupName, gId, exportflage) {
            self.observableModelPopup('unloadTemplate');
            $('#downloadModel').modal('hide');
		}

		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
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

		//Validation
		self.hierarchyName = ko.observable('').extend({
			required: {
				params: true,
				message: i18n.t('enter_hierarchy_name', {
					lng: lang
				})
			}
		});

		////Enable/disable save button
		$("#hierarchyName").on('change keyup paste', function () {
			if ($("#fileinput").val() != "") {
				if (isModifyAllowed == true && (koUtil.isAddHierarchyFlag == true || koUtil.isEditHierarchyFlag == true)) {

					$('#saveBtn').removeAttr('disabled');
					$('#addBtn').removeAttr('disabled');
				}
			}
		});

		$("#description").on('change keyup paste', function () {
			if ($("#fileinput").val() != "") {
				if (isModifyAllowed == true && (koUtil.isAddHierarchyFlag == true || koUtil.isEditHierarchyFlag == true)) {

					$('#saveBtn').removeAttr('disabled');
					$('#addBtn').removeAttr('disabled');
				}
			}
		});

		$("#txtEntityUid").on('change keyup paste', function () {
			if ($("#fileinput").val() != "") {
				if (isModifyAllowed == true && (koUtil.isAddHierarchyFlag == true || koUtil.isEditHierarchyFlag == true)) {

					$('#saveBtn').removeAttr('disabled');
					$('#addBtn').removeAttr('disabled');
				}
			}
		});

		$("#startIpAddress").on('change keyup paste', function () {
			if ($("#fileinput").val() != "") {

				if (isModifyAllowed == true && (koUtil.isAddHierarchyFlag == true || koUtil.isEditHierarchyFlag == true)) {

					$('#saveBtn').removeAttr('disabled');
					$('#addBtn').removeAttr('disabled');
				}
			}
		});


		$("#endIpAddress").on('change keyup paste', function () {
			if ($("#fileinput").val() != "") {
				if (isModifyAllowed == true && (koUtil.isAddHierarchyFlag == true || koUtil.isEditHierarchyFlag == true)) {

					$('#saveBtn').removeAttr('disabled');
					$('#addBtn').removeAttr('disabled');
				}
			}
		});

		$('#startIpAddress').keyup(function () {
			var yourInput = $(this).val();
			re = /[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi;

			// store current positions in variables
			var start = this.selectionStart,
				end = this.selectionEnd;

			var isSplChar = re.test(yourInput);
			if (isSplChar) {
				var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi, '');
				$(this).val(no_spl_char);

				// restore from variables...
				this.setSelectionRange(start - 1, end - 1);
			}
		});

		$('#endIpAddress').keyup(function () {
			var yourInput = $(this).val();
			re = /[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi;

			// store current positions in variables
			var start = this.selectionStart,
				end = this.selectionEnd;

			var isSplChar = re.test(yourInput);
			if (isSplChar) {
				var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",^a-zA-Z<>\{\}\[\]\\\-_/]/gi, '');
				$(this).val(no_spl_char);

				// restore from variables...
				this.setSelectionRange(start - 1, end - 1);
			}
		});
		$("#locationIdentifier").on('change keyup paste', function () {
			if ($("#fileinput").val() != "") {
				if (isModifyAllowed == true && (koUtil.isAddHierarchyFlag == true || koUtil.isEditHierarchyFlag == true)) {

					$('#saveBtn').removeAttr('disabled');
					$('#addBtn').removeAttr('disabled');
				}
			}
		});

		self.onChangeTimeZone = function () {

			$("#validateTargetUser").empty();
			if ($("#timeZone").find('option:selected').text() == "Select Time Zone") {
				// self.ConfigValue(null);
			} else {
				$("#validateTargetUser").empty();
				if (isModifyAllowed == true && (koUtil.isAddHierarchyFlag == true || koUtil.isEditHierarchyFlag == true)) {

					$('#saveBtn').removeAttr('disabled');
					$('#addBtn').removeAttr('disabled');
				}
			}
		}

		self.onChangeEntityType = function () {
			if ($("#selectEntityType").find('option:selected').text() == "") {
				self.entityType(null);
			} else {
				self.entityType($("#selectEntityType").find('option:selected').text());
				$('#saveBtn').removeAttr('disabled');
				$('#addBtn').removeAttr('disabled');
			}
		}

		function setEntityType(entityType) {
			if (entityType === "") {
				$('#selectEntityType').val('-Select-').prop("selected", "selected");
				$('#selectEntityType').trigger('chosen:updated');
			} else {
				$('#selectEntityType').val(entityType).prop("selected", "selected");
				$('#selectEntityType').trigger('chosen:updated');
			}
		}
		
		////////////////////////////End//////////////////////////////////


		// allow only 255 charcters in hierarchy name.
		$("#hierarchyName").on("keypress keyup paste", function (e) {
			var textMax = 255;
			var textLength = $('#hierarchyName').val().length;
			var textRemaining = textMax - textLength;
		});

		// allow only 15 charcters in startIpAddress.
		$("#startIpAddress").on("keypress keyup paste", function (e) {
			var textMax = 15;
			var textLength = $('#startIpAddress').val().length;
			var textRemaining = textMax - textLength;
		});

		// allow only 15 charcters in endIpAddress.
		$("#endIpAddress").on("keypress keyup paste", function (e) {
			var textMax = 15;
			var textLength = $('#endIpAddress').val().length;
			var textRemaining = textMax - textLength;
		});


		//Hierrachy related code
		var hierarchyConstructor = function (name, hierarchies, Level) {

			this.Name = ko.observable(name);
			this.hierarchies = ko.observableArray(hierarchies);
			this.Level = ko.observable(Level);

		}

		for (var i = 0; i < heirarchyData.length; i++) {
			self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
		}

		function refreshInitialData() {
			var rootId;
			if (heirarchyData[hierarchyDataRootIndex] != null && heirarchyData[hierarchyDataRootIndex].hierarchies.length > 0) {
				rootId = heirarchyData[hierarchyDataRootIndex].hierarchies[0].Id
			} else {
				rootId = userGlobalData.userHierarchies[0].Id;
			}

			function hierarchyCallback(heirarchyData) {
				self.HierarchyLevels([]);
				var l = heirarchyData[hierarchyDataRootIndex].Level + 1;
				if (heirarchyData && heirarchyData.length > 0) {
					for (var i = 0; i < heirarchyData.length; i++) {
						if (i >= l) {
							heirarchyData[i].hierarchies = [];
						}
						if (heirarchyData[i].Level >= l - 1) {
							self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
						}
					}

					if (heirarchyData[0].hierarchies && heirarchyData[0].hierarchies.length > 0) {
						self.hierarchyName(heirarchyData[0].hierarchies[0].HierarchyName);
						self.description(heirarchyData[0].hierarchies[0].Description);
						self.ipStartingAddress(heirarchyData[0].hierarchies[0].IPAddressRangeStart);
						self.ipEndingAddress(heirarchyData[0].hierarchies[0].IPAddressRangeEnd);
						self.locationIdentifier(heirarchyData[0].hierarchies[0].LocationId);
                        self.entityUid(heirarchyData[0].hierarchies[0].EntityUid);
						self.entityType(heirarchyData[0].hierarchies[0].EntityType);
						
						hierarchyId = heirarchyData[0].hierarchies[0].Id;
						parentId = heirarchyData[0].hierarchies[0].ParentId;
						level = heirarchyData[0].hierarchies[0].Level;
						timeZoneId = heirarchyData[0].hierarchies[0].TimeZoneId;
						self.timeZoneFunction(self.TimeZoneId, heirarchyData[0].hierarchies[0]);
					}
				}

				ADSearchUtil.selectedHierarchyIDs = new Array();
				ADSearchUtil.selectedHierarchyIDs.push(rootId);
				setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);

				koUtil.isEditHierarchyFlag = true;
				operation = 2;
			}
			ADSearchUtil.getHierarchy(rootId, heirarchyData[hierarchyDataRootIndex].Level, hierarchyCallback, true);
		}

		self.refreshData = function () {
			koUtil.isAddHierarchyFlag = false;
			koUtil.isEditHierarchyFlag = false;
			$("#addBtn").prop('disabled', true);
			$("#saveBtn").prop('disabled', true);

			function hierarchyCallback(heirarchyData) {
				self.HierarchyLevels([]);
				var l = level + 1;
				for (var i = 0; i < heirarchyData.length; i++) {
					if (i >= l) {
						heirarchyData[i].hierarchies = [];
						var source = _.where(hierarchyLipostionArr, { Level: l });
						hierarchyLipostionArr = jQuery.grep(hierarchyLipostionArr, function (value) {
							var ind = hierarchyLipostionArr.indexOf(source[0]);
							return (value != hierarchyLipostionArr[ind] && value != null);
						});

					}
					if (firstChangedHierarchyLevel != null) {
						if (heirarchyData[i].Level >= firstChangedHierarchyLevel) {
							self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
						}
					}
					else {
						self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
					}
				}

				self.maximumHierarchyLevel(heirarchyData[heirarchyData.length - 1].Level);
				var mlength = 260;
				var cl = self.HierarchyLevels().length;
				mlength = mlength * cl;

				$("#mainHierarchyViewDiv").css("width", mlength + "px");
				ADSearchUtil.selectedHierarchyIDs = new Array();
				ADSearchUtil.selectedHierarchyIDs.push(id);
				setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);
				for (var i = 0; i < heirarchyData.length; i++) {
					if (heirarchyData[i].hierarchies.length > 0) {
						fetchAssignedHierarchiesForUser(heirarchyData[i].hierarchies[0]);
						break;
					}
				}
				///$("mainPageBody").css("height", '651px')
			}
			var id = '';
			var level = '';
			if (self.changedFirstHierarchyId() != null) {
				id = self.changedFirstHierarchyId();
			}
			else {
				id = heirarchyData[0].hierarchies[0].Id;
			}
			if (firstChangedHierarchyLevel != null) {
				level = firstChangedHierarchyLevel;
			}
			else {
				level = heirarchyData[0].Level;
			}
			ADSearchUtil.getHierarchy(id, level, hierarchyCallback, true);
			self.cancelClick();
		}

		function setforeidtHierarchy(data, flag, selectedHierarchyData, selectedHierarchyIDs) {
			if ($.inArray(data.Id, ADSearchUtil.selectedHierarchyIDs) == -1) {
				ADSearchUtil.selectedHierarchyIDs.push(data.Id);
			}
			self.HierarchypathForSet(data);

			function hierarchyCallback(heirarchyData) {

				$("#loadingDiv").show()
				self.HierarchyLevels([]);
				var l = data.Level + 1;

				for (var i = 0; i < heirarchyData.length; i++) {
					if (i >= l) {
						heirarchyData[i].hierarchies = [];
					}
					if (i <= hierarchyDataRootIndex) {
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

				//    //setHierarchySelect(selarr);
				//    for (var i = 0; i < selarr.length; i++) {
				//        var id = '#' + selarr[i] + 'Li';
				//        $(id).addClass('active');
				//    }
				//} else {

				//}
				$('#' + heirarchyData[hierarchyDataRootIndex].hierarchies[0].Id + 'Li').addClass('active');
				var selarr = self.selectedHierarchyIDs();

				//setHierarchySelect(selarr);
				for (var i = 0; i < selarr.length; i++) {
					var id = '#' + selarr[i] + 'Li';
					$(id).addClass('active');
				}
				getHierarchyforEdit(data.Id, data.Level, selectedHierarchyData, selectedHierarchyIDs);
			}
			ADSearchUtil.getHierarchy(data.Id, data.Level, hierarchyCallback, data.IsChildExists);
		}

		function getHierarchyforEdit(id, level, selectedHierarchyData, selectedHierarchyIDs) {
			$("#loadingDiv").show()
			var hierarchy = new Object();
			hierarchy.Id = id;

			var responsefunction = function (data, error) {
				//setcountforloading = setcountforloading + 1;
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						if (data.hierarchyList) {
							data.hierarchyList = $.parseJSON(data.hierarchyList);
							for (var h = 0; h < data.hierarchyList.length; h++) {
								if (level != data.hierarchyList[h].Level) {
									//for (var t = 0; t < edithierarchyArr.length; t++) {
									if ($.inArray(data.hierarchyList[h].HierarchyName.trim(), edithierarchyArr) != -1) {
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

										obj.EntityUid = data.hierarchyList[h].EntityUid;
										obj.EntityType = data.hierarchyList[h].EntityType;

										selectedHierarchyData.push(obj);

										selectedHierarchyIDs.push(data.hierarchyList[h].Id);

										setforeidtHierarchy(obj, 0, selectedHierarchyData, selectedHierarchyIDs);

										if (obj.HierarchyName == edithierarchyArr[edithierarchyArr.length - 1]) {
											self.hierarchyName(obj.HierarchyName);
											self.description(obj.Description);
											self.ipStartingAddress(obj.IPAddressRangeStart);
											self.ipEndingAddress(obj.IPAddressRangeEnd);
											self.locationIdentifier(obj.LocationId);
											self.entityUid(obj.EntityUid);
											self.entityType(obj.EntityType);
											hierarchyId = obj.Id;
											parentId = obj.ParentId;
											level = obj.Level;
											timeZoneId = obj.TimeZoneId;
											self.timeZoneFunction(self.TimeZoneId, obj);
											setEntityType(obj.EntityType);
										}
									}
								}
							}
						}
					}
				}

			}
			var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
			ajaxJsonCall('GetHierarchies', params, responsefunction, true, 'POST', false);
		}

		self.changeHierarchyData = function (data) {
			var id = data.Id;
			var level = data.Level || data.HierarchyLevel.Level;
			self.changedFirstHierarchyId(id);
			firstChangedHierarchyLevel = level;
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

				self.selectedUserHierarchy(data);
				globalSelectedUserHierarchy = data;
				ADSearchUtil.selectedHierarchyIDs = new Array();
				ADSearchUtil.selectedHierarchyIDs.push(id);
				setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);

				for (var i = 0; i < heirarchyData.length; i++) {
					if (heirarchyData[i].hierarchies && heirarchyData[i].hierarchies.length > 0) {
						hierarchyDataRootIndex = i;
						break;
					}
				}

				$("#addBtn").prop('disabled', true);
				$("#saveBtn").prop('disabled', true);
				$('#hierarchyName').focus();
				$("#hierarchyName").val('');
				$("#description").val('');
				$("#txtEntityUid").val('');
				$("#startIpAddress").val('');
				$("#endIpAddress").val('');
				$("#locationIdentifier").val('');
				$('#timeZone').val('Select Time Zone').prop("selected", "selected");
                $('#timeZone').trigger('chosen:updated');
				setEntityType('');
			}
			ADSearchUtil.changeHierarchy(id, level, callback, true)
		}

		var mlength = 260;
		var cl = self.HierarchyLevels().length;
		mlength = mlength * cl;


		$("#mainHierarchyViewDiv").css("width", mlength + "px");

		self.getHierarchy = function (data, getcallback, isAddClick) {

			AppliedValue = '';

			var divId = '';
			var position = 0;
			if ($("#" + data.Id + "Li").parent('ul').parent('div').html() != undefined) {
				divId = $("#" + data.Id + "Li").parent('ul').parent('div')[0].id;
				position = $("#" + divId).scrollTop();

			}
			var obj = new Object();
			obj.id = data.Id;
			obj.position = position;
			obj.Level = data.Level;
			hierarchyLipostionArr.push(obj);

			var indexOfSelectedId = $.inArray(data.Id, ADSearchUtil.selectedHierarchyIDs);
			if (indexOfSelectedId == -1) {
				ADSearchUtil.selectedHierarchyIDs.push(data.Id);
			}
			else {
				ADSearchUtil.selectedHierarchyIDs.splice(indexOfSelectedId + 1);
			}

			function hierarchyCallback(heirarchyData) {
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
					if (firstChangedHierarchyLevel != null) {
						if (heirarchyData[i].Level >= firstChangedHierarchyLevel) {
							self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
						}
					}
					else {
						self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
					}
				}
				setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);

				if (isAddEditHierarchy) {
					isAddEditHierarchy = false;
				}

				if (getcallback != undefined) {
					return getcallback();
				}
			}

			if (koUtil.isAddHierarchyFlag == false) {
				ADSearchUtil.getHierarchy(data.Id, data.Level, hierarchyCallback, data.IsChildExists);
			} else {
				setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);
			}
			koUtil.lastFetchedHierarchyFullPath = data.HierarchyFullPath;

			self.hierarchyName(data.HierarchyName);
			self.description(data.Description);
			self.ipStartingAddress(data.IPAddressRangeStart);
			self.ipEndingAddress(data.IPAddressRangeEnd);
			self.locationIdentifier(data.LocationId);
			self.timeZoneFunction(self.TimeZoneId, data);
			self.entityUid(data.EntityUid);
			self.entityType(data.EntityType);

			$("#hierarchyName").val(data.HierarchyName);
			$("#description").val(data.Description);
			$("#txtEntityUid").val(data.EntityUid);
			$("#startIpAddress").val(data.IPAddressRangeStart);
			$("#endIpAddress").val(data.IPAddressRangeEnd);
			$("#locationIdentifier").val(data.LocationId);
			setEntityType(data.EntityType);

			hierarchyId = data.Id;
			parentId = data.ParentId;
			level = data.Level;
			timeZoneId = data.TimeZoneId;

			if (koUtil.isAddHierarchyFlag == true && isAddClick == 1) {
				$("#addBtn").show();
				$("#saveBtn").hide();
			} else {
				$("#addBtn").hide();
				$("#saveBtn").show();
				operation = 2;
			}
			koUtil.isAddHierarchyFlag = false;
			koUtil.isEditHierarchyFlag = true;
		}

		function getHierarchyDetails(data) {
			var id = data.Id;
			var level = data.Level;
			for (var i = 0; i < heirarchyData.length; i++) {
				if (level == heirarchyData[i].Level) {
					for (var j = 0; j < heirarchyData[i].hierarchies.length; j++) {
						if (id == heirarchyData[i].hierarchies[j].Id) {
							heirarchyData[i].hierarchies[j].HierarchyName = data.HierarchyName;
							heirarchyData[i].hierarchies[j].Description = data.Description;
							heirarchyData[i].hierarchies[j].IPAddressRangeStart = data.IPAddressRangeStart;
							heirarchyData[i].hierarchies[j].IPAddressRangeEnd = data.IPAddressRangeEnd;
							heirarchyData[i].hierarchies[j].EntityUid = data.EntityUid;
							heirarchyData[i].hierarchies[j].LocationId = data.LocationId;
							heirarchyData[i].hierarchies[j].EntityType = data.EntityType;
						}
					}
				}
			}
			self.HierarchyLevels([]);
			for (var i = 0; i < heirarchyData.length; i++) {
				self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
			}
		}

		self.getHierarchyRefresh = function (data) {
			self.HierarchypathForSet(data);

			function hierarchyCallback(heirarchyData) {
				self.HierarchyLevels([]);
				var l = data.Level + 1;
				for (var i = 0; i < heirarchyData.length; i++) {
					if (i >= l) {
						heirarchyData[i].hierarchies = [];
					}
					self.HierarchyLevels.push(new hierarchyConstructor(heirarchyData[i].Name, heirarchyData[i].hierarchies, heirarchyData[i].Level));
				}
			}
			if (self.deleteflage() == true) {
				var Level = data.Level - 1;
				self.deleteflage(false);
				ADSearchUtil.getHierarchy(data.ParentId, Level, hierarchyCallback, true);
			} else {
				ADSearchUtil.getHierarchy(data.Id, data.Level, hierarchyCallback, data.IsChildExists);
			}
		}

		self.timeZoneFunction = function (TimeZoneId, data) {
			var arr = self.getTimeZoneArray();
			if (data.TimeZoneId != null) {
				for (i = 0; i < arr.length; i++) {
					if (arr[i].TimeZoneId == data.TimeZoneId) {
						$('#timeZone').val(data.TimeZoneId).prop("selected", "selected");
						$('#timeZone').trigger('chosen:updated');
					}
				}
			}
		}

		self.hierarchyFullPath = ko.observableArray();
		var hierarchyData = new Object();

		self.addHierarchy = function (data) {
			hierarchyData = data;
			operation = 1;
			koUtil.isAddHierarchyFlag = true;
			koUtil.isEditHierarchyFlag = false;
			self.getHierarchy(hierarchyData, null, 1);

			$('#hierarchyName').focus();
			$("#hierarchyName").val('');
			$("#description").val('');
			$("#txtEntityUid").val('00000000-0000-0000-0000-000000000000');
			$("#startIpAddress").val('');
			$("#endIpAddress").val('');
			$("#locationIdentifier").val('');
			$('#timeZone').val('Select Time Zone').prop("selected", "selected");
			$('#timeZone').trigger('chosen:updated');
			setEntityType('');
			

			$("#addBtn").show();
			$("#addBtn").prop('disabled', true);
			$("#saveBtn").hide();
		}

		//Cancel button click
		self.cancelReset = function () {
			$('#hierarchyDelete').modal('hide');
		}


		var deleteData = new Object();
		self.deleteHierarchy = function (data) {
			$('#hierarchyDelete').modal('show');
			$("#deleteHierarchy").text(i18n.t('delete_selected_hierachy', { lng: lang }));
			deleteData = data;
		}
		//Delete Hierarchy
		self.deleteHierarchyCall = function () {
			$('#hierarchyDelete').modal('hide');
			var objDeleteHierarchy = new Object();
			objDeleteHierarchy.Id = deleteData.Id;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						self.deleteflage(true);
						//self.refreshData();

						var obj = new Object();
						obj.Id = deleteData.ParentId;
						obj.Level = deleteData.Level - 1;
						obj.IsChildExists = true;
						self.getHierarchy(obj);
						self.cancelClick();
						openAlertpopup(0, 'hierarchy_deleted');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Hierarchy_Assigned')) {
						openAlertpopup(1, 'delete_not_completed');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Cannot_Proceed_With_Delete_Operation')) {
						openAlertpopup(1, data.responseStatus.StatusMessage);
					} else if (data.responseStatus.StatusCode == AppConstants.get('Cannot_Proceed_With_Delete_Operation_User')) {
						openAlertpopup(1, data.responseStatus.StatusMessage);
					}
				}
			}

			var method = 'DeleteHierarchy';
			var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(objDeleteHierarchy) + '}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);

		}


		//Edit Hierarchy
		self.setHierarchyCall = function (observableModelPopupViewModel) {
			var hirarchyName = $("#hierarchyName").val().replace(/^\s+/, "");
			if (hirarchyName == null || hirarchyName == '') {
				openAlertpopup(1, 'enter_hierarchy_name');
			} else {

				var hierarchy = new Object();
				hierarchy.Id = hierarchyId;
				hierarchy.ParentId = parentId;
				hierarchy.HierarchyName = $("#hierarchyName").val();
				hierarchy.IPAddressRangeStart = $("#startIpAddress").val();
				hierarchy.IPAddressRangeEnd = $("#endIpAddress").val();
				hierarchy.Description = $("#description").val();
				hierarchy.Level = level;
				hierarchy.TimeZoneId = $("#timeZone").find('option:selected').val();
				hierarchy.LocationId = $("#locationIdentifier").val().replace(/^\s+/, "").trim();
				hierarchy.EntityUid = isCustomerEnabledforVerifoneCentral ? $("#txtEntityUid").val() : '00000000-0000-0000-0000-000000000000';
				hierarchy.EntityType = isCustomerEnabledforVerifoneCentral ? ($("#selectEntityType").find('option:selected').text() == '-Select-' ? '' : $("#selectEntityType").find('option:selected').val()) : '';

				var callBackfunction = function (data, error) {
					if (data) {
						if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
							var getHierarchCallBack = function () {
								isAddEditHierarchy = true;
								fetchAssignedHierarchiesForUser(hierarchy);
							}
							$("#saveBtn").prop('disabled', true);
							openAlertpopup(0, 'hierarchy_edit_success');
							firstChangedHierarchyLevel = null;
							getHierarchyDetails(hierarchy);
							self.getHierarchy(hierarchy, getHierarchCallBack);
                        } else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHYNAME_ALREADY_EXISTS')) {
                            openAlertpopup(1, data.responseStatus.StatusMessage);
                        } else if (data.responseStatus.StatusCode == AppConstants.get('LOCATIONID_ALREADY_EXIST')) {
							openAlertpopup(1, 'location_exists');
						} else if (data.responseStatus.StatusCode == AppConstants.get('LIMIT_EXCEDDED_FOR_HIERARCHY_FULLPATH')) {
							openAlertpopup(1, 'hierarchy_limit');
						} else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_UNIQUE_KEY_VIOLATION')) {
							openAlertpopup(1, 'hierarchy_name_exists');
						}
					}
				}

				var method = 'SetHierarchy';
				var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(hierarchy) + '}';
				ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
			}
		}

		function fetchAssignedHierarchiesForUser(hierarchy) {
			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (data && data.getAssignedHierarchiesForUserResp) {
							data.getAssignedHierarchiesForUserResp = $.parseJSON(data.getAssignedHierarchiesForUserResp);
						}

						if (data.getAssignedHierarchiesForUserResp && data.getAssignedHierarchiesForUserResp.Hierarchies.length > 0) {
							globalSelectedUserHierarchy = hierarchy;
							userGlobalData.userHierarchies = data.getAssignedHierarchiesForUserResp.Hierarchies;
							self.UserHiearchies.removeAll();
							GetUser(self.UserHiearchies);
							koUtil.UserData.userHierarchies = data.getAssignedHierarchiesForUserResp.Hierarchies;
							var selectedHierarchy = _.where(self.UserHiearchies(), { Id: hierarchy.Id })
							if (selectedHierarchy != '') {
								self.selectedUserHierarchy(hierarchy);
							}
							if (isAddEditHierarchy) {
								globalSelectedUserHierarchy = null;
							}
							//self.changeHierarchyData(hierarchy);
						}
					}
				}
			}
			var method = 'GetAssignedHierarchiesForUser';
			var params = '{"token":"' + TOKEN() + '"}';
			ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
		}

		//Add Hierachy
		self.addHierarchyCall = function (observableModelPopupViewModel) {
			var hirarchyName = $("#hierarchyName").val().replace(/^\s+/, "");;
			if (hirarchyName == null || hirarchyName == '') {
				openAlertpopup(1, 'Please enter hierarchy name.');
			}
			else {
				var objAddHierarchy = new Object();
				objAddHierarchy.Description = $("#description").val();
				objAddHierarchy.HierarchyName = $("#hierarchyName").val();
				objAddHierarchy.IPAddressRangeEnd = $("#endIpAddress").val();
				objAddHierarchy.IPAddressRangeStart = $("#startIpAddress").val();
				objAddHierarchy.Level = hierarchyData.Level + 1;
				for (i = 0; i < heirarchyData.length; i++) {
					if (objAddHierarchy.Level == heirarchyData[i].Level) {
						objAddHierarchy.LevelName = heirarchyData[i].Name;
					}
				}
				objAddHierarchy.LocationId = $("#locationIdentifier").val().replace(/^\s+/, "").trim();
				objAddHierarchy.ParentId = hierarchyData.Id;
				objAddHierarchy.TimeZoneId = $("#timeZone").find('option:selected').text() === '' ? -1 : $("#timeZone").find('option:selected').val();
				objAddHierarchy.EntityUid = isCustomerEnabledforVerifoneCentral ? $("#txtEntityUid").val() : '00000000-0000-0000-0000-000000000000';
				objAddHierarchy.EntityType = isCustomerEnabledforVerifoneCentral ? ($("#selectEntityType").find('option:selected').text() == '-Select-' ? '' :  $("#selectEntityType").find('option:selected').val()) : '';

				var callBackfunction = function (data, error) {
					if (data) {
                        if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
                            hierarchyData.IsChildExists = true;

                            var callBack = function () {
                                var objHierarchy = new Object();
                                objHierarchy.Id = data.hierarchyId;
                                objHierarchy.Level = objAddHierarchy.Level;
                                objHierarchy.IsChildExists = true;
                                objHierarchy.Description = objAddHierarchy.Description;
                                objHierarchy.HierarchyName = objAddHierarchy.HierarchyName;
                                objHierarchy.IPAddressRangeEnd = objAddHierarchy.IPAddressRangeEnd;
                                objHierarchy.IPAddressRangeStart = objAddHierarchy.IPAddressRangeStart;
                                objHierarchy.LocationId = objAddHierarchy.LocationId;
								objHierarchy.EntityUid = objAddHierarchy.EntityUid;
								objHierarchy.EntityType = objAddHierarchy.EntityType;
                                self.getHierarchy(objHierarchy);
                            }
                            
							self.getHierarchy(hierarchyData, callBack, 1);

							self.cancelClick();
							$("#addBtn").prop('disabled', true);

							openAlertpopup(0, 'hierarchy_add_success');
                        }
                        else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHYNAME_ALREADY_EXISTS')) {
                            openAlertpopup(1, data.responseStatus.StatusMessage);
                        }
                        else if (data.responseStatus.StatusCode == AppConstants.get('LOCATIONID_ALREADY_EXIST')) {
							openAlertpopup(1, 'location_exists');
						} else if (data.responseStatus.StatusCode == AppConstants.get('LIMIT_EXCEDDED_FOR_HIERARCHY_FULLPATH')) {
							openAlertpopup(1, 'hierarchy_limit');
						} else if (data.responseStatus.StatusCode == AppConstants.get('HIERARCHY_UNIQUE_KEY_VIOLATION')) {
							openAlertpopup(1, 'hierarchy_name_exists');
						}
					}
				}

				var method = 'AddHierarchy';
				var params = '{"token":"' + TOKEN() + '","hierarchy":' + JSON.stringify(objAddHierarchy) + '}';
				ajaxJsonCall(method, params, callBackfunction, true, 'POST', true);
			}
		}

		//save button click
		self.saveHierarchy = function (observableModelPopup) {
			if (operation == 1) {
				self.addHierarchyCall(observableModelPopup);
			} else {
				self.setHierarchyCall(observableModelPopup);
				$('#setHierarchyModel').modal('hide');
			}

		}

		self.hierarchyOperation = function (observableModelPopup) {
			var startIpString = new Array();
			var endIpString = new Array();
			var startIp = $("#startIpAddress").val();
			var endIp = $("#endIpAddress").val();

			startIpString = startIp.split(".");
			endIpString = endIp.split(".");
			//Conversion Ip string into integer
			var ipStartRangeNum = 16777216 * parseInt(startIpString[0]) + 65536 * parseInt(startIpString[1]) + 256 * parseInt(startIpString[2]) + parseInt(startIpString[3]);

			var ipEndRangeNum = 16777216 * parseInt(endIpString[0]) + 65536 * parseInt(endIpString[1]) + 256 * parseInt(endIpString[2]) + parseInt(endIpString[3]);

			// Regular Expression for check ip value is ip string or not
			var regForIp = /^(([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[0-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/;


			if (startIp != "" || endIp != "") {
				if (startIp != "") {
					if ((regForIp.test(startIp)) == false) {
						openAlertpopup(1, 'plrase_enter_valid_starting_ip_address');
						return;
					}
				}

				if (endIp != "") {
					if ((regForIp.test(endIp)) == false) {
						openAlertpopup(1, 'please_enter_valid_ending_address');
						return;
					}
				}

				if ((startIpString.length < 4 || startIpString.length > 4) && (regForIp.test(startIpString) == false)) {
					openAlertpopup(1, 'plrase_enter_valid_starting_ip_address');
					return;
				} else
					//For  startIpString length
					if ((endIpString.length < 4 || endIpString.length > 4) && (regForIp.test(endIpString) == false)) {
						openAlertpopup(1, 'please_enter_valid_ending_address');
						return;
					} else
						if (ipStartRangeNum < 1) {
							openAlertpopup(2, 'plrase_enter_valid_starting_ip_address');
							return;
						}
				if (ipEndRangeNum < 1) {
					openAlertpopup(1, 'please_enter_valid_ending_address');
					return;
				}
				//if strat ip address is greater than end or to ip address
				if (ipStartRangeNum > ipEndRangeNum) {
					openAlertpopup(1, 'please_enter_valid_start_from_ip_address_must_be_less_than_end');
					return;
				} else {
					var isStartIpAddress = regForIp.test(startIp);
					var isEndIpAddress = regForIp.test(endIp);

					if (isStartIpAddress == false && isEndIpAddress == true) {             //if start Ip Address is in valid and end ip address is valid
						openAlertpopup(1, 'plrase_enter_valid_starting_ip_address');
					} else if (isStartIpAddress == true && isEndIpAddress == false) {
						openAlertpopup(1, 'Please enter a valid To IP Address.');
					} else if (isStartIpAddress == false && isEndIpAddress == false) {
						openAlertpopup(1, 'plrase_enter_valid_starting_ip_address');
					} else {
					}
				}
			}
			var retval = checkerror();
			if (retval == null || retval == "") {
				if (operation == 2) {
					$('#setHierarchyModel').modal('show');
					$("#setHierarchy").text(i18n.t('existing_hierarchy', { lng: lang }));
				} else {
					self.saveHierarchy(observableModelPopup);
				}
			}
		}

		//cancel set hierarchy
		self.cancelSetHierarchy = function () {
			$('#setHierarchyModel').modal('hide');
		}

		//Cancel click
		self.cancelClick = function () {
			$("#hierarchyName").val('');
			$("#description").val('');
			$("#startIpAddress").val('');
			$("#endIpAddress").val('');
			$("#txtEntityUid").val('');
			$("#locationIdentifier").val('');
			$('#timeZone').val('Select Time Zone').prop("selected", "selected");
			$('#timeZone').trigger('chosen:updated');
			setEntityType('');
			$("#saveBtn").prop('disabled', true);
		}

		function checkerror(chekVal) {
			var retval = '';
			if ($('#hierarchyName').val() == "") {
				retval += 'hierarchy name';
				self.hierarchyName(null);
				$("#enter_hierarchy_name").show();
			}
			else {
				retval += '';
			}
			return retval;
		}

		self.saveConfirmation = function (observableModelPopup) {
			if (operation == 2) {
				self.hierarchyOperation(observableModelPopup);
			} else {
				operation = 1;
				self.hierarchyOperation(observableModelPopup);
			}
		}

		function GetUser(UserHiearchies) {
			if (userGlobalData.userHierarchies && userGlobalData.userHierarchies.length > 0) {
				for (i = 0; i < userGlobalData.userHierarchies.length; i++) {
					if (userGlobalData.userHierarchies[i] != null) {
						UserHiearchies.push(userGlobalData.userHierarchies[i]);
					}
				}
				if (globalSelectedUserHierarchy == null || isAddEditHierarchy) {
					self.selectedUserHierarchy(userGlobalData.userHierarchies[0]);
				}
				else {
					self.selectedUserHierarchy(globalSelectedUserHierarchy);
					changeHierarchy(globalSelectedUserHierarchy);
				}
			}
		}

		function changeHierarchy(data) {
			var id = data.Id;
			var level = data.Level || data.HierarchyLevel.Level;
			self.changedFirstHierarchyId(id);
			firstChangedHierarchyLevel = level;
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

				self.selectedUserHierarchy(data);
				globalSelectedUserHierarchy = data;
				ADSearchUtil.selectedHierarchyIDs = new Array();
				ADSearchUtil.selectedHierarchyIDs.push(id);
				setHierarchySelect(ADSearchUtil.selectedHierarchyIDs);
				$("#addBtn").prop('disabled', true);
				$("#saveBtn").prop('disabled', true);
				$('#hierarchyName').focus();
				$("#hierarchyName").val('');
				$("#description").val('');
				$("#txtEntityUid").val('');
				$("#startIpAddress").val('');
				$("#endIpAddress").val('');
				$("#locationIdentifier").val('');
				$('#timeZone').val('Select Time Zone').prop("selected", "selected");
				$('#timeZone').trigger('chosen:updated');
				setEntityType('');
			}
			ADSearchUtil.changeHierarchy(id, level, callback, true)
		}

		seti18nResourceData(document, resourceStorage);
	};


});


