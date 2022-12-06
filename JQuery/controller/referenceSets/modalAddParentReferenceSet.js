define(["knockout"], function (ko) {

	//validation
	ko.validation.init({
		decorateElement: true,
		errorElementClass: 'err',
		insertMessages: false
	});
	return function addParentReferenceSetModel() {

		var self = this;

		//focus on first textbox
		$('#modelAddParentReferenceSetHeader').on('shown.bs.modal', function () {
			$('#txtParentReferenceSetName').focus();
		})
		//------------------------------FOCUS ON  POP UP-------------------------------------


		$('#modelAddParentReferenceSetHeader').keydown(function (e) {
			if ($('#btnCancelParentReferenceSet').is(":focus") && (e.which || e.keyCode) == 9) {
				e.preventDefault();
				$('#modelAddParentReferenceSetClose').focus();
			}
		});

		//----------------------------------------------------------------------------------------

		$('#modelAddParentReferenceSetHeader').mouseup(function () {
			$("#modelAddParentReferenceSetClose").draggable({ disabled: true });
		});

		$('#modelAddParentReferenceSetHeader').mousedown(function () {
			$("#modelAddParentReferenceSetClose").draggable({ disabled: false });
		});


		//$('#txtParentReferenceSetName').keyup(function () {
		//	var yourInput = $(this).val();
		//	re = /[`~!#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi;
		//	// store current positions in variables
		//	var start = this.selectionStart,
		//		end = this.selectionEnd;

		//	var isSplChar = re.test(yourInput);
		//	if (isSplChar) {
		//		var no_spl_char = yourInput.replace(/[`~!@#$%^&*()|+\=?;:'",<>\{\}\[\]\\\/]/gi, '');
		//		$(this).val(no_spl_char);

		//		// restore from variables...
		//		this.setSelectionRange(start - 1, end - 1);
		//	}
		//});

		self.ParentReferenceSetName = ko.observable('');
		self.ParentReferenceSetName.subscribe(function () {
			if ($("#txtParentReferenceSetName").val().trim() != '') {
				$('#btnAddParentReferenceSet').removeAttr('disabled');
			} else {
				$('#btnAddParentReferenceSet').prop('disabled', true);
			}
		});

		self.addParentReferenceSet = function (observableModelPopup, gId) {
			var addParentReferenceSetReq = new Object();
			addParentReferenceSetReq.Name = $("#txtParentReferenceSetName").val();
			addParentReferenceSetReq.Description = $("#txtAreaParentRFSDescription").val();

			function callbackFunction(data, error) {
				if (data) {
					if (data.responseStatus.StatusCode == AppConstants.get('SUCCESS')) {
						openAlertpopup(0, 'parent_reference_set_add_success');
						observableModelPopup('unloadTemplate');
						$("#modalParentReferenceSet").modal('hide');
						gridFilterClear(gId);
					} else if (data.responseStatus.StatusCode == AppConstants.get('EX_PARENT_REFERENCESET_EXISTS')) {
						openAlertpopup(1, 'parent_reference_set_duplicate');
					}
				}
				$("#loadingDiv").hide();
			}

			var method = 'AddParentReferenceSet';
			var params = '{"token":"' + TOKEN() + '","addParentReferenceSetReq":' + JSON.stringify(addParentReferenceSetReq) + '}';
			ajaxJsonCall(method, params, callbackFunction, true, 'POST', true);
		}

		seti18nResourceData(document, resourceStorage);
	};
});