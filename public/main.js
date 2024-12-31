document.addEventListener("DOMContentLoaded", () => {
    const submitButton = document.getElementById('submit-button');
    const name = document.getElementById('name');
    const email = document.getElementById('email');

    submitButton.addEventListener('click', () => {
        const name_input = name.value;
        const email_input = email.value;


        fetch('/submit', {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
            },
            body: JSON.stringify({name: name_input, email: email_input})
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data.message);
            })
            .catch((error) => {
                console.error('Error,', error);
            });

        name.value = ''
        email.value = ''
    }); 

});