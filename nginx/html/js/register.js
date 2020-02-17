$( document ).ready(function() {
    // URL
    var host = window.location.host;
    var url = "https://" + host + "/register/";
    var submit_btn = $('#register-submit');
    var response_display = $('#registration-response');
    var taken_usernames, taken_emails;
    
    function getAllGrafanaUsers() {
        var xhr = new XMLHttpRequest();
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                if (this.responseText === "") {
                    taken_emails = []
                    taken_usernames = []
                } else {
                    var users = JSON.parse(this.responseText)
                    taken_usernames = users.map(d => d.login)
                    taken_emails = users.map(d => d.email)
                }
                submit_btn.prop('disabled', false)
            }
        });
        xhr.open("GET", "https://" + host + "/users");
        xhr.send(null);
    }
    
    getAllGrafanaUsers()
    
    function encodeUnamePasswd(username, password) {
        var token = username + ':' + password;
        var b64enc_token = btoa(token);
        return "Basic " + b64enc_token;
    }
    
    
    function requestUserRegistration() {
        // Variables from the form
        var realname = $('#register-realname').val();
        var email = $('#register-email').val();
        var experiment = $('#register-experiment').val();
        var uname = $('#register-username').val();
        var passwd = $('#register-password').val();
        var passwd_confirm = $('#register-password-confirm').val();
        
        // Sanity checks
        // No empty fields please
        if (email === "" || experiment === "" || uname === "" || passwd === "" || passwd_confirm === "") {
            return "Error, all fields are required."
        }
        // Checking username availability
        if (taken_usernames.includes(uname)) {
            return "Error, username already taken."
        } 
        // Checking email availability
        if (taken_emails.includes(email)) {
            return "Error, email address already taken."
        }
        // Checking password length
        if (passwd.length < 8) {
            return "Error, password must be at least 8 characters."
        }
        // Checking that passwords match
        if (passwd !== passwd_confirm) {
            return "Error, passwords do not match."
        }
        
        // Create request
        var http = new XMLHttpRequest();
        http.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                if (this.status === 0) {
                    response_display.text("Error, cannot connect to registration service.")
                    response_display.prop('class', 'registration-error')
                } else if (this.status === 200) {
                    response_display.text("You have been successfully registered!")
                    response_display.prop('class', 'registration-success')
                } else {
                    response_display.text(this.responseText)
                    response_display.prop('class', 'registration-error')
                }
            }
        });
        http.open('POST', url);
        http.setRequestHeader("Authorization", encodeUnamePasswd(uname, passwd));
        http.setRequestHeader("Content-Type", "application/x-www-form-urlencoded")
        
        var dat = "realname=" + realname + "&email=" + email + "&experiment=" + experiment;
        http.send(dat);
    }

    submit_btn.click(function() {
        // Reset error display
        response_display.text("")
        var err = requestUserRegistration();
        if (err !== "") {
            response_display.text(err)
            response_display.prop('class', 'registration-error')
        }
    });
})