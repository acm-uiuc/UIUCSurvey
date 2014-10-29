import pymongo, random
from pymongo import MongoClient

client = MongoClient() # Connect to default ip and port

db = client.node_auth # Connect to node_auth db

# Goal: Get the surveys that have yet to be distributed. Assign them to a proper sample based on the target.

surveys_to_handle = db.surveys.find({"distributed" : False})

def distribute_survey_all( survey, number_of_recipients ):
    print "Survey _id: %s" % survey['_id']
    users = db.users.find({"pendingSurvey": {"$exists" : False}, "surveys_taken" : {"$ne" : survey['_id']}})
    count = users.count()
    print "Found %s qualified users" % count

    allocated = 0

    while allocated < number_of_recipients and allocated < count: # While there are more to be allocated and we have enough users to allocate to
        for user in users:
            if random.random() < number_of_recipients/count:
                user.update({"pendingSurvey" : survey['_id']})
                print "Updated user: %s" % user['email']
                db.users.save(user)
                allocated = allocated + 1

    # Check if done distributing
    if allocated == number_of_recipients:
        survey.update({"distributed" : 0})
        db.surveys.save(survey)

for survey in surveys_to_handle:
    if survey['target'] == False: # The surveys that can go to anyone
        distribute_survey_all(survey, 50) # Hard coded!

