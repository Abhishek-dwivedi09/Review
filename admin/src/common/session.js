const checksession = (req) => {
    let sessionData
    if(!req.session.powerUser) {
        return sessionData = {
           userType: "home",
           isLogedIn:false
         }
       }
       if(req.session.powerUser) {
        return req.session.powerUser
       }
}

export default { checksession }
