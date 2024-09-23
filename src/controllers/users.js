const fs = require('fs')
const path = require('path');

function getUser({email}){
    console.log(email, "this is event->")
    const filePath = path.join(__dirname, 'dataseeder', 'users.json');

    // Read the file synchronously
    const data = fs.readFileSync(filePath, 'utf8');

    // Parse the JSON data
    const users = JSON.parse(data);
    const user = users.filter((u)=> u.Email == email)
    console.log(user, 'this is user')
    return user
}


module.exports = {
    getUser
}