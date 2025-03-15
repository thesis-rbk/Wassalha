const prisma = require("../../prisma");

const notification = async (req, res) => {
    const { title, body, token } = req.body
    if (!token || body || title) {
        return res.status(404).send("token or title or body not found")
    }
    const message = {
        notification: {
            title,
            body
        },
        token
    }
    try {
        const result = await admin.messaging().send(message)
        console.log("successfully send", result)
        res.status(200).send({ "message succ:": result })
    } catch (err) {
        console.log("notificationnnnnnnnnnnn err", err)
        res.status(400).send({ "message err:": err })
    }
}

module.exports = { notification }