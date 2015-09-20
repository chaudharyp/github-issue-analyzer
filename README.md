# github-issue-analyzer
Gives an analysis on *open* GitHub issues for a particular repository.

Following data is shown:
* Total open issues
* Issues opened in the last 24 hours
* Issues opened between 24 hours and 7 days
* Issues opened more than 7 days ago

Solution explanation
--------------------
* Python is the backend language used along with Flask microframework.
* Gunicorn is being used as the server to host the app.
* The data for a particualar repository is fetched using AJAX.

Find the app at: [https://github-issue-analyzer.herokuapp.com](https://github-issue-analyzer.herokuapp.com)

Improvements that can be done
-----------------------------
* Using a JavaScript framework like AngularJS/React to make the code cleaner and for better interaction between DOM and JS.
* Adding more data and develop the app into a complete analytics app for a particular repo/owner. GitHub API provides endpoints for a lot of data.
* Make this app more user-friendly and engaging.
