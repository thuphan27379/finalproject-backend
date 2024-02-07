#codercomm:
social network

creating accounts with name, email, password

can update profile: avatar, company, jobtitle, social links, short description about themselves

can write posts with text and image, new posts show on the user profile page and can comment and react like or dislike on the post and comment

can send friend requests who have a open relationship

can accept or decline a friend request
after accept, can see posts of each other

#user stories:
##authentication:

- I can register a new account with name, email, password
- as a user I can sign in with my email and password

##user:

- I can see a list of other users so I can send, accept or decline friend requests
- I can get my current profile info, stay signed in with refreshing page
- I can see profile of a specific user given ID
- I can update profile with avatar, company, jobtitle, social links, short description

##posts:

- I can see list of posts
- I can create a new post with text and image
- I can edit posts
- I can delete posts

##comments:

- I can see list of comments of the post
- I can write a comments on the post
- I can update comments
- I can delete comments

##reactions:

- I can react like or dislike on the post and comment

##friends:

- I can send friend request
- I can see list of friend requests I have received
- I can see list of friend requests I have sent
- I can see list of my friends
- I can accept or decline a friend request
- I can cancel friend request I sent
- I can unfriend

Endpoint APIs:
#Auth APIs:

javascript
@route POST/auth/login
@description log in with email and password
@body (email, password)
@access public

#user APIs:

javascript
@route POST/users
@description register new user
@body (name, email, password)
@access public

javascript
@route GET/users/page=1&limit=10
@description get users with pagination
@access log in required

javascript
@route GET/users/me
@description get current user info
@access log in required

javascript
@route GET/users/:id
@description get user profile
@access log in required

javascript
@route PUT/users/:id/
@description update user profile
@body (name, avatarURL, coverURL, aboutMe, city, country, company, jobtitle, social links)
@access log in required

#posts APIs:

javascript
@route GET/posts/user/userID?page=1&limit=10
@description get all posts and user can see with pagination
@access login required

javascript
@route POST/posts
@description create a new post
@body (content, image)
@access login required

javascript
@route PUT/posts/:id
@description update a post
@body (content, image)
@access login required

javascript
@route DELETE/posts/:id
@description delete a post
@access login required

javascript
@route GET/posts/:id
@description get a single post
@access login required

javascript
@route GET/posts/:id/comments
@description get comment of a post
@access login required

#comments APIs:

@route POST/comments
@description create a new comment
@access login required

@route PUT/comments
@description update a comment
@access login required

@route DELETE/comments/:id
@description delete a comment
@access login required

@route GET/comments/:id
@description get details of a comment
@access login required

#reactions APIs:

@route POST/reaction
@description reaction a post and comment
@body {targetType: 'post' or 'comment', targetId, emoji: 'like' or 'dislike'}
@access login required

#friend APIs:

@route POST/friends/request
@description send a friend request
@body (to: User ID)
@access login required

@route GET/friends/requests/incoming
@description get list of received pending requests
@access login required

@route GET/friends/requests/outgoing
@description get list of sent pending requests
@access login required

@route GET/friends
@description get list of friends
@access login required

@route PUT/friends/requests/:userId
@description accept/reject a received pending request
@body {status: 'accepted' or 'declined'}
@access login required

@route DELETE/friends/request/:userId
@description remove friend
@access login required

summary:
start with functional specification
list down user stories
design endpoint APIs
entity relationship diagram
code code code
