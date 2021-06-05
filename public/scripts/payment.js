let items;
let total;
/**
 * Module to collect and handle payment information
 */
const form = document.querySelector('#paymentForm');

const payButton = document.querySelector("#payButton");
payButton.addEventListener('click', handlePayment);

function init() {
    items = JSON.parse(sessionStorage.getItem("checkoutItems"));
    total = sessionStorage.getItem("total");
    if (!items || total === undefined) {
        window.location = "/shoppingCart";
    }
    document.querySelector("#price").innerText = total;
    sessionStorage.removeItem("checkoutItems");
    sessionStorage.removeItem("total");

}
init();

function handlePayment(e) {
    e.preventDefault();

    // Contact info
    const firstName = form[0].value;
    const lastName = form[1].value;
    const email = form[2].value;

    // Payment info
    const cardType = form[3].value;
    const cardNumber = form[4].value;
    const cardCVV = form[5].value;
    const cardExpDate = form[6].value;

    if (cardNumber.length !== 16) {
        alert("Invalid CreditCard Number");
        return;
    }
    // We are not really handle the payment information in this project
    // So only creditCard number is sent
    const payload = {
        items: items,
        creditCardNumber: cardNumber
    };
    const request = new Request("/api/submitPayment", {
        method: "post",
        body: JSON.stringify(payload),
        headers: {
            "Accept": "application/json, text/plain, */*",
            "Content-Type": "application/json"
        }
    });

    fetch(request).then((res) => {
        if (res.status === 200) {
            alert("You have successfully submit the payment");
            window.location = '/pages/myPurchases.html';
        }
    }).catch((err) => {
        console.log(err);
    });

    // Redirect user to profile back
    // document.location = "../index.html";
}

const cancelButton = document.querySelector("#cancelButton");
cancelButton.addEventListener("click", (e) => {
    e.preventDefault();
    window.location = "/pages/shoppingCart.html";
});
