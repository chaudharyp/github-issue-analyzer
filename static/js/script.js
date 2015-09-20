$(function() {
	var pageNumber = 1;
	var recordsPerPage = 100;
	var issueState = "open";
	var repoOwner = "";
	var repoName = "";
	var repoIssues = [];

	function init() {
		pageNumber = 1;
		recordsPerPage = 100;
		issueState = "open";
		repoOwner = "";
		repoName = "";
		repoIssues = [];
	}

	$("#btn-analyze").click(function() {
		init();
		$("#ajax-loader").show();
		$("#results").hide();
		var publicRepoUrl = $("#input-url").val();

		var repoUrlSegments = publicRepoUrl.split("/");
		repoOwner = repoUrlSegments[3];
		repoName = repoUrlSegments[4];

		getIssues(repoOwner, repoName, issueState, pageNumber, recordsPerPage);
	});

	function getIssues(repoOwner, repoName, issueState, pageNumber, recordsPerPage) {
		if(typeof(repoOwner) === "undefined" || repoOwner === "") return "Repository owner must be specified";
		if(typeof(repoName) === "undefined" || repoName === "") return "Repository name must be specified";

		if(typeof(pageNumber) === "undefined") pageNumber = 1;
		if(typeof(recordsPerPage) === "undefined") recordsPerPage = 100;
		if(typeof(issueState) === "undefined") issueState = "open";

		$.ajax({
			url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/issues?state=" + issueState + "&page=" + pageNumber + "&per_page=" + recordsPerPage,
			type: "GET",
			beforeSend: function(xhr) {
				xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json')
			}
		}).done(function(issues) {
			_.each(issues, function(issue) {
				if(issue.pull_request == undefined)
					repoIssues.push(issue);
			});
			if(issues.length == recordsPerPage)
				getIssues(repoOwner, repoName, issueState, ++pageNumber, recordsPerPage);
			else
				renderIssues(repoIssues);
		});
	}

	function renderIssues(repoIssues) {
		var totalOpenIssues = repoIssues.length;
		var issuesInLast24Hours = 0;
		var issuesBetween24HoursAnd7Days = 0;
		var issuesMoreThan7Days = 0;

		var currentDate = new Date();
		var milliSecondsInDay = 1000 * 3600 * 24;
		_.each(repoIssues, function(repoIssue) {
			var issueCreationDate = new Date(repoIssue.created_at);

			var timeDiff = currentDate - issueCreationDate;
			var timeDiffInDays = timeDiff / milliSecondsInDay;

			if (timeDiffInDays <= 1) {
				issuesInLast24Hours++;
			}
			else if (timeDiffInDays > 1 && timeDiffInDays <= 7) {
				issuesBetween24HoursAnd7Days++;
			}
			else if (timeDiffInDays > 7) {
				issuesMoreThan7Days++;
			}
		});

		$("#total-open-issues .panel-body").text(totalOpenIssues);
		$("#issues-in-last-24-hours .panel-body").text(issuesInLast24Hours);
		$("#issues-between-24-hours-and-7-days .panel-body").text(issuesBetween24HoursAnd7Days);
		$("#issues-more-than-7-days .panel-body").text(issuesMoreThan7Days);
		$("#ajax-loader").hide();
		$("#results").show();
	}
});