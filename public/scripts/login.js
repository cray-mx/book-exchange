// import { users } from '../classes/data.js';


/**
 * DOM elements
 */
const signInForm = document.querySelector('#signIn');
signInForm.addEventListener('submit', handleLogin);


function handleLogin(e) {
    e.preventDefault();
    // Get their entered email and password. (We need .value and not innerText or textContent)
    const username = document.getElementById('email').value;
    const password = document.querySelector('#password').value;

    const payload = {
        username: username,
        password: password
    };

    const request = new Request('/api/login', {
        method: 'post',
        body: JSON.stringify(payload),
        headers: {
            "Accept": "application/json, text/plain, */*",
            "content-Type": "application/json"
        }
    });

    fetch(request).then(function(res) {
        if (res.status === 200) {
            alert("You have successfully logged in.");
            window.location = '/index.html';
        } else if (res.status === 401) {
            alert("Username or password is incorrect.");
        }

    })
}
