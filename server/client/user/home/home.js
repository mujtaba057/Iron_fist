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
let latitude = 0,
  longitude = 0;
function getLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;
      fetchGYMS()
    });
  } if (navigator.permissions) {
    navigator.permissions.query({ name: 'geolocation' })
      .then(permissionStatus => {
        if (permissionStatus.state === 'denied') {
          alert('Give location permission.');
          // Perform actions when permission is denied
        }
      })
      .catch(error => {
        alert('Error checking geolocation permission:', error);
      });
  } else {
    alert('Geolocation permission API not supported.');
    // Handle the case when the API is not supported by the browser
  }
}
getLocation();
async function fetchGYMS() {
  try {
    
    console.log("hi");
    let text = document.getElementById("text");
    text = text.value;
    let category = document.getElementById("category");
    category = category.value;
    category;
    if (category == "A") category = 1;
    if (category == "B") category = 2;
    if (category == "C") category = 3;
    if (category == "All") category = 4;
    const response = await fetch(`http://localhost:5123/api/user/search`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        latitude,
        longitude,
        category,
      }),
    });
    console.log("hoeo");

    console.log(response.ok);
    if (!response.ok) {
      const error = new Error("HTTP error, status = " + response.status);
      error.data = await response.json();
      console.log(error.data);
      throw error;
    }
    const data = await response.json();
    console.log(data);
    if (data.access) {
      const container = document.getElementById("container");
      container.innerHTML = "";
      data.gym.forEach((element) => {
        // Create a new element from the HTML string
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <div class="card-header">
          <img src="https://via.placeholder.com/50x50" alt="Card image">
          <h2>${element.name}</h2>
        </div>
        <div class="card-body">
        <p>${element.address}</p>
          <p>distance : ${Math.trunc(element.distance)} km</p>
          <div class="card-buttons">
            <button class="btn btn-primary" onclick="openGymPage(${
              element.gym_id
            })">Explore</button>
          </div>
        `;

        // Append the new element to the container
        container.appendChild(card);
      });
    }
  } catch (error) {
    console.log(error);
    console.log(error.data);
     if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later');
  }
}
function openGymPage(gymId) {
  // alert(gymId)
  location.href = "../gym/gym.html?gymId=" + gymId;
}

function signOut() {
  // alert('hi')
  localStorage.removeItem("token");
  window.location.replace("/index.html");
}
