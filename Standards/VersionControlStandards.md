# Version Control Standards and Guidelines

> <span style = "font-weight:bold;line-height:40px;">Below are all the respected standards and guidelines that must be followed through out the development of this project.
The standards and guidelines will explain the proper ways to use git throughout all the know procedures that the team uses. It's Important that every team member follows these to ensure the code base has no concurrency issues with commits ...etc</span>

## Git Usage
----
Git was chosen as the Version Control tool for this project. This will allow the team to create separate branches for new features, testing and also allow for easy viewing of the file differences which is used as a tool for code review before any merges are made to the **merge restricted branches**. The online hosting service Github was also chosen for the hosting of the project files for the team. The team public repo can be found at the following link: [OIT-CX Github](https://github.com/JoeManto/OIT-CX). (See General Commands for retrieving the project)

* **Merge Restricted Branch** : A branch that only allows commits from the lead contributor or contributor's

## Starting Commands
----
To initialize the Repository use one of the two commands can be used
```bash
git init \

git remote add origin https://www.github.com/joemanto/OIT-CX \

git pull origin master \
```
**or**

To directly cloning the repository, use this command
```bash
//clone
git clone https://www.github.com/joemanto/OIT-CX
```
## Branching & Merging
----


### Branching
When starting a new feature or sub-feature, a branch can be created from the testing branch or a from a sub branch from testing. 

* Sub-feature branching is not required, but is used throughout the project. 

* Feature branching from the testing branch is required. 

**Branching from testing**

```bash
git checkout testing

git branch <branchname>
```

**Branching from sub branch**

```bash
git checkout <subbranch>

git branch <branchname>
```

### Merging

- Before any code can be merged to master the following must be done
    - All server and frontend side tests should all pass

    - All code has to be development and pushed to the testing branch before the code can be pushed to the master branch
    - All code should go through a code review with another team member
    (see code review section)
 


* A sub-feature branch is only allowed to be merged back up to the root feature branch. No Higher 

* A feature branch is only allowed to be merged to testing. No Higher

**Merging to master**

Testing branch merging will be handled by the lead contributor's via Github pull requests from team members

**or**

lead contributor's can merge after code review by the following commands
```bash
    git checkout master

    git merge testing
```

**Merging to testing**

```bash
    git checkout testing

    git merge <feature-branch-name>
```


## Commits
----
**All commits should** 
* have small file differences and only contain file differences that relate to the context of the commit that is bring created.
* have a detailed message or paragraph that explain the insertions and deletions.
  follow this guide for [writing commit messages](https://medium.com/@steveamaza/how-to-write-a-proper-git-commit-message-e028865e5791)

**Don't directly push to the master branch**
This practice allows for possible inconsistencies throughout the code base and could result in merge conflicts or cause bugs because the new changes caused tests to fail.  

**Pushing to Branches**
```bash
git add -A 

# short message
git commit -m "message"

# or

# paragraph message
git commit 

git push <remote> <branch-name>
```
## Reverting
----
 If any code is pushed to the Master branch without being reviewed and tested (both unit and system tests), that push will be reverted and the project will be taken back to the most recent stable version. The code that follows will perform a rollback:
```bash
git push -f origin last_known_good_commit:branch_name
```
 To revert an individual commit that was either made by mistake or incorrect, perform the following:
```bash
git revert <commit hash>
```

## Code Review
----
 Before any major changes the team will need to engage in a short Pair Programming review session
 This can be done either in person, or in real time using Visual Studio Code Live Share.
 We opted for this since the team is small

-  In this code review the tests for the project will be ran before the code review starts.
    


## Pushing to Testing
----
All team members are allowed to push to the testing branch and everything lower without a code review. 
-   Features when completed and tested should then be pushed to the master branch after a code review

Allow the guide for pushing to branches in (Commits)



