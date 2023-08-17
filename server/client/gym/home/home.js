let details;
async function fetchDetails() {
  try {
    const wallet = document.getElementById("wallet");
    const name = document.getElementById('name')
    const response = await fetch(`http://localhost:5123/api/gym/details`, {
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
    details = data.details;
    wallet.innerText = data.details.wallet;
    name.innerText = data.details.name
    const response2 = await fetch(`http://localhost:5123/api/gym/history`, {
      method: "get",
      headers: {
        token: localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
    });
    if (!response2.ok) {
      const error = new Error("HTTP error, status = " + response2.status);
      error.data = await response2.json();
      console.log(error.data);
      throw error;
    }
    const data2 = await response2.json();
    console.log(data2);
    const history = document.getElementById("history-table");
    data2.history.forEach((element, index) => {
      const row = document.createElement("tr");

      row.innerHTML = `
            <td>${index + 1}</td>
            <td>${element.user_name}</td>
            <td>${element.amount}</td>
            <td>${element.gym_date.substring(0, 10)}</td>
            <td>${element.user_phone}</td>
          `;
      history.appendChild(row);
    });
  } catch (error) {
    console.log(error);
    if (error.data.msg)
    return alert(error.data.msg)
  alert('something went wrong, try later');
  }
}
async function moveAmount(e) {
  try {
    e.preventDefault();
    let formData = new FormData(e.target);
    const plainFormData = Object.fromEntries(formData.entries());
    const amount = document.getElementById("amount");
    const upi = document.getElementById("upi");
    const upiId = upi.value;
    // Regular expression pattern for UPI ID validation
    var upiPattern = /^[\w.-]+@[\w]+$/;

    // Check if the UPI ID matches the pattern
    if (!upiPattern.test(upiId)) return alert("enter valid upi id"); // Valid UPI ID
    if (amount.value < 15) return alert("enter amount above 14 rs");
    const response = await fetch(
      "http://localhost:5123/api/gym/movetoaccount",
      {
        method: "post",
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(plainFormData),
      }
    );
    if (!response.ok) {
      const error = new Error("HTTP error, status = " + response.status);
      error.data = await response.json();
      console.log(error.data);
      throw error;
    }
    const data = await response.json();
    alert(data.msg);
    // location.reload()
    fetchDetails();
  } catch (error) {
    console.log(error);
    console.log(error.data);
    if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later');
  }
}
async function verifyToken(e) {
  try {
    e.preventDefault();
    let formData = new FormData(e.target);
    formData.append("category", details.category);
    formData.append("gym_name", details.name);
    const plainFormData = Object.fromEntries(formData.entries());
    const response = await fetch("http://localhost:5123/api/gym/verifytoken", {
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
    if (data.access) {
      alert(data.msg);
      location.reload();
    }
  } catch (error) {
    console.log(error);
    console.log(error.data);
    if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later')
  }
}
