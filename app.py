# Importing Flask and render_template modules
from flask import Flask, render_template

# Creating a Flask app
app = Flask(__name__)

# Specifying the URL route and the template that should be rendered
@app.route("/")
def main():
	return render_template('index.html')