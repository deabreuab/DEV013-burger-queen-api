/* eslint-disable */
const { getDataBase } = require(".././connect");
const jwt = require("jsonwebtoken");
const config = require("../config");
const bcrypt = require("bcrypt");

const { secret } = config;

module.exports = (app, nextMain) => {
    app.post("/login", async (req, res, next) => {
      // console.log("ENTRO AQUI")
        const { email, password } = req.body;
        if (!email || !password) {
            // return next(400);
            return res.status(400).json({
              error: "Email o contraseña no ingresados, por favor verifique de nuevo los campos obligatorios"
            })
        }
        // console.log("YA AQUI NO")
        const collection = getDataBase().collection("users");
        const userInfoDb = await collection.findOne({ email: email });
        if (userInfoDb == null) {
            return res.status(404).json({
                error: "El email es invalido, por favor intente de nuevo con información válida",
            });
        }
        // console.log("Y AQUI?")
        const { _id, role } = userInfoDb;
        if (await bcrypt.compare(password, userInfoDb.password)) {
            const accessToken = jwt.sign({ uid: _id, role: role, email: email }, secret);
            console.log("Este es mi token de acceso JWT", accessToken);
            return res.json({
                accessToken: accessToken,
                user: {
                    id: _id,
                    email: email,
                    role: role,
                },
              });
            } else {
              return res.status(404).json({
                error: "contraseña incorrecta, por favor intentelo de nuevo"
              })
            }
            // TODO: Authenticate the user
            // It is necessary to confirm if the email and password
            // match a user in the database
            // If they match, send an access token created with JWT
            
          });

    return nextMain();
};
