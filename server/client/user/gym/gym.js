const urlParams = new URLSearchParams(window.location.search);
const paramsObj = Object.fromEntries(urlParams.entries());
const gymId = paramsObj.gymId;
let details;
async function fetchGym() {
  try {
    const gymName = document.getElementById("gym-name");
    const gymAddress = document.getElementById("gym-add");
    const gymLocation = document.getElementById("gym-loc");
    const category = document.getElementById("category");
    const price = document.getElementById("price");

    const facilities = document.getElementById("facilities");
    const tokenNumber = document.getElementById("token");
    const validity = document.getElementById("validity");
    const response = await fetch(
      `http://localhost:5123/api/user/gym/${gymId}`,
      {
        method: "get",
        headers: {
          "Content-Type": "application /json",
        },
      }
    );
    if (!response.ok) {
      const error = new Error("HTTP error, status = " + response.status);
      error.data = await response.json();
      console.log(error.data);
      throw error;
    }
    const data = await response.json();
    const gym = data.gym;
    details = data.gym;
    if (data.access) {
      gymName.innerText = gym.name;
      gymLocation.href = `https://www.google.com/maps/search/?api=1&query=${gym.latitude},${gym.longitude}`;
      gymAddress.innerText = gym.address;
      if(gym.category == 1){
        price.innerText = 70
        category.innerText = 'A';

      }
      else if(gym.category == 2){
        price.innerText = 40
        category.innerText = 'B';

      }
      else{
        price.innerText = 20
        category.innerText = 'C';

      }
      if (gym.parking) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "Parking";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.cardio) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "Cardio";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.ac) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "AC";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.gym) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "GYM";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.zumba) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "Zumba";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.yoga) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "Yoga";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.aerobic) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "Aerobic";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.strength) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "Strength";
        facilities.appendChild(facilitiesChild);
      }
      if (gym.crossfit) {
        const facilitiesChild = document.createElement("div");
        facilitiesChild.className = "facility";
        facilitiesChild.textContent = "Crossfit";
        facilities.appendChild(facilitiesChild);
      }
    }

    const response2 = await fetch(
      `http://localhost:5123/api/user/passes/${gymId}`,
      {
        method: "get",
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    if (!response2.ok) {
      const error = new Error("HTTP error, status = " + response2.status);
      error.data = await response2.json();
      console.log(error.data);
      throw error;
    }
    const data2 = await response2.json();
    console.log(data2);
    if (data2.access && data2.passes.length) {
      const pass = data2.passes[0];
      tokenNumber.innerText = pass.token;
      validity.innerText = pass.days;
    } else {
      const passes = document.getElementById("passes");
      const dayPass = document.createElement("button");
      dayPass.className = "button";
      dayPass.innerText = "Day Pass";
      dayPass.onclick = () => buyPass(1);
      passes.appendChild(dayPass);

      const monthlyPass = document.createElement("button");
      monthlyPass.className = "button";
      monthlyPass.innerText = "Monthly Pass";
      monthlyPass.onclick = () => buyPass(30);
      passes.appendChild(monthlyPass);
    }
    const response3 = await fetch(
      `http://localhost:5123/api/user/history/${gymId}`,
      {
        method: "get",
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
      }
    );
    if (!response3.ok) {
      const error = new Error("HTTP error, status = " + response3.status);
      error.data = await response3.json();
      console.log(error.data);
      throw error;
    }
    const data3 = await response3.json();
    console.log(data3);
    const history = document.getElementById("history");
    data3.history.forEach((element, index) => {
      const row = document.createElement("tr");
      row.innerHTML = `<td>${index + 1}</td>
      <td>${element.gym_date.substring(0, 10)}</td>
      <td>${element.amount}</td>`;
      history.appendChild(row);
    });
  } catch (error) {
    console.log(error);
    console.log(error.data);
     if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later');
  }
}
async function buyPass(days) {
  let day = "day";
  if (days != 1) day = "monthly";
  if (confirm(`Add ${day} pass`)) {
    try {
      // alert(JSON.stringify(details))
      const response = await fetch(`http://localhost:5123/api/user/buypass`, {
        method: "post",
        headers: {
          token: localStorage.getItem("token"),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 1,
          gym_id: gymId,
          days,
          gym_name : details.name,
          category: details.category,
        }),
      });
      if (!response.ok) {
        const error = new Error("HTTP error, status = " + response.status);
        error.data = await response.json();
        console.log(error.data);
        throw error;
      }
      const data = await response.json();
      console.log(data);
      if (data.access) location.reload();
    } catch (error) {
      console.log(error);
      console.log(error.data);
       if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later');
    }
  }
}
//model js
function myFunction() {
  document.getElementById("myDropdown").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
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
//model js end//