/*
* This spike was run with Quokka VScode extension which allows for real time logging when creating spikes
*/
//classes
//here is the old way to create a user object before es6
function User(name, bnid, email){
    this.name = name;
    this.bnid = bnid;
    this.email = email;
}
//defining a user would have looked something like this
const jared = new User("Jared", "xyz1234", "jared@fakeemail.com");

//Now with es6+
class User2 {
    constructor(name, bnid, email) {
        this.name = name;
        this.bnid = bnid;
        this.email = email;
    }
    //This allows us to create object functions inside the class like
    changeEmail(newEmail) {
        this.email = newEmail; 
    }
}
const newUser = new User2("Joe", "xyz1234", "tempEmail@gmail.com");
//and updating the email is as simple as
newUser.changeEmail("newEmail@mail.com");
console.log(newUser.name, newUser.email ,newUser.bnid);

//If we wanted to create an Administrator extension of the User2 class
class Administrator extends User2 {
    constructor(name, bnid, email, role) {
        super(name, bnid, email);
        this._role = role;
    }
    //spiking getters and setters
    get role() {
        return this._role;
    }
    set role(newRole) {
        this._role = newRole;
    }
}
//defining an admin would like something like this
const boss = new Administrator("Dylan", "abc1234", "dylan@test.com", "Admin");
boss._role = "Admin2"; //updating using the setter defined
console.log(boss.name,":", boss.role,boss.bnid);