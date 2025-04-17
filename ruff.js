<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Forgot Password</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body {
      background-color: #f8f9fa;
    }
    .form-container {
      max-width: 500px;
      margin: 50px auto;
      padding: 30px;
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  </style>
</head>
<body>

  <div class="form-container">
    <h3 class="text-center mb-4">Forgot Password</h3>
    <form id="forgotPasswordForm" onsubmit="return handleForgotPassword(event)">
      <div class="mb-3">
        <label for="identifier" class="form-label">Email, Phone, or Username</label>
        <input type="text" class="form-control" id="identifier" name="identifier" placeholder="Enter your Email, Phone, or Username">
      </div>

      <button type="submit" class="btn btn-primary w-100">Send Login Link</button>
    </form>

   
    <div id="otpSection" class="mt-3" style="display: none;">
      <label for="otp" class="form-label">Enter OTP</label>
      <input type="text" class="form-control" id="otp" placeholder="Enter OTP">
      <button type="button" class="btn btn-success mt-2" onclick="verifyOTP()">Verify OTP</button>
    </div>

    <div id="message" class="mt-3 text-center"></div>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.emailjs.com/dist/email.min.js"></script>

  <script>
    emailjs.init("your_emailjs_user_id"); 
    function handleForgotPassword(event) {
      event.preventDefault();
      const identifier = document.getElementById('identifier').value.trim();

      if (!identifier) {
        alert('Please enter your email, phone, or username');
        return;
      }

      if (validateEmail(identifier)) {
        sendResetLink(identifier);
      } else if (validatePhone(identifier)) {
        sendOTP(identifier);
      } else {
        alert('Invalid input. Please enter a valid Email or 10-digit Phone Number.');
      }
    }

    function validateEmail(email) {
      return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    }

    function validatePhone(phone) {
      return /^[0-9]{10}$/.test(phone);
    }

    function sendResetLink(email) {
      const resetLink = `https://yourwebsite.com/reset-password?email=${encodeURIComponent(email)}`;
      const templateParams = {
        email: email,
        reset_link: resetLink
      };

      emailjs.send('service_id', 'template_id', templateParams)
        .then(response => {
          document.getElementById('message').innerHTML = 'Password reset link sent! Check your email.';
          document.getElementById('message').classList.add('text-success');
        })
        .catch(error => {
          console.log('Error sending email', error);
          alert('Error sending email. Please try again later.');
        });
    }

    function sendOTP(phone) {
      const otp = Math.floor(100000 + Math.random() * 900000);
      localStorage.setItem('otp', otp);  

      console.log("OTP is:", otp); 
      document.getElementById('otpSection').style.display = 'block';
      document.getElementById('message').innerHTML = 'OTP sent to your phone. Please enter it below.';
      document.getElementById('message').classList.add('text-primary');
    }

    function verifyOTP() {
      const enteredOTP = document.getElementById('otp').value;
      const correctOTP = localStorage.getItem('otp');

      if (enteredOTP === correctOTP) {
        document.getElementById('message').innerHTML = 'OTP verified successfully! You can now reset your password.';
        document.getElementById('message').classList.add('text-success');
      } else {
        document.getElementById('message').innerHTML = 'Incorrect OTP. Please try again.';
        document.getElementById('message').classList.add('text-danger');
      }
    }
  </script>

</body>
</html>