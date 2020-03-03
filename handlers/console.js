module.exports = (client) => {
    let prompt = process.openStdin()
    prompt.addListener("data", res => {
        let x = res.toString().trim().split(/ +/g)
        client.fetchUser("177578480899325952", false).then(user => {
            user.send(x.join(" "));
        });
    });
}