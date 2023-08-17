// const fetchData = async  ()=>{
//     try {
//         const table = document.getElementById("demo")
//        const res = await fetch('http://localhost:5123')
//        const data = await res.json()
//        console.log(data)
//        for(let i = 0; i< data.msg.length; i++){
//         let row = table.insertRow(i + 1)
//         let id = row.insertCell(0)
//         id.innerHTML = data.msg[i].usrid
//         let name = row.insertCell(1)
//         name.innerHTML = data.msg[i].username
//         let salary = row.insertCell(2)
//         salary.innerHTML = data.msg[i].salary
//     }
//     } catch (error) {
//         console.log(error)
//     }
// }

