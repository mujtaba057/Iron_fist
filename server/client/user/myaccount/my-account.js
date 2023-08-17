//dropdown js
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

window.onclick = function (event) {
  if (!event.target.matches(".dropbtn")) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains("show")) {
        openDropdown.classList.remove("show");
      }
    }
  }
};

async function fetchDetails() {
  try {
    const wallet = document.getElementById("wallet");
    const username = document.getElementById('username')
    const useremail = document.getElementById('useremail')
    const response = await fetch(`http://localhost:5123/api/user/details`, {
      method: "get",
      headers: {
        token: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      const error = new Error("HTTP error, status = " + response.status);
      error.data = await response.json();
      console.log(error.data);
      throw error;
    }
    const data = await response.json();
    wallet.innerText = data.details.wallet;
    useremail.innerText = data.details.email
    username.innerText = data.details.username
  } catch (error) {
    console.log(error);
    console.log(error.data);
     if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later');
  }
}
async function addToWallet(e) {
  try {
    e.preventDefault();
    let formData = new FormData(e.target);
    const plainFormData = Object.fromEntries(formData.entries());
    const amount = document.getElementById("amount");
    const upi = document.getElementById('upi')
    const upiId = upi.value
      // Regular expression pattern for UPI ID validation
      var upiPattern = /^[\w.-]+@[\w]+$/;
    
      // Check if the UPI ID matches the pattern
      if (!upiPattern.test(upiId)) 
        return alert('enter valid upi id'); // Valid UPI ID
    if (amount.value < 15) return alert("enter amount above 14 rs");
    const response = await fetch("http://localhost:5123/api/user/addtowallet", {
      method: "post",
      headers: {
        token: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(plainFormData),
    });
    if (!response.ok) {
      const error = new Error("HTTP error, status = " + response.status);
      error.data = await response.json();
      console.log(error.data);
      throw error;
    }
    const data = await response.json();
    alert(data.msg)
    // location.reload()
    fetchDetails()
  } catch (error) {
    console.log(error);
    console.log(error.data);
     if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later');
  }
}
