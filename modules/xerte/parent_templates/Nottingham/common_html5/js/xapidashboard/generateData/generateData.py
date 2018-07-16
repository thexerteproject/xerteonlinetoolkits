#!/bin/env python
import subprocess, sys, os, random, json, math, datetime as dt
from uuid import uuid4
from StringIO import StringIO


random.seed()
nameData = {}


class EST(dt.tzinfo):
	def utcoffset(self, d):
		return dt.timedelta(hours=-5)
	def dst(self, d):
		return dt.timedelta(hours=1)


class Student(object):
	def __init__(self, average):

		self.firstName = random.choice(nameData['firstNames'])
		self.lastName = random.choice(nameData['lastNames'])
		self.name = u'{} {}'.format(self.firstName, self.lastName)
		self.email = u'{}.{}@myschool.edu'.format(self.firstName.lower(), self.lastName.lower())

		self.average = average

	def answerQuestion(self, difficulty):
		difference = self.average - difficulty
		successProbability = math.atan((difference+12)/10)/math.pi + 0.5
		return random.random() < successProbability
		#return random.normalvariate(self.average,sqrt(self.variance)) >= difficulty


class Class(object):
	def __init__(self, numStudents, classAverage, classVariance):
		self.id = 'cop-3223'
		self.instructor = Student(100)
		self.students = []
		for i in range(numStudents):
			studentAverage = random.normalvariate(classAverage, math.sqrt(classVariance))
			self.students.append( Student(studentAverage) )

	def takeTest(self, test):
		results = TestResults(len(test))
		results.classHandle = self
		for questionNum,difficulty in enumerate(test):
			for student in self.students:
				results.logAnswer( student, questionNum, student.answerQuestion(difficulty) )

		return results


class Test(list):
	def __init__(self, name, questions):
		self.name = name
		for q in questions:
			self.append(q)


class Battery(object):
	def __init__(self):
		self.tests = []

	def run(self, group):
		result = {}
		for test in self.tests:
			result[test.name] = group.takeTest(test)

		return result


class TestResults(list):
	def __init__(self, numQuestions):
		for i in range(numQuestions):
			self.append({})

	def logAnswer(self, student, questionNumber, success):
		self[questionNumber][student] = success


def genStatements(results):

	xapiStatements = []

	for testid,questions in results.items():

		times = {}
		sums = {}
		try:
			startTime += dt.timedelta(hours=3)
		except UnboundLocalError:
			startTime = dt.datetime.now(EST())

		for qNum,qResults in enumerate(questions):

			for student,result in qResults.items():

				if qNum == 0:
					xapiStatements.append( genStatement(questions.classHandle, student,'attempted',testid,startTime) )

				activity = '{}/q{}'.format(testid,qNum)
				times[student] = times.get(student, startTime) + dt.timedelta(seconds=random.randint(30,90))
				sums[student] = sums.get(student,0) + (100 if result else 0)

				xapiStatements.append( genStatement(questions.classHandle, student,'answered',activity,times[student],result) )


		for student,time in times.items():
			xapiStatements.append( genStatement(questions.classHandle, student,'completed',testid,time) )

			average = sums[student]/len(questions)
			passed = 'passed' if average >= 60 else 'failed'
			xapiStatements.append( genStatement(questions.classHandle, student,passed,testid,time,average) )

	def sortKey(e):
		return e['stored']
	xapiStatements.sort(key=sortKey, reverse=True)

	return xapiStatements

			
def genStatement(c, student, verb, activity, time, score=None):
	stmt = {
		'actor': {
			'name': student.name,
			'mbox': 'mailto:'+student.email
		},
		'verb': {
			'id': 'http://adlnet.gov/expapi/verbs/'+verb,
			'display': {'en-US': verb}
		},
		'object': {
			'id': 'http://myschool.edu/xapi/{}/{}'.format(c.id,activity),
			'definition': {
				'name': activity
			}
		},
		'context': {
			'instructor': {
				'objectType': 'Agent',
				'name': c.instructor.name,
				'mbox': 'mailto:'+c.instructor.email
			},
			'contextActivities': {
				'grouping': [{'id': 'http://myschool.edu/xapi/'+c.id}]
			}
		},

		'authority': {
			'mbox': 'mailto:admin@myschool.edu',
			'objectType': 'Agent'
		},
		'timestamp': time.isoformat(),
		'stored': time.isoformat(),
		'version': '1.0.1',
		'id': str(uuid4())
	}

	if verb == 'answered':
		stmt['context']['contextActivities']['parent'] = [{
			'id': 'http://myschool.edu/xapi/{}/{}'.format(c.id, activity.split('/')[0])
		}]

	if isinstance(score, bool):
		stmt['result'] = {
			'success': score
		}
	elif isinstance(score, (int,long,float)):
		stmt['result'] = {
			'score': {
				'raw': score,
				'min': 0,
				'max': 100
			}
		}
	
	return stmt



def main():

	if not set(sys.argv).isdisjoint(set(['-?','-h','--help'])):
		print 'Generate SCORM-style xAPI statements'
		print 'options:'
		print '  -o <filename> - output to a file instead of the console'
		print '  -p            - pack the JSON payload in a compressed javascript file'
		return
		
	path = os.path.dirname(os.path.realpath(__file__))
	with open(path+'/names.json','r') as names:
		global nameData
		nameData = json.load(names)


	battery = Battery()
	battery.tests.append( Test('test1', [random.randint(65,80) for i in range(50)]) )
	battery.tests.append( Test('test2', [random.randint(65,80) for i in range(50)]) )
	battery.tests.append( Test('test3', [random.randint(65,80) for i in range(50)]) )
	battery.tests.append( Test('test4', [random.randint(65,80) for i in range(50)]) )
	battery.tests.append( Test('final', [random.randint(70,85) for i in range(50)]) )
	#battery.tests.append( Test('test2', [50 for i in range(100)]) )

	myclass = Class(30, 75,20)

	results = battery.run(myclass)
	statements = genStatements(results)
	stmtString = json.dumps(statements, indent=4)

	if '-p' in sys.argv:
		p = subprocess.Popen(['node', path+'/compress.js'], stdin=subprocess.PIPE, stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=path)
		stmtString, err = p.communicate(stmtString)
		if err != '':
			print 'Error', err

	if '-o' in sys.argv:
		i = sys.argv.index('-o')
		try:
			with open(sys.argv[i+1],'w') as outfile:
				outfile.write(stmtString)
		except IndexError:
			print stmtString
	else:
		print stmtString

if __name__ == '__main__':
	main()
