const app = require("express").Router();

app.get("/", (req, res) => {
    res.render("index", {
        user: req.session.user || null,
        bot: req.app.get("DISCORD_CLIENT")
    });
});

app.get("/commands", (req, res) => {
    res.render("commands", {
        user: req.session.user || null,
        bot: req.app.get("DISCORD_CLIENT")
    });
});

app.get("/invite", (req, res) => {
    const url = `https://discord.com/oauth2/authorize?client_id=${req.app.get("DISCORD_CLIENT").user.id}&scope=bot&permissions=388160`;
    return res.redirect(url);
});

app.get("/discord", (req, res) => {
    const url = req.app.get("DISCORD_CLIENT").config.DISCORD_INVITE;
    return res.redirect(url);
});

module.exports = app;