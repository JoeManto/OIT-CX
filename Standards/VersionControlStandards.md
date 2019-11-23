# Version Control Standards and Guidelines

## General Information
----
Git was chosen as the Version Control for this project. This will allow the team to create separate branches for testing and also allow for code review before any merges are made. The project can be found at the following link: [OIT-CX Github](https://github.com/JoeManto/OIT-CX).

## General Commands
----
To initialize the Repository the following commands were used:
```
git init

git remote add origin https://www.github.com/joemanto/OIT-CX

git pull origin master
```
To clone the repository the following command can be used:
```
git clone https://www.github.com/joemanto/OIT-CX
```
## Branching
----
When starting a need feature or sub feature, a branch should be created from the testing branch or a from a sub branch from testing.

**Branching from testing**

```
git checkout testing

git branch <branchname>
```

**Branching from sub branch**

```
git checkout <subbranch>`

git branch <branchname>
```

## Pushing to Master
----

- Before any code can be pushed to master
    - All server and frontend side tests should all pass
    - All code should go through a code review with another team member

All code has to be development and pushed to the testing branch before the code can be pushed to the master branch </br>
**Pushing to the master branch**</br>
```
git add -A 

git commit -m "message"

git push <remote> master
```
## Reverting
----
- If any code is pushed to the Master branch without being reviewed and tested (both unit and system tests), that push will be reverted and the project will be taken back to the most recent stable version. The code that follows will perform a rollback:
```CSS
git push -f origin last_known_good_commit:branch_name
```
- To revert an individual commit that was either made by mistake or incorrect perform the following:
```CSS
git revert <commit hash>
```

## Code Review
----
- Before any major changes the team will need to engage in a short Pair Programming review session
    - This can be done either in person, or in real time using Visual Studio Code Live Share
    - We opted for this since the team is small and everyone on the team will be able to push to Master
    


## Pushing to Testing
----
All team members are allowed to push to testing without code review. 
-   Features when completed and tested should then be pushed to the master branch after a code review



