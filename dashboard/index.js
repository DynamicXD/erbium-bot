const express = require("express");
const app = express();
const client = require("../client");
const Logger = require("../utils/Logger");
const helmet = require("helmet");
const session = require("express-session");

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.static(`${__dirname}/public`));
app.use(express.static("assets"));
app.set("views", `${__dirname}/views`);
app.use(session({
    secret: client.config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.set("DISCORD_CLIENT", client);

// routes
app.use("/", require("./routes/main"));
app.use("/authorize", require("./routes/auth"));
app.use("/dashboard", require("./routes/dashboard"));

/* 404 */
app.all("*", (req, res) => {
    return res.status(404).render("error", {
        user: req.session.user || null,
        title: "404",
        message: "Page not found!",
        bot: app.get("DISCORD_CLIENT")
    });
});

/* 500 */
app.use((error, req, res, next) => {
    Logger.error(`[DASHBOARD] ${error}`);

    return res.status(500).render("error", {
        user: req.session.user || null,
        title: "500",
        message: "Internal Server Error",
        bot: app.get("DISCORD_CLIENT")
    });
});

app.listen(client.config.PORT, () => {
    Logger.info(`[Dashboard] Server running on PORT ::${client.config.PORT}::`);
});