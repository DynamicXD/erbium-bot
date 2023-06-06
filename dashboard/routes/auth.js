const app = require("express").Router();
const FormData = require("@discordjs/form-data");
const { User, Permissions, Guild } = require("discord.js");
const Logger = require("../../utils/Logger");

app.get("/", (req, res) => {
    if (req.session.user) return res.redirect("/");

    const client = req.app.get("DISCORD_CLIENT");
    const config = client.config;
    const URL = config.AUTH_URL
        .replace(/{CLIENT_ID}/, client.user.id)
        .replace(/{REDIRECT_URI}/, encodeURIComponent(config.REDIRECT_URI))
        .replace(/{SCOPES}/, config.SCOPES.join("%20"));

    return res.redirect(URL);
})

app.get("/callback", (req, res) => {
    if (req.session.user) return res.redirect("/");

    const client = req.app.get("DISCORD_CLIENT");
    const config = client.config;
    const accessCode = req.query.code;
    if (!accessCode) return res.redirect("/");

    const data = new FormData();
    data.append("client_id", client.user.id);
    data.append("client_secret", config.CLIENT_SECRET);
    data.append("grant_type", "authorization_code");
    data.append("redirect_uri", config.REDIRECT_URI);
    data.append("scope", config.SCOPES.join(" "));
    data.append("code", accessCode);

    fetch(config.AUTH_TOKEN_URL, {
        method: "POST",
        body: data
    })
        .then(response => response.json())
        .then(async data => {
            let user = await fetchUser(data, config, res);
            user = new User(client, user);

            const guilds = await fetchGuilds(data, config, res);

            user.guilds = guilds.map(m => {
                let g = new Guild(client, m);
                
                const perms = new Permissions(BigInt(m.permissions)).toArray();

                g.permissions = perms;

                return g;
            });

            req.session.user = {
                ...user,
                dev: client.config.OWNER.includes(user.id)
            };

            return res.redirect("/dashboard");
        })
        .catch((e) => {
            Logger.error(`[AUTH] ${e}`);
            res.redirect("/");
        });
})

app.get("/logout", (req, res) => {
    if (!req.session.user) return res.redirect("/");
    req.session.destroy(err => { /* Do nothing */ });
    return res.redirect("/");
});

function fetchUser(data, config, res) {
    if (!data.token_type || !data.access_token) return res.redirect("/");

    return fetch(config.AUTH_GET_USER, {
        headers: {
            authorization: `${data.token_type} ${data.access_token}`
        }
    })
        .then(response => response.json())
}

function fetchGuilds(data, config, res) {
    if (!data.token_type || !data.access_token) return res.redirect("/");

    return fetch(config.AUTH_GET_USER_GUILDS, {
        headers: {
            authorization: `${data.token_type} ${data.access_token}`
        }
    })
        .then(response => response.json())
}

module.exports = app;