# fyp-mgmt

## Run

```bash
npm start
```

## Functionalities

### User

1. [x] User can create an account and Sign In
1. [x] User can be Student, Supervisor, or Committee
1. [x] Users can delete their account

**Student**

1. [x] Request another Student to become part of a group
1. [x] Student can view their requests
1. [x] Accept/Reject invites from other Students
1. [x] Students can submit an idea for FYP
1. [x] Students can view FYP ideas from Teachers (Supervisors)
1. [ ] Students can drop their FYP
1. [x] Students can see their past submissions
1. [x] Students can view their own marks for a submission

**Supervisor**

1. [x] Supervisor can be assigned to FYPs (note: not GROUPS)
1. [x] Supervisors can create an FYP
1. [x] Supervisors can apply to Supervise a Group (based on FYP idea)

**Committee**

1. [ ] Committee member can approve an FYP
1. [ ] Committee member have a list of In Progress FYPs

### Groups

1. [x] Group Creator is the Group Leader
1. [x] Group is made of 2 or 3 people
1. [x] Group can submit their idea
1. [x] Group can apply to work on a Supervisor ideas
1. [x] Group can't be assigned an fyp/supervisor if its member list is 0 or more then 2. Group Leader is the 1st member.
1. [x] Group members can accept a supervisor to supervise their idea.
1. [x] Groups can have submissions where they can upload stuff
1. [x] Any one of group member can upload a submission
1. [ ] Group members can chat with their Supervisor

### FYP

1. [x] FYP must have a Title, Description, Availability (T/F), Status

### Submission

1. [x] Submission must have a title
1. [x] Submission must have a deadline
1. [ ] Faculty members can mark submissions

### Application Queue

1. [x] Student/Faculty can view the requests on their FYP

## Misc

1. [ ] Create new role of "Group Leader" for options that are only available to a group leader
1. [ ] Refactor role check into a middleware
1. [ ] Add group_id to token, on login, if the user is in a group (would simplify a lot of queries)
