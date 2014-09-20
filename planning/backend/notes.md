We can all add design decisions and other information here to collaborate.

# Design Choices

Node.js with MongoDB

# Potentially Helpful Links
- [NodeJS and Express](http://blog.modulus.io/nodejs-and-express-create-rest-api)
- [NodeJS, Express, Mongo](http://www.codemag.com/Article/1210041)
- [Node Restify](http://mcavage.me/node-restify/)
- [Building a RESTful API with Express](http://scotch.io/tutorials/javascript/build-a-restful-api-using-node-and-express-4)

# Routes

We need to define the exactly what api calls are going to be made so that we can design the server around them. For example, if we want to add a user to our system, how are we going to tell the server that we adding someone, who we are adding, and other new user related information. Do any processes need to be run upon adding a new user? Do we need to make space for that user in our database? These are all questions we need to answer in order to make a robust api.

This is a rough format for defining this information. We should think of something more elegant later. 
<pre>
EXAMPLE

call: /add_user
sent data: email address
returned data: success or failure indication
process run: send email verification.
</pre>

List Routes Here:

