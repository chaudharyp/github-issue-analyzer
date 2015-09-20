$(function() {
	var pageNumber;
	var recordsPerPage;
	var issueState;
	var repoOwner;
	var repoName;
	var repoIssues;
	init();

	// Using a function to initialize the vars
	function init() {
		pageNumber = 1;
		recordsPerPage = 100;
		issueState = "open";
		repoOwner = "";
		repoName = "";
		repoIssues = [];
		$("#results").hide();
		$("#results-error").hide();
	}

	// Clicking the Analyze button on enter key press
	$("#input-url").keyup(function(event) {
		if(event.keyCode == 13) {
			$("#btn-analyze").click();
		}
	});

	// Analyze button click event handler
	$("#btn-analyze").click(function() {
		init();
		$("#ajax-loader").show();

		// Fetching the URL entered in the text box
		var publicRepoUrl = $("#input-url").val();

		// Fetching the GitHub repo owner and name from the URL entered
		var repoUrlSegments = publicRepoUrl.split("/");
		repoOwner = repoUrlSegments[3];
		repoName = repoUrlSegments[4];

		// Fetching the issues for a particular repo owner and name
		getIssues(repoOwner, repoName, issueState, pageNumber, recordsPerPage);
	});

	// Fetches the issues for a particular repo owner and name. Accepts a few other parameters to send to the GitHub API
	function getIssues(repoOwner, repoName, issueState, pageNumber, recordsPerPage) {
		// Setting the default values when these are not passed to the function
		if(typeof(pageNumber) === "undefined") pageNumber = 1;
		if(typeof(recordsPerPage) === "undefined") recordsPerPage = 100;
		if(typeof(issueState) === "undefined") issueState = "open";

		// AJAX call to the GitHub API. Usage: https://developer.github.com/v3/issues/
		$.ajax({
			url: "https://api.github.com/repos/" + repoOwner + "/" + repoName + "/issues?state=" + issueState + "&page=" + pageNumber + "&per_page=" + recordsPerPage,
			type: "GET",
			beforeSend: function(xhr) {
				xhr.setRequestHeader('Accept', 'application/vnd.github.v3+json')
			}
		}).done(function(issues) {
			// Looping through the issues returned by GitHub API and filtering out the issues which are actually pull requests. Specified in https://developer.github.com/v3/issues/#list-issues
			repoIssues = _.filter(issues, function(issue) {
				return issue.pull_request == undefined;
			});

			// Getting more issues, if there are 100 issues returned. 100 issues is the max no of issues returned by the GitHub API per page.
			// If less than 100 issues returned, then render the issues on the UI
			if(issues.length == recordsPerPage)
				getIssues(repoOwner, repoName, issueState, ++pageNumber, recordsPerPage);
			else
				renderIssues(repoIssues);
		}).fail(function() {
			$("#results-error").show();
			$("#ajax-loader").hide();
		});
	}

	// Calculates the open issues and renders them on the UI
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