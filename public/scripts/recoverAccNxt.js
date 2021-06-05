const recoverAccNxtForm = document.querySelector('#recoverAccNxtForm');
recoverAccNxtForm.addEventListener('submit', handleRecovery);



function handleRecovery(e) {
    e.preventDefault();
    // Collect the entered fields
    const code = document.querySelector('#email').value;
    const password = document.querySelector('#password').value;
    const confirm = document.querySelector('#confirm').value;

    if (password !== confirm) {
        alert("Password don't match!");
        return;
    }

    // Confirm that the code is correct
    const payload = {
        code: code,
        password: password
    };

    const request = new Request("/api/recover", {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json"
        },
    });

    fetch(request).then((res) => {
        if (res.status === 401) {
            alert("You code is incorrect or invalid");
        } else {
            alert("You have successfully recover your password! You can login now");
            window.location = '/';
        }
    });


}
