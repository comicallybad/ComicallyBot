module.exports = async (client, node, error) => {
    if (error.message.includes("ready")) return;
    console.error(error)
}