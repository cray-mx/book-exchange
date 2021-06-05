/**
 * This module handles recovering an account for a user that forgot their pw.
 */
//Citation: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

const log = console.log;

const recoverAccForm = document.querySelector('#recoverAccForm');
recoverAccForm.addEventListener('submit', handleRecovery);

function handleRecovery(event) {
    event.preventDefault();
    // Veryify the email is from a proper user
    const email = document.querySelector('#email').value;
    if (!validateEmail(email)) {
        alert("Your email is not valid!");
        return;
    }
    const request = new Request("/api/sendCode/" + email, {
        method: "post"
    });
    fetch(request).then((res) => {
        console.log(res.status);
        if (res.status === 404) {
            alert("This is not a valid email, please try again");
        } else if (res.status === 200) {
            alert("An email with the recovery code has sent to your email.");
            window.location = "/pages/recoverAccNxt.html";
        }
    })

}
