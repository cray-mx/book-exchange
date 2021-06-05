// import { User } from '../classes/User.js';
// import { users } from '../classes/data.js';


/**
 * This module handles creating a new account for a user.
 */
const createAccountForm = document.querySelector('#createAccountForm');
createAccountForm.addEventListener('submit', handleCreateAccount);



function handleCreateAccount(e) {
    e.preventDefault();
    // Collect the entered fields
    const firstName = document.querySelector('#firstName').value;
    const lastName = document.querySelector('#lastName').value;
    const username = document.querySelector('#username').value;
    const email = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirm = document.querySelector('#confirm').value;

    // Check if password matches confirm
    if (password !== confirm) {
        alert('Password does not match');
        return;
    }

    // Check that the other fields are correct. We can make these more precise later
    let nameRegex = /^[a-zA-Z]+[a-zA-Z0-9]*$/;
    let emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName) || !nameRegex.test(username) || !emailRegex.test(email.toString())) {
        alert('Please correct fields and try again.');
        return;
    }

    const newUser = {
      firstName: firstName,
      lastName: lastName,
      username: username,
      email: email,
      password: password,
    };

    const request = new Request("/api/createAccount", {
        method: 'post',
        body: JSON.stringify(newUser),
        headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json'
        }
    });
    fetch(request).then((res) => {
        if (res.status === 200) {
            alert(`Account created successfully!\nPlease login.`);
            window.location = '/';
        } else if (res.status === 600) {
            alert("The username you choose has been taken.");
        } else if (res.status === 601) {
            alert("The email is already registered.");
        }
    });
}
