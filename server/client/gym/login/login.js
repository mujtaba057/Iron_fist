async function login(event) {
    try {
      event.preventDefault();
      let formData = new FormData(event.target);
      const plainFormData = Object.fromEntries(formData.entries());
      const res = await fetch(`http://localhost:5123/api/gym/login`, {
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(plainFormData),
      });
      console.log(res.ok);
      if (!res.ok) {
        console.log('error')
        const error = new Error("HTTP error, status = " + res.status);
        error.data = await res.json();
        throw error;
      }
      const data = await res.json();
      console.log(data.token);
      if (data.access){
        localStorage.setItem('token',JSON.stringify(data.token))
        window.location.href = "../home/home.html";
      }
    } catch (error) {
      console.log(error);
      if (error.data.msg == "user not found") return alert("user not found");
      else if (error.data.msg == "wrong password") return alert("wrong password");
      alert("somithing went wrong");
    }
  }