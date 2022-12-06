define(["knockout", "koUtil", "knockout.validation", "constants", "globalFunction", "appEnum", "chosen", "utility"], function (ko, koUtil) {

	//validation
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});

	return function qualifiersModel() {

		var self = this;
		self.isReadOnly = ko.observable(false);
		self.models = ko.observableArray();

		var modelsArray = koUtil.rootmodels;	//All Models
		var supportedModelIds = [];				//Supported Model Ids for the selected Application's source package
		var qualifierModelIds = [];				//Previously selected Model Ids for the Parameter Template
		var qualifierModels = [];				//ModelName-ModelId object for the selected models
		var modelCount = 0;						//to show the count of selected models

		init();
		function init() {
			if (!_.isEmpty(globalTemplateQualifiers)) {
				supportedModelIds = !_.isEmpty(globalTemplateQualifiers.SupportedModels) ? globalTemplateQualifiers.SupportedModels : [];
				qualifierModelIds = !_.isEmpty(globalTemplateQualifiers.SelectedModelIds) ? globalTemplateQualifiers.SelectedModelIds : [];
				globalTemplateQualifiers.IsAssignedToHierarchy ? self.isReadOnly(true) : self.isReadOnly(false);
				qualifierModels = new Array();
            }

			if (!_.isEmpty(modelsArray) && modelsArray.length > 0) {								//All Models
				if (!_.isEmpty(supportedModelIds) && supportedModelIds.length > 0) {				//Supported Models
					modelCount = 0;
					for (var i = 0; i < supportedModelIds.length; i++) {
						var source = _.where(modelsArray, { ModelId: supportedModelIds[i] });
						if (!_.isEmpty(source) && source.length > 0) {
							var modelObject = new Object();
							modelObject.ModelId = source[0].ModelId;
							modelObject.ModelName = source[0].ModelName;
							modelObject.IsDisabled = self.isReadOnly();

							//edit template - selected & saved Models in Qualifiers but not saved against template
							if (!_.isEmpty(globalTemplateQualifiers) && !_.isEmpty(globalTemplateQualifiers.SelectedModels) && globalTemplateQualifiers.SelectedModels.length > 0) {
								var savedModelData = _.where(globalTemplateQualifiers.SelectedModels, { ModelId: supportedModelIds[i] });
								if (!_.isEmpty(savedModelData) && source.length > 0) {
									modelObject.IsSelected = true;
									modelCount++;
								} else {
									modelObject.IsSelected = false;
								}
							}
							//edit template - previously saved models against the selected template
							else if (!_.isEmpty(qualifierModelIds) && qualifierModelIds.length > 0) {//Selected Models
								if (qualifierModelIds.indexOf(supportedModelIds[i]) > -1) {
									var selectedModel = new Object();
									selectedModel.ModelId = modelObject.ModelId;
									selectedModel.ModelName = modelObject.ModelName;
									qualifierModels.push(selectedModel);
									modelObject.IsSelected = true;
									modelCount++;
								} else {
									modelObject.IsSelected = false;
								}
							} else {
								modelObject.IsSelected = false;
							}
							self.models().push(modelObject);
						}
					}
				}
			}

			$("#spanModelsCount").text(" " + modelCount);
			globalTemplateQualifiers.SelectedModels = qualifierModels;
		}

		self.changeCheckBoxValue = function (data) {
			var checkBoxId = "#chkModel-" + data.ModelId;
			if ($(checkBoxId).is(':checked')) {
				modelCount++;
			} else {
				modelCount--;
			}
			$("#spanModelsCount").text(" " + modelCount);
        }

		self.selectAllModels = function () {
			for (i = 0; i < self.models().length; i++) {
				var element = self.models()[i];
				var checkBoxId = 'chkModel-' + element.ModelId;
				element.IsSelected = true;
				$("#" + checkBoxId).prop("checked", true);
			}
			modelCount = self.models().length;
			$("#spanModelsCount").text(" " + modelCount);
		}

		self.unSelectAllModels = function () {
			for (i = 0; i < self.models().length; i++) {
				var element = self.models()[i];
				var checkBoxId = 'chkModel-' + element.ModelId;
				element.IsSelected = false;
				$("#" + checkBoxId).prop("checked", false);
			}
			globalTemplateQualifiers.SelectedModels = [];
			$("#spanModelsCount").text(" " + 0);
		}

		self.saveQualifiers = function (unloadTempPopup) {
			var selectedModelData = _.where(self.models(), { IsSelected: true });
			var models = new Array();
			if (!_.isEmpty(selectedModelData) && selectedModelData.length > 0) {
				for (i = 0; i < selectedModelData.length; i++) {
					var element = selectedModelData[i];
					var modelObject = new Object();
					modelObject.ModelName = element.ModelName;
					modelObject.ModelId = element.ModelId;					
					models.push(modelObject);
				}
			}
			globalTemplateQualifiers.SelectedModels = models;
			$("#modelAddAppLevelInstance").modal('hide');
			$("#btnAddTemplate").prop('disabled', false);	//Save button in Edit Parameter Template for Application screen
			unloadTempPopup('qualifiers');
		}

		self.cancelQualifiers = function (unloadTempPopup) {
			modelCount = 0;
			for (i = 0; i < self.models().length; i++) {
				var element = self.models()[i];
				var checkBoxId = 'chkModel-' + element.ModelId;
				var selectedModelData = _.where(qualifierModels, { ModelId: element.ModelId });
				if (!_.isEmpty(selectedModelData) && selectedModelData.length > 0) {
					element.IsSelected = true;
					modelCount++;
					$("#" + checkBoxId).prop("checked", true);
				} else {
					element.IsSelected = false;
					$("#" + checkBoxId).prop("checked", false);
				}
			}
			globalTemplateQualifiers.SelectedModels = qualifierModels;
			$("#modelAddAppLevelInstance").modal('hide');
			unloadTempPopup('unloadTemplate');
		}

		seti18nResourceData(document, resourceStorage);
    }
})