﻿define(["knockout", "spinner", "autho", "koUtil", "knockout.mapping", "knockout.validation", "jQuery.base64", "constants", "globalFunction", "appEnum", "bootstrapDateTimePicker", "chosen", "moment"], function (ko, spinner, autho, koUtil, koMapping) {

	var lang = getSysLang();
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function modelViewApplicatonsParameterTemplate(data) {
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

		//-------------------------------------------------------------FOCUS ON CONFO PO UP-----------------------------------------------
		$('#TemplateConfirmPopup').on('shown.bs.modal', function (e) {
			$('#TemplateConfirmPopup_Confo_No').focus();

		});
		$('#TemplateConfirmPopup').keydown(function (e) {
			if ($('#TemplateConfirmPopup_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#TemplateConfirmPopup_Confo_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		//-------------------------------------------------------------FOCUS ON Sequence CONFO PO UP-----------------------------------------------
		$('#EditSequenceConfirmPopup').on('shown.bs.modal', function (e) {
			$('#SequenceConfirmPopup_Confo_No').focus();

		});
		$('#EditSequenceConfirmPopup').keydown(function (e) {
			if ($('#SequenceConfirmPopup_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#SequenceConfirmPopup_Confo_Yes').focus();
			}
		});
		//------------------------------------------------------------------------------------------------------------------------

		paramDataArray = new Array();
		tabContainer = new Array();
		treeOriginalColl = new Array();
		arrayForSetValue = new Array();
		var previousSelectedCol = new Array();

		paramLevel = 0;
		instanceLevelBaseContainer = false;
		instanceAddorEdit = false;
		var isGridTabSelect = false;
		isAdpopup = 'open';

		var self = this;
		self.isEditTemplateAllowed = ko.observable(true);
		self.isEditTemplateNotAllowed = ko.observable(false);
		self.isQualifiersApplicable = ko.observable(false);
		self.isLocked = ko.observable(koUtil.selectedIsLocked);

		koUtil.currentScreen = 'TemplateEditInstance';

		isLookupTemplate === true ? self.isQualifiersApplicable(false) : (self.isLocked() === false ? self.isQualifiersApplicable(true) : self.isQualifiersApplicable(false));
		
		if (koUtil.viewParameterTemplateOnDevice == true) {
			APPGridIdForTemplate = 0;
			selectedApplicationName = koUtil.deviceEditTemplate.ApplicationName;
			selectedApplicationVersion = koUtil.deviceEditTemplate.ApplicationVersion;
			ApplicationIdForTemplate = koUtil.deviceEditTemplate.ApplicationId;
			selectedIsMultiVPFXFileSupported = koUtil.deviceEditTemplate.IsMultiVPFXSupported;
			$("#txtTemplateName").val(koUtil.selectedTemplateName);
			$("#txtDescription").val(koUtil.selectedTemplateDescription);
			$("#txtDescription").prop('disabled', true);
			$("#btnAddTemplate").hide();
			$('#MultiInstanceLevelContainerFooter').addClass('hide');
			self.isEditTemplateAllowed(false);
			self.isEditTemplateNotAllowed(true);

			var noContainerPanelHeight = $(window).height() - $(".fixed-footer").height() - 140;
			$("#noContainerAccessPanelTemplate").css("min-height", noContainerPanelHeight);
		}

		TemplateParamAppGID = '';
		if (APPGridIdForTemplate == 0) {
			TemplateParamAppGID = '';
		} else {
			TemplateParamAppGID = APPGridIdForTemplate;
		}

		arrayofeditvalue = new Array();
		arrayOfInvalidChars = new Array();
		selectedLevelParams = new Array();
		levelInstanceDetails = new Array();

		var checkFlagForAddOnload = 1;
		koUtil.selectedLevel = 0;

		//Draggable function
		$('#mdlAddTempHeader').mouseup(function () {
			$("#mdlAddTemplateFile").draggable({ disabled: true });
		});

		$('#mdlAddTempHeader').mousedown(function () {
			$("#mdlAddTemplateFile").draggable({ disabled: false });
		});

		self.focusInMaskValue = function (data) {
			var id = '#templateTxt' + data.ParamId;
			isTabKeyPressed(id);
			if ((data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') || (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE')) {
				if (data.ParamValue == undefined) {
					$(id).val("");
				} else {
					$(id).val(data.ParamValue);
				}
				//$(id).val($(id).val()).prop("type", "text");
			}

		}

		self.focusOutMaskValue = function (data) {
			var id = '#templateTxt' + data.ParamId;
			isTabKeyPressed(id);
			if (data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') {
				data.ParamValue = $(id).val();
				$(id).val('********');
				//$(id).val($(id).val()).prop("type", "password");
			}
			//Partial masking value based on Length and Direction
			if (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE') {
				var id = '#templateTxt' + data.ParamId;
				data.ParamValue = $(id).val();
				var paramValueLength = data.ParamValue ? data.ParamValue.length : 0;
				if (data.MaskLength && paramValueLength > data.MaskLength) {
					if (data.MaskDirection && data.MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_RIGHT')) {
						var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - data.MaskLength) : '****';
						$(id).val('****' + lastcharcters);
					}
					else if (data.MaskDirection && data.MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_LEFT')) {
						var Firstcharcters = $(id).val() ? $(id).val().substr(0, data.MaskLength) : '****';
						$(id).val(Firstcharcters + '****');
					}
					else {
						var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - data.MaskLength) : '****';
						$(id).val('****' + lastcharcters);
					}
				}
				else if (data.MaskLength && paramValueLength <= data.MaskLength) {
					$(id).val('********');
				}
				else if (paramValueLength > 4) {
					var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - 4) : '****';
					$(id).val('****' + lastcharcters);

				}
				else {
					$(id).val('********');
				}
			}
		}

		self.focusInSlidePanel = function (data) {
			var data = editedValue;
            if ((data.MaskValue && (data.MaskValue.toUpperCase() == 'TRUE')) || (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE')) {
				var id = '#txtValue';
				$(id).val(data.ParamValue);
            }            
		}

		self.focusOutSlidePanel = function () {
			var data = editedValue;
			if (data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') {
				var id = '#txtValue';
				data.ParamValue = $(id).val();
				$(id).val('********');
            }
            //Partial masking value based on Length and Direction
            if (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE') {
                var id = '#txtValue';
				data.ParamValue = $(id).val();
				var paramValueLength = data.ParamValue ? data.ParamValue.length : 0;
                if (data.MaskLength && paramValueLength > data.MaskLength) {
                    if (data.MaskDirection && data.MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_RIGHT') ) {
                        var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - data.MaskLength) : '****';
                        $(id).val('****' + lastcharcters);
                    }
                    else if (data.MaskDirection && data.MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_LEFT')) {
                        var Firstcharcters = $(id).val() ? $(id).val().substr(0, data.MaskLength) : '****';
                        $(id).val(Firstcharcters + '****');
                    }
                    else {
                        var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - data.MaskLength) : '****';
                        $(id).val('****' + lastcharcters);
                    }
                }
                else if (data.MaskLength && paramValueLength <= data.MaskLength) {
                    $(id).val('********');
                }
                else if (paramValueLength > 4) {
                    var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - 4) : '****';
                    $(id).val('****' + lastcharcters);
                   
                }
                else {                    
                    $(id).val('********');
                }
            }
		}

		self.JsonXmlData = ko.observable();
		self.dataforEdit = ko.observable();
		self.observableModelPopup = ko.observable();
		self.observableModelPopupFiles = ko.observable();
		self.templateXML = ko.observable();
		self.versionFlag = ko.observable(true);
		self.treeColl = ko.observableArray();
		self.templateFlag = ko.observable(false);
		self.templateFileFlag = ko.observable(false);
		self.sequenceNavUp = ko.observable(true);
		self.sequenceNavDown = ko.observable(true);
		self.breadcrumbColl = ko.observableArray([]);
		self.isMulitiInstanceFlag = ko.observable(true);
		self.editAccessValue = ko.observable();
		self.paramId = ko.observable();
		self.SourceId = ko.observable();
		self.SourceTempId = ko.observable();
		self.SourceType = ko.observable();
		self.paramValue = ko.observable();
		self.paramValueType = ko.observable();
		self.regExpression = ko.observable();
		self.textMinLength = ko.observable();
		self.controlType = ko.observable();
		self.paramDllData = ko.observable();
		self.paramDefaultValue = ko.observable();
		self.paramFormat = ko.observable();
		self.maxValue = ko.observable();
		self.minValue = ko.observable();
		self.pramvaluforcheckbox = ko.observable();
		self.templateTxtValueNum = ko.observable();
		IsPrimaryIdentifierExist = false;
		var retvalForBasicParamView = false;
		var retvalForAdvParamView = false;
		var retvalForBasicParamEdit = false;
		var retvalForAdvParamEdit = false;
		var isFileIdModified = false;
		arrayOfPrimaryIdentifierValue = [];

		if (koUtil.addOrEditTemplate == 0) {
			if (!selectedIsMultiVPFXFileSupported) {
				self.isMulitiInstanceFlag(false);
			} else {
				getIntialTemplateIdToAdd();
			}
			getApplicationTemplateVPFXFilesById(self.JsonXmlData, self.templateXML, self.treeColl, self.versionFlag, self.dataforEdit, 0, true);
		} else {
			var isUpdate = true;
			if (koUtil.viewParameterTemplateOnDevice == true) {
				isUpdate = false;
			}
			getApplicationTemplateVPFXFilesById(self.JsonXmlData, self.templateXML, self.treeColl, self.versionFlag, self.dataforEdit, koUtil.selectedTemplateId, isUpdate);
		}
		self.checkChange = ko.observable(false);
		var modelname = 'unloadTemplate';
		try {
			loadelement(modelname, 'genericPopup');
		} catch (e) {

		}

		function checkRights() {
			retvalForBasicParamView = autho.checkRightsBYScreen('Basic Parameter Management', 'IsviewAllowed');
			retvalForAdvParamView = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsviewAllowed');
			retvalForBasicParamEdit = autho.checkRightsBYScreen('Basic Parameter Management', 'IsModifyAllowed');
			retvalForAdvParamEdit = autho.checkRightsBYScreen('Advanced Parameter Management', 'IsModifyAllowed');
		}
		checkRights();

		self.unloadTempPopup = function () {			
			self.templateFlag(false);
			self.observableModelPopup('unloadTemplate');
			$("#modelAddAppLevelInstance").modal('hide');			
		}

		self.onTabSelect = function (data) {
			if (data.Type.toUpperCase() == 'GRID') {
				$("#templateTabs li div span").addClass("tabMask");
				$("#btnAddTemplate").prop('disabled', true);
				$('#baselevelTemplateFooter').removeClass('hide');
				$("#tabPanelDivTemplate").removeClass('hide');
				$('#subContainerDivTemplate').removeClass('hide');
				$('#instanceParametersDivTemplate').removeClass('hide');
				$('#noContainerAccessDivTemplate').addClass('hide');

				if (arrayofeditvalue.length > 0) {
					if (koUtil.viewParameterTemplateOnDevice == false) {
						$("#EditParameterConfirmPopup").modal('show');
						return;
					}
				} else if (self.isSequenceChanged()) {
					$("#EditSequenceConfirmPopup").modal('show');
					return;
				}
			}
		}
		$("#cancelInstanceDetailsBtn").hide();
		self.checkTxtEditInstanceName = ko.observable();
		self.checkTxtEditInstanceName.subscribe(function (newValue) {
			if (newValue != null || newValue.trim() != '') {
				if ($("#txtInstanceNameTemplate").val().trim() != '') {
					$("#saveInstanceDetailsBtn").removeAttr('disabled');
					$("#cancelInstanceDetailsBtn").show();
				} else {
					$("#saveInstanceDetailsBtn").prop('disabled', true);
					$("#cancelInstanceDetailsBtn").hide();
				}
			} else {
				$("#saveInstanceDetailsBtn").prop('disabled', true);
				$("#cancelInstanceDetailsBtn").hide();
			}
		});
		///for new changes
		self.checkTxtValue = function (data) {
			var id = "#templateTxt" + data.ParamId;
			isTabKeyPressed(id);
			var val = '';

			if (koUtil.addOrEditTemplate == 1) {
				var pId = parseInt(data.ParamId);
				var datasource = _.where(self.dataforEdit(), { ParamId: pId });
				if (datasource != '') {
					if (datasource[0].ParamValue == $(id).val()) {
						val = '';
					} else {
						val = $(id).val();
					}
				} else {
					val = $(id).val();
				}

			} else {
				val = $(id).val();
			}

			data.IsClear = false;
			if ($(id).val() == data.ParamValue) {
				$(id).removeClass("borderColor-Text");
				updateEditvalue(data);
			} else {
				updateSetValue(data, val);
			}
		}

		self.checkFileValue = function () {
			data = fileData;
			var id = "#templateFile" + data.ParamId;
			var value = $(id).val();
			updateSetValue(data, value);
		}

		self.selectPackageFile = function (popupName, data) {
			if (popupName == "modelPackageFiles") {
				self.templateFileFlag(true);
				fileData = data;
				koUtil.parameterTypeFileId = '#templateFile' + data.ParamId;
				koUtil.parameterPackageId = data.PackageId;
				if (data.ValueType.File.Type.toUpperCase() == AppConstants.get('PACKAGE_FILE')) {
					koUtil.isParameterTypeContent(false);
				} if (data.ValueType.File.Type.toUpperCase() == AppConstants.get('CONTENT_FILE')) {
					koUtil.isParameterTypeContent(true);
				}
				self.templateFlag(true);
				loadelement(popupName, 'device/deviceProfileTemplates');
				$("#modelAddAppLevelInstance").removeClass('bs-example-modal-lg addInstance');
				$('#modelAddAppLevelInstance').modal('show');
			}
		}

		self.checkDllValue = function (data) {
			if (checkFlagForAddOnload == 0) {
				var id = "#templateCombo" + data.ParamId;
				var val = '';

				if (koUtil.addOrEditTemplate == 1) {

					var pId = parseInt(data.ParamId);
					var datasource = _.where(self.dataforEdit(), { ParamId: pId });
					if (datasource != '') {
						if (datasource[0].ParamValue == $(id).val()) {
							val = '';
						} else {
							val = $(id).val();
						}
					} else {
						val = $(id).val();
					}

				} else {
					val = $(id).val();
				}
				data.IsClear = false;
				if (val == '' || $(id).val() == data.ParamValue) {
					updateEditvalue(data);
				} else {
					var name = $(id).find('option:selected').text();
					updateSetValue(data, val, name);
				}
			}
		}

		self.checkReferenceEnumValue = function (data) {
			if (checkFlagForAddOnload == 0) {
				var id = "#paramTemplateReferenceCombo" + data.ParamId;
				var value = $(id).find('option:selected').val();
				if (value == '' || value == data.ParamValue || data.ParamValue == undefined) {
					updateEditvalue(data);
				} else {
					var name = $(id).find('option:selected').text();
					updateSetValue(data, value, name);
				}
			}
		}

		self.checkAddCheckboxValue = function (data) {
			var id = "#templateCheck" + data.ParamId;
			var check = 0;

			if ($(id).is(':checked')) {
				check = 1;
			} else {
				check = 0;
			}

			var val = 2;

			if (koUtil.addOrEditTemplate == 1) {
				var pId = parseInt(data.ParamId);
				var datasource = _.where(self.dataforEdit(), { ParamId: pId });
				if (datasource != '') {
					if (datasource[0].ParamValue == check) {
						val = 2;
					} else {
						val = check;
					}
				} else {
					val = check;
				}

			} else {
				val = check;
			}

			data.IsClear = false;
			if (val == 2 || check == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, check);
			}
		}

		self.clearDateParameter = function (data) {
			var id = "#templateInputDate" + data.ParamId;
			var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
			if (data.ValueType.DateTime && data.ValueType.DateTime.DateFormat) {
				dateFormat = data.ValueType.DateTime.DateFormat;
			}
			updateDateTimePicker("#templateDate" + data.ParamId, dateFormat, 'today');
			$(id).val('');
			updateSetValue(data, '', '', 'User');
		}

		self.checkDateValue = function (data) {
			var id = "#templateInputDate" + data.ParamId;
			var check = '';
			if ($(id).val() != '') {
				check = $(id).val();
			}
			var val = '';
			if (koUtil.addOrEditTemplate == 1) {
				var pId = parseInt(data.ParamId);
				var datasource = _.where(self.dataforEdit(), { ParamId: pId });
				if (datasource != '') {
					if (datasource[0].ParamValue == check) {
						val = '';
					} else {
						val = check;
					}
				} else {
					val = check;
				}

			} else {
				val = check;
			}
			data.IsClear = false;
			if (check == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, val);
			}
		}

		self.validationOfRegExpression = function (newValue) {
			var regExpval = new RegExp(self.regExpression());
			if ((regExpval.test(newValue)) == false) {
				return false;
			} else {
				return true;
			}
		}

		self.validateStringLength = function (value) {
			if (value && value.length < self.textMinLength()) {
				return false;
			} else {
				return true;
			}
		}

		function updateEditvalue(data) {

			arrayofeditvalue = jQuery.grep(arrayofeditvalue, function (value) {
				var id = "" + data.ParamId + ""
				return (value != id && value != null);
			});

			//var pId = parseInt(data.ParamId);
			var sourceData = _.where(arrayForSetValue, { ParamId: data.ParamId });

			if (sourceData != '') {
				arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
					var index = arrayForSetValue.indexOf(sourceData[0]);
					return (value != arrayForSetValue[index] && value != null);
				});
			}
			
            if (data.PrimaryIdentifier == "True") {
                var source = _.where(arrayOfPrimaryIdentifierValue, { ParamId: data.ParamId });
                if (!_.isEmpty(source) && source.length > 0) {
                    source[0].ParamValue = data.ParamValue;
                }
            }

			arrayOfInvalidChars = jQuery.grep(arrayOfInvalidChars, function (value) {
				var index = arrayOfInvalidChars.indexOf(data.ParamId);
				return (value != arrayOfInvalidChars[index] && value != null);
			});
            if (arrayofeditvalue.length <= 0) {
                $("#btnAddTemplate").prop('disabled', true);
                $("#saveInstanceDetailsBtn").prop('disabled', true);
                $("#cancelInstanceDetailsBtn").hide();
            } else if(arrayofeditvalue.length > 0 || instanceAddorEdit) {
                if (koUtil.selectedLevel == 0) {
                    if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
                        $("#btnAddTemplate").prop('disabled', false);
                    }
                    $("#saveInstanceDetailsBtn").prop('disabled', false);
                    $("#cancelInstanceDetailsBtn").show();
                } else if (arrayOfInvalidChars.length == 0) {
                    $("#saveInstanceDetailsBtn").prop('disabled', false);
                    $("#cancelInstanceDetailsBtn").show();
                }
            }
		}

		function updateSetValue(data, value, name, sourceType) {

			if ($.inArray(data.ParamId, arrayofeditvalue) < 0) {
				arrayofeditvalue.push(data.ParamId);
			} else {
				var sourceData = _.where(arrayForSetValue, {
					ParamId: data.ParamId
				});

				if (sourceData != '') {
					arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
						var index = arrayForSetValue.indexOf(sourceData[0]);
						return (value != arrayForSetValue[index] && value != null);
					});
				}
			}

			if (!isSelectedInstanceisMulti && koUtil.selectedLevel > 0) {
				var sourceData = _.where(arrayForSetValue, {
					ParamId: data.ParamId
				});

				if (sourceData != '') {
					arrayForSetValue = jQuery.grep(arrayForSetValue, function (value) {
						var index = arrayForSetValue.indexOf(sourceData[0]);
						return (value != arrayForSetValue[index] && value != null);
					});
				}
			}

			var Parameter = new Object();
			Parameter.ParamId = data.ParamId;
			Parameter.ParamValue = data.ValueType.Type == "File" ? data.ParamValue : value;
			Parameter.ParamName = data.Name;
			Parameter.TemplateId = koUtil.selectedTemplateId;
			Parameter.IsPrimaryIdentifier = (data.PrimaryIdentifier == "True") ? 1 : 0;
			Parameter.PISequence = data.Sequence ? data.Sequence : 0;
			if (data.IsClear == undefined) {
				Parameter.IsClear = false;
			} else {
				Parameter.IsClear = data.IsClear;
			}
			if (Parameter.ParamValue == data.Default) {
				Parameter.SourceType = 'User';
			} else if (sourceType) {
				Parameter.SourceType = sourceType;
			}
			else {
				Parameter.SourceType = 'User';
			}
			Parameter.ParamType = data.ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
			Parameter.PackageId = data.ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
			Parameter.IncludeInMP = data.IncludeInMP == "True" ? 1 : 0;
			Parameter.ValueType = data.ValueType.Type;

			if (data.ValueType.Type == "String") {
				Parameter.ValidChars = data.ValueType.String.ValidChars;
				Parameter.MinLen = data.ValueType.String.MinLen;
				var id = "#templateTxt" + data.ParamId;
				if (data.ValueType.String.ValidChars && data.ValueType.String.ValidChars != '') {					
					self.regExpression(data.ValueType.String.ValidChars)
					var checkVal = self.validationOfRegExpression($(id).val());
					if (checkVal == false) {
						arrayofeditvalue = jQuery.grep(arrayofeditvalue, function (value) {
							var index = arrayofeditvalue.indexOf(data.ParamId);
							return (value != arrayofeditvalue[index] && value != null);
						});
						if ($.inArray(data.ParamId, arrayOfInvalidChars) < 0) {
							arrayOfInvalidChars.push(data.ParamId);
						}

						$(id).addClass("borderColor-Text");
						$("#btnAddTemplate").prop('disabled', true);
						$("#saveInstanceDetailsBtn").prop('disabled', true);
						return;
					} else {
						arrayOfInvalidChars = jQuery.grep(arrayOfInvalidChars, function (value) {
							var index = arrayOfInvalidChars.indexOf(data.ParamId);
							return (value != arrayOfInvalidChars[index] && value != null);
						});
						if (data.ValueType.String.MinLen && data.ValueType.String.MinLen != '') {
							self.textMinLength(data.ValueType.String.MinLen);
							var checkTextLength = self.validateStringLength($(id).val());
							if (checkTextLength == false) {
								$(id).addClass("borderColor-Text");
								$("#btnAddTemplate").prop('disabled', true);
								$("#saveInstanceDetailsBtn").prop('disabled', true);
								return;
							} else {
								$(id).removeClass("borderColor-Text");
								if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
									$("#btnAddTemplate").prop('disabled', false);
								}
							}
						} else {
							$(id).removeClass("borderColor-Text");
							if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
								$("#btnAddTemplate").prop('disabled', false);
							}
						}
					}
				} else {
					if (data.ValueType.String.MinLen && data.ValueType.String.MinLen != '') {
						self.textMinLength(data.ValueType.String.MinLen);
						var checkTextLength = self.validateStringLength($(id).val());
						if (checkTextLength == false) {
							$(id).addClass("borderColor-Text");
							$("#btnAddTemplate").prop('disabled', true);
							$("#saveInstanceDetailsBtn").prop('disabled', true);
							return;
						} else {
							$(id).removeClass("borderColor-Text");
							if ($("#txtTemplateName").val().trim() != '') {
								$("#btnAddTemplate").prop('disabled', false);
							}
						}
					} else {
						$(id).removeClass("borderColor-Text");
						if ($("#txtTemplateName").val().trim() != '') {
							$("#btnAddTemplate").prop('disabled', false);
						}
					}
                }
			}
			var sourceDataTemp = _.where(arrayForSetValue, { ParamId: data.ParamId });
			if (sourceDataTemp.length > 0) {
				var index = arrayForSetValue.indexOf(sourceDataTemp[0]);
				arrayForSetValue[index] = Parameter;
			} else {
				arrayForSetValue.push(Parameter);
			}
			//Include primary identifier in collection if its is Primary Identifier
			if (data.PrimaryIdentifier == "True") {
				var sourceData = _.where(arrayOfPrimaryIdentifierValue, { ParamId: data.ParamId });

				if (sourceData != '') {
					arrayOfPrimaryIdentifierValue = jQuery.grep(arrayOfPrimaryIdentifierValue, function (value) {
						var index = arrayOfPrimaryIdentifierValue.indexOf(sourceData[0]);
						return (value != arrayOfPrimaryIdentifierValue[index] && value != null);
					});
				}
				if (data.ValueType.Type == "Enumeration" || data.ValueType.Type == "ReferenceEnumeration") {
					var PIParameter = new Object();
					PIParameter.ParamId = data.ParamId;
					PIParameter.ParamName = data.Name;
					PIParameter.ParamValue = _.isEmpty(name) ? value : name;
					PIParameter.TemplateId = koUtil.selectedTemplateId;
					PIParameter.SourceType = 'User';
					PIParameter.IsPrimaryIdentifier = (data.PrimaryIdentifier == "True") ? 1 : 0;
					PIParameter.PISequence = data.Sequence ? data.Sequence : 0;
					arrayOfPrimaryIdentifierValue.push(PIParameter);
				} else {
					arrayOfPrimaryIdentifierValue.push(Parameter);
				}
			}

			if (arrayofeditvalue.length > 0 || instanceAddorEdit) {
				if (koUtil.selectedLevel == 0) {
					if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
						$("#btnAddTemplate").prop('disabled', false);
					}
					$("#saveInstanceDetailsBtn").prop('disabled', false);
					$("#cancelInstanceDetailsBtn").show();
                } else if (arrayOfInvalidChars.length == 0){
					$("#saveInstanceDetailsBtn").prop('disabled', false);
					$("#cancelInstanceDetailsBtn").show();
				}
			}
		}

		$("#txtnumericValue").on('keyup', function () {
			var newValue = parseInt($(this).val());
			if (newValue == self.paramDefaultValue()) {
				$("#txtsourceValue").val('Default');
			} else {
				$("#txtsourceValue").val('User');
			}


			if (newValue == '' || newValue == self.paramValue()) {
				$("#btnSaveSelectedPvalue").prop('disabled', true);
			} else {
				$("#btnSaveSelectedPvalue").prop('disabled', false);
			}
			if (newValue > self.maxValue()) {
				$("#txtnumericValue").val(self.maxValue());
			} else if (newValue < self.minValue()) {
				$("#txtnumericValue").val(self.minValue());
			} else {
				$("#txtnumericValue").val(newValue);
			}
			self.enableDisableSaveBtnOnEditPopUp(newValue);
		})


		self.templateCheckValue = function () {


			var id = "#checkBoxValue";//"#templateCheck" + self.paramId();

			var check = 0;
			if ($(id).is(':checked')) {

				check = 1;

			} else {
				check = 0;

			}

			if ($(id).val() == self.paramDefaultValue()) {
				$("#txtsourceValue").val('Default');
			} else {
				$("#txtsourceValue").val('User');
			}

			if (check == self.paramValue()) {
				$("#btnSaveSelectedPvalue").prop('disabled', true);
			} else {
				$("#btnSaveSelectedPvalue").prop('disabled', false);
			}
		};
		self.confirmUndoChanges = function (unloadAddTemplatepopup) {
			if (koUtil.addOrEditTemplate == 0) {
				deleteTemplateOnCancel();
			}
			unloadAddTemplatepopup('checkTxtValue');
			clearQualifiersObject();
		}
		///for new changes
		self.cancelpopup = function (unloadAddTemplatepopup) {

			if (arrayofeditvalue.length > 0 || self.isSequenceChanged()) {
				$("#TemplateConfirmPopup").modal('show');
			} else {
				if (koUtil.addOrEditTemplate == 0 && instanceAddorEdit) {
					$("#TemplateConfirmPopup").modal('show');
				} else {
					if (koUtil.addOrEditTemplate == 0) {
						deleteTemplateOnCancel();
					}
					unloadAddTemplatepopup('checkTxtValue');
					clearQualifiersObject();
				}
			}
		}

		self.cancelconfirmation = function () {
			$("#TemplateConfirmPopup").modal('hide');
			$("#mainPageBody").addClass('modal-open-appendon');
		}

		self.cancelInstanceConfirmation = function (instance, target) {
			if (self.confirmPrevInstance() != undefined && self.confirmPrevInstance().LevelName() != undefined) {
				var prevInstance = self.confirmPrevInstance();
				self.confirmInstance(prevInstance);
				var prevTarget = self.confirmPrevTarget();
				self.confirmTarget(prevTarget);
			}
			if (selectionMode == 'comboBox') {
				if (isComboSelected == true) {
					var id = "#treeCombo" + instance.FormFileId() + "_" + instance.Level();
					var instanceID = $(id).find('option:selected').val();
					var sourceData = _.where(previousSelectedCol, {
						instanceID: id
					});
					for (i = 1; i <= previousSelectedCol.length; i++) {
						if (id == previousSelectedCol[i - 1].instanceID) {
							var previnstanceID = previousSelectedCol[i - 1].instanceID;
							var prevSel = previousSelectedCol[i - 1].selectedIndex;
							$(id).val(prevSel).prop("selected", "selected");
							$(id).trigger('chosen:updated');
						}
					}
					$("#templateTabs li div .tabMask").removeClass("tabMask");
					$('#templateTabs li:nth-child(2) a').click();
				} else {
					$("#templateTabs li div .tabMask").removeClass("tabMask");
					$('#templateTabs li:nth-child(2) a').click();
				}
			} else if (selectionMode == 'gridEdit') {
				$("#templateTabs li div .tabMask").removeClass("tabMask");
				$('#templateTabs li:nth-child(2) a').click();
			} else if (selectionMode == 'treeNode' && !isTreeNodeSelected) {
				$("#templateTabs li div .tabMask").removeClass("tabMask");
				$('#templateTabs li:nth-child(2) a').click();
			}

			if (arrayOfInvalidChars.length == 0) {
				$("#btnAddTemplate").prop('disabled', false);
			}
			isTreeNodeSelected = false;
			$("#EditParameterConfirmPopup").modal('hide');
			$("#mainPageBody").addClass('modal-open-appendon');
		}
		self.cancelSaveSquence = function (instance, target) {
			$("#EditSequenceConfirmPopup").modal('hide');
			if (selectionMode == 'comboBox') {
				var id = "#treeCombo" + instance.FormFileId() + "_" + instance.Level();
				var instanceID = $(id).find('option:selected').val();
				var sourceData = _.where(previousSelectedCol, {
					instanceID: id
				});
				for (i = 1; i <= previousSelectedCol.length; i++) {
					if (id == previousSelectedCol[i - 1].instanceID) {
						var previnstanceID = previousSelectedCol[i - 1].instanceID;
						var prevSel = previousSelectedCol[i - 1].selectedIndex;
						$(id).val(prevSel).prop("selected", "selected");
						$(id).trigger('chosen:updated');
					}
				}
			}
		}
		///numeric steper
		self.upNumber = function (data) {
			if (data.AllowModify) {
				var id = '#templateNumeric' + data.ParamId;
				if ($(id).val() == '') {
					var number = 0;
				} else {
					var number = parseInt($(id).val());
				}
				if (number < data.ValueType.Numeric.MaxVal) {
					number = number + 1;
				}
				$(id).val(number);
				data.IsClear = false;
				if ($(id).val() == '' || $(id).val() == data.ParamValue) {
					updateEditvalue(data);
				} else {
					var value = $(id).val();
					updateSetValue(data, value);
				}
			}
		}

		self.downNumber = function (data) {
			if (data.AllowModify) {
				var id = '#templateNumeric' + data.ParamId;
				if ($(id).val() == '') {
					var number = 0;
				} else {
					var number = parseInt($(id).val());
				}

				if (number > data.ValueType.Numeric.MinVal) {
					number = number - 1;
				}

				$(id).val(number);
				data.IsClear = false;
				if ($(id).val() == '' || $(id).val() == data.ParamValue) {
					updateEditvalue(data);
				} else {
					var value = $(id).val();
					updateSetValue(data, value);
				}
			}

		}

		self.upNumberPval = function (data) {

			var id = '#txtnumericValue';

			if ($(id).val() == '') {
				var number = 0;
			} else {

				var number = parseInt($(id).val());

			}
			if (number < self.maxValue()) {
				number = number + 1;
			}

			$(id).val(number);

			//self.templateNumericValue(number)
			self.enableDisableSaveBtnOnEditPopUp($(id).val());
		}

		self.downNumberPval = function (data) {

			var id = '#txtnumericValue';
			if ($(id).val() == '') {
				var number = 0;
			} else {
				var number = parseInt($(id).val());
			}
			var max = self.maxValue();
			var min = self.maxValue();


			if (number > self.minValue()) {
				number = number - 1;
			}
			$(id).val(number);
			//self.templateNumericValue(number);
			self.enableDisableSaveBtnOnEditPopUp($(id).val());
		}
		self.enableDisableSaveBtnOnEditPopUp = function (newValue) {

			if (newValue == self.paramDefaultValue()) {
				$("#txtsourceValue").val('Default');
			} else {
				$("#txtsourceValue").val('User');
			}
			if (newValue == '' || newValue == self.paramValue()) {
				$("#btnSaveSelectedPvalue").prop('disabled', true);
			} else {
				$("#btnSaveSelectedPvalue").prop('disabled', false);
			}
		}

		self.confirmInstance = ko.observable();
		self.confirmPrevInstance = ko.observable();
		self.confirmPrevTarget = ko.observable();
		self.isSequenceChanged = ko.observable(false);
		self.confirmTarget = ko.observable();
		var selectionMode = '';
		var isTreeNodeSelected = false;
		var isComboSelected = false;

		self.onClickLevel = function (instance, event) {
			if (arrayofeditvalue.length == 0) {
				self.confirmPrevInstance(instance);
				if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
				self.confirmPrevTarget(target);
			}
			//$("#btnAddElement").prop('disabled', false);
			selectionMode = 'treeNode';
			isTreeNodeSelected = true;
			isComboSelected = false;
			self.confirmInstance(instance);
			koUtil.selectedInstance(instance);
			if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
			self.confirmTarget(target);
			if (arrayofeditvalue.length > 0) {
				if (koUtil.viewParameterTemplateOnDevice == false) {
					$("#EditParameterConfirmPopup").modal('show');
					return;
				}
			} else if (self.isSequenceChanged()) {
				$("#EditSequenceConfirmPopup").modal('show');
				return;
			}

			if (instance.Level() > 1 && instance.parentInstanceId() == 0) {
				openAlertpopup(1, 'Select_parent_level_first');
				return;
			}

			handleNodeClick(instance, event);
			if (instance.isMulti()) {
				$('#baselevelTemplateFooter').removeClass('hide');
				$('#nonMultiInstanceLevelContainerFooter').addClass('hide');
				instanceLevelBaseContainer = false;
			} else if (instance.Level() > 0) {
				instanceLevelBaseContainer = true;
				$('#nonMultiInstanceLevelContainerFooter').removeClass('hide');
			} else {
				$('#baselevelTemplateFooter').removeClass('hide');
				instanceLevelBaseContainer = false;
			}
			var selectedDropDownId = "#treeCombo" + koUtil.selectedlevelFormFileId + "_" + koUtil.selectedLevel;
			var ddlSelectedInstanceID = $(selectedDropDownId).find('option:selected')[0] ? $(selectedDropDownId).find('option:selected')[0].index : 0;
			$('#treeSection').find("select").each(function () {
				var ddlLevel = $(this)[0].id.substr($(this)[0].id.indexOf("_") + 1);
				if (ddlLevel >= koUtil.selectedLevel) {
					$(this).prop('selectedIndex', 0);
					$(this).trigger('chosen:updated');
				}
			});

			$(selectedDropDownId).prop('selectedIndex', ddlSelectedInstanceID);
			$(selectedDropDownId).trigger('chosen:updated');
		}



		function storeInstanceLevelDetails(instance) {
			var storedData = _.where(levelInstanceDetails, { Level: koUtil.selectedLevel, LevelName: koUtil.selectedLevelName, InstanceName: koUtil.selectedInstanceName });
			if (storedData.length == 0) {
				var levelDetails = new Object();
				levelDetails.Level = koUtil.selectedLevel;
				levelDetails.LevelName = koUtil.selectedLevelName;
				levelDetails.InstanceName = koUtil.selectedInstanceName;
				levelDetails.ParentInstanceId = instance.parentInstanceId();
				levelDetails.ParentInstanceName = instance.parentInstanceName();
				levelDetails.ParentLevel = instance.ParentLevel();
				levelInstanceDetails.push(levelDetails);
			} else if (storedData.length > 0) {
				var index = levelInstanceDetails.indexOf(storedData[0]);
				if (index != undefined) {
					levelInstanceDetails[index].ParentInstanceId = instance.parentInstanceId();
					levelInstanceDetails[index].ParentInstanceName = instance.parentInstanceName();
					levelInstanceDetails[index].ParentLevel = instance.ParentLevel();
				}
			}
		}
		function getParentInstanceLevelDetails(levelVO, levelList) {
			var storedData = _.where(levelInstanceDetails, { Level: levelVO.Level - 1, LevelName: levelVO.ParentLevel, InstanceName: levelVO.ParentInstanceName });
			if (storedData.length > 0) {
				var levelPVO = new Object();
				levelPVO.Level = storedData[0].Level;
				levelPVO.InstanceName = storedData[0].InstanceName;
				levelList.push(levelPVO);
				if (storedData[0].Level > 1) {
					return getParentInstanceLevelDetails(storedData[0], levelList);
				} else {
					return levelList;
				}
			} else {
				return levelList;
			}
		}
		function getInstanceLevelDetails() {
			var levelList = [];
			var storedData = [];
			storedData = _.where(levelInstanceDetails, { Level: koUtil.selectedLevel - 1, LevelName: koUtil.selectedlevelParentLevel, InstanceName: koUtil.selectedlevelParentInstanceName });

			if (storedData.length > 0) {
				var levelVO = new Object();
				levelVO.Level = storedData[0].Level;
				levelVO.InstanceName = storedData[0].InstanceName;
				levelList.push(levelVO);
				if (storedData[0].Level > 1) {
					return getParentInstanceLevelDetails(storedData[0], levelList);
				} else {
					return levelList;
				}
			} else {
				return levelList;
			}
		}

		isSelectedInstanceisMulti = true;
		function handleNodeClick(instance, event) {
			if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
			if ($(target).prop("tagName") == 'SPAN') {
				$(target).next().find("select").prop('selectedIndex', 0);
				$(target).next().find("select").trigger('chosen:updated');
				isGridTabSelect = true;
			}
			else {
				$(target).parent().find("select").prop('selectedIndex', 0);
				$(target).parent().find("select").trigger('chosen:updated');
			}
			if (instance.children().length > 0 && instance.isMulti()) {
				clearChildDropDownColl(instance);
			}
			$(".treeNodeCntr .treeNodeActive").removeClass("treeNodeActive");
			if ($(target).prop("tagName") != 'BUTTON') { $(target).addClass("treeNodeActive"); }
			var rootItem = _.where(treeOriginalColl, { FormFileId: instance.FormFileId() });

			koUtil.selectedFormFile = rootItem;
			koUtil.selectedlevelFormFileId = instance.FormFileId();
			koUtil.selectedLevel = rootItem[0].Level;
			koUtil.selectedLevelName = rootItem[0].LevelName;
			koUtil.selectedInstanceName = rootItem[0].selectedInstanceName;
			isSelectedInstanceisMulti = instance.isMulti();
			koUtil.selectedlevelParentInstanceId = instance.parentInstanceId();
			koUtil.selectedlevelParentInstanceName = instance.parentInstanceName();
			koUtil.selectedlevelParentLevel = instance.ParentLevel();
			koUtil.editDevicetemplateXML = rootItem[0].FormFileXML;
			var containerData = $.xml2json(koUtil.editDevicetemplateXML);
			if (containerData && containerData.length == undefined) {
				containerData = $.makeArray(containerData);
				koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
			}
			self.isSequenceChanged(false);

			isTreeNodeSelected = false;
			isComboSelected = false;
			isAddInstance = false;
			isFileIdModified = false;
			koUtil.selectedInstanceLevelDetails = getInstanceLevelDetails();

			$("#tabPanelDivTemplate").removeClass('hide');
			$('#subContainerDivTemplate').removeClass('hide');
			$('#instanceParametersDivTemplate').removeClass('hide');
			$('#noContainerAccessDivTemplate').addClass('hide');

			containerData = $.xml2json(koUtil.editDevicetemplateXML);
			if (containerData && containerData.length == undefined) {
				containerData = $.makeArray(containerData);
			}
			self.JsonXmlData(containerData);

			if (containerData && containerData.length > 0 && rootItem[0].IsReferenceEnumeration) {		//if the selected FormFile has one or more ReferenceEnumeration Parameters
				var referenceEnumContainer = new Array();
				getReferenceEnumAttributes(containerData, referenceEnumContainer);
				getParameterValuesForReferenceEnum(instance, "", koUtil.selectedInstanceName, rootItem, containerData, referenceEnumContainer, false);
			} else {
				setNodeSelection(instance, "", koUtil.selectedInstanceName, rootItem, false);			//create container tabs for the selected FormFile with no ReferenceEnumeration Parameters
			}
		}
		function seqControlSelect() {
			var rowCount = $('#jqxgridtemplateparameterdetails').jqxGrid('getrows').length;
			var selctedRow = $('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindex');
			var selectedRowId = $("#jqxgridtemplateparameterdetails").jqxGrid('getrowid', selctedRow);
			var allowSequence = $('#allowSequence').text();

			if (allowSequence.toUpperCase() == 'FALSE') {
				self.sequenceNavDown(true);
				self.sequenceNavUp(true);
				return;
			}

			if ($('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindexes').length == 1) {
				if (rowCount == 1) {
					self.sequenceNavDown(true);
					self.sequenceNavUp(true);
				} else if (selectedRowId == rowCount - 1) {
					self.sequenceNavDown(true);
					self.sequenceNavUp(false);
				}
				else if (selectedRowId == 0) {
					self.sequenceNavDown(false);
					self.sequenceNavUp(true);
				}
				else {
					self.sequenceNavDown(false);
					self.sequenceNavUp(false);
				}
			}
			else if ($('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindexes').length > 1 || $('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindexes').length == 0) {
				self.sequenceNavDown(true);
				self.sequenceNavUp(true);
			}

		}
		function buildBreadCrumText(selectedInstance, isfromCLick) {

			var baseItem = _.where(self.breadcrumbColl(), { Level: 0 });

			if (baseItem.length == 0) {
				var root1Item = _.where(treeOriginalColl, { Level: 0 });
				root1Item[0].selectedInstanceName = '';
				self.breadcrumbColl.push(root1Item[0]);
			}

			//Onclick level 1
			self.breadcrumbColl(jQuery.grep(self.breadcrumbColl(), function (Level, i) {
				return self.breadcrumbColl()[i].Level >= selectedInstance.Level;
			}, true));

			var selectedDropDownId = "#treeCombo" + koUtil.selectedlevelFormFileId + "_" + koUtil.selectedLevel;
			var instanceName = $(selectedDropDownId).find('option:selected').text();
			instanceName = instanceName != '--Select--' ? instanceName : '';
			selectedInstance.selectedInstanceName = isfromCLick ? '' : instanceName;
			self.breadcrumbColl.push(selectedInstance);
		}

		self.onChangeSelect = function (instance, event) {
			if (arrayofeditvalue.length == 0) {
				self.confirmPrevInstance(instance);
				if (typeof event.target == 'undefined') { var target = event.srcElement; } else { var target = event.target; }
				self.confirmPrevTarget(target);
			}
			isTreeNodeSelected = false;
			isComboSelected = true;
			selectionMode = 'comboBox';
			self.confirmInstance(instance);
			koUtil.selectedInstance(instance);
			if (arrayofeditvalue.length > 0) {
				if (koUtil.viewParameterTemplateOnDevice == false) {
					$("#EditParameterConfirmPopup").modal('show');
					return;
				}
			}
			if (self.isSequenceChanged()) {
				$("#EditSequenceConfirmPopup").modal('show');
				return;
			}

			isGridTabSelect = false;
			handleComboChange(instance);

			var selectedDropDownId = "#treeCombo" + koUtil.selectedlevelFormFileId + "_" + koUtil.selectedLevel;
			$('#txtInstanceNameTemplate').val($(selectedDropDownId).find('option:selected').text());
			var ddlSelectedInstanceID = $(selectedDropDownId).find('option:selected')[0].index;
			$('#treeSection').find("select").each(function () {
				var ddlLevel = $(this)[0].id.substr($(this)[0].id.indexOf("_") + 1);
				if (ddlLevel >= koUtil.selectedLevel) {
					$(this).prop('selectedIndex', 0);
					$(this).trigger('chosen:updated');
				}
			});
			$(selectedDropDownId).prop('selectedIndex', ddlSelectedInstanceID);
			$(selectedDropDownId).trigger('chosen:updated');
		}

		function handleComboChange(instance) {
			isTreeNodeSelected = false;
			isComboSelected = false;
			isAddInstance = false;
			isFileIdModified = false;
			var rootItem = _.where(treeOriginalColl, { FormFileId: instance.FormFileId() });
			var id = "#treeCombo" + instance.FormFileId() + "_" + instance.Level();
			var instanceID = $(id).find('option:selected').val();
			var instanceName = $(id).find('option:selected').text();
			validateIsSelectedExist(id, instanceID);
			if (instanceID != "") {
				isSelectedInstanceisMulti = true;
				$(".treeNodeCntr .treeNodeActive").removeClass("treeNodeActive");
				$(id).parent().parent().prev().addClass("treeNodeActive");
				$(".treeNodeCntr .lastLevel").removeClass("lastLevel");
				koUtil.selectedlevelFormFileId = instance.FormFileId();
				koUtil.selectedLevel = rootItem[0].Level;
				koUtil.selectedLevelName = rootItem[0].LevelName;
				koUtil.editDevicetemplateXML = rootItem[0].FormFileXML;
				koUtil.selectedlevelParentInstanceId = instance.parentInstanceId();
				koUtil.selectedlevelParentInstanceName = instance.parentInstanceName();
				koUtil.selectedlevelParentLevel = instance.ParentLevel();
				koUtil.selectedlevelInstanceId = instanceID;
				koUtil.selectedInstanceName = instanceName;
				storeInstanceLevelDetails(instance);
				koUtil.selectedInstanceLevelDetails = getInstanceLevelDetails();

				$("#tabPanelDivTemplate").removeClass('hide');
				$('#subContainerDivTemplate').removeClass('hide');
				$('#instanceParametersDivTemplate').removeClass('hide');
				$('#noContainerAccessDivTemplate').addClass('hide');

				var containerData = $.xml2json(koUtil.editDevicetemplateXML);
				if (containerData && containerData.length == undefined) {
					containerData = $.makeArray(containerData);
				}
				self.JsonXmlData(containerData);
				if (containerData && containerData.length > 0) {
					koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
					if (rootItem[0].IsReferenceEnumeration) {											//if the selected instance has one or more ReferenceEnumeration Parameters
						var referenceEnumContainer = new Array();
						getReferenceEnumAttributes(containerData, referenceEnumContainer);
						getParameterValuesForReferenceEnum(instance, instanceID, instanceName, rootItem, containerData, referenceEnumContainer, true);
					} else {
						setNodeSelection(instance, instanceID, instanceName, rootItem, true);			//create container tabs for the selected instance with no ReferenceEnumeration Parameters
					}
				}
			}
		}

		function validateIsSelectedExist(instanceID, selectedIndex) {
			var sourceData = _.where(previousSelectedCol, {
				instanceID: instanceID
			});
			if (sourceData != '') {
				previousSelectedCol = jQuery.grep(previousSelectedCol, function (value) {
					var index = previousSelectedCol.indexOf(sourceData[0]);
					return (value != previousSelectedCol[index] && value != null);
				});
			}
			var selectedObj = new Object();
			selectedObj.instanceID = instanceID;
			selectedObj.selectedIndex = selectedIndex;
			previousSelectedCol.push(selectedObj);
		}
		function clearChildDropDownColl(instance) {
			if (instance.children().length > 0) {
				for (var k = 0; k < instance.children().length > 0; k++) {
					instance.children()[k].dropdownCol([]);
					instance.children()[k].parentInstanceId(0);
					instance.children()[k].parentInstanceName('');
					if (instance.children()[k].children().length > 0)
						clearChildDropDownColl(instance.children()[k]);
				}
			}
		}
		function generateTemplate(tempname, controllerId) {
			//new template code
			var htmlName = '../template/' + controllerId + '/' + tempname + '.html';
			var ViewName = 'controller/' + controllerId + '/' + tempname + '.js';
			var cunanem = tempname + '1';
			ko.components.register(tempname, {
				viewModel: { require: ViewName },
				template: { require: 'plugin/text!' + htmlName }
			});
			// end new template code
		}
		//For Load element
		function loadelement(elementname, controllerId) {
			if (!ko.components.isRegistered(elementname)) {
				generateTemplate(elementname, controllerId);
			}
			self.observableModelPopup(elementname);
		}
		
		self.unloadPackageFilesPopup = function (popupName) {
			self.observableModelPopup('unloadTemplate');
			$("#modelAddAppLevelInstance").modal('hide');
			koUtil.parameterPackageId = 0;
		}

		function updateTemplateInstanceSelection() {
			$("#templateTabs li div .tabMask").removeClass("tabMask");
			$('#templateTabs li:nth-child(1) a').click();
			var id = "#treeCombo" + koUtil.selectedInstance().FormFileId() + "_" + koUtil.selectedInstance().Level();
			$(id).prop('selectedIndex', 0);
			$(id).trigger('chosen:updated');
			var rootItem = _.where(treeOriginalColl, { FormFileId: koUtil.selectedInstance().FormFileId() });
			buildBreadCrumText(rootItem[0], false);
		}
		function deleteTemplateAppLevelInstances(paramDelete) {
			function callbackFunction(data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						gridRefresh('jqxgridtemplateparameterdetails');
						$('#jqxgridtemplateparameterdetails').jqxGrid('clearselection');
						updateTemplateInstanceSelection();
						openAlertpopup(0, 'Instances_successfully_deleted');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REFERENCED_INSTANCES_CANNOT_BE_DELETED')) {	//371
						openAlertpopup(1, 'instances_referenced_cannot_be_deleted');
					}
				}
			}

			var method = 'DeleteTemplateAppLevelInstances';
			var params = '{"token":"' + paramDelete.token + '","deleteTemplateAppLevelInstancesReq":' + JSON.stringify(paramDelete.deleteTemplateAppLevelInstancesReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}
		self.openPopup = function (popupName) {
			if (popupName == "modelAddTemplateAppLevelInstance") {
				self.templateFlag(true);
				//TO Clear the Sub children instances
				if (koUtil.selectedInstance() && koUtil.selectedInstance().children().length > 0) {
					for (var k = 0; k < koUtil.selectedInstance().children().length; k++) {
						koUtil.selectedInstance().children()[k].dropdownCol([]);
						koUtil.selectedInstance().children()[k].parentInstanceId(0);
						koUtil.selectedInstance().children()[k].parentInstanceName('');
					}
				}
				koUtil.selectedInstanceLevelDetails = getInstanceLevelDetails();
				updateTemplateInstanceSelection();
				loadelement(popupName, 'device');
				$("#modelAddAppLevelInstance").addClass('bs-example-modal-lg addInstance');
				$("#modelAddAppLevelInstance").removeClass('bs-example-modal-md');
				$('#modelAddAppLevelInstance').modal('show');
			} else if (popupName == "modalTemplateQualifiers") {
				self.templateFlag(true);
				$("#modelAddAppLevelInstance").removeClass('bs-example-modal-lg addInstance');
				$("#modelAddAppLevelInstance").addClass('bs-example-modal-md');
				$("#modelAddAppLevelInstance").modal('show');
				loadelement(popupName, 'genericPopup');
            }
		}
		self.moveItemsUP = function () {
			self.isSequenceChanged(true);
			if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
				$("#btnAddTemplate").prop('disabled', false);
			}
			var selectedRow = $('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindex');
			var datarow = $("#jqxgridtemplateparameterdetails").jqxGrid('getrowdata', selectedRow);
			var prevdatarow = $("#jqxgridtemplateparameterdetails").jqxGrid('getrowdata', selectedRow - 1);
			var rowID = $('#jqxgridtemplateparameterdetails').jqxGrid('getrowid', selectedRow);
			var rowID1 = $('#jqxgridtemplateparameterdetails').jqxGrid('getrowid', selectedRow - 1);

			$('#jqxgridtemplateparameterdetails').jqxGrid('updaterow', [rowID, rowID1], [prevdatarow, datarow]);
			$('#jqxgridtemplateparameterdetails').jqxGrid('clearselection');
			$('#jqxgridtemplateparameterdetails').jqxGrid('unselectrow', selectedRow);
			$('#jqxgridtemplateparameterdetails').jqxGrid('selectrow', selectedRow - 1);
			seqControlSelect();
		}

		self.moveItemsDown = function () {
			self.isSequenceChanged(true);
			if ($("#txtTemplateName").val().trim() != '') {
				$("#btnAddTemplate").prop('disabled', false);
			}
			var selectedRow = $('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindex');
			var datarow = $("#jqxgridtemplateparameterdetails").jqxGrid('getrowdata', selectedRow);
			var nextdatarow = $("#jqxgridtemplateparameterdetails").jqxGrid('getrowdata', selectedRow + 1);
			var rowID = $('#jqxgridtemplateparameterdetails').jqxGrid('getrowid', selectedRow);
			var rowID1 = $('#jqxgridtemplateparameterdetails').jqxGrid('getrowid', selectedRow + 1);

			$('#jqxgridtemplateparameterdetails').jqxGrid('updaterow', [rowID1, rowID], [datarow, nextdatarow]);
			$('#jqxgridtemplateparameterdetails').jqxGrid('clearselection');
			$('#jqxgridtemplateparameterdetails').jqxGrid('unselectrow', selectedRow);
			$('#jqxgridtemplateparameterdetails').jqxGrid('selectrow', selectedRow + 1);
			seqControlSelect();
		}

		self.editInstance = function (gID) {
			var arrayRowIndexes = $('#' + gID).jqxGrid('getselectedrowindexes');
			var selecteItemIds = new Array();
			for (var i = 0; i < arrayRowIndexes.length; i++) {
				var instanceData = $('#' + gID).jqxGrid('getrowdata', arrayRowIndexes[i]);
				selecteItemIds.push(instanceData);
			}
			if (selecteItemIds && selecteItemIds.length == 1) {
				isTreeNodeSelected = false;
				isComboSelected = false;
				selectionMode = 'gridEdit';
				isGridTabSelect = false;
				$("#templateTabs li div .tabMask").removeClass("tabMask");
				$('#templateTabs li:nth-child(2) a').click();
				if (koUtil.viewParameterTemplateOnDevice == false) {
					$('#baselevelTemplateFooter').addClass('hide');
				}
				koUtil.selectedlevelInstanceId = selecteItemIds[0].InstanceId;

				var instance = self.confirmInstance();
				var rootItem = _.where(treeOriginalColl, { FormFileId: instance.FormFileId() });
				var instanceCol = _.where(instance.dropdownCol(), { InstanceId: selecteItemIds[0].InstanceId });
				var index = koUtil.selectedInstance().dropdownCol().indexOf(instanceCol[0]);
				var id = "#treeCombo" + koUtil.selectedInstance().FormFileId() + "_" + koUtil.selectedInstance().Level();
				$(id).prop('selectedIndex', index + 1);
				$(id).trigger('chosen:updated');
				$('#txtInstanceNameTemplate').val($(id).find('option:selected').text());
				storeInstanceLevelDetails(instance);
				validateIsSelectedExist(id, koUtil.selectedlevelInstanceId);
				buildBreadCrumText(rootItem[0], false);
				//To Get Refresh the Data
				self.templateXML(tabContainer);

				getTemplateApplicationParams(self.isSequenceChanged);
				if (instance.children().length > 0) {
					clearChildDropDownColl(instance);
				}

			} else if (selecteItemIds.length == 0) {
				openAlertpopup(1, 'please_select_a_instance_to_edit', { instanceName: koUtil.selectedLevelName });
				$('#baselevelTemplateFooter').removeClass('hide');
				return;
			} else if (selecteItemIds.length > 1) {
				openAlertpopup(1, 'please_select_a_single_instance_to_edit', { instanceName: koUtil.selectedLevelName });
				$('#baselevelTemplateFooter').removeClass('hide');
				return;
			}
		}

		self.deleteInstances = function () {
			var arrayRowIndexes = $('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindexes');
			var arrayInstances = new Array();
			for (var i = 0; i < arrayRowIndexes.length; i++) {
				var instanceData = $('#jqxgridtemplateparameterdetails').jqxGrid('getrowdata', arrayRowIndexes[i]);
				arrayInstances.push(instanceData);
			}
			if (arrayInstances.length > 0) {
				$("#DeleteInstanceText").text(i18n.t('are_you_sure_you_want_to_delete_instances', { deleteInstanceCount: arrayInstances.length }, { lng: lang }))
				$("#DeleteInstanceConfirmPopup").modal('show');
				//var paramDeleteInstances = getParamForDeleteDeviceAppLevelInstances(arrayInstances);
				//deleteDeviceAppLevelInstances(paramDeleteInstances);
			} else if (arrayInstances.length == 0) {
				openAlertpopup(1, 'please_select_a_instance_to_delete', { instanceName: koUtil.selectedLevelName });
				return;
			}
		}

		self.confirmDeleteInstance = function () {
			var arrayRowIndexes = $('#jqxgridtemplateparameterdetails').jqxGrid('getselectedrowindexes');
			var arrayInstances = new Array();
			for (var i = 0; i < arrayRowIndexes.length; i++) {
				var instanceData = $('#jqxgridtemplateparameterdetails').jqxGrid('getrowdata', arrayRowIndexes[i]);
				arrayInstances.push(instanceData);
			}
			var paramDeleteInstances = getParamForDeleteTemplateAppLevelInstances(arrayInstances);
			deleteTemplateAppLevelInstances(paramDeleteInstances);
			$("#DeleteInstanceConfirmPopup").modal('hide');
		}

		self.cancelDeleteInstance = function () {
			$("#DeleteInstanceConfirmPopup").modal('hide');
		}


		$('#DeleteInstanceConfirmPopup').on('shown.bs.modal', function (e) {
			$('#DeleteInstanceConfirmPopup_Confo_No').focus();

		});
		$('#DeleteInstanceConfirmPopup').keydown(function (e) {
			if ($('#DeleteInstanceConfirmPopup_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#DeleteInstanceConfirmPopup_Confo_Yes').focus();
			}
		});

		$('#EditParameterConfirmPopup').on('shown.bs.modal', function (e) {
			$('#TemplateConfirmPopup_Confo_No').focus();

		});
		$('#EditParameterConfirmPopup').keydown(function (e) {
			if ($('#TemplateConfirmPopup_Confo_No').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#TemplateConfirmPopup_Confo_Yes').focus();
			}
		});


		self.unloadAddTemplatepopup = function (checkTxtValue) {
			if (checkTxtValue == 'AddInstance') {
				instanceAddorEdit = true;
			}
			if (checkTxtValue == '') {
				$('#TemplateConfirmPopup').modal('show');
			} else {
				//add template
				if (koUtil.addOrEditTemplate == 0) {
					if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
						$("#btnAddTemplate").prop('disabled', false);
					}
				} else {
					//edit template with Qualifiers change only
					//To Do when labels are brought back
                }
				self.observableModelPopup('unloadTemplate');
				$('#modelAddAppLevelInstance').modal('hide');
				koUtil.currentScreen = 'TemplateEditInstance';
			}
		}
		function changenumber(data, number) {

			var val = '';

			if (koUtil.addOrEditTemplate == 1) {
				var pId = parseInt(data.ParamId);
				var datasource = _.where(self.dataforEdit(), { ParamId: pId });
				if (datasource != '') {
					if (datasource[0].ParamValue == number) {
						val = '';
					} else {
						val = number;
					}
				} else {
					val = number;
				}

			} else {
				val = number;
			}
			data.IsClear = false;
			if (val == '' || number == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, number);
			}
		}



		self.downNumber = function (data) {
			if (data.AllowModify) {
				var id = '#templateNumeric' + data.ParamId;
				if ($(id).val() == '') {
					var number = 0;
				} else {
					var number = parseInt($(id).val());
				}
				if (number > data.ValueType.Numeric.MinVal) {
					number = number - 1;
				}
				$(id).val(number);
				changenumber(data, number);
			}
		}

		self.setParamDataValue = function (data, value) {
			if (data.ValueType.Type == 'String') {
				var id = '#templateTxt' + data.ParamId;
				$(id).val(value);
			}
			if (data.ValueType.Type == 'Enumeration') {
				var id = '#templateCombo' + data.ParamId;
				$(id).val(value).prop("selected", "selected");
				$(id).trigger('chosen:updated');
			}
			if (data.ValueType.Type == 'Numeric') {
				var id = '#templateNumeric' + data.ParamId;
				$(id).val(value);
			}

			if (data.ValueType.Type == 'DateTime') {
				var id = '#templateInputDate' + data.ParamId;
				$(id).val(value);
			}
			if (data.ValueType.Type == 'Boolean' || data.ValueType.Type == 'CheckBox') {
				var id = '#templateCheck' + data.ParamId;
				$(id).val(value);
				if (value == 1) {
					$(id).prop("checked", true);
				} else {
					$(id).prop("checked", false);
				}

			}
		}
		self.clearParamValue = function (data) {
			var value = "";
			if (data.ValueType.Type == 'String') {
				var id = '#templateTxt' + data.ParamId;
				$(id).val(value);
			}
			else if (data.ValueType.Type == 'Enumeration') {
				var id = '#templateCombo' + data.ParamId;
				$(id).val(value).prop("selected", "selected");
				$(id).trigger('chosen:updated');
			}
			else if (data.ValueType.Type == 'Numeric') {
				var id = '#templateNumeric' + data.ParamId;
				$(id).val(value);
			}
			else if (data.ValueType.Type == 'DateTime') {
				var id = '#templateInputDate' + data.ParamId;
				$(id).val(value);
			}
			else if (data.ValueType.Type == 'Boolean' || data.ValueType.Type == 'CheckBox') {
				var id = '#templateCheck' + data.ParamId;
				value = 0;
				$(id).val(value);
				if (value == 1) {
					$(id).prop("checked", true);
				} else {
					$(id).prop("checked", false);
				}
			}
			data.IsClear = true;
			if (data.ParamValue == undefined || $(id).val() == data.ParamValue) {
				$(id).removeClass("borderColor-Text");
				updateEditvalue(data);
			} else {
				updateSetValue(data, value);
			}
		}

		self.restoredValue = function (data) {
			self.setParamDataValue(data, data.Default);
			var val = 2;
			if (koUtil.addOrEditTemplate == 1) {
				var pId = parseInt(data.ParamId);
				var datasource = _.where(self.dataforEdit(), { ParamId: pId });
				if (datasource != '') {
					if (datasource[0].ParamValue == data.Default) {
						val = 2;
					} else {
						val = data.Default;
					}
				} else {
					val = data.Default;
				}

			} else {
				val = data.Default;
			}
			data.IsClear = false;
			if (val == 2 || val == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, val);
			}
		}
		self.checkTxtTemplateName = ko.observable();
		self.checkTxtTemplateName.subscribe(function (newValue) {
			if (newValue != null || newValue.trim() != '') {
				if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
					if (koUtil.addOrEditTemplate == 0) {
						if (arrayofeditvalue.length > 0 || instanceAddorEdit) {
							$("#btnAddTemplate").removeAttr('disabled');
						}
					} else {
						if (arrayofeditvalue.length > 0 || instanceAddorEdit) {
							$("#btnAddTemplate").removeAttr('disabled');
						} else if (self.isSequenceChanged()) {
							$("#btnAddTemplate").removeAttr('disabled');
						} else {
							$("#btnAddTemplate").prop('disabled', true);
						}
					}
				} else {
					$("#btnAddTemplate").prop('disabled', true);
				}
			} else {
				$("#btnAddTemplate").prop('disabled', true);
			}
		});
		var IsPrimaryIdentifier = 0;
		var editedValue;
		self.confirmNavigation = function (instance, target) {
			if ((selectionMode == 'treeNode' || selectionMode == 'gridEdit') && isTreeNodeSelected == true) {
				//TO Clear the Sub children instances
				if (koUtil.selectedInstance().children() && koUtil.selectedInstance().children().length > 0) {
					for (var k = 0; k < koUtil.selectedInstance().children().length; k++) {
						koUtil.selectedInstance().children()[k].dropdownCol([]);
						koUtil.selectedInstance().children()[k].parentInstanceId(0);
						koUtil.selectedInstance().children()[k].parentInstanceName('');
					}
				}
				handleNodeClick(instance, target);
				if (target != undefined) {
					$(target).addClass("treeNodeActive");
				}
			} else if (selectionMode == 'comboBox' && isComboSelected == true) {
				handleComboChange(instance, target);
			}

			isTreeNodeSelected = false;
			$("#EditParameterConfirmPopup").modal('hide');
			if (instanceLevelBaseContainer == false) {
				$('#baselevelTemplateFooter').removeClass('hide');
				$('#nonMultiInstanceLevelContainerFooter').addClass('hide');
			}
			arrayForSetValue = [];
			arrayofeditvalue = [];
			arrayOfInvalidChars = [];
			arrayOfPrimaryIdentifierValue = [];
			updateTemplateInstanceSelection();
		}
		self.confirmSaveSequence = function (instance, target) {
			self.isSequenceChanged(false);
			self.sequenceNavDown(true);
			self.sequenceNavUp(true);
			self.setInstancesSequence(instance, target, true);
		}
		self.editValue = function (data) {
			editedValue = data;
			$("#txtValueSpanDevProf").hide();
			$("#txtValueSpanDevProf").empty();

			self.editAccessValue(data.Access);
			$("#btnSaveSelectedPvalue").prop('disabled', true);
			savecheck = 0;
			self.paramId(data.ParamId);

			if ($.inArray(data.ParamId, arrayofeditvalue) < 0) {
				self.SourceType(data.SourceType);
			} else {
				self.SourceType('User');
			}

			//self.SourceType(data.SourceType)
			self.SourceId(data.SourceId);
			self.SourceTempId(data.SourceId);
			self.paramValueType(data.ValueType.Type);
			self.paramValue(data.ParamValue);

			IsPrimaryIdentifier = (data.PrimaryIdentifier != undefined && data.PrimaryIdentifier == "True") ? 1 : 0;
			self.paramDefaultValue(data.Default);


			$("#editParamValueHeader").text(i18n.t('edit_param_popup_lbl', {
				lng: lang
			}) + ' ' + data.DisplayName);

			if (data.ValueType.Type == 'String') {
				self.controlType('String');
				var id = "#templateTxt" + data.ParamId;
				var value = $(id).val();
				$("#txtValue").val(value);
				if ((data.MaskValue && data.MaskValue.toUpperCase() == 'TRUE') || (data.PartialMask && data.PartialMask.toUpperCase() == 'TRUE')) {
					value = data.ParamValue;
				}

				if (data.ValueType.String.MinLen) {
					$("#txtValue").prop('minlength', data.ValueType.String.MinLen);
				}
				if (data.ValueType.String.MaxLen) {
					$("#txtValue").prop('maxlength', data.ValueType.String.MaxLen);
				}

				$("#txtDiv").show();
				$("#numericDiv").hide();
				$("#ddlDiv").hide();
				$("#validationDiv").show();
				$("#CheckboxDiv").hide();
				$("#DateDiv").hide();
				//self.templateTxtValue(data.ParamValue);
				if ($("#txtValue").val() == '' || $("#txtValue").val() == data.ParamValue) {

					$("#btnSaveSelectedPvalue").prop('disabled', true);
				} else {

					$("#btnSaveSelectedPvalue").prop('disabled', false);
				}

                $("#txtvalidationValue").val(data.ValueType.String.ValidChars);
				$("#txtDefaultValue").val(data.Default);


				self.regExpression(data.ValueType.String.ValidChars);

			} else if (data.ValueType.Type == 'Numeric') {
				self.maxValue(data.ValueType.Numeric.MaxVal);
				self.minValue(data.ValueType.Numeric.MinVal);

				self.controlType('Numeric');
				var id = "#templateNumeric" + self.paramId();
				var value = $(id).val();
				$("#txtnumericValue").val(value);
				//    self.templateTxtValueNum(value) ;
				// self.templateTxtValueNum( $("#txtnumericValue").val())
				$("#txtDiv").hide();
				$("#numericDiv").show();
				$("#ddlDiv").hide();
				$("#validationDiv").hide();
				$("#CheckboxDiv").hide();
				$("#DateDiv").hide();

				if ($("#txtnumericValue").val() == '' || $("#txtnumericValue").val() == data.ParamValue) {

					$("#btnSaveSelectedPvalue").prop('disabled', true);
				} else {

					$("#btnSaveSelectedPvalue").prop('disabled', false);
				}

				// $("#txtnumericValue").val(data.ParamValue);
				self.paramDefaultValue(data.Default);
				$("#txtDefaultValue").val(data.Default);

			} else if (data.ValueType.Type == 'Enumeration') {
				self.controlType('Enumeration');
				self.paramDllData(data.ValueType.Enumeration.EnumItem);
				var id = "#templateCombo" + self.paramId();
				var value = $(id).val();

				$("#ddlValue").val(value).prop("selected", "selected");
				$("#ddlValue").trigger('chosen:updated');

				$("#txtDiv").hide();
				$("#numericDiv").hide();
				$("#ddlDiv").show();
				$("#validationDiv").hide();
				$("#CheckboxDiv").hide();
				$("#DateDiv").hide();

				if ($("#ddlValue").val() == null || $("#ddlValue").val() == '' || $("#ddlValue").val() == data.ParamValue) {

					$("#btnSaveSelectedPvalue").prop('disabled', true);
				} else {

					$("#btnSaveSelectedPvalue").prop('disabled', false);
				}

				var enumsoirce = _.where(data.ValueType.Enumeration.EnumItem, {
					Value: data.Default
				})
				// if (enumsoirce.length > 0) {
				$("#txtDefaultValue").val(enumsoirce[0].Name);
				//} else {
				//      $("#txtDefaultValue").val(data.Default);
				//  }
				//self.paramDefaultValue(data.Default);

			}
			else if (data.ValueType.Type == 'DateTime') {
				self.controlType('DateTime');
				var id = "#templateInputDate" + self.paramId();
				var value = $(id).val();
				var date = '';
				if (value != '') {
					date = value;
				}
				if (data.ValueType.DateTime && data.ValueType.DateTime.DateFormat) {
					dateFormat = data.ValueType.DateTime.DateFormat;
				}
				self.paramFormat(dateFormat);
				updateDateTimePicker("#txtDateValue", dateFormat, date);
				$(id).val(value);

				$("#txtDiv").hide();
				$("#numericDiv").hide();
				$("#ddlDiv").hide();
				$("#validationDiv").hide();
				$("#CheckboxDiv").hide();
				$("#DateDiv").show();

				if ($("#txtDateInputValue").val() == '' || date == data.ParamValue) {

					$("#btnSaveSelectedPvalue").prop('disabled', true);
				} else {

					$("#btnSaveSelectedPvalue").prop('disabled', false);
				}


				$("#txtDefaultValue").val(data.Default);

			}
			else if (data.ValueType.Type == 'Boolean' || data.ValueType.Type == 'CheckBox') {

				$("#editCheckboxlabel").text(data.DisplayName);
				self.controlType('Boolean');
				var id = "#templateCheck" + self.paramId();

				var check = 0;

				if ($(id).is(':checked')) {
					check = 1;
				} else {
					check = 0;
				}

				if (check == 1) {
					self.pramvaluforcheckbox(1);
				} else {
					self.pramvaluforcheckbox(0);
				}

				var check1 = 0;
				if ($("#checkBoxValue").is(':checked')) {
					check1 = 1;
				} else {
					check1 = 0;
				}

				$("#txtDiv").hide();
				$("#numericDiv").hide();
				$("#ddlDiv").hide();
				$("#validationDiv").hide();
				$("#CheckboxDiv").show();
				$("#DateDiv").hide();

				if (check1 == data.ParamValue) {
					$("#btnSaveSelectedPvalue").prop('disabled', true);

				} else {
					$("#btnSaveSelectedPvalue").prop('disabled', false);
				}

				$("#txtDefaultValue").val(data.Default);

			} else {
				self.controlType('String');
				var id = "#templateTxt" + data.ParamId;
				var value = $(id).val();
				$("#txtValue").val(value);

				$("#txtDiv").show();
				$("#numericDiv").hide();
				$("#ddlDiv").hide();
				$("#validationDiv").show();
				$("#CheckboxDiv").hide();
				$("#DateDiv").hide();
				//self.templateTxtValue(data.ParamValue);
				if ($("#txtValue").val() == '' || $("#txtValue").val() == data.ParamValue) {

					$("#btnSaveSelectedPvalue").prop('disabled', true);
				} else {

					$("#btnSaveSelectedPvalue").prop('disabled', false);
				}

				//$("#txtvalidationValue").text(data.ValueType.String.ValidChars);
				$("#txtDefaultValue").val(data.Default);


				//self.regExpression(data.ValueType.String.ValidChars);
			}

			//$("#txtDefaultValue").val(data.Default);
			if (self.SourceType() == undefined) {
				$("#txtsourceValue").parent().hide();
				$('#btnRestTempValue').hide();
			}
			else {
				$("#txtsourceValue").parent().show();
				$('#btnRestTempValue').show();
				$("#txtsourceValue").val(self.SourceType());
			}
			$("#txtDescriptionValue").val(data.Description);

			if (IsPrimaryIdentifier == 1) {
				$('#btnRestDefault').hide();
				$('#btnRestTempValue').hide();
			} else {
				$('#btnRestDefault').show();
				$('#btnRestTempValue').show();
			}

			self.editParams();
			//$("#editParamValue").modal("show");
		}
		self.SetDefaultApplicationParameterValue = function () {

			if (self.controlType() == 'String') {
				$("#txtValue").val(self.paramDefaultValue());
			} else if (self.controlType() == 'Numeric') {
				$("#txtnumericValue").val(self.paramDefaultValue());
			} else if (self.controlType() == 'Enumeration') {
				$("#ddlValue").val(self.paramDefaultValue()).prop("selected", "selected");
				$("#ddlValue").trigger('chosen:updated');
			} else if (self.controlType() == 'DateTime') {
				var date = '';
				if (self.paramDefaultValue() != '') {
					date = self.paramDefaultValue();
					updateDateTimePicker("#txtDateValue", self.paramFormat(), date);
				}
				$("#txtDateInputValue").val(date);
			} else if (self.controlType() == 'Boolean') {

				if (self.paramDefaultValue() == 1) {
					$("#checkBoxValue").prop("checked", true);
				} else {
					$("#checkBoxValue").prop("checked", false);
				}
			}
			$("#txtsourceValue").val('Default');
			if (self.paramValue() == self.paramDefaultValue()) {
				$("#btnSaveSelectedPvalue").prop('disabled', true);
			} else {
				$("#btnSaveSelectedPvalue").prop('disabled', false);
			}
		}
		self.checkEditDllValue = function () {

			var defaultv = self.paramDefaultValue();
			if ($("#ddlValue").val() == self.paramDefaultValue()) {
				$("#txtsourceValue").val('Default');
			} else {
				$("#txtsourceValue").val('User');
			}

			if ($("#ddlValue").val() == self.paramValue() || $("#ddlValue").val() == '--Select--') {

				$("#btnSaveSelectedPvalue").prop('disabled', true);
			} else {

				$("#btnSaveSelectedPvalue").prop('disabled', false);
			}

		}
		self.editParams = function () {
			var modalHeight = $('#editTemplateInstanceBody')[0].clientHeight;
			$('#slidePanel').height(modalHeight - 60);
			if ($('#slidePanel').hasClass('show')) {
				$("#slidePanel").animate({
					width: "-=400"
				}, 700, function () {
					// Animation complete.
				});
				$('#slidePanel').removeClass('show').addClass('hide');
				$('.pageMask').hide();
			}
			else {
				$('.pageMask').show();
				$("#slidePanel").animate({
					width: "+=400"
				}, 700, function () {
					// Animation complete.
				});
				$('#slidePanel').removeClass('hide').addClass('show');
			}
		}
		self.hideEditPramDiv = function () {
			$(".pageMask").hide();
			self.editParams();
			setTimeout(function () {
				$("#mainPageBody").addClass('modal-open');
			}, 500);

		}
		function checkerror(editedValue) {
			var retval = '';
			$("#txtValueSpanDevProf").hide();
			$("#txtValueSpanDevProf").empty();

			var checkVal = self.validationOfRegExpression($("#txtValue").val())

			if (checkVal == false) {
				retval += 'invalid item';
				if (editedValue.ValueType.String.ErrorOnValidationFailure && editedValue.ValueType.String.ErrorOnValidationFailure != '') {
					$("#txtValueSpanDevProf").text(editedValue.ValueType.String.ErrorOnValidationFailure).show()
				} else {
					$("#txtValueSpanDevProf").text(i18n.t('Invalid_Parameter_Values_VPFX', { lng: lang })).show();
				}
			} else {
				retval += '';
				$("#txtValueSpanDevProf").hide();
			}
			return retval;

		}
		self.SetDeviceParameterValue = function () {

			var paramID = self.paramId();
			var paramValue = '';
			var name = '';
			if (self.controlType() == 'String') {
				var id = '#templateTxt' + paramID;
				$(id).val($("#txtValue").val());
				paramValue = $("#txtValue").val();
				var retval = checkerror(editedValue);
				if (retval == null || retval == '') {

				} else {
					return;
				}

			} else if (self.controlType() == 'Numeric') {
				var id = '#templateNumeric' + paramID;
				paramValue = parseInt($("#txtnumericValue").val());
				var maxValueNum = parseInt(self.maxValue());
				var minValueNum = parseInt(self.minValue());
				if (isNaN(paramValue)) {
					paramValue = (minValueNum && minValueNum > 0) ? minValueNum : 0;
				} else {
					if (paramValue > maxValueNum) {
						paramValue = maxValueNum;
					} else if (paramValue < minValueNum) {
						paramValue = minValueNum;
					}
				}
				$(id).val(paramValue);
			} else if (self.controlType() == 'Enumeration') {
				paramValue = $("#ddlValue").val();
				var id = '#templateCombo' + paramID;
				$(id).val(paramValue).prop("selected", "selected");
				$(id).trigger('chosen:updated');
				name = $(id).find('option:selected').text();
				//self.SourceType($("#txtsourceValue").val());
			}
			else if (self.controlType() == 'DateTime') {
				//var date1;
				//if ($("#txtDateInputValue").val() != '') {
				//    var val = $("#txtDateInputValue").val();
				//    paramValue = val;
				//}

				paramValue = $("#txtDateInputValue").val();
				var id = '#templateDate' + paramID;
				dateFormat = self.paramFormat();
				if (paramValue == '') {
					updateDateTimePicker(id, dateFormat, 'today');
				} else {
					updateDateTimePicker(id, dateFormat, paramValue);
				}
				$('#templateInputDate' + paramID).val(paramValue);

				//var id = '#templateDate' + paramID;
				//var date = $("#templateInputDate").val();//moment(date1).format('MM/DD/YYYY');
				//$(id).val(date)                
				//if (date == "") {
				//    date = null;
				//}
				//updateDateTimePicker(id, dateFormat, date);

			}
			else if (self.controlType() == 'Boolean' || self.controlType() == 'CheckBox') {
				var id = '#templateCheck' + paramID;
				if ($("#checkBoxValue").is(':checked')) {
					$(id).prop("checked", true);
					paramValue = 1;
				} else {
					$(id).prop("checked", false);
					paramValue = 0;
				}
			}
			if ($("#txtsourceValue").val() && $("#txtsourceValue").val() != '') {
				self.SourceType($("#txtsourceValue").val());
			}
			$(".templatePageMask").hide();
			self.editParams();

			if (paramValue == editedValue.ParamValue) {

				updateEditvalue(editedValue);
			} else {

				if (name == '') {
					updateSetValue(editedValue, paramValue, '', self.SourceType());
				} else {
					updateSetValue(editedValue, paramValue, name, self.SourceType());
				}
			}
		}

		self.cancelWarningForTemplateUpdate = function () {
			$("#WarningPopupForTemplate").modal('hide');
		}
		self.addTemplate = function (unloadAddTemplatepopup) {
			var fileTypeParametersCount = 0;
			var isUpdateFileId = false;
			var sourceCustomParameter = _.where(arrayForSetValue, { IncludeInMP: 1 });
			if (!_.isEmpty(arrayForSetValue)) {
				for (var i = 0; i < arrayForSetValue.length; i++) {
					if (arrayForSetValue[i].ValueType === "File") {
						fileTypeParametersCount = fileTypeParametersCount + 1;
					}
				}
			}
			if (koUtil.parameterPackageId > 0 || !_.isEmpty(sourceCustomParameter)) {
				isUpdateFileId = true;
			}
			if (isUpdateFileId) {
				getFileId(fileTypeParametersCount, sourceCustomParameter);
			} else {
				if (koUtil.addOrEditTemplate == 1) {
					$("#WarningPopupForTemplate").modal('show');
				}
				else {
					setApplicationParameterTemplate(unloadAddTemplatepopup);
				}
			}
		}
		self.addTemplateWithWarning = function (unloadAddTemplatepopup) {
			setApplicationParameterTemplate(unloadAddTemplatepopup);
			$("#WarningPopupForTemplate").modal('hide');
		}
		function setApplicationParameterTemplate(unloadAddTemplatepopup) {
			var isSequenceUpdated = false;
			if (self.isSequenceChanged()) {
				var descriptionVal = $('#txtDescription').val();
				if (koUtil.addOrEditTemplate == 1 && descriptionVal == koUtil.selectedTemplateDescription) {
					self.setInstancesSequence(null, null, true);
					self.isSequenceChanged(false);
					self.sequenceNavDown(true);
					self.sequenceNavUp(true);
					return;
				} else {
					isSequenceUpdated = true;
					self.setInstancesSequence(null, null, false);
					self.isSequenceChanged(false);
					self.sequenceNavDown(true);
					self.sequenceNavUp(true);
				}
			}
			var checkArrayTextValidation = 0;
			for (var g = 0; g < arrayForSetValue.length; g++) {
				var id = "#templateTxt" + arrayForSetValue[g].ParamId;
				self.regExpression(arrayForSetValue[g].ValidChars)
				var checkVal = self.validationOfRegExpression((arrayForSetValue[g].ParamValue));
				if (checkVal == false) {
					$(id).addClass("borderColor-Text");
					checkArrayTextValidation--;
				} else {
					$(id).removeClass("borderColor-Text");
					checkArrayTextValidation++;
				}
			}
			if (checkArrayTextValidation != arrayForSetValue.length) {
				return;
			}

			var Parameters = new Array();
			for (var i = 0; i < arrayForSetValue.length; i++) {
				if (arrayForSetValue[i].ParamId != 0) {
					Parameters.push(arrayForSetValue[i]);
				}
			}
			var qualifier = new Object();
			qualifier.SelectedModels = globalTemplateQualifiers.SelectedModels;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (koUtil.addOrEditTemplate == 0) {
							openAlertpopup(0, 'p_t_add_success');
						} else {
							openAlertpopup(0, 'p_t_edit_success');
						}

						if (koUtil.addOrEditTemplate == 0) {
							unloadAddTemplatepopup('change');
							gridFilterClear('templateGrid');
							$("#applicationModel").modal('hide');
							isAdpopup = '';
							$("#mainPageBody").removeClass('modal-open-appendon');
							isSequenceUpdated = false;
						} else if (koUtil.addOrEditTemplate == 1 && !isSequenceUpdated) {
							unloadAddTemplatepopup('change');
							gridFilterClear('templateGrid');
							$("#applicationModel").modal('hide');
							isAdpopup = '';
							$("#mainPageBody").removeClass('modal-open-appendon');
							isSequenceUpdated = false;
						}

						//clear all set values manually as popup is not unloaded, only hidden from view
						arrayForSetValue = [];
						arrayofeditvalue = [];
						arrayOfInvalidChars = [];
						arrayOfPrimaryIdentifierValue = [];
						self.isSequenceChanged(false);
						instanceAddorEdit = false;
						isFileIdModified = false;
						koUtil.isParamValuesChanged(true);
						koUtil.parameterPackageId = 0;
						clearQualifiersObject();
						$("#btnAddTemplate").prop('disabled', true);
						$("#saveInstanceDetailsBtn").prop('disabled', true);
						$("#cancelInstanceDetailsBtn").hide();
					} else if (data.responseStatus.StatusCode == AppConstants.get('DUPLICATE_TEMPLATE')) {
						openAlertpopup(1, 'p_t_add_duplicate');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_REQUIRED_VPFX_MULTIINSTANCE_TEMPLATENAME')) {
						openAlertpopup(1, 'p_t_name_not_exist');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_PARAMETER_ALREADY_EXIST')) {
						openAlertpopup(1, 'assigned_template_contains_duplicate_parameter_templates');
					} else if (data.responseStatus.StatusCode == AppConstants.get('EX_INVALID_TEMPLATE_LABEL')) {
						openAlertpopup(1, 'ex_invalid_template_label');
					}
				}
			}

			var setApplicationParameterTemplateReq = new Object();
			setApplicationParameterTemplateReq.FormFileId = koUtil.selectedlevelFormFileId;
			setApplicationParameterTemplateReq.ContainerId = koUtil.selectedlevelContainerId;
			setApplicationParameterTemplateReq.Level = koUtil.selectedLevel;

			if (koUtil.addOrEditTemplate == 0) {
				for (var i = 0; i < selectedLevelParams.length; i++) {
					var sourceParam = _.where(Parameters, { ParamId: selectedLevelParams[i].ParamId });
					if (sourceParam.length > 0) {
						var index = Parameters.indexOf(sourceParam[0]);
						selectedLevelParams[i] = Parameters[index];
					}
				}

				var ApplicationTemplate = new Object();
				ApplicationTemplate.ApplicationId = ApplicationIdForTemplate;
				ApplicationTemplate.Description = $("#txtDescription").val();
				ApplicationTemplate.TemplateId = koUtil.selectedTemplateId;
				ApplicationTemplate.TemplateName = $("#txtTemplateName").val();
				setApplicationParameterTemplateReq.ApplicationTemplate = ApplicationTemplate;
				setApplicationParameterTemplateReq.ParamValues = koUtil.selectedLevel == 0 ? Parameters : [];
				setApplicationParameterTemplateReq.IsEdited = false;
				setApplicationParameterTemplateReq.IsMultiVPFXSupported = selectedIsMultiVPFXFileSupported;
				setApplicationParameterTemplateReq.IsFinalSave = true;
				setApplicationParameterTemplateReq.Qualifiers = qualifier;
				var params = '{"token":"' + TOKEN() + '","setApplicationParameterTemplateReq":' + JSON.stringify(setApplicationParameterTemplateReq) + '}';
				ajaxJsonCall('SetApplicationParameterTemplate', params, callbackFunction, true, 'POST', true);
			} else if (koUtil.addOrEditTemplate == 1) {
				var setApplicationParameterTemplateReq = new Object();
				var ApplicationTemplate = new Object();
				ApplicationTemplate.ApplicationId = ApplicationIdForTemplate;
				ApplicationTemplate.Description = $("#txtDescription").val();
				ApplicationTemplate.TemplateId = koUtil.selectedTemplateId;
				ApplicationTemplate.TemplateName = $("#txtTemplateName").val();
				if(referenceSetParameterTemplateLock) {
					ApplicationTemplate.IsLocked = $("#chkPTLocked").is(":checked");
				}
				setApplicationParameterTemplateReq.ApplicationTemplate = ApplicationTemplate;
				setApplicationParameterTemplateReq.ParamValues = koUtil.selectedLevel == 0 ? Parameters : [];
				setApplicationParameterTemplateReq.IsEdited = true;
				setApplicationParameterTemplateReq.IsMultiVPFXSupported = selectedIsMultiVPFXFileSupported;
				setApplicationParameterTemplateReq.IsFinalSave = true;
				setApplicationParameterTemplateReq.Qualifiers = qualifier;
				var params = '{"token":"' + TOKEN() + '","setApplicationParameterTemplateReq":' + JSON.stringify(setApplicationParameterTemplateReq) + '}';
				ajaxJsonCall('SetApplicationParameterTemplate', params, callbackFunction, true, 'POST', true);
			}
		}
		self.cancelTemplateParameters = function () {
			$("#templateTabs li div .tabMask").removeClass("tabMask");
			$('#templateTabs li:nth-child(1) a').click();

			if (arrayofeditvalue.length > 0) {
				if (koUtil.viewParameterTemplateOnDevice == false) {
					$("#EditParameterConfirmPopup").modal('show');
					return;
				}
			} else if (self.isSequenceChanged()) {
				$("#EditSequenceConfirmPopup").modal('show');
				return;
			}
			if (koUtil.addOrEditTemplate == 0) {
				if ($("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
					$("#btnAddTemplate").prop('disabled', false);
				}
			}
		}

		self.setTemplateParameters = function () {
			var fileTypeParametersCount = 0;
			var isUpdateFileId = false;
			var sourceCustomParameter = _.where(arrayForSetValue, { IncludeInMP: 1 });
			if (!_.isEmpty(sourceCustomParameter)) {
				if (tabContainer && tabContainer.length > 0) {
					for (var i = 0; i < tabContainer.length; i++) {
						for (var j = 0; j < tabContainer[i].Container.length; j++) {
							if (koUtil.selectedLevel == 0) {
								if (tabContainer[i].Container[j].Type == 'GENERAL') {
									for (var k = 0; k < tabContainer[i].Container.length; k++) {
										var params = tabContainer[i].Container[j].Param;
										for (var n = 0; n < params.length; n++) {
											if (params[n].ValueType.Type == "File") {
												fileTypeParametersCount = fileTypeParametersCount + 1;
											}
										}
									}
								}
							} else {
								if (tabContainer[i].Container[j].Type == 'Details') {
									for (var k = 0; k < tabContainer[i].Container[j].Container.length; k++) {
										for (var m = 0; m < tabContainer[i].Container[j].Container[k].length; m++) {
											var params = tabContainer[i].Container[j].Container[k][0].Param;
											for (var n = 0; n < params.length; n++) {
												if (params[n].ValueType.Type == "File") {
													fileTypeParametersCount = fileTypeParametersCount + 1;
												}
											}
										}
									}
								}
							}
						}
					}
				}
			} else {
				if (!_.isEmpty(arrayForSetValue)) {
					for (var i = 0; i < arrayForSetValue.length; i++) {
						if (arrayForSetValue[i].ValueType === "File") {
							fileTypeParametersCount = fileTypeParametersCount + 1;
						}
					}
				}
			}
			if (koUtil.parameterPackageId > 0 || !_.isEmpty(sourceCustomParameter)) {
				isUpdateFileId = true;
			}

			if (isUpdateFileId) {
				getFileId(fileTypeParametersCount, sourceCustomParameter);
			} else {
				setApplicationTemplateParameters(0);
			}
		}

		//get auto generated File Id
		var fileIdCall = 0;
		var fileIds = new Array();
		function getFileId(fileTypeParametersCount, customParameter) {

			function callbackFunction(data, Error) {
				fileIdCall = fileIdCall + 1;
				if (data) {
					isFileIdModified = true;
					var fileId = data.FileId;
					fileIds.push(fileId);
					var isFileParameterExists = false;
					if (fileTypeParametersCount > 1 && fileTypeParametersCount > fileIdCall) {
						getFileId(fileTypeParametersCount, customParameter);
						return;
					}

					$("#loadingDiv").hide();
					fileIdCall = 0;
					if (tabContainer && tabContainer.length > 0) {
						var fileIdCount = -1;
						for (var i = 0; i < tabContainer.length; i++) {
							for (var j = 0; j < tabContainer[i].Container.length; j++) {
								if (koUtil.selectedLevel == 0 && !isFileParameterExists) {
									if (tabContainer[i].Container[j].Type == 'GENERAL') {
										for (var k = 0; k < tabContainer[i].Container.length; k++) {
											var params = tabContainer[i].Container[j].Param;
											for (var n = 0; n < params.length; n++) {
												if (params[n].ValueType.Type == "File") {
													isFileParameterExists = true;
													var source = _.where(arrayForSetValue, { ParamId: params[n].ParamId });
													var sourcePId = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[n].ParamId });
													if (!_.isEmpty(source) && source.length > 0) {
														fileIdCount = fileIdCount + 1;
														params[n].PackageId = source[0].PackageId;
														var parameter = generateParameterObject(params[n], fileIds[fileIdCount]);
														var index = arrayForSetValue.indexOf(source[0]);
														arrayForSetValue[index] = parameter;
													} else if (!_.isEmpty(customParameter)) {
														fileIdCount = fileIdCount + 1;
														var fileParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
														var fileParameterIndex = arrayForSetValue.indexOf(params[n]);
														if (fileParameterIndex > -1) {
															arrayForSetValue[fileParameterIndex] = fileParameter;
														} else {
															arrayForSetValue.push(fileParameter);
														}
													}

													if (!_.isEmpty(sourcePId) && sourcePId.length > 0) {
														var pidParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
														var pidIndex = arrayOfPrimaryIdentifierValue.indexOf(sourcePId[0]);
														arrayOfPrimaryIdentifierValue[pidIndex] = pidParameter;
													}
													if (fileIdCount == fileIds.length - 1) {
														break;
													}
												}
											}
										}
									}
								} else {
									if (tabContainer[i].Container[j].Type == 'Details') {
										for (var k = 0; k < tabContainer[i].Container[j].Container.length; k++) {
											for (var m = 0; m < tabContainer[i].Container[j].Container[k].length; m++) {
												if (tabContainer[i].Container[j].Container[k][m].Container && tabContainer[i].Container[j].Container[k][m].Container.length > 0) {
													for (var p = 0; p < tabContainer[i].Container[j].Container[k][m].Container.length; p++) {
														var params = tabContainer[i].Container[j].Container[k][m].Container[p][0].Param;
														if (!_.isEmpty(params) && params.length > 0) {
															for (var q = 0; q < params.length; q++) {
																if (params[q].ValueType.Type == "File") {
																	if (arrayOfPrimaryIdentifierValue && arrayOfPrimaryIdentifierValue.length > 0) {
																		var parameter = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[q].ParamId });
																		if (!_.isEmpty(parameter) && parameter.length > 0) {
																			if (parameter[0].ParamId == params[q].ParamId) {
																				params[q].ParamValue = parameter[0].ParamValue;
																			}
																		}
																	}
																	var source = _.where(arrayForSetValue, { ParamId: params[q].ParamId });
																	var sourcePId = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[q].ParamId });
																	if (!_.isEmpty(source) && source.length > 0) {
																		fileIdCount = fileIdCount + 1;
																		params[q].PackageId = source[0].PackageId;
																		var parameter = generateParameterObject(params[q], fileIds[fileIdCount]);
																		var index = arrayForSetValue.indexOf(source[0]);
																		arrayForSetValue[index] = parameter;
																	} else if (!_.isEmpty(customParameter)) {
																		fileIdCount = fileIdCount + 1;
																		var fileParameter = generateParameterObject(params[q], fileIds[fileIdCount]);
																		var fileParameterIndex = arrayForSetValue.indexOf(params[q]);
																		if (fileParameterIndex > -1) {
																			arrayForSetValue[fileParameterIndex] = fileParameter;
																		} else {
																			arrayForSetValue.push(fileParameter);
																		}
																	}

																	if (!_.isEmpty(sourcePId) && sourcePId.length > 0) {
																		var pidParameter = generateParameterObject(params[q], fileIds[fileIdCount]);
																		var pidIndex = arrayOfPrimaryIdentifierValue.indexOf(sourcePId[0]);
																		arrayOfPrimaryIdentifierValue[pidIndex] = pidParameter;
																	}
																	if (fileIdCount == fileIds.length - 1) {
																		break;
																	}
																}
															}
														}
													}
												}

												var params = tabContainer[i].Container[j].Container[k][0].Param;
												if (!_.isEmpty(params) && params.length > 0) {
													for (var n = 0; n < params.length; n++) {
														if (params[n].ValueType.Type == "File") {
															var source = _.where(arrayForSetValue, { ParamId: params[n].ParamId });
															var sourcePId = _.where(arrayOfPrimaryIdentifierValue, { ParamId: params[n].ParamId });
															if (!_.isEmpty(source) && source.length > 0) {
																fileIdCount = fileIdCount + 1;
																params[n].PackageId = source[0].PackageId;
																var parameter = generateParameterObject(params[n], fileIds[fileIdCount]);
																var index = arrayForSetValue.indexOf(source[0]);
																arrayForSetValue[index] = parameter;
															} else if (!_.isEmpty(customParameter)) {
																fileIdCount = fileIdCount + 1;
																var fileParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
																var fileParameterIndex = arrayForSetValue.indexOf(params[n]);
																if (fileParameterIndex > -1) {
																	arrayForSetValue[fileParameterIndex] = fileParameter;
																} else {
																	arrayForSetValue.push(fileParameter);
																}
															}

															if (!_.isEmpty(sourcePId) && sourcePId.length > 0) {
																var pidParameter = generateParameterObject(params[n], fileIds[fileIdCount]);
																var pidIndex = arrayOfPrimaryIdentifierValue.indexOf(sourcePId[0]);
																arrayOfPrimaryIdentifierValue[pidIndex] = pidParameter;
															}
															if (fileIdCount == fileIds.length - 1) {
																break;
															}
														}
													}
												}
											}
										}
									}
								}
							}
						}
					}
					fileIds = new Array();

					if (koUtil.selectedLevel == 0) {
						setApplicationParameterTemplate(self.observableModelPopup);
					} else {
						setApplicationTemplateParameters();
					}
				}
			}

			$("#loadingDiv").show();
			var method = 'GenerateFileId';
			var params = '{"token":"' + TOKEN() + '"}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		function generateParameterObject(param, fileId) {
			var previousFileId = param.ParamValue == '' ? 0 : param.ParamValue;
			var Parameter = new Object();
			Parameter.ParamId = param.ParamId;
			Parameter.ParamName = param.Name;
			Parameter.ParamValue = fileId != undefined ? fileId : param.ParamValue;
			Parameter.TemplateId = 0;
			Parameter.IsPrimaryIdentifier = (param.PrimaryIdentifier == "True") ? 1 : 0;
			Parameter.PISequence = param.Sequence ? param.Sequence : 0;
			Parameter.SourceType = 'User';
			Parameter.ParamType = ENUM.get('FILE_ID');
			Parameter.PackageId = param.PackageId;
			Parameter.IncludeInMP = 0;
			Parameter.ValueType = param.ValueType.Type;
			Parameter.PreviousFileId = previousFileId;

			return Parameter;
		}

		function setApplicationTemplateParameters() {
			if (!isSelectedInstanceisMulti && isAddInstance && (koUtil.selectedLevel > 0)) {
				addNewInstance();
				return;
			}

			var checkArrayTextValidation = 0;
			for (var g = 0; g < arrayForSetValue.length; g++) {
				//var checkArrayTextValidation = 0;
				var id = "#templateTxt" + arrayForSetValue[g].ParamId;
				self.regExpression(arrayForSetValue[g].ValidChars)
				var checkVal = self.validationOfRegExpression((arrayForSetValue[g].ParamValue));
				if (checkVal == false) {
					$(id).addClass("borderColor-Text");
					checkArrayTextValidation--;
				} else {
					if (arrayForSetValue[g].MinLen) {
						self.textMinLength(arrayForSetValue[g].MinLen);
						var checkTextLength = self.validateStringLength(arrayForSetValue[g].ParamValue);
						if (checkTextLength == false) {
							$(id).addClass("borderColor-Text");
							checkArrayTextValidation--;
						} else {
							$(id).removeClass("borderColor-Text");
							checkArrayTextValidation++;
						}
					} else {
						$(id).removeClass("borderColor-Text");
						checkArrayTextValidation++;
					}
				}

			}
			if (checkArrayTextValidation != arrayForSetValue.length) {
				return;
			}

			var setTemplateParametersReq = new Object();

			var SelectedItemIds = new Array()
			SelectedItemIds.push(koUtil.selectedTemplateId);
			//getSelectedUniqueId('Devicejqxgrid');
			var UnSelectedItemIds = null;//getUnSelectedUniqueId('Devicejqxgrid');

			var Selector = new Object();
			Selector.SelectedItemIds = SelectedItemIds;
			Selector.UnSelectedItemIds = UnSelectedItemIds;

			var ParamList = new Array();
			for (var i = 0; i < arrayForSetValue.length; i++) {
				var Parameter = new Object();
				Parameter.ParamElementId = arrayForSetValue[i].ParamId;
				Parameter.ParamName = arrayForSetValue[i].ParamName;
				Parameter.ParamValue = arrayForSetValue[i].ParamValue;
				Parameter.TemplateId = arrayForSetValue[i].TemplateId;
				Parameter.IsPrimaryIdentifier = arrayForSetValue[i].IsPrimaryIdentifier;
				Parameter.PISequence = arrayForSetValue[i].PISequence;
				if (arrayForSetValue[i].SourceType == undefined) {
					Parameter.SourceType = "Default";
				} else {
					Parameter.SourceType = arrayForSetValue[i].SourceType;
				}
				Parameter.ParamType = arrayForSetValue[i].ParamType;
				Parameter.PackageId = arrayForSetValue[i].PackageId;
				Parameter.IncludeInMP = arrayForSetValue[i].IncludeInMP == 1 ? 1 : 0;
				Parameter.ValueType = arrayForSetValue[i].ValueType;
				Parameter.PreviousFileId = arrayForSetValue[i].PreviousFileId;
				ParamList.push(Parameter);
			}

			var PrimaryIdentParameters = new Array();

			for (var i = 0; i < arrayOfPrimaryIdentifierValue.length; i++) {
				if (arrayOfPrimaryIdentifierValue[i].ParamId != 0) {
					var IdentifiersInstances = new Object();
					IdentifiersInstances.Sequence = arrayOfPrimaryIdentifierValue[i].PISequence;
					IdentifiersInstances.Value = arrayOfPrimaryIdentifierValue[i].ParamValue;
					if (IdentifiersInstances.Value == '' || IdentifiersInstances.Value == "--Select--") {
                        openAlertpopup(1, 'please_fill_mandatory_fields_adding_instance');
                        return;
                    }
					PrimaryIdentParameters.push(IdentifiersInstances);
				}
			}

			//setTemplateParametersReq.ActionMode = isDirectParameterActivation ? ENUM.get('ACTION_MODE_SAVE_ACTIVATE') : ENUM.get('ACTION_MODE_SAVE');
			setTemplateParametersReq.ApplicationId = ApplicationIdForTemplate;
			setTemplateParametersReq.DeviceSearch = null;
			setTemplateParametersReq.Selector = Selector;
			setTemplateParametersReq.ParamList = ParamList;
			setTemplateParametersReq.IdentifiersInstances = PrimaryIdentParameters;
			setTemplateParametersReq.FormFileId = koUtil.selectedlevelFormFileId;
			setTemplateParametersReq.ContainerId = koUtil.selectedlevelContainerId;
			setTemplateParametersReq.Level = koUtil.selectedLevel;
			setTemplateParametersReq.ColumnSortFilter = null;
			if (isSelectedInstanceisMulti) {
				setTemplateParametersReq.InstanceId = koUtil.selectedlevelInstanceId;
			} else {
				setTemplateParametersReq.InstanceId = subchildInstanceID;
			}
			setTemplateParametersReq.InstanceName = $('#txtInstanceNameTemplate').val();
			setTemplateParametersReq.IsFileIdModified = isFileIdModified;
			setTemplateParametersReq.IsLookUpTemplate = isLookupTemplate;

			function callbackFunction(data, error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						arrayForSetValue = [];
						arrayofeditvalue = [];
						arrayOfInvalidChars = [];
						arrayOfPrimaryIdentifierValue = [];
						self.isSequenceChanged(false);
						instanceAddorEdit = true;
						isFileIdModified = false;
						koUtil.isParamValuesChanged(true);
						koUtil.parameterPackageId = 0;
						$("#btnAddTemplate").prop('disabled', true);
						$("#saveInstanceDetailsBtn").prop('disabled', true);
						$("#cancelInstanceDetailsBtn").hide();

						if (koUtil.selectedLevel == 0 && koUtil.selectedTemplateId != 0) {
							getApplicationTemplateVPFXFilesById(self.JsonXmlData, self.templateXML, self.treeColl, self.versionFlag, true, koUtil.selectedTemplateId, true);
						}
						else {
							//TO Clear the Sub children instances
							if (koUtil.selectedInstance() && koUtil.selectedInstance().children().length > 0) {
								for (var k = 0; k < koUtil.selectedInstance().children().length; k++) {
									koUtil.selectedInstance().children()[k].dropdownCol([]);
									koUtil.selectedInstance().children()[k].parentInstanceId(0);
									koUtil.selectedInstance().children()[k].parentInstanceName('');
								}
							}

							if ($('#jqxgridtemplateparameterdetails') && $('#jqxgridtemplateparameterdetails').length > 0) {
								gridRefresh('jqxgridtemplateparameterdetails');
							}
							if (selectedIsMultiVPFXFileSupported && koUtil.selectedInstance().Level() > 0) {
								updateTemplateInstanceSelection();
							}
						}
						//if (isDirectParameterActivation) {
						openAlertpopup(0, 'Instances_Sequence_successfully_updated');
						// } else {
						//     openAlertpopup(0, 'Parameters_successfully_updated');
						// }

					} else if (data.responseStatus.StatusCode == AppConstants.get('INSTANCE_ALREADY_EXISTS')) {
						openAlertpopup(2, 'Instance_Already_Exists', { instancelevelname: koUtil.selectedLevelName });
					} else if (data.responseStatus.StatusCode == AppConstants.get('PARAM_NOT_FOUND')) {
						openAlertpopup(2, 'param_Not_Found');
					} else if (data.responseStatus.StatusCode == AppConstants.get('Invalid_Param_Value')) {
						openAlertpopup(2, 'Invalid_Param_Value');
					}
				}
			}

			$("#loadingDiv").show();
			var method = 'SetTemplateParameters';
			var params = '{"token":"' + TOKEN() + '","setTemplateParametersReq":' + JSON.stringify(setTemplateParametersReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		function addNewInstance() {

			var checkArrayTextValidation = 0;
			for (var g = 0; g < arrayForSetValue.length; g++) {
				//var checkArrayTextValidation = 0;
				var id = "#templateAddTxt" + arrayForSetValue[g].ParamId;
				self.regExpression(arrayForSetValue[g].ValidChars)
				var checkVal = self.validationOfRegExpression((arrayForSetValue[g].ParamValue));
				if (checkVal == false) {
					$(id).addClass("borderColor-Text");
					checkArrayTextValidation--;
				} else {
					$(id).removeClass("borderColor-Text");
					checkArrayTextValidation++;
				}

			}
			if (checkArrayTextValidation != arrayForSetValue.length) {
				return;
			}


			var addTemplateAppLevelInstanceReq = new Object();
			var Parameters = new Array
			var PrimaryIdentParameters = new Array();

			for (var i = 0; i < arrayForSetValue.length; i++) {
				if (arrayForSetValue[i].ParamId != 0) {
					var Parameter = new Object();
					Parameter.ParamElementId = arrayForSetValue[i].ParamId;
					Parameter.ParamName = arrayForSetValue[i].ParamName;
					Parameter.ParamValue = arrayForSetValue[i].ParamValue;
					Parameter.TemplateId = arrayForSetValue[i].TemplateId;
					Parameter.IsPrimaryIdentifier = arrayForSetValue[i].IsPrimaryIdentifier;
					Parameter.PISequence = arrayForSetValue[i].PISequence;
					if (arrayForSetValue[i].SourceType == undefined) {
						Parameter.SourceType = "Default";
					} else {
						Parameter.SourceType = arrayForSetValue[i].SourceType;
					}
					Parameter.ParamType = arrayForSetValue[i].ParamType;
					Parameter.PackageId = arrayForSetValue[i].PackageId;
					Parameter.IncludeInMP = arrayForSetValue[i].IncludeInMP == 1 ? 1 : 0;
					Parameter.ValueType = arrayForSetValue[i].ValueType;
					Parameter.PreviousFileId = arrayForSetValue[i].PreviousFileId;
					Parameters.push(Parameter);
				}
			}

			for (var i = 0; i < arrayOfPrimaryIdentifierValue.length; i++) {
				if (arrayOfPrimaryIdentifierValue[i].ParamId != 0) {
					var IdentifiersInstances = new Object();
					IdentifiersInstances.Sequence = arrayOfPrimaryIdentifierValue[i].PISequence;
					IdentifiersInstances.Value = arrayOfPrimaryIdentifierValue[i].ParamValue;
					PrimaryIdentParameters.push(IdentifiersInstances);
				}
			}

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						isAddInstance = false;
						koUtil.parameterPackageId = 0;
						openAlertpopup(0, 'instance_add_success');
						$("#saveInstanceDetailsBtn").prop('disabled', true);
						getAppTemplateChildInstances();
					} else if (data.responseStatus.StatusCode == AppConstants.get('INSTANCE_ALREADY_EXISTS')) {
						openAlertpopup(2, 'Instance_Already_Exists', { instancelevelname: koUtil.selectedLevelName });
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_TEMPLATE_PARAMETER_ALREADY_EXIST')) {
						openAlertpopup(1, 'assigned_template_contains_duplicate_parameter_templates');
					} else if (data.responseStatus.StatusCode == AppConstants.get('E_INSTANCE_MAXIMUM_LIMIT_EXCEEDED')) {
						openAlertpopup(1, 'maximum_instances_limit_reached');
					}
				}
			}

			addTemplateAppLevelInstanceReq.ApplicationId = ApplicationIdForTemplate;
			addTemplateAppLevelInstanceReq.FormFileId = koUtil.selectedlevelFormFileId;
			addTemplateAppLevelInstanceReq.ContainerId = koUtil.selectedlevelContainerId;
			addTemplateAppLevelInstanceReq.TemplateId = koUtil.selectedTemplateId;
			addTemplateAppLevelInstanceReq.Level = koUtil.selectedLevel;
			addTemplateAppLevelInstanceReq.ParentInstanceId = koUtil.selectedlevelParentInstanceId;
			addTemplateAppLevelInstanceReq.InstanceName = $("#txtInstanceNameTemplate").val();
			addTemplateAppLevelInstanceReq.IsLookupTemplate = isLookupTemplate;
			if (Parameters != '') {
				addTemplateAppLevelInstanceReq.Parameters = Parameters;
				addTemplateAppLevelInstanceReq.IdentifiersInstances = PrimaryIdentParameters;
				var params = '{"token":"' + TOKEN() + '","addTemplateAppLevelInstanceReq":' + JSON.stringify(addTemplateAppLevelInstanceReq) + '}';
				ajaxJsonCall('AddTemplateAppLevelInstance', params, callbackFunction, true, 'POST', true);
			} else {
				openAlertpopup(1, 'p_t_add_entername');
			}
		}

		function setLevelParams(selectedLevelParams, Params) {
			for (var i = 0; i < Params.length; i++) {
				var Parameter = new Object();
				Parameter.ParamId = Params[i].ParamId;
				if (Params[i].ParamValue == undefined) {
					Parameter.ParamValue = Params[i].Default
				} else {
					Parameter.ParamValue = Params[i].ParamValue;
				}
				Parameter.TemplateId = koUtil.selectedTemplateId;
				Parameter.ApplicationId = ApplicationIdForTemplate;
				if (Parameter.ParamValue == Params[i].Default) {
					Parameter.SourceType = 'User';
				}
				else {
					Parameter.SourceType = 'User';
				}
				selectedLevelParams.push(Parameter);
			}
		}
		function setLevelContainers(Container, selectedLevelParams) {
			if (Container.Param == undefined) {
				if (Container.Container != undefined) {
					for (var l = 0; l < Container.Container.length; l++) {
						setLevelContainers(Container.Container[l], selectedLevelParams);
					}
				}
			} else {
				setLevelParams(selectedLevelParams, Container.Param);
				if (Container.Container != undefined) {
					for (var k = 0; k < Container.Container.length; k++) {
						setLevelContainers(Container.Container[k], selectedLevelParams);
					}
				}
			}
		}
		function loadParametersByLevel(container) {
			if (container.length > 0) {
				selectedLevelParams = [];
				for (var j = 0; j < container.length; j++) {
					setLevelContainers(container[j], selectedLevelParams);
				}

			}
		}

		function getParameterValuesFromTemplate(JsonXmlData, templateXML, LevelFlag, isUpdate, dataforEdit) {
			var getParameterValuesFromTemplateAtAppLevelReq = new Object();
			getParameterValuesFromTemplateAtAppLevelReq.ParamId = self.paramId();
			getParameterValuesFromTemplateAtAppLevelReq.TemplateId = koUtil.selectedTemplateId;
			getParameterValuesFromTemplateAtAppLevelReq.Level = koUtil.selectedLevel;
			getParameterValuesFromTemplateAtAppLevelReq.ApplicationId = ApplicationIdForTemplate;
			getParameterValuesFromTemplateAtAppLevelReq.ContainerId = koUtil.selectedlevelContainerId;
			getParameterValuesFromTemplateAtAppLevelReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						if (data && data.getParameterValuesFromTemplateAtAppLevelResp) {
							data.getParameterValuesFromTemplateAtAppLevelResp = $.parseJSON(data.getParameterValuesFromTemplateAtAppLevelResp);
						}

						if (data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS == null) {
							if (LevelFlag != 0) {
								savecheck = 1;
								openAlertpopup(1, 'pvalu_dose_not_exist');
							}
						} else {
							if (LevelFlag == 0) {
								dataforEdit(data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS);
								if (isUpdate == false) {
									createContainerTabs(JsonXmlData, templateXML, 0, isUpdate, data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS);
								}
								for (var k = 0; k < tabContainer.length; k++) {
									for (var j = 0; j < tabContainer[k].Container.length; j++) {
										assignContainerValue(tabContainer[k].Container[j], data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS);
									}
								}
								$("#txtTemplateName").prop('disabled', true);
								$("#btnAddTemplate").prop('disabled', true);
								$("#txtTemplateName").val(koUtil.selectedTemplateName);
							} else {
								savecheck = 1;
								var paramValue = data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS[0].ParamValue;
								self.paramValue(paramValue);
								$("#txtsourceValue").val(data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS[0].SourceType);
								self.SourceTempId(data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS[0].SourceId);
								self.SourceType(data.getParameterValuesFromTemplateAtAppLevelResp.TEMPLATEPARAMETERS[0].SourceType);
								$("#btnSaveSelectedPvalue").prop('disabled', false);
								if (self.controlType() == 'String') {
									$("#txtValue").val(paramValue);
								} else if (self.controlType() == 'Numeric') {
									$("#txtnumericValue").val(paramValue);
								} else if (self.controlType() == 'Enumeration') {
									$("#ddlValue").val(paramValue).prop("selected", "selected");
									$("#ddlValue").trigger('chosen:updated');
								} else if (self.controlType() == 'DateTime') {
									if (paramValue != '') {
										var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
										updateDateTimePicker('#txtDateValue', dateFormat, paramValue);
									}
									$("#txtDateInputValue").val(paramValue);
								} else if (self.controlType() == 'Boolean') {

									if (paramValue == 1) {
										$("#checkBoxValue").prop("checked", true);
									} else {
										$("#checkBoxValue").prop("checked", false);
									}
								}
							}
						}
					}
				}
			}

			var method = 'GetParameterValuesFromTemplateAtAppLevel';
			var params = '{"token":"' + TOKEN() + '","getParameterValuesFromTemplateAtAppLevelReq":' + JSON.stringify(getParameterValuesFromTemplateAtAppLevelReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}
		self.setInstancesSequence = function (instance, target, isFromInstanceChange) {
			var setTemplateInstanceSequenceReq = new Object();
			setTemplateInstanceSequenceReq.Level = koUtil.selectedLevel;
			var instanceSequenceCol = new Array();
			var instanceObject;
			var griddata = $('#jqxgridtemplateparameterdetails').jqxGrid('getdatainformation');

			for (var i = 0; i < griddata.rowscount; i++) {
				var rowdata = $("#jqxgridtemplateparameterdetails").jqxGrid('getrowdata', i);
				instanceObject = new Object();
				instanceObject.InstanceId = rowdata.InstanceId;
				instanceObject.Sequence = i + 1;
				instanceSequenceCol.push(instanceObject);
			}
			setTemplateInstanceSequenceReq.InstanceSequence = instanceSequenceCol;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						if (koUtil.selectedLevel == 0)
							unloadAddTemplatepopup();
						arrayForSetValue = [];
						arrayofeditvalue = [];
						arrayOfInvalidChars = [];
						arrayOfPrimaryIdentifierValue = [];
						$("#btnSaveSelectedPvalue").prop('disabled', true);
						gridRefresh('jqxgridtemplateparameterdetails');

						if (!_.isEmpty(instance) && !_.isEmpty(target)) {
							handleNodeClick(instance, target);
							if (target != undefined) {
								$(target).addClass("treeNodeActive");
							}
						}

						try {
							$("#EditSequenceConfirmPopup").modal('hide');
							$('#jqxgridtemplateparameterdetails').jqxGrid('clearselection');
						} catch (e) {
							//No exception should be return in console hence logging exception is removed
						}
						if (isFromInstanceChange) {
							openAlertpopup(0, 'Instances_Sequence_successfully_updated');
						}
						$("#btnAddTemplate").prop('disabled', true);
					}
				}
			}
			var method = 'SetTemplateInstanceSequence';
			var params = '{"token":"' + TOKEN() + '","setTemplateInstanceSequenceReq":' + JSON.stringify(setTemplateInstanceSequenceReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}
		self.validateNumber = function (data) {
			var maxValueNum = parseInt(data.ValueType.Numeric.MaxVal);
			var minValueNum = parseInt(data.ValueType.Numeric.MinVal);
			var id = "#templateNumeric" + data.ParamId;
			var val = parseInt($(id).val());

			if (isNaN(val)) {
				val = (minValueNum && minValueNum > 0) ? minValueNum : 0;
			} else {
				if (val > maxValueNum) {
					val = maxValueNum;
				} else if (val < minValueNum) {
					val = minValueNum;
				}
			}
			$(id).val(val);
			data.IsClear = false;
			if (val == data.ParamValue) {
				updateEditvalue(data);
			} else {
				updateSetValue(data, val);
			}
		}

		self.isNumberKey = function () {
			return validateNumberKey(event);
		}

		self.templateTxtValue = ko.observable();
		self.templateTxtValue.subscribe(function (newValue) {

			if (newValue == self.paramDefaultValue()) {
				$("#txtsourceValue").val('Default');
			} else {
				$("#txtsourceValue").val('User');
			}

			if (newValue == self.paramValue()) {
				$("#btnSaveSelectedPvalue").prop('disabled', true);
			} else {
				$("#btnSaveSelectedPvalue").prop('disabled', false);
			}
		});
		///spinner
		$('[data-trigger="spinner"]').spinner();
		///
		$("#btnAddTemplate").text(i18n.t('save', { lng: lang }));
		if (koUtil.addOrEditTemplate == 0) {
			if (isLookupTemplate) {
				$("#addParamTemplate").text("Add Lookup Template for Application :" + " " + selectedApplicationName + " " + "Version :" + " " + selectedApplicationVersion);
			} else {
				$("#addParamTemplate").text("Add Parameter Template for Application :" + " " + selectedApplicationName + " " + "Version :" + " " + selectedApplicationVersion);
			}
			$('#chkPTLockedDiv').hide();
		} else if (koUtil.addOrEditTemplate == 1) {
			if (isLookupTemplate) {
				$("#addParamTemplate").text("Edit Lookup Template for Application :" + " " + selectedApplicationName + " " + "Version :" + " " + selectedApplicationVersion);
			} else {
				$("#addParamTemplate").text("Edit Parameter Template for Application :" + " " + selectedApplicationName + " " + "Version :" + " " + selectedApplicationVersion);
			}
			if(self.isLocked())
			{
				$('#ptLockIcon').show();
				$('#ptUnlockIcon').hide();
			}
			else
			{
				$('#ptLockIcon').hide();
				$('#ptUnlockIcon').show();
			}
		}

		self.handleDescriptionChange = function () {
			if (koUtil.addOrEditTemplate == 1) {
				var descriptionVal = $('#txtDescription').val();
				if (descriptionVal == koUtil.selectedTemplateDescription) {
					if (arrayofeditvalue.length > 0 && arrayOfInvalidChars.length == 0) {
						$("#btnAddTemplate").prop('disabled', false);
					} else if (self.isSequenceChanged() && arrayOfInvalidChars.length == 0) {
						$("#btnAddTemplate").prop('disabled', false);
					} else if (instanceAddorEdit && arrayOfInvalidChars.length == 0) {
						$("#btnAddTemplate").prop('disabled', false);
					} else {
						$("#btnAddTemplate").prop('disabled', true);
					}
				} else if (arrayOfInvalidChars.length == 0) {
					$("#btnAddTemplate").prop('disabled', false);
				}
			}
		}

		self.handleLockChange = function () {
			$("#btnAddTemplate").prop('disabled', false);
		}

		//Tab Laf tand Right arrow Navigation 
		var left = 0;
		var contrWidth = 0;
		self.moveLeft = function () {
			contrWidth = $('#resultSectionTemplate').width();        //When we move left
			left = moveTabsLeft("#templateTabs", "#moveATLeft", "#moveATRight", self.templateXML().length, left, contrWidth);
		}

		self.moveRight = function () {
			contrWidth = $('#resultSectionTemplate').width();        //When we move right
			left = moveTabsRight("#templateTabs", "#moveATLeft", "#moveATRight", self.templateXML().length, left, contrWidth);
		}
		function getIntialTemplateIdToAdd() {
			var addApplicationParameterTemplateReq = new Object();
			var ApplicationParamterTemplate = new Object();
			ApplicationParamterTemplate.ApplicationId = ApplicationIdForTemplate;
			ApplicationParamterTemplate.Description = "";
			ApplicationParamterTemplate.TemplateId = 0;
			ApplicationParamterTemplate.TemplateName = "";
			addApplicationParameterTemplateReq.ApplicationParamterTemplate = ApplicationParamterTemplate;
			addApplicationParameterTemplateReq.Parameters = [];
			addApplicationParameterTemplateReq.IsMultiInstance = selectedIsMultiVPFXFileSupported;
			addApplicationParameterTemplateReq.IsFinalSave = false;
			addApplicationParameterTemplateReq.IsLookupTemplate = isLookupTemplate;

			var callbackFunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						data.addApplicationParameterTemplateResp = $.parseJSON(data.addApplicationParameterTemplateResp);
						koUtil.selectedTemplateId = data.addApplicationParameterTemplateResp.TemplateId;
					}
				}
			}
			var params = '{"token":"' + TOKEN() + '","addApplicationParameterTemplateReq":' + JSON.stringify(addApplicationParameterTemplateReq) + '}';
			ajaxJsonCall('AddApplicationParameterTemplate', params, callbackFunction, true, 'POST', true);
		}

		//get Container Id
		function getParameterContainerId(containerData) {
			var containerId = 0;
			if (containerData[0].ParameterFile && containerData[0].ParameterFile.length === undefined) {
				containerData[0].ParameterFile = $.makeArray(containerData[0].ParameterFile);
			}
			if (containerData[0].ParameterFile && containerData[0].ParameterFile.length > 0) {
				for (var i = 0; i < containerData[0].ParameterFile.length; i++) {
					if (containerData[0].ParameterFile[i].Container && containerData[0].ParameterFile[i].Container.length > 0) {
						for (var j = 0; j < containerData[0].ParameterFile[i].Container.length; j++) {
							if (_.isEmpty(containerData[0].ParameterFile[i].Container[j].Type)) {
								if (containerData[0].ParameterFile[i].Container[j].Param && containerData[0].ParameterFile[i].Container[j].Param.length > 0) {
									containerId = containerData[0].ParameterFile[i].Container[j].Param[0].ParamContainerId;
									break;
								} else {
									containerId = containerData[0].ParameterFile[i].Container[j].Param.ParamContainerId;
									break;
								}
							}
							if (containerData[0].ParameterFile[i].Container[j].Type === AppConstants.get('NORMAL')) {
								if (containerData[0].ParameterFile[i].Container[j].Container && containerData[0].ParameterFile[i].Container[j].Container.length > 0) {
									if (containerData[0].ParameterFile[i].Container[j].Container[0].Param) {
										if(containerData[0].ParameterFile[i].Container[j].Container[0].Param.length > 0) {
											containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param[0].ParamContainerId;
										}
									else {
											containerId = containerData[0].ParameterFile[i].Container[j].Container[0].Param.ParamContainerId;
										}
									}
								} else {
									if (containerData[0].ParameterFile[i].Container[j].Container.Param) {
										if(containerData[0].ParameterFile[i].Container[j].Container.Param.length > 0) {
											containerId = containerData[0].ParameterFile[i].Container[j].Container.Param[0].ParamContainerId;
										}
										else {
											containerId = containerData[0].ParameterFile[i].Container[j].Container.Param.ParamContainerId;
										}
									}
								}
							}
						}
					} else if (containerData[0].ParameterFile[i].Container && containerData[0].ParameterFile[i].Container.Param && containerData[0].ParameterFile[i].Container.Param.length > 0) {
						containerId = containerData[0].ParameterFile[i].Container.Param[0].ParamContainerId;
						break;
					}
				}
			}
			return containerId;
		}

		function getParameterValuesForReferenceEnum(instance, instanceID, instanceName, rootItem, containerData, referenceEnumContainer, isEditInstance) {
			var getParameterValuesForReferenceEnumReq = new Object();
			var Selector = new Object();
			Selector.SelectedItemIds = [koUtil.deviceProfileUniqueDeviceId];
			Selector.UnSelectedItemIds = null;

			getParameterValuesForReferenceEnumReq.UniqueDeviceId = koUtil.deviceProfileUniqueDeviceId;
			getParameterValuesForReferenceEnumReq.Level = koUtil.selectedLevel;
			getParameterValuesForReferenceEnumReq.IsFromDeviceSearch = false;
			getParameterValuesForReferenceEnumReq.DeviceSearch = null;
			getParameterValuesForReferenceEnumReq.ColumnSortFilter = null;
			getParameterValuesForReferenceEnumReq.Selector = Selector;
			getParameterValuesForReferenceEnumReq.Containers = referenceEnumContainer;
			getParameterValuesForReferenceEnumReq.ParamSourceType = ENUM.get('TEMPLATE');
			getParameterValuesForReferenceEnumReq.ApplicationId = ApplicationIdForTemplate;

			function callbackFunction(data, Error) {
				$("#loadingDiv").hide();
				if (data) {
					if (data.getParameterReferenceEnumResp)
						data.getParameterReferenceEnumResp = $.parseJSON(data.getParameterReferenceEnumResp);

					var referenceEnumItems = data.getParameterReferenceEnumResp;
					if (referenceEnumItems && referenceEnumItems.length > 0) {
						setReferenceEnumValues(containerData, referenceEnumItems);
					}
					setNodeSelection(instance, instanceID, instanceName, rootItem, isEditInstance);
				}
			}

			$("#loadingDiv").show();
			var method = 'GetParameterValuesForReferenceEnum';
			var params = '{"token":"' + TOKEN() + '","getParameterValuesForReferenceEnumReq":' + JSON.stringify(getParameterValuesForReferenceEnumReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		//Get ReferenceEnum parameter attributes for GetParameterValuesForReferencEnum request
		function getReferenceEnumAttributes(containerData, referenceEnumContainer) {
			var referenceEnumObject = new Object();

			if (containerData && containerData.length > 0) {
				for (var i = 0; i < containerData.length; i++) {
					if (containerData && containerData[i].ParameterFile && containerData[i].ParameterFile.length === undefined) {
						containerData[i].ParameterFile = $.makeArray(containerData[i].ParameterFile);
					}
					if (containerData[i].ParameterFile && containerData[i].ParameterFile.length > 0) {
						for (var j = 0; j < containerData[i].ParameterFile.length; j++) {
							if (containerData[i].ParameterFile[j].Container && containerData[i].ParameterFile[j].Container.length > 0) {
								for (var k = 0; k < containerData[i].ParameterFile[j].Container.length; k++) {
									if (containerData[i].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
										if (containerData[i].ParameterFile[j].Container[k].Container && containerData[i].ParameterFile[j].Container[k].Container.length > 0) {
											for (var m = 0; m < containerData[i].ParameterFile[j].Container[k].Container.length; m++) {
												for (var n = 0; n < containerData[i].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
													if (containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "ReferenceEnumeration") {
														referenceEnumObject = new Object();
														referenceEnumObject.ContainerId = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ReferenceContainerId;
														referenceEnumObject.Name = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.Name;
														referenceEnumObject.Value = containerData[i].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.Value;
														referenceEnumContainer.push(referenceEnumObject);
													}
												}
											}
										} else {
											for (var p = 0; p < containerData[i].ParameterFile[j].Container[k].Container.Param.length; p++) {
												if (containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "ReferenceEnumeration") {
													referenceEnumObject = new Object();
													referenceEnumObject.ContainerId = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ReferenceContainerId;
													referenceEnumObject.Name = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.Name;
													referenceEnumObject.Value = containerData[i].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.Value;
													referenceEnumContainer.push(referenceEnumObject);
												}
											}
										}
									}
								}
							}
						}
					}
				}
			}
		}

		//set ReferenceEnum parameter values from GetParameterValuesForReferencEnum response
		function setReferenceEnumValues(containerData, referenceEnumItems) {
			if (containerData[0].ParameterFile && containerData[0].ParameterFile.length > 0) {
				for (var j = 0; j < containerData[0].ParameterFile.length; j++) {
					if (containerData[0].ParameterFile[j].Container && containerData[0].ParameterFile[j].Container.length > 0) {
						for (var k = 0; k < containerData[0].ParameterFile[j].Container.length; k++) {
							if (containerData[0].ParameterFile[j].Container[k].Type === AppConstants.get('NORMAL')) {
								if (containerData[0].ParameterFile[j].Container[k].Container && containerData[0].ParameterFile[j].Container[k].Container.length > 0) {
									for (var m = 0; m < containerData[0].ParameterFile[j].Container[k].Container.length; m++) {
										for (var n = 0; n < containerData[0].ParameterFile[j].Container[k].Container[m].Param.length; n++) {
											if (containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.Type === "ReferenceEnumeration") {
												paramContainerId = parseInt(containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ReferenceContainerId);
												var source = _.where(referenceEnumItems, {
													ContainerId: paramContainerId
												})
												if (source && source.length > 0) {
													containerData[0].ParameterFile[j].Container[k].Container[m].Param[n].ValueType.ReferenceEnumeration.ReferenceEnumItem = source[0].ParameterReferenceEnums;
												}
											}
										}
									}
								} else {
									if (containerData[0].ParameterFile[j].Container[k].Container.Param && containerData[0].ParameterFile[j].Container[k].Container.Param.length > 0) {
										for (var p = 0; p < containerData[0].ParameterFile[j].Container[k].Container.Param.length; p++) {
											if (containerData[0].ParameterFile[j].Container[k].Container.Param[p].ValueType.Type === "ReferenceEnumeration") {
												paramContainerId = parseInt(containerData[0].ParameterFile[j].Container[k].Container.Param[p].ReferenceContainerId);
												var source = _.where(referenceEnumItems, {
													ContainerId: paramContainerId
												})
												if (source && source.length > 0) {
													containerData[0].ParameterFile[j].Container[k].Container.Param[p].ValueType.ReferenceEnumeration.ReferenceEnumItem = source[0].ParameterReferenceEnums;
												}
											}
										}
									}
								}
							}
						}
					}
				}
				self.JsonXmlData(containerData);
			}
		}

		function setNodeSelection(instance, instanceID, instanceName, rootItem, isEditInstance) {
			if (koUtil.viewParameterTemplateOnDevice && instance.Level() == 0) {
				createContainerTabs(self.JsonXmlData, self.templateXML, rootItem[0].Level, false, self.dataforEdit());
			} else {
				createContainerTabs(self.JsonXmlData, self.templateXML, rootItem[0].Level, true, self.dataforEdit());
			}

			if (isEditInstance) {
				getTemplateApplicationParams(self.isSequenceChanged);
				if (instance.children().length > 0) {
					clearChildDropDownColl(instance);
					for (var j = 0; j < instance.children().length; j++) {
						instance.children()[j].parentInstanceId(instanceID);
						instance.children()[j].parentInstanceName(instanceName);
					}
					getAppTemplateChildInstances(instance);
				}

				buildBreadCrumText(rootItem[0], false);

				if (rootItem[0].Level == 1) {
					//To Clear The Other Level 1 Instance Childrens Dropdown Collection
					for (var i = 0; i < self.treeColl().children().length; i++) {
						var level1Instance = self.treeColl().children()[i];
						if (instance.FormFileId() != level1Instance.FormFileId())
							clearChildDropDownColl(level1Instance);
					}
				}

				if (isGridTabSelect == false) {
					$("#templateTabs li div .tabMask").removeClass("tabMask");
					$('#templateTabs li:nth-child(2) a').click();
					if (koUtil.viewParameterTemplateOnDevice == false) {
						$('#baselevelTemplateFooter').addClass('hide');
					}
				}
				else {
					isGridTabSelect = false;
					$('#baselevelTemplateFooter').removeClass('hide');
				}
			} else {				//node click of a FormFile with no ReferenceEnumeration parameters
				subchildInstanceID = 0;
				if (!isSelectedInstanceisMulti && rootItem[0].Level > 0) {
					getTemplateAppLevelInstanceDetails();
					if (instance.dropdownCol().length > 0) {
						subchildInstanceID = instance.dropdownCol()[0].InstanceId;
					}
					$('#baselevelTemplateFooter').removeClass('hide');
				}

				buildBreadCrumText(rootItem[0], true);

				if (rootItem[0].Level == 1 && isSelectedInstanceisMulti) {
					//To Clear The Other Level 1 Instance Childrens Dropdown Collection
					for (var i = 0; i < self.treeColl().children().length; i++) {
						var level1Instance = self.treeColl().children()[i];
						if (instance.FormFileId() != level1Instance.FormFileId())
							clearChildDropDownColl(level1Instance);
					}
				}

				arrayofeditvalue = [];
				arrayForSetValue = [];
				arrayOfInvalidChars = [];
				arrayOfPrimaryIdentifierValue = [];
				$("#btnAddTemplate").prop('disabled', true);
				if (koUtil.addOrEditTemplate == 0) {
					if ((arrayofeditvalue.length > 0 || instanceAddorEdit) && $("#txtTemplateName").val().trim() != '' && arrayOfInvalidChars.length == 0) {
						$("#btnAddTemplate").prop('disabled', false);

					}
				}
			}

			self.isSequenceChanged(false);
			self.sequenceNavDown(true);
			self.sequenceNavUp(true);
			$("#jqxgridtemplateparameterdetails").bind("click", function (event) { seqControlSelect() });
			$("#jqxgridtemplateparameterdetails").on('rowselect', function (event) { seqControlSelect() });
		}

		function getApplicationTemplateVPFXFilesById(JsonXmlData, templateXML, leftTreeColl, versionFlag, dataforEdit, templateId, isUpdate) {

			var getParameterFormElementsReq = new Object();
			getParameterFormElementsReq.ApplicationId = ApplicationIdForTemplate;
			getParameterFormElementsReq.TemplateId = templateId;
			getParameterFormElementsReq.ParameterRetrivalType = ENUM.get("FORMFILE_XML");
			getParameterFormElementsReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

			var callBackfunction = function (data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						//if (data && data.getParameterFormElementsResp) {
						//    data.getParameterFormElementsResp = $.parseJSON(data.getParameterFormElementsResp);
						//}

						if (data.getParameterFormElementsResp) {

							koUtil.editDevicetemplateXML = data.getParameterFormElementsResp.FormFiles[0].FormFileXML;
							var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
							if (JsonXmlData1.version >= 2.0) {
								versionFlag(true);
							}
							else {
								versionFlag(false)
							}
							if (JsonXmlData1.ParameterFile != undefined) {
								loadParametersByLevel(JsonXmlData1.ParameterFile.Container)
							}
							if (selectedIsMultiVPFXFileSupported) {
								$('#mainSplitter').jqxSplitter({ width: '99.9%', height: 656, panels: [{ size: '30%', max: 600, min: 250 }, { size: '70%', min: '50%' }] });
							} else {
								$('#mainSplitter').jqxSplitter({ width: '99.9%', height: 656, panels: [{ size: '0%', max: 0, min: 0 }, { size: '100%', min: '100%' }] });
								$('#mainSplitter').jqxSplitter({ showSplitBar: false });
							}
							var treeObject;
							var temptreeColl = new Array();
							treeOriginalColl = new Array();
							if (data.getParameterFormElementsResp.FormFiles) {

								for (var i = 0; i < data.getParameterFormElementsResp.FormFiles.length; i++) {
									treeObject = new Object();
									treeObject.FormFileId = data.getParameterFormElementsResp.FormFiles[i].FormFileId;
									treeObject.ParentFormFileId = data.getParameterFormElementsResp.FormFiles[i].ParentFormFileId;
									treeObject.FormFileXML = data.getParameterFormElementsResp.FormFiles[i].FormFileXML;
									treeObject.LevelName = data.getParameterFormElementsResp.FormFiles[i].LevelName;
									treeObject.Level = data.getParameterFormElementsResp.FormFiles[i].Level;
									treeObject.FileName = data.getParameterFormElementsResp.FormFiles[i].FileName;
									treeObject.ParentVPFX = data.getParameterFormElementsResp.FormFiles[i].ParentVPFX;
									treeObject.OriginalPFX = data.getParameterFormElementsResp.FormFiles[i].OriginalPFX;
									treeObject.ParentLevel = data.getParameterFormElementsResp.FormFiles[i].ParentLevel;
									treeObject.children = [];
									treeObject.parentInstanceId = 0;
									treeObject.isMulti = data.getParameterFormElementsResp.FormFiles[i].IsMultiInstance;
									treeObject.dropdownCol = [];
									treeObject.parentInstanceName = '';
									treeObject.selectedInstanceName = '';
									treeObject.Relation = data.getParameterFormElementsResp.FormFiles[i].Relation;

									var treeNode = buildMultiInstanceTreeForTemplate(data.getParameterFormElementsResp.FormFiles, treeObject.Level, treeObject.ParentLevel, treeObject.FormFileXML, treeObject.Relation, isLookupTemplate);
									data.getParameterFormElementsResp.FormFiles[i].isLevelAccess = treeNode.isLevelAccess;
									treeObject.isLevelAccess = treeNode.isLevelAccess;
									if (!treeNode.isParentLevelAccess)
										break;
									if (treeNode.isLevelAccess)
										temptreeColl.push(treeObject);
								}

								koUtil.editDevicetemplateXML = temptreeColl[0].FormFileXML;
								koUtil.selectedlevelFormFileId = temptreeColl[0].FormFileId;

								var containerData = $.xml2json(koUtil.editDevicetemplateXML);
								if (containerData && containerData.length == undefined) {
									containerData = $.makeArray(containerData);
								}
								if (containerData && containerData.length > 0) {
									koUtil.selectedlevelContainerId = getParameterContainerId(containerData);
								}

								if (data.getParameterFormElementsResp.TemplateLevel1Instances != undefined) {
									for (var l = 0; l < data.getParameterFormElementsResp.TemplateLevel1Instances.length; l++) {
										for (var j = 0; j < temptreeColl.length; j++) {
											if (temptreeColl[j].Level === 1 && temptreeColl[j].FormFileId == data.getParameterFormElementsResp.TemplateLevel1Instances[l].FormFileId) {
												data.getParameterFormElementsResp.TemplateLevel1Instances[l].Name = data.getParameterFormElementsResp.TemplateLevel1Instances[l].InstanceName;
												temptreeColl[j].dropdownCol.push(data.getParameterFormElementsResp.TemplateLevel1Instances[l]);
												var id = "#treeCombo" + data.getParameterFormElementsResp.TemplateLevel1Instances[l].FormFileId + "_" + temptreeColl[j].Level;
												$(id).prop('selectedIndex', 0);
												$(id).trigger('chosen:updated');
											}
										}
									}
									for (var k = 0; k < temptreeColl.length; k++) {
										if (temptreeColl[k].dropdownCol.length > 0) {
											temptreeColl[k].dropdownCol.sort(function (a, b) {
												return (a.Sequence - b.Sequence);
											});
										}
									}
								}
								var source = BuildTreeStructure(temptreeColl);
								treeOriginalColl = data.getParameterFormElementsResp.FormFiles;

								var root = new TreeNode(source[0]);
								leftTreeColl(root);
								buildBreadCrumText(source[0], true);
								$(".treeRoot .treeNodeCntr .nodeText").first().addClass("treeNodeActive");
							}
							if (isUpdate == true) {
								createContainerTabs(JsonXmlData, templateXML, 0, isUpdate, dataforEdit());
							}
							if (koUtil.addOrEditTemplate == 1) {							//Edit Template
								$("#txtDescription").val(koUtil.selectedTemplateDescription);
								getParameterValuesFromTemplate(JsonXmlData, templateXML, 0, isUpdate, dataforEdit);
							}
						} else {
							PFXFiles = null;
						}
					}
				}
			}

			var params = '{"token":"' + TOKEN() + '","getParameterFormElementsReq":' + JSON.stringify(getParameterFormElementsReq) + '}'
			ajaxJsonCall('GetApplicationVPFXFiles', params, callBackfunction, true, 'POST', true);
		}

		function getAppTemplateChildInstances(instance) {
			var getAppTemplateChildInstancesReq = new Object();
			getAppTemplateChildInstancesReq.ApplicationId = ApplicationIdForTemplate;
			getAppTemplateChildInstancesReq.TemplateId = koUtil.selectedTemplateId;
			if (isSelectedInstanceisMulti)
				getAppTemplateChildInstancesReq.Level = koUtil.selectedLevel;
			else
				getAppTemplateChildInstancesReq.Level = koUtil.selectedLevel - 1;
			getAppTemplateChildInstancesReq.ContainerId = koUtil.selectedlevelContainerId;
			getAppTemplateChildInstancesReq.InstanceId = koUtil.selectedlevelInstanceId;
			getAppTemplateChildInstancesReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;
			

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						if (data && data.getAppTemplateChildInstancesResp) {
							data.getAppTemplateChildInstancesResp = $.parseJSON(data.getAppTemplateChildInstancesResp);
						}

						if (data.getAppTemplateChildInstancesResp && data.getAppTemplateChildInstancesResp.ChildInstances) {
							if (instance) {
								if (instance.children().length > 0)
									for (var i = 0; i < instance.children().length; i++) {
										var childSource = _.where(data.getAppTemplateChildInstancesResp.ChildInstances, { FormFileId: instance.children()[i].FormFileId() })
										instance.children()[i].dropdownCol(childSource);
										var id = "#treeCombo" + instance.children()[i].FormFileId() + "_" + instance.children()[i].Level();
										$(id).prop('selectedIndex', 0);
										$(id).trigger('chosen:updated');
									}
							}
							//In Case of Not a Multi Next Level this Id Will be Used
							subchildInstanceID = (!_.isEmpty(data.getAppTemplateChildInstancesResp.ChildInstances) && data.getAppTemplateChildInstancesResp.ChildInstances.length > 0) ? data.getAppTemplateChildInstancesResp.ChildInstances[0].InstanceId : 0;
						}

					}
				}
			}

			var method = 'GetAppTemplateChildInstances';
			var params = '{"token":"' + TOKEN() + '","getAppTemplateChildInstancesReq":' + JSON.stringify(getAppTemplateChildInstancesReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		function BuildTreeStructure(array, parent, tree) {

			tree = typeof tree !== 'undefined' ? tree : [];
			parent = typeof parent !== 'undefined' ? parent : { FormFileId: 0 };

			var children = _.filter(array, function (child) { return child.ParentFormFileId == parent.FormFileId; });

			if (!_.isEmpty(children)) {
				if (parent.FormFileId == 0) {
					tree = children;
				} else {
					parent['children'] = children;
				}
				_.each(children, function (child) {
					BuildTreeStructure(array, child)
				});
			}

			return tree;
		}

		function TreeNode(values) {
			var self = this;
			koMapping.fromJS(values, {
				children: {
					create: createNode
				}
			}, this);
			this.expanded = ko.observable(true);
			this.collapsed = ko.computed(function () {
				return !self.expanded();
			})
		}

		function createNode(options) {
			return new TreeNode(options.data);
		}

        function GetPrimaryIdentifiers(primaryIdentifiers, data) {

            for (var l = 0; l < data.length; l++) {
                if (primaryIdentifiers.length == 0) {
					if(data[l][0].Param != undefined) {
						primaryIdentifiers = _.where(data[l][0].Param, { PrimaryIdentifier: "True" });
						if (primaryIdentifiers.length == 0) {
							primaryIdentifiers = GetPrimaryIdentifiers(primaryIdentifiers, data[l][0].Container);
						}
					} else if (data[l][0].Container != undefined && data[l][0].Container.length > 0) {
                        primaryIdentifiers = GetPrimaryIdentifiers(primaryIdentifiers, data[l][0].Container);
                    }
                }
            }
            return primaryIdentifiers;
        }
        function createContainerTabs(JsonXmlData, templateXML, level, isUpdate, templateParameters) {
            templateXML([]);
            tabContainer = [];
            if (JsonXmlData() && JsonXmlData().length > 0) {
                var JsonXmlData1 = JsonXmlData();
            } else {
                var JsonXmlData1 = $.xml2json(koUtil.editDevicetemplateXML);
            }

			if (JsonXmlData1 && JsonXmlData1.length == undefined) {
				JsonXmlData1 = $.makeArray(JsonXmlData1);
			}

			if (JsonXmlData1 && JsonXmlData1.length > 0) {

				for (var i = 0; i < JsonXmlData1.length; i++) {
					if (isUpdate == false && level == 0) {

						//if ParameterFile is a collection
						if (JsonXmlData1[i].ParameterFile && JsonXmlData1[i].ParameterFile.length > 0) {
							for (var j = 0; j < JsonXmlData1[i].ParameterFile.length; j++) {

								//if ParameterFile collection's Container is a collection
								if (JsonXmlData1[i].ParameterFile[j].Container && JsonXmlData1[i].ParameterFile[j].Container.length > 0) {
									for (var k = 0; k < JsonXmlData1[i].ParameterFile[j].Container.length; k++) {
										if (JsonXmlData1[i].ParameterFile[j].Container[k].Param && JsonXmlData1[i].ParameterFile[j].Container[k].Param.length > 0) {
											for (var m = 0; m < JsonXmlData1[i].ParameterFile[j].Container[k].Param.length; m++) {
												var isUserEdited = false;
												var paramValue = "";
												if (templateParameters && templateParameters.length > 0) {
													for (var n = 0; n < templateParameters.length; n++) {
														if (templateParameters[n].ParamId == parseInt(JsonXmlData1[i].ParameterFile[j].Container[k].Param[m].ParamId)) {
															isUserEdited = true;
															paramValue = templateParameters[n].ParamValue;
														}
													}
												}
												if (isUserEdited) {
													JsonXmlData1[i].ParameterFile[j].Container[j].Param[m].SourceType = 'User';
													JsonXmlData1[i].ParameterFile[j].Container[j].Param[m].ParamValue = paramValue;
												} else {
													JsonXmlData1[i].ParameterFile[j].Container[j].Param[m].SourceType = 'Default';
												}
											}
										}
									}
								} else {

									//if ParameterFile collection's Container is an object
									if (JsonXmlData1[i].ParameterFile[j].Container && JsonXmlData1[i].ParameterFile[j].Container.Param && JsonXmlData1[i].ParameterFile[j].Container[k].Param.length > 0) {
										for (var m = 0; m < JsonXmlData1[i].ParameterFile[j].Container.Param.length; m++) {
											var isUserEdited = false;
											var paramValue = "";
											if (templateParameters && templateParameters.length > 0) {
												for (var n = 0; n < templateParameters.length; n++) {
													if (templateParameters[n].ParamId == parseInt(JsonXmlData1[i].ParameterFile[j].Container.Param[m].ParamId)) {
														isUserEdited = true;
														paramValue = templateParameters[n].ParamValue;
													}
												}
											}
											if (isUserEdited) {
												JsonXmlData1[i].ParameterFile[j].Container.Param[m].SourceType = 'User';
												JsonXmlData1[i].ParameterFile[j].Container.Param[m].ParamValue = paramValue;
											} else {
												JsonXmlData1[i].ParameterFile[j].Container.Param[m].SourceType = 'Default';
											}
										}
									}
								}
							}
						} else {

							//if ParameterFile is an object & ParameterFile object's Container is a collection
							if (JsonXmlData1[i].ParameterFile && JsonXmlData1[i].ParameterFile.Container && JsonXmlData1[i].ParameterFile.Container.length > 0) {
								for (var p = 0; p < JsonXmlData1[i].ParameterFile.Container.length; p++) {
									if (JsonXmlData1[i].ParameterFile.Container[p].Param && JsonXmlData1[i].ParameterFile.Container[p].Param.length > 0) {
										for (var q = 0; q < JsonXmlData1[i].ParameterFile.Container[p].Param.length; q++) {
											var isUserEdited = false;
											var paramValue = "";
											if (templateParameters && templateParameters.length > 0) {
												for (var r = 0; r < templateParameters.length; r++) {
													if (templateParameters[r].ParamId == parseInt(JsonXmlData1[i].ParameterFile.Container[p].Param[q].ParamId)) {
														isUserEdited = true;
														paramValue = templateParameters[r].ParamValue;
													}
												}
											}
											if (isUserEdited) {
												JsonXmlData1[i].ParameterFile.Container[p].Param[q].SourceType = 'User';
												JsonXmlData1[i].ParameterFile.Container[p].Param[q].ParamValue = paramValue;
											} else {
												JsonXmlData1[i].ParameterFile.Container[p].Param[q].SourceType = 'Default';
											}
										}
									}
								}
							} else {

								//if ParameterFile is an object & ParameterFile object's Container is an object
								if (JsonXmlData1[i].ParameterFile.Container.Param && JsonXmlData1[i].ParameterFile.Container.Param.length && JsonXmlData1[i].ParameterFile.Container.Param.length > 0) {
									for (var s = 0; s < JsonXmlData1[i].ParameterFile.Container.Param.length; s++) {
										var isUserEdited = false;
										for (var l = 0; l < templateParameters.length; l++) {
											if (templateParameters[l].ParamId == parseInt(JsonXmlData1[i].ParameterFile.Container.Param[s].ParamId)) {
												isUserEdited = true;
											}
										}
										if (isUserEdited) {
											JsonXmlData1[i].ParameterFile.Container.Param[s].SourceType = 'User';
										} else {
											JsonXmlData1[i].ParameterFile.Container.Param[s].SourceType = 'Default';
										}
									}
								} else {
									var isUserEdited = false;
									for (var m = 0; m < templateParameters.length; m++) {
										if (templateParameters[m].ParamId == parseInt(JsonXmlData1[i].ParameterFile.Container.Param.ParamId)) {
											isUserEdited = true;
										}
									}
									if (isUserEdited) {
										JsonXmlData1[i].ParameterFile.Container.Param.SourceType = 'User';
									} else {
										JsonXmlData1[i].ParameterFile.Container.Param.SourceType = 'Default';
									}
								}
							}
						}
					}

					if ((isLookupTemplate && level > 0) || !isLookupTemplate) {
						if (JsonXmlData1[i].ParameterFile.length == undefined) {
							JsonXmlData1[i].ParameterFile = $.makeArray(JsonXmlData1[i].ParameterFile);
						}

						for (var u = 0; u < JsonXmlData1[i].ParameterFile.length; u++) {

							if (JsonXmlData1[i].ParameterFile[u].Container.length == undefined) {

								JsonXmlData1[i].ParameterFile[u].Container = $.makeArray(JsonXmlData1[i].ParameterFile[u].Container);

							}
							for (var v = 0; v < JsonXmlData1[i].ParameterFile[u].Container.length; v++) {
								paramLevel = 0;
								GenerateContainerData(JsonXmlData1[i].ParameterFile[u].Container[v], tabContainer, paramLevel, TemplateParamAppGID, JsonXmlData1[i], level, isUpdate, retvalForBasicParamView, retvalForAdvParamView, retvalForBasicParamEdit, retvalForAdvParamEdit, !koUtil.isDeviceProfile(), koUtil, false);
							}
						}
					}
				}
			}

			$("#templateTabs").css("width", tabContainer.length * 110 + "px");
			templateXML(tabContainer);

			setTimeout(function () {
                contrWidth = $('#resultSectionTemplate').width();
                left = 0;
				updateTabsNavigation("#templateTabs", "#moveATLeft", "#moveATRight", tabContainer.length, left, contrWidth);
			}, 500);

            if (tabContainer && tabContainer.length > 0) {
                for (var k = 0; k < tabContainer.length; k++) {
                    for (var j = 0; j < tabContainer[k].Container.length; j++) {
                        assignContainerValue(tabContainer[k].Container[j], self.dataforEdit());
                        if (tabContainer[k].Container[j].Type == 'Details') {
                            var primaryIdentifiers = []
                            IsPrimaryIdentifierExist = false;
                            var isViewAllowed = tabContainer[k].Container[j].AllowView;
                            if (tabContainer[k].Container[j].Container.length > 0) {
                                // find primary identifier //VHQ-19247 VHQ-20036
                                primaryIdentifiers = GetPrimaryIdentifiers(primaryIdentifiers, tabContainer[k].Container[j].Container);
                                                              
                            } else {
                                if (isGridTabSelect) {
                                    $("#tabPanelDivTemplate").removeClass('hide');
                                    $('#subContainerDivTemplate').removeClass('hide');
                                    $('#instanceParametersDivTemplate').addClass('hide');
                                    $('#noContainerAccessDivTemplate').addClass('hide');
                                } else {
                                    $("#tabPanelDivTemplate").addClass('hide');
                                    $('#subContainerDivTemplate').addClass('hide');
                                    $('#instanceParametersDivTemplate').addClass('hide');
                                    $('#noContainerAccessDivTemplate').removeClass('hide');
                                }
                            }
                            if (primaryIdentifiers.length > 0 || !isViewAllowed) {
                                IsPrimaryIdentifierExist = true;
                                $('#instanceNameDivTemplate').addClass('hide');
                            } else {
                                IsPrimaryIdentifierExist = false;
                                $('#instanceNameDivTemplate').removeClass('hide');
                            }
                        }
                    }
                }
                if (koUtil.viewParameterTemplateOnDevice == true) {
                    $('#txtInstanceNameTemplate').prop('disabled', true);
                }
                $("#noContainerAccessSpan").text(i18n.t('you_do_not_have_access_to_add_new_instance', { lng: lang }));
            } else {
                $("#tabPanelDivTemplate").addClass('hide');
                $('#subContainerDivTemplate').addClass('hide');
                $('#instanceParametersDivTemplate').addClass('hide');
                $('#noContainerAccessDivTemplate').removeClass('hide');
                if (isLookupTemplate) {
                    $("#noContainerAccessSpan").text(i18n.t('lookup_template_cannot_have_root_level_params', { lng: lang }));
                } else {
                    $("#noContainerAccessSpan").text(i18n.t('you_do_not_have_access_to_add_new_instance', { lng: lang }));
                }
            }
            checkFlagForAddOnload = 0;
		}

		function clearQualifiersObject() {
			globalTemplateQualifiers.SelectedModels = [];
		}

		seti18nResourceData(document, resourceStorage);
	};



	function getTemplateDataById(templateXML, JsonXmlData, dataforEdit) {
		var getParameterValuesForTemplateReq = new Object();
		templateId = parseInt(koUtil.selectedTemplateId);
		getParameterValuesForTemplateReq.TemplateId = templateId;
		function callbackFunction(data, error) {
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

					if (data && data.getParameterValuesForTemplateResp) {
						data.getParameterValuesForTemplateResp = $.parseJSON(data.getParameterValuesForTemplateResp);
					}

					dataforEdit(data.getParameterValuesForTemplateResp.ParameterDetails);

					for (var k = 0; k < tabContainer.length; k++) {
						for (var j = 0; j < tabContainer[k].Container.length; j++) {
							assignContainerValue(tabContainer[k].Container[j], data.getParameterValuesForTemplateResp.ParameterDetails);
						}
					}

					$("#txtTemplateName").prop('disabled', true);
					$("#btnAddTemplate").prop('disabled', true);
					$("#txtTemplateName").val(koUtil.selectedTemplateName);
				}
			}
		}


		var params = '{"token":"' + TOKEN() + '","getParameterValuesForTemplateReq":' + JSON.stringify(getParameterValuesForTemplateReq) + '}';
		ajaxJsonCall('GetParameterValuesForTemplate', params, callbackFunction, true, 'POST', true);
	}
	function deleteTemplateOnCancel() {
		var deleteApplicationParameterTemplateReq = new Object();
		var Selector = new Object();
		deleteApplicationParameterTemplateReq.IsAllSelected = false;
		Selector.SelectedItemIds = [koUtil.selectedTemplateId];
		Selector.UnSelectedItemIds = null;
		deleteApplicationParameterTemplateReq.ApplicationId = ApplicationIdForTemplate;
		deleteApplicationParameterTemplateReq.Selector = Selector;
		deleteApplicationParameterTemplateReq.IsCanceled = true;

		var callBackfunction = function (data, error) {
			if (data) {
				$("#loadingDiv").hide();
				//No information should be shown after delete when added template
			}
		}

		var method = 'DeleteApplicationParameterTemplate';
		var params = '{"token":"' + TOKEN() + '","deleteApplicationParameterTemplateReq":' + JSON.stringify(deleteApplicationParameterTemplateReq) + '}';
		ajaxJsonCall(method, params, callBackfunction, true, 'POST', false);
	}
	function assignContainerValue(data, ParameterDetails, isAssignParam, isAddInstance) {
		if (data.length == undefined) {
			data = $.makeArray(data);
		}

		for (var d = 0; d < data.length; d++) {
			if (isAssignParam != true && data[d].Type != undefined && data[d].Type.toUpperCase() == "GRID") {
				if (data[d].Param != undefined) {
					if (data[d].Param.length == undefined) {
						data[d].Param = $.makeArray(data[d].Param);
					}
					if (data[d].Param.length > 0) {
						koUtil.instanceGridParameters = data[d].Param;
						var paramAPI = getParamForTemplateAppLevelInstances();
						assignParamValueGrid('jqxgridtemplateparameterdetails', data[d].Param, paramAPI);
					}
				}
			}
			else if (data[d].Type != undefined && data[d].Type.toUpperCase() != "GRID") {
				if (data[d].Param != undefined) {
					if (data[d].Param.length == undefined) {
						data[d].Param = $.makeArray(data[d].Param);
					}
					if (data[d].Param.length > 0) {
						assignParamValue(data[d].Param, ParameterDetails, isAddInstance);
					}
				}
			}

			if (data[d].Container != undefined) {
				if (data[d].Container.length == undefined) {
					data[d].Container = $.makeArray(data[d].Container);
				}
				if (data[d].Container.length > 0) {
					for (var a = 0; a < data[d].Container.length; a++) {
						assignContainerValue(data[d].Container[a], ParameterDetails);
					}
				} else {
					if (data[d].Type == "Details") {
						$("#tabPanelDivTemplate").addClass('hide');
						$('#subContainerDivTemplate').addClass('hide');
						$('#instanceParametersDivTemplate').addClass('hide');
						$('#noContainerAccessDivTemplate').removeClass('hide');
					}
				}
			}
		}
	}

	function assignParamValue(Param, ParameterDetails, isAddInstance) {

		if (ParameterDetails && ParameterDetails.length > 0) {
			for (var l = 0; l < Param.length; l++) {
				var pid = parseInt(Param[l].ParamId);
				var source = _.where(ParameterDetails, {
					ParamId: pid
				})
				var PIParameter = new Object();
				if (source != '') {
					PIParameter.ParamValue = Param[l].ParamValue = source[0].ParamValue;
					PIParameter.SourceType = Param[l].SourceType = source[0].SourceType;
					if (Param[l].ValueType.Type == 'Enumeration') {
						var id = '#templateCombo' + source[0].ParamId;
						if (source[0].ParamValue != undefined) {
							if (source[0].ParamId != 0) {

								var sourceItem = _.where(Param[l].ValueType.Enumeration.EnumItem, { Value: source[0].ParamValue });
								if (sourceItem != '')
									PIParameter.ParamValue = sourceItem[0].Name;

								$(id).val(source[0].ParamValue).prop("selected", "selected");
								$(id).trigger('chosen:updated');
							}
						}
					} else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
						var id = '#paramTemplateReferenceCombo' + source[0].ParamId;
						if (source[0].ParamValue != undefined) {
							if (source[0].ParamId != 0) {

								var sourceItem = _.where(Param[l].ValueType.ReferenceEnumeration.ReferenceEnumItem, { Value: source[0].ParamValue });
								if (sourceItem != '')
									PIParameter.ParamValue = sourceItem[0].Name;

								$(id).val(source[0].ParamValue).prop("selected", "selected");
								$(id).trigger('chosen:updated');
							}
						}
					} else if (Param[l].ValueType.Type == 'String') {
						var id = '#templateTxt' + source[0].ParamId;
						$(id).val(source[0].ParamValue);
						if (Param[l].MaskValue && Param[l].MaskValue.toUpperCase() == 'TRUE') {
							$(id).val('********');
						}
						//Partial masking value based on Length and Direction
						if (Param[l].PartialMask && Param[l].PartialMask.toUpperCase() == 'TRUE') {
							var id = '#templateTxt' + source[0].ParamId;
							$(id).val(source[0].ParamValue);
							var paramValueLength = source[0].ParamValue ? source[0].ParamValue.length : 0;
							if (Param[l].MaskLength && paramValueLength > Param[l].MaskLength) {
								if (Param[l].MaskDirection && Param[l].MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_RIGHT')) {
									var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - Param[l].MaskLength) : '****';
									$(id).val('****' + lastcharcters);
								}
								else if (Param[l].MaskDirection && Param[l].MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_LEFT')) {
									var Firstcharcters = $(id).val() ? $(id).val().substr(0, Param[l].MaskLength) : '****';
									$(id).val(Firstcharcters + '****');
								}
								else {
									var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - Param[l].MaskLength) : '****';
									$(id).val('****' + lastcharcters);
								}
							}
							else if (Param[l].MaskLength && paramValueLength <= Param[l].MaskLength) {
								$(id).val('********');
							}
							else if (paramValueLength > 4) {
								var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - 4) : '****';
								$(id).val('****' + lastcharcters);

							}
							else {
								$(id).val('********');
							}
						}
					} else if (Param[l].ValueType.Type == 'File') {
						var id = '#templateFile' + source[0].ParamId;
						$(id).val(source[0].ParamValue);
					} else if (Param[l].ValueType.Type == 'Numeric') {
						var id = '#templateNumeric' + source[0].ParamId;
						$(id).val(source[0].ParamValue);
					} else if (Param[l].ValueType.Type == 'DateTime') {
						var id = '#templateDate' + source[0].ParamId;
						var Inputid = '#templateInputDate' + source[0].ParamId;
						var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
						if (Param[l].ValueType.DateTime && Param[l].ValueType.DateTime.DateFormat) {
							dateFormat = Param[l].ValueType.DateTime.DateFormat;
						}
						if (source[0].ParamValue != '') {
							var paramValue = source[0].ParamValue;
							$(Inputid).val(paramValue)
							updateDateTimePicker(id, dateFormat, paramValue);
						} else {
							updateDateTimePicker(id, dateFormat, '');
						}
					} else if (Param[l].ValueType.Type == 'Boolean' || Param[l].ValueType.Type == 'CheckBox') {
						var id = '#templateCheck' + source[0].ParamId;
						if (source[0].ParamValue == 1) {
							$(id).prop("checked", true);
						} else {
							$(id).prop("checked", false);
						}
					}
				} else {
					PIParameter.SourceType = 'User';
					PIParameter.ParamValue = Param[l].Default;
					if (Param[l].ValueType.Type == 'Enumeration') {
						var sourceItem = _.where(Param[l].ValueType.Enumeration.EnumItem, { Value: Param[l].Default });
						if (sourceItem != '')
							PIParameter.ParamValue = sourceItem[0].Name;
					} else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
						var sourceItem = _.where(Param[l].ValueType.ReferenceEnumeration.ReferenceEnumItem, { Value: Param[l].Default });
						if (sourceItem != '')
							PIParameter.ParamValue = sourceItem[0].Name;
					}
				}
				if (arrayOfPrimaryIdentifierValue == undefined) {
					arrayOfPrimaryIdentifierValue = [];
				}
				//Include all primary identifiers in collection
				if (Param[l].PrimaryIdentifier == "True") {
					PIParameter.ParamId = Param[l].ParamId;
					PIParameter.ParamName = Param[l].Name;
					PIParameter.TemplateId = 0;
					PIParameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
					PIParameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
					PIParameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
					PIParameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
					PIParameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
					PIParameter.ValueType = Param[l].ValueType.Type;
					arrayOfPrimaryIdentifierValue.push(PIParameter);
				}

				if (!isSelectedInstanceisMulti) {

					var Parameter = new Object();
					Parameter.ParamId = Param[l].ParamId;
					Parameter.ParamName = Param[l].Name;
					Parameter.ParamValue = Param[l].ParamValue;
					Parameter.TemplateId = 0;
					Parameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
					Parameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
					Parameter.SourceType = !_.isEmpty(Param[l].SourceType) ? Param[l].SourceType : 'Default';
					if (Param[l].ValueType == "String") {
						Parameter.ValidChars = Param[l].ValueType.String.ValidChars;
					}
					Parameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
					Parameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
					Parameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
					Parameter.ValueType = Param[l].ValueType.Type;
					var sourceObject = _.where(arrayForSetValue, { ParamId: Param[l].ParamId });
					if (sourceObject.length > 0) {
						var index = arrayForSetValue.indexOf(sourceObject[0]);
						arrayForSetValue[index] = Parameter;
					} else {
						arrayForSetValue.push(Parameter);
					}
				}

			}
		} else {
			for (var l = 0; l < Param.length; l++) {
				var paramValue;
				if (isAddInstance) {
					paramValue = Param[l].Default;
					//Include all primary identifiers in collection
					var PIParameter = new Object();
					PIParameter.ParamValue = paramValue;
					PIParameter.SourceType = 'User';
					if (Param[l].ValueType.Type == 'Enumeration') {
						if (paramValue != undefined) {
							if (Param[l].ParamId != 0) {
								var sourceItem = _.where(Param[l].ValueType.Enumeration.EnumItem, { Value: Param[l].Default });
								if (sourceItem != '')
									PIParameter.ParamValue = sourceItem[0].Name;
							}
						}
					} else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
						if (paramValue != undefined) {
							if (Param[l].ParamId != 0) {
								var sourceItem = _.where(Param[l].ValueType.ReferenceEnumeration.ReferenceEnumItem, { Value: Param[l].Default });
								if (sourceItem != '')
									PIParameter.ParamValue = sourceItem[0].Name;
							}
						}
					}

					if (Param[l].PrimaryIdentifier == "True") {
						PIParameter.ParamId = Param[l].ParamId;
						PIParameter.ParamName = Param[l].Name;
						PIParameter.TemplateId = 0;
						PIParameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
						PIParameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
						PIParameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
						PIParameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
						PIParameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
						PIParameter.ValueType = Param[l].ValueType.Type;
						arrayOfPrimaryIdentifierValue.push(PIParameter);
					}

					if (!isSelectedInstanceisMulti) {
						var Parameter = new Object();
						Parameter.ParamId = Param[l].ParamId;
						Parameter.ParamName = Param[l].Name;
						Parameter.ParamValue = paramValue;
						Parameter.TemplateId = 0;
						Parameter.IsPrimaryIdentifier = (Param[l].PrimaryIdentifier == "True") ? 1 : 0;
						Parameter.PISequence = Param[l].Sequence ? Param[l].Sequence : 0;
						Parameter.SourceType = !_.isEmpty(Param[l].SourceType) ? Param[l].SourceType : 'Default';
						if (Param[l].ValueType == "String") {
							Parameter.ValidChars = Param[l].ValueType.String.ValidChars;
						}
						Parameter.ParamType = Param[l].ValueType.Type == "File" ? ENUM.get('FILE_ID') : ENUM.get('DEFAULT');
						Parameter.PackageId = Param[l].ValueType.Type == "File" ? koUtil.parameterPackageId : 0;
						Parameter.IncludeInMP = Param[l].IncludeInMP == "True" ? 1 : 0;
						Parameter.ValueType = Param[l].ValueType.Type;
						var sourceObject = _.where(arrayForSetValue, { ParamId: Param[l].ParamId });
						if (sourceObject.length > 0) {
							var index = arrayForSetValue.indexOf(sourceObject[0]);
							arrayForSetValue[index] = Parameter;
						} else {
							arrayForSetValue.push(Parameter);
						}
					}
				} else {
					paramValue = Param[l].Default;
				}
				if (Param[l].ValueType.Type == 'String') {
					var id = '#templateTxt' + Param[l].ParamId;
					$(id).val(paramValue)

					if (Param[l].MaskValue && Param[l].MaskValue.toUpperCase() == 'TRUE') {
						$(id).val('********');
					}
					//Partial masking value based on Length and Direction
					if (Param[l].PartialMask && Param[l].PartialMask.toUpperCase() == 'TRUE') {
						var id = '#templateTxt' + Param[l].ParamId;
						$(id).val(Param[l].ParamValue);
						var paramValueLength = Param[l].ParamValue ? Param[l].ParamValue.length : 0;
						if (Param[l].MaskLength && paramValueLength > Param[l].MaskLength) {
							if (Param[l].MaskDirection && Param[l].MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_RIGHT')) {
								var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - Param[l].MaskLength) : '****';
								$(id).val('****' + lastcharcters);
							}
							else if (Param[l].MaskDirection && Param[l].MaskDirection.toUpperCase() == AppConstants.get('PARTIAL_MASKING_DIRECTION_LEFT')) {
								var Firstcharcters = $(id).val() ? $(id).val().substr(0, Param[l].MaskLength) : '****';
								$(id).val(Firstcharcters + '****');
							}
							else {
								var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - Param[l].MaskLength) : '****';
								$(id).val('****' + lastcharcters);
							}
						}
						else if (Param[l].MaskLength && paramValueLength <= Param[l].MaskLength) {
							$(id).val('********');
						}
						else if (paramValueLength > 4) {
							var lastcharcters = $(id).val() ? $(id).val().substr(paramValueLength - 4) : '****';
							$(id).val('****' + lastcharcters);

						}
						else {
							$(id).val('********');
						}
					}
				} else if (Param[l].ValueType.Type == 'File') {
					var id = '#templateFile' + Param[l].ParamId;
					if (paramValue == "") {
						paramValue = 0;
					}
					$(id).val(paramValue);
				} else if (Param[l].ValueType.Type == 'Numeric') {
					if (paramValue == "") {
						paramValue = 0;
					}
					var id = '#templateNumeric' + Param[l].ParamId;
					if (paramValue != undefined) {
						$(id).val(paramValue);
					}
				} else if (Param[l].ValueType.Type == 'Boolean' || Param[l].ValueType.Type == 'CheckBox') {
					var id = '#templateCheck' + Param[l].ParamId;
					if (paramValue != undefined) {
						if (paramValue == 1) {
							$(id).prop("checked", true);
						} else {
							$(id).prop("checked", false);
						}
					}
				} else if (Param[l].ValueType.Type == 'Enumeration') {
					var id = '#templateCombo' + Param[l].ParamId;
					if (paramValue != undefined) {
						if (Param[l].ParamId != 0) {
							if (paramValue == "") {
								paramValue = 0;
							}
							$(id).val(paramValue).prop("selected", "selected");
							$(id).trigger('chosen:updated');

						}
					}
				} else if (Param[l].ValueType.Type == 'ReferenceEnumeration') {
					var id = '#paramTemplateReferenceCombo' + Param[l].ParamId;
					if (paramValue != undefined) {
						if (Param[l].ParamId != 0) {
							if (paramValue == "") {
								paramValue = 0;
							}
							$(id).val(paramValue).prop("selected", "selected");
							$(id).trigger('chosen:updated');

						}
					}
				} else if (Param[l].ValueType.Type == 'DateTime') {
					var id = '#templateDate' + Param[l].ParamId;
					var Inputid = '#templateInputDate' + Param[l].ParamId;
					var dateFormat = AppConstants.get('DEFAULT_DATETIME_FORMAT');
					if (Param[l].ValueType.DateTime && Param[l].ValueType.DateTime.DateFormat) {
						dateFormat = Param[l].ValueType.DateTime.DateFormat;
					}
					if (paramValue != undefined && paramValue != '') {
						$(Inputid).val(paramValue)
						updateDateTimePicker(id, dateFormat, paramValue)
					} else {
						updateDateTimePicker(id, dateFormat, '')
					}
				}
			}
		}
	}

	function assignParamValueGrid(gID, Param, paramAPI) {
		var gridColumnArr = new Array();
		var sourceDataFieldsArr = [];

		for (i = 0; i < Param.length; i++) {
			var columnObj = new Object();
			columnObj.text = Param[i].DisplayName;
			columnObj.datafield = 'Col' + Param[i].ParamId;
			columnObj.minwidth = 150;
			columnObj.editable = false;
			columnObj.sortable = false;
			columnObj.enabletooltips = true;
			columnObj.hidden = false;

			gridColumnArr.push(columnObj);
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
		gridStorage = JSON.parse(sessionStorage.getItem(gID + "gridStorage"));

		var source =
		{
			dataType: "json",
			dataFields: gridStorage[0].dataFields,
			root: 'InstanceDetails',
			type: "POST",
			data: paramAPI,
			url: AppConstants.get('API_URL') + "/GetTemplateAppLevelInstances",
			contentType: 'application/json'
		};
		var dataAdapter = new $.jqx.dataAdapter(source,
			{
				formatData: function (data) {
					$('.all-disabled').show();
					///disableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);
					data = JSON.stringify(paramAPI);
					return data;
				},
				downloadComplete: function (data, status, xhr) {
					$('.all-disabled').hide();
					//enableIcons(['btnRestFilter', 'btnShowHide', 'btnExportToexcel', 'btnRefresh']);                   
					if (data && data.getTemplateAppLevelInstancesResp) {
						data.getTemplateAppLevelInstancesResp = $.parseJSON(data.getTemplateAppLevelInstancesResp);
					}
					if (data.getTemplateAppLevelInstancesResp) {

						if (data.getTemplateAppLevelInstancesResp.Instances != null && data.getTemplateAppLevelInstancesResp.Instances.length > 0) {
							if (koUtil.selectedInstance()) {
								koUtil.selectedInstance().dropdownCol(data.getTemplateAppLevelInstancesResp.Instances);
							}
						} else {
							if (koUtil.selectedInstance()) {
								koUtil.selectedInstance().dropdownCol([]);
							}
						}
						if (data.getTemplateAppLevelInstancesResp.InstanceDetails && data.getTemplateAppLevelInstancesResp.InstanceDetails.length > 0) {
							data.getTemplateAppLevelInstancesResp.InstanceDetails = $.parseJSON(data.getTemplateAppLevelInstancesResp.InstanceDetails);
							sourceDataFieldsArr = [];

							var instanceObj = data.getTemplateAppLevelInstancesResp.InstanceDetails[0];
							for (var attr in instanceObj) {
								var fieldObj = new Object();
								fieldObj.map = fieldObj.name = attr;
								sourceDataFieldsArr.push(fieldObj);
							}

							source.dataFields = sourceDataFieldsArr;
						} else {
							data.getTemplateAppLevelInstancesResp.InstanceDetails = [];
						}
					} else {
						data.getTemplateAppLevelInstancesResp = new Object();
						data.getTemplateAppLevelInstancesResp.InstanceDetails = [];
					}
				},
				loadError: function (jqXHR, status, error) {
					$('.all-disabled').hide();
				}

			}
		);

		var gridCoulmns = [];
		gridCoulmns = gridColumnArr;

		gridStorage[0].columnsArr = gridCoulmns;

		$("#" + gID).jqxGrid(
			{

				width: "100%",
				pageable: false,
				editable: false,
				source: dataAdapter,
				columnsResize: true,
				selectionmode: 'checkbox',
				theme: AppConstants.get('JQX-GRID-THEME'),
				rowsheight: 32,
				columns: gridCoulmns
			});
	}
	function getParamForTemplateAppLevelInstances() {
		var getTemplateAppLevelInstancesReq = new Object();
		getTemplateAppLevelInstancesReq.ApplicationId = ApplicationIdForTemplate;
		getTemplateAppLevelInstancesReq.TemplateId = koUtil.selectedTemplateId;
		getTemplateAppLevelInstancesReq.FormFileId = koUtil.selectedlevelFormFileId;
		getTemplateAppLevelInstancesReq.Level = koUtil.selectedLevel;
		getTemplateAppLevelInstancesReq.InstanceId = koUtil.selectedLevel > 1 ? koUtil.selectedlevelParentInstanceId : 0;
		getTemplateAppLevelInstancesReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;
		getTemplateAppLevelInstancesReq.ContainerId = koUtil.selectedlevelContainerId;
		var param = new Object();
		param.token = TOKEN();
		param.getTemplateAppLevelInstancesReq = getTemplateAppLevelInstancesReq;
		return param;
	}
	function getParamForDeleteTemplateAppLevelInstances(arrayInstances) {
		var deleteTemplateAppLevelInstancesReq = new Object();
		deleteTemplateAppLevelInstancesReq.ApplicationId = ApplicationIdForTemplate;
		deleteTemplateAppLevelInstancesReq.TemplateId = koUtil.selectedTemplateId;
		deleteTemplateAppLevelInstancesReq.Level = koUtil.selectedLevel;
		deleteTemplateAppLevelInstancesReq.IsLookupTemplate = isLookupTemplate;

		var arrayInstanceIds = new Array();
		if (arrayInstances != undefined && arrayInstances.length > 0) {
			for (var i = 0; i < arrayInstances.length; i++) {
				arrayInstanceIds.push(arrayInstances[i].InstanceId);
			}
		}

		deleteTemplateAppLevelInstancesReq.Instances = arrayInstanceIds

		var param = new Object();
		param.token = TOKEN();
		param.deleteTemplateAppLevelInstancesReq = deleteTemplateAppLevelInstancesReq;
		return param;
	}
	function getTemplateAppLevelInstanceDetails() {
		var getTemplateAppLevelInstanceDetailsReq = new Object();
		getTemplateAppLevelInstanceDetailsReq.ApplicationId = ApplicationIdForTemplate;
		getTemplateAppLevelInstanceDetailsReq.TemplateId = koUtil.selectedTemplateId;
		getTemplateAppLevelInstanceDetailsReq.Level = koUtil.selectedLevel;
		getTemplateAppLevelInstanceDetailsReq.ParentInstanceId = koUtil.selectedlevelParentInstanceId;
		getTemplateAppLevelInstanceDetailsReq.FormFileId = koUtil.selectedlevelFormFileId;
		getTemplateAppLevelInstanceDetailsReq.ContainerId = koUtil.selectedlevelContainerId;
		getTemplateAppLevelInstanceDetailsReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

		function callbackFunction(data, error) {
			isAddInstance = true;
			if (data) {
				if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

					if (data && data.getTemplateAppLevelInstanceDetailsResp) {
						data.getTemplateAppLevelInstanceDetailsResp = $.parseJSON(data.getTemplateAppLevelInstanceDetailsResp);
					}

					var tempArray = new Array();
					if (data.getTemplateAppLevelInstanceDetailsResp && !_.isEmpty(data.getTemplateAppLevelInstanceDetailsResp.Parameters)) {
						tempArray = data.getTemplateAppLevelInstanceDetailsResp.Parameters;
						if (!_.isEmpty(tempArray) && tempArray.length > 0) {
							var sourceType = _.where(tempArray, { SourceType: 'Default' });
							if (!_.isEmpty(sourceType) && sourceType.length == tempArray.length) {
								isAddInstance = true;
							} else {
								isAddInstance = false;
							}
						}

						for (var k = 0; k < tabContainer.length; k++) {
							for (var j = 0; j < tabContainer[k].Container.length; j++) {
								assignContainerValue(tabContainer[k].Container[j], tempArray, true, isAddInstance);
							}
						}
					} else {
						isAddInstance = true;
					}
				}
			}
		}
		var method = 'GetTemplateAppLevelInstanceDetails';
		var params = '{"token":"' + TOKEN() + '","getTemplateAppLevelInstanceDetailsReq":' + JSON.stringify(getTemplateAppLevelInstanceDetailsReq) + '}';
		ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
	}
	function getTemplateApplicationParams(isSequenceChanged) {
		var getTemplateApplicationParamsReq = new Object();
		getTemplateApplicationParamsReq.ApplicationId = ApplicationIdForTemplate;
		getTemplateApplicationParamsReq.TemplateId = koUtil.selectedTemplateId;
		getTemplateApplicationParamsReq.Level = koUtil.selectedLevel;
		getTemplateApplicationParamsReq.InstanceId = koUtil.selectedlevelInstanceId;
		getTemplateApplicationParamsReq.ContainerId = koUtil.selectedlevelContainerId;
		getTemplateApplicationParamsReq.InstanceDetails = koUtil.selectedInstanceLevelDetails;

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {

						if (data && data.getTemplateApplicationParamsResp) {
							data.getTemplateApplicationParamsResp = $.parseJSON(data.getTemplateApplicationParamsResp);
						}

						if (data.getTemplateApplicationParamsResp && data.getTemplateApplicationParamsResp.Parameters) {
							arrayForSetValue = [];
							arrayofeditvalue = [];
							arrayOfInvalidChars = [];
							arrayOfPrimaryIdentifierValue = [];
							// isSequenceChanged(false);
							for (var k = 0; k < tabContainer.length; k++) {
								for (var j = 0; j < tabContainer[k].Container.length; j++) {
									assignContainerValue(tabContainer[k].Container[j], data.getTemplateApplicationParamsResp.Parameters, true);
								}
							}
						}
					}
				}
			}

			var method = 'GetTemplateApplicationParams';
			var params = '{"token":"' + TOKEN() + '","getTemplateApplicationParamsReq":' + JSON.stringify(getTemplateApplicationParamsReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

	});

function ckecktxtchanges(self) {

	if ($(self).val().trim() == '') {
		ischanges = false;
	} else {
		ischanges = true;
	}
}