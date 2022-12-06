define(["knockout"], function (ko) {

	//validation
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	return function editParentReferenceSetModel() {

		var self = this;

		//focus on first textbox
		$('#modalEditParentReferenceSetHeader').on('shown.bs.modal', function () {
			$('#txtParentReferenceSetName').focus();
		})
		//------------------------------FOCUS ON  POP UP-------------------------------------


		$('#modalEditParentReferenceSetHeader').keydown(function (e) {
			if ($('#btnCancelSaveParentReferenceSet').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#modelEditParentReferenceSetClose').focus();
			}
		});

		//----------------------------------------------------------------------------------------

		$('#modalEditParentReferenceSetHeader').mouseup(function () {
			$("#modelEditParentReferenceSetClose").draggable({ disabled: true });
		});

		$('#modalEditParentReferenceSetHeader').mousedown(function () {
			$("#modelEditParentReferenceSetClose").draggable({ disabled: false });
		});

		self.Name = ko.observable('');
		self.Description = ko.observable('');

		init();
		function init() {
			if (!_.isEmpty(globalSelectedParentReferenceSet)) {
				self.Name(globalSelectedParentReferenceSet.SelectedParentRFSName);
				self.Description(globalSelectedParentReferenceSet.SelectedParentRFSDescription);
			}
		}

        self.Description.subscribe(function (newValue) {
            $('#btnSaveParentReferenceSet').removeAttr('disabled');
        });

		self.saveParentReferenceSet = function (observableModelPopup, gId) {
            var parentReferenceSet = new Object();
            parentReferenceSet.ID = globalSelectedParentReferenceSet.SelectedParentRFSId;
            parentReferenceSet.Name = globalSelectedParentReferenceSet.SelectedParentRFSName;
            parentReferenceSet.Description = $("#txtAreaEditParentRFSDescription").val();

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'parent_reference_set_save_success');
						observableModelPopup('unloadTemplate');
						$("#modalParentReferenceSet").modal('hide');
						gridFilterClear(gId);
					} else if (data.responseStatus.StatusCode == AppConstants.get('EX_PARENT_REFERENCESET_EXISTS')) {
						openAlertpopup(1, 'parent_reference_set_duplicate');
					}
				}
				$("#loadingDiv").hide();
			}

			var method = 'SetParentReferenceSet';
            var params = '{"token":"' + TOKEN() + '","parentReferenceSet":' + JSON.stringify(parentReferenceSet) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		seti18nResourceData(document, resourceStorage);
	};
});