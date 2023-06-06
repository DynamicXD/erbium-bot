const app = require("express").Router();
const checkAuth = require("../middleware/checkAuth");

app.get("/", checkAuth, (req, res) => {
    const user = req.session.user;

    res.render("dashboard/selector", {
        user: user || null,
        title: "Selector",
        bot: req.app.get("DISCORD_CLIENT")
    });
});

app.get("/:id", checkAuth, (req, res) => {
    const user = req.session.user;
    const guild = user.guilds.find(x => x.id === req.params.id);

    if (!guild || !guild.permissions.includes("MANAGE_GUILD")) return res.redirect("/404");

    res.render("dashboard/dashboard", {
        user: user || null,
        title: "Dashboard",
        bot: req.app.get("DISCORD_CLIENT"),
        guild: guild
    });
});

module.exports = app;