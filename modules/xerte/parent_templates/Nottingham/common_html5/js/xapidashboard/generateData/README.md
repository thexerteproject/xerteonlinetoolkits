# Generating xAPI Data

Many times it is easier to experiment with the Dashboard with local data rather than setting up and populating an LRS. As such, the scripts in this directory are designed to generate xAPI-like data and output in a format that is directly consumable by browsers.

This subproject of the xAPI Dashboard efforts will generate SCORM-like statements based on how it is configured. It will generate a set of *n* unique fictitious students with names, email addresses, and proficiencies. It will then simulate those students taking tests with a given number of variable-difficulty questions, and record the results in xAPI format.


## Producing the Raw JSON Data

The *generateData.py* script is easy to configure, even though it requires editing the source. You only need to edit the `main` function at the bottom of the file. The `main` function may look something like this:

```python
def main():

	# create tests
    battery = Battery()
    battery.tests.append( Test('test1', [random.randint(70,85) for i in range(100)]) )
    battery.tests.append( Test('test2', [50 for i in range(100)]) )
    battery.tests.append( Test('test3', [80,60,50,80]) )

	# create students
    myclass = Class(100, 85,50)

	# run tests
    results = battery.run(myclass)
    statements = genStatements(results)
```

This can be broken into a couple of logical sections: creating tests, creating students, and giving the students the tests.

### Creating tests

Just copy/paste the sample test(s) to create new ones. The `Test` constructor takes two arguments that you'll need to change.

The first one is the identifier of the test, and must be unique among your tests. It will be used to define an xAPI activity of the format `http://myschool.edu/xapi_vocab/{{testId}}`.

The second argument is a list of question difficulties. The difficulty is used to alter the probability that a student will get that question wrong, with higher values representing more difficult questions. The use of list comprehensions is recommended for lengthier tests.

### Creating students

Groups of students are created by using the `Class` object. The `Class` constructor takes three arguments: the number of students in the class, the mean class proficiency, and the class proficiency standard deviation. Using this information, the constructor generates the given number of students, each with a unique name and email address (for xAPI agent identification) and a proficiency rating conforming to the class normal distribution curve.

Each student will answer questions based on the difference between the question difficulty and the student proficiency. If the proficiency is equal to the difficulty, the student has about a 75% chance of answering that question correctly. Higher proficiency/lower difficulty will increase this probability, and lower proficiency/higher difficulty will decrease this probability.

### Running the tests

This part of the process will probably not need to be changed. It runs the battery of tests, generates xAPI statements based on the results, and then outputs the statements to a specified file if the `-o` argument is given, or the console if not.

## xAPI output

Generally speaking, the script will output sane and internally consistent xAPI-format test data. Using the ADL verbs, each student will `attempt` a test, `answer` each question with a boolean `result.success` value, `complete` the test, and then `pass` or `fail` the test based on the `result.score.raw` percentage.

These statements will have in-order timestamps per student, reversed as if they came from an LRS, with each question taking between 30 and 90 seconds to answer and each test starting 3 hours from the start of the previous one. Note that since the statements are sorted by timestamp, a given student's statements may not be sequential.

All of these statements will be serialized and output as a JSON array of statement objects. If the `-o` argument is specified, then the JSON will be output to that file, otherwise it will be printed to the console.

## Building the Self-Extracting Payload

You also have the option of outputting the statements in the form of a Javascript source file. If the `-p` flag is specified, the script will generate a self-extracting compressed digest of the xAPI data. Just include the result in your HTML document via the `<script>` tag like any other Javascript, and the statements will be written to `window.statements` for the dashboard to read.

Note that this flag requires the installation of Node.js and a couple dependencies, though a *package.json* is provided for convenience. Run `$ npm install` in the `generateData` directory and it will install all the dependencies. You are then ready to use the `-p` flag.
