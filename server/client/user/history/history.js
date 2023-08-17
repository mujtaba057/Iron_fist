
async function fetchHistory(){
    try {
        const response = await fetch(
            `http://localhost:5123/api/user/history`,
            {
              method: "get",
              headers: {
                token: localStorage.getItem("token"),
                "Content-Type": "application/json",
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
          console.log(data);
          const history = document.getElementById("history");
          data.history.forEach((element, index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
              <td>${index + 1}</td>
              <td>${element.gym_date.substring(0, 10)}</td>
              <td>${element.gym_name}</td>
              <td>${element.amount}</td>
              <td><a href='../gym/gym.html?gymId=${element.gym_id}'>View</a></td>
            `;
            history.appendChild(row)
          });
          
    } catch (error) {
        console.log(error);
        console.log(error.data)
         if (error.data.msg)
      return alert(error.data.msg)
    alert('something went wrong, try later');
    }
}