import pymongo, random
from pymongo import MongoClient

client = MongoClient() # Connect to default ip and port

db = client.node_auth # Connect to node_auth db

# Goal: Get the surveys that have yet to be distributed. Assign them to a proper sample based on the target.

surveys_to_handle = db.surveys.find({"distributed" : {"$gt" : 0}})

def distribute_survey_all( survey ):
    print "Survey _id: %s" % survey['_id']
    number_of_recipients = survey['distributed']
    users = db.users.find({"pendingSurvey": {"$exists" : False}, "surveys_taken" : {"$ne" : survey['_id']}})
    count = users.count()
    print "Found %s qualified users" % count

    recipients_left = number_of_recipients
    for user in users:
        if random.random() < recipients_left/count:
            user.update({"pendingSurvey" : survey['_id']})
            print "Updated user: %s" % user['email']
            db.users.save(user)
            recipients_left -= 1
        count -= 1

    survey.update({"distributed" : recipients_left})
    db.surveys.save(survey)

for survey in surveys_to_handle:
    if survey['target'] == False: # The surveys that can go to anyone
        distribute_survey_all(survey) # Hard coded!

