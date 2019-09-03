$(document).ready(function() {
	if ($(this).width() < 768) {
		$('#campground-header').removeClass('d-flex justify-content-between');
	}
	$(window).resize(function() {
		if ($(this).width() < 768) {
			$('#campground-header').removeClass('d-flex justify-content-between');
		} else {
			$('#campground-header').addClass('d-flex justify-content-between');
		}
	});
	if ($(this).width() < 576) {
		$('#collapseSummary').addClass('collapse');
	}
	$(window).resize(function() {
		if ($(this).width() < 576) {
			$('#collapseSummary').addClass('collapse');
		} else {
			$('#collapseSummary').removeClass('collapse');
		}
	});
});
