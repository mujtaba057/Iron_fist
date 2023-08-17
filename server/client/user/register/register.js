const form = document.getElementById("form");
const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const progressBar = document.getElementById("progress-bar");

function nextStep() {
  if (validateStep1()) {
    step1.style.display = "none";
    step2.style.display = "block";
    progressBar.style.width = "50%";
  }
}

function validateStep1() {
  let isValid = true;
  const name = document.getElementById("name");
  const email = document.getElementById("email");
  const password = document.getElementById("password");
  const repassword = document.getElementById("repassword");
  const dob = document.getElementById("dob");
  const gender = document.getElementsByName("gender");

  if (name.value === "") {
    isValid = false;
    name.classList.add("invalid");
  } else {
    name.classList.remove("invalid");
  }

  if (email.value === "") {
    isValid = false;
    email.classList.add("invalid");
  } else {
    email.classList.remove("invalid");
  }

  if (password.value === "") {
    isValid = false;
    password.classList.add("invalid");
  } else {
    password.classList.remove("invalid");
  }

  if (repassword.value === "" || repassword.value !== password.value) {
    isValid = false;
    repassword.classList.add("invalid");
  } else {
    repassword.classList.remove("invalid");
  }

  if (dob.value === "") {
    isValid = false;
    dob.classList.add("invalid");
  } else {
    dob.classList.remove("invalid");
  }

  let isGenderSelected = false;
  for (let i = 0; i < gender.length; i++) {
    if (gender[i].checked) {
      isGenderSelected = true;
      break;
    }
  }

  if (!isGenderSelected) {
    isValid = false;
    gender[0].classList.add("invalid");
  } else {
    gender[0].classList.remove("invalid");
  }

  return isValid;
}

function submitForm() {
  if (validateStep2()) {
    form.submit();
  }
}

function validateStep2() {
  let isValid = true;
  const cardName = document.getElementById("card-name");
  const cardNumber = document.getElementById("card-number");
  const expDate = document.getElementById("exp-date");
  const cvv = document.getElementById("cvv");
  const razorpayId = document.getElementById("razorpay-id");

  if (cardName.value === "") {
    isValid = false;
    cardName.classList.add("invalid");
  } else {
    cardName.classList.remove("invalid");
  }

  if (cardNumber.value === "") {
    isValid = false;
    cardNumber.classList.add("invalid");
  } else {
    cardNumber.classList.remove("invalid");
  }

  if (expDate.value === "") {
    isValid = false;
    expDate.classList.add("invalid");
  } else {
    expDate.classList.remove("invalid");
  }

  if (cvv.value === "") {
    isValid = false;
    cvv.classList.add("invalid");
  } else {
    cvv.classList.remove("invalid");
  }

  if (razorpayId.value === "") {
    isValid = false;
    razorpayId.classList.add("invalid");
  } else {
    razorpayId.classList.remove("invalid");
  }

  return isValid;
}
async function register(event) {
  event.preventDefault();
  try {
    let formData = new FormData(event.target);
    const plainFormData = Object.fromEntries(formData.entries());
    const res = await fetch(`http://localhost:5123/api/user/register`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(plainFormData),
    });
    console.log(res.ok);
    if (!res.ok) {
      console.log("error");
      const error = new Error("HTTP error, status = " + res.status);
      error.data = await res.json();
    //   console.log(error.data)
      throw error;
    }
    const data = await res.json();
    console.log(data);
    if (data.access) window.location.href = "../login/login.html";
  } catch (error) {
    console.log(error.data);
     if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later')
  }
}
