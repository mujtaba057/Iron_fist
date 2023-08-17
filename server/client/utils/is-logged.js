const isLogged = () => {
  let role;
  try {
    let token = localStorage.getItem("token");
    if (!token) return false;
    token = JSON.parse(token);
    role = token.role;
    if (role != "user" && role != "gym") throw new Error("invalid user");
  } catch (error) {
    console.log(error);
    localStorage.removeItem("token");
    location.replace("/");
  }
  return role;
};

export default isLogged;
