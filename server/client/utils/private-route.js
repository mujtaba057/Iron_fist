async function privateRoute(user) {
  try {
    let userRoute;
    if (user == "user") userRoute = "userauth";
    else userRoute = "gymauth";
    const response = await fetch(`http://localhost:5123/api/${userRoute}`, {
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
  } catch (error) {
    // console.log(error);
    // console.log(error.data);
    // localStorage.removeItem('token')
    // location.replace('/client')
    console.log(error);
    // alert(error.data.msg + '    hi')
    if (error.data.msg != "unauthorized access") {
      localStorage.removeItem("token");
      location.replace(`/${user}/login/login.html`);
    } else {
      if (user == "user") user = "gym";
      else user = "user";
      location.replace(`/${user}/home/home.html`);
    }
  }
}
export default privateRoute;
