async function fetchPasses() {
  try {
    const response = await fetch(`http://localhost:5123/api/user/passes`, {
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
    console.log(data);
    if (data.access) {
      const container = document.getElementById("container");
      container.innerHTML = "";
      data.passes.forEach((element) => {
        // Create a new element from the HTML string
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
        <div class="card-header">
        <h2>${element.gym_name}</h2>
      </div>
      <div class="card-body">
        <h3>Token Number : ${element.token}</h3>
        <h3>Days Left : ${element.days}</h3>
        <div class="card-buttons">
          <a href="../gym/gym.html?gymId=${element.gym_id}" class="btn btn-primary">VIEW</a>
        </div>
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
