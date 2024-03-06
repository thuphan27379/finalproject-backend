THUNDER & Routers & Controllers

Site:                                    home.api.js

GET /home/:slug 
Get all information of company  xx 

Authentication:                          auth.api.js

POST /auth/login 
Logs user into the system  xx 
 
User: Access to user account             user.api.js

GET /users/page=1?&limit=10 
Get list of users with pagination  xx 

GET /users/me 
Get current user info (my profile)  xx

GET /users/:id 
Get user detail info by Id  xx

POST /users   
User Registration  xx

PUT /users/:id 
Update user profile  xx

Post:                                    post.api.js

GET /posts/user/:userId?page=1&limit=10 
Find a list of posts that the user can see  xx

GET /posts/:id/comments 
Get comments of a post  ?!?! 

GET /posts/:id 
Get a single post  xx

POST /posts 
Create a new post  xx

PUT /posts/:id 
Updated a post  xx

DELETE /posts/:id 
Delete a post  xx

Comment:                                comment.api.js

GET /comments/:id 
Get detail of a comment ???
 
POST /comments 
Create a new comment xx

PUT /comments/:id 
Updated a comment  xx

DELETE /comments/:id 
Delete a comment  

Friend:  http://localhost:4000/          friend.api.js

GET /friends/requests/incoming 
List of received pending requests   xx

GET /friends/requests/outgoing 
List of sent friend requests  xx

GET /friends 
List of friends  xx

POST /friends/requests 
Send a friend request xx

PUT /friends/requests/:userId 
Response to a friend request - Accept/decline  xx

DELETE /friends/requests/:userId 
Cancel a friend request 

DELETE /friends/:userId 
Unfriend   xx

Reaction: posts OR comments             reaction.api.js

POST /reactions 
Create a like/dislike xx