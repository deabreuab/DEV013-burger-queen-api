/* eslint-disable */
const { ObjectId } = require("mongodb");
const { getDataBase } = require("../connect");
const bcrypt = require("bcrypt");
// const roles [admin, waiter, chef]

module.exports = {
    createAdminUser: async (adminUser) => {
        try {
            const collection = getDataBase().collection("users");
            const { email, role } = adminUser;
            const filter = { email: email, role: role };
            const findResults = await collection.find(filter).toArray();
            // console.log(findResults);
            if (!findResults.length) {
                const creatingAdminUser = await collection.insertOne(adminUser);
                console.log(creatingAdminUser);
            }
        } catch (error) {
            console.log(error);
        }
    },

    getUsers: async (req, res) => {
        // TODO: Implement the necessary function to fetch the `users` collection or table
        // Hacer la paginacion, debe empezar en la pagina numero 1 y mostrar solo 10 elementos por pagina
        console.log("ESTE ES MI REQUEST .QUERY", req.query)
        console.log("ESTE ES MI REQUEST .PARAMS", req.params)
        console.log("ESTE ES EL REQ.USER", req.user)
        try {
            if(req.user.role !== 'admin'){
                return res.status(403).json({ error: "El usuario no tiene permisos para consultar la información"})
            }
            const collection = getDataBase().collection("users");
            // Para ocultar el password en la consulta
            const options = { projection: { password: 0 } };
            // Paginado
            // El req.query son todo lo que viene despues de mi ? en la url ?_limit=2&_page=2 *QUERY PARAMS* revisar params en PostMan
            const { _limit, _page } = req.query
            const limit = parseInt(_limit) || 10
            const page = parseInt(_page) || 1
            // El offset me indica desde que registro se va a traer la nueva información
            const offset = (page -1) * limit
            const findResults = await collection.find({}, options).skip(offset).limit(limit).toArray();
            res.json(findResults);
        } catch (error) {
            console.log("ERROR!", error);
            res.status(500).json({
                message: "Algo salió mal",
            });
        }
    },

    createUser: async (req, res) => {
        try {
            const collection = getDataBase().collection("users");
            const { email, role } = req.body;
            let password = req.body.password;
            console.log(password);
            if (!email || !req.body.password) {
                return res.status(400).json({
                    error: "No se ha ingresado un email o contraseña válido",
                });
            }
            // Verificar que el email es válido, si tiene un @ y un .
            const validationRegex = /^[\w.-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
            if (!validationRegex.test(email)) {
                return res.status(400).json({ error: "El email ingresado no es válido" });
            }
            // Verificar que la contraseña no sea vacia y sea >= 4 
            if(password.trim().length < 4){
                return res.status(400).json({ error: "La contraseña ingresada no es válida"})
            }
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(password, salt);
            password = hashedPassword;
            console.log(password);
            const emailExist = await collection.findOne({ email: email });
            console.log(emailExist);
            if (emailExist) {
                return res.status(403).json({
                    error: "El email ya esta en uso",
                });
            }
            const creatingUser = await collection.insertOne({
                email: email,
                password: password,
                role: role,
            });
            console.log(creatingUser);
            const { insertedId } = creatingUser;
            res.json({
                _id: insertedId,
                email: email,
                role: role,
            });
        } catch (error) {
            console.log("ERROR!", error);
            res.status(500).json({
                message: "Algo salió mal",
            });
        }
    },

    getUserById: async (req, res) => {
        // Error 401 si no hay header con autenticación
        // Error 403 si el token no es de un administrador
        // Error 403 si el token no es el mismo que del usuario del uid
        // Error 403 si un usuario que no es admin trata de cambiar su role
        console.log("PARAMS", req.params);
        console.log("USER", req.user);
        try {
            const collection = getDataBase().collection("users");
            const { uid } = req.params;
            const options = { projection: { password: 0 } };
            const filter = createFilter(uid)
            if(!filter){
                return res.status(400).json({ error: "Identificador inválido"})
            }
            const user = await collection.findOne(filter, options);
            if(!validateOwnerOrAdmin(req, uid)){
                return res.status(403).json({error: 'El usuario no tiene permisos para ver esta información'})
            }
            // if (req.user.role !== "admin") {
            //     if (uid !== req.user.uid && uid !== req.user.email) {
            //         return res.status(403).json({error: 'El usuario no tiene permisos para ver esta información'});
            //     }
            // }
            if (user === null) {
                return res.status(404).json({ error: "El usuario no existe" });
            }
            const { _id, email, role } = user;
            return res.json({
                id: _id,
                email: email,
                role: role,
            });

            // let user;
            // if(validationRegex.test(uid)){
            //     const filter = {email: uid};
            //     user = await collection.findOne(filter, options);
            // }else{
            //     if (uid.length < 24) {
            //             return res.status(400).send("userId invalido, debe ser una cadena de texto de 24 caracteres");
            //     }
            //     const filter = new ObjectId(uid);
            //     user = await collection.findOne(filter, options);
            // }
            // console.log("MI USUARIO", user);
            // const { _id, email, role } = user;
            // if(uid === _id || uid === email || req.user.role === 'admin'){
            //     console.log(true)
            // }else{
            //     console.log(false, _id, uid)
            // }
            // if (user === null) {
            //     return res.status(404).json({
            //         error: "El usuario no existe",
            //     });
            // }
            // res.json({
            //     id: _id,
            //     email: email,
            //     role: role,
            // });
        } catch (error) {
            console.log("ERROR!", error);
            res.status(500).json({
                message: "Algo salió mal",
            });
        }
    },

    updateUser: async (req, res) => {
        console.log("desde updateUser", req.body);
        console.log("ESTE ES EL REQUEST USER", req.user)
        try {
            const collection = getDataBase().collection("users");
            const { uid } = req.params;
            const options = { projection: { password: 0 } };
            // const validationRegex = /^[\w.-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
            // let filter;
            // if (validationRegex.test(uid)) {
            //     filter = { email: uid };
            // } else {
            //     if (uid.length < 24) {
            //         return res.status(400).json({error: "userId invalido, debe ser una cadena de texto de 24 caracteres"});
            //     }
            //     filter = new ObjectId(uid);
            // }
            const filter = createFilter(uid)
            // Negación puede ser falso, nulo o 0 
            if(!filter){
                return res.status(400).json({ error: "Identificador inválido"})
            }
            const user = await collection.findOne(filter, options);
            if(!validateOwnerOrAdmin(req, uid)){
                return res.status(403).json({error: 'El usuario no tiene permisos para ver esta información'})
            }
            if (user === null) {
                return res.status(404).json({ error: "El usuario no existe" });
            }
             // Aquí estoy validando si el objecto de req.body no tiene ninguna clave/llave dentro 
            if(Object.keys(req.body).length === 0 ){
                return res.status(400).json({ error: "No se ha enviado ninguna información para modificar"})
            }
            const { password } = req.body
            if(password){
                const salt = await bcrypt.genSalt();
                console.log("ESTA ES LA SALT", salt)
                const hashedPassword = await bcrypt.hash(password, salt);
                console.log("ESTE ES EL HASHEDPASSWORD", hashedPassword)
                req.body.password = hashedPassword
            }
            console.log("REQ BODY ACA", req.body)
            const updatingUser = {
                $set: req.body
            };
            // Validar el si esta intentando hacer un cambio de role, si el role del request y el role del user de la base de datos es diferente
            if(req.body.role && req.body.role !== user.role){
                if(req.user.role !== 'admin'){
                    return res.status(403).json({ error: "El usuario no tiene permisos para cambiar su rol"})
                }
            }
            const updatedUser = await collection.updateOne(filter, updatingUser);
            console.log("UPDATED EL USER", updatedUser)
            if(updatedUser.modifiedCount === 0){
                return res.status(400).json({ error: "No se realizó ningún cambio"})
            }
            const finalUserResult = await collection.findOne(filter, options);
            res.json(finalUserResult);
        } catch (error) {
            console.log("ERROR ACA!", error);
            res.status(500).json({
                message: "Algo salió mal",
            });
        }
    },

    deleteUser: async (req, res) => {
        // 401 si no hay header de autenticación
        // 403 si the authentication token is not from an admin or the same user as the uid

        try {
            const collection = getDataBase().collection("users");
            const { uid } = req.params;
            const options = { projection: { password: 0 } };
            const filter = createFilter(uid)
            if(!filter){
                return res.status(400).json({ error: "Identificador inválido"})
            }
            const user = await collection.findOne(filter, options);
            if(!validateOwnerOrAdmin(req, uid)){
                return res.status(403).json({error: 'El usuario no tiene permisos para ver esta información'})
            }
            if (user === null) {
                return res.status(404).json({
                    error: "El usuario que intentas eliminar no existe",
                });
            }
            const deleteResult = await collection.deleteOne(user);
            console.log(deleteResult);
            res.json(user);
        } catch (error) {
            console.log("ERROR!", error);
            res.status(500).json({
                message: "Algo salió mal",
            });
        }
    },
};

const validateOwnerOrAdmin = (req, uid) => {
    if (req.user.role !== "admin") {
        if (uid !== req.user.uid && uid !== req.user.email) {
           return false
        }
    }
    return true
}

const createFilter = (uid) => {
    let filter = null;
    const validationRegex = /^[\w.-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/;
    if (validationRegex.test(uid)) {
        filter = { email: uid };
    } else {
        if (uid.length >= 24) {
            filter = new ObjectId(uid);
        }
    }
    return filter;
}