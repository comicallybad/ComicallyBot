module.exports = (client) => {
    let prompt = process.openStdin()
    prompt.addListener("DiscordAPIError", res => {
        let x = res.toString().trim().split(/ +/g)
        client.fetchUser(`${process.env.USERID}`, false).then(user => {
            user.send(x.join(" "));
        });
    });

    prompt.addListener("TypeError", res => {
        let x = res.toString().trim().split(/ +/g)
        client.fetchUser(`${process.env.USERID}`, false).then(user => {
            user.send(x.join(" "));
        });
    });
}