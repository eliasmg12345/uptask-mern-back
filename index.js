import express from "express";
//const express = require('express')
import dotenv from "dotenv"
import cors from "cors"
import conectarDB from "./config/db.js";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import proyectoRoutes from "./routes/proyectoRoutes.js";
import tareaRoutes from "./routes/tareaRoutes.js";

const app = express();

app.use(express.json())

dotenv.config()

conectarDB()
//configurar cors
const whitelist = [process.env.FRONTEND_URL];

const corsOptions = {
    origin: function (origin, callback) {
        console.log(origin);
        if (whitelist.includes(origin)) {
            //puede consultar la API
            callback(null, true)
        } else {
            //No esta permitido
            callback(new Error("Error de Cors"))
        }
    }
}

app.use(cors(corsOptions))

//Routing
app.use("/api/usuarios", usuarioRoutes)
app.use("/api/proyectos", proyectoRoutes)
app.use("/api/tareas", tareaRoutes)

const PORT = process.env.PORT || 4000

const servidor = app.listen(PORT, () => {
    console.log(`servidor corriendo en ${PORT}`);
})

//SOCKET.IO

import { Server } from 'socket.io'

const io = new Server(servidor, {
    pingTiemout: 6000,
    cors: {
        origin: process.env.FRONTEND_URL,
    }
})


io.on('connection', (socket) => {
    console.log('conectado a socket.io');

    //definir los ecventos de socket io
    /*
    socket.on('prueba', (nombre) => {
        console.log('proeba desde socket io', nombre);
        socket.emit('respuesta', { nombre: "elias" })
    })
    */

    socket.on('abrir proyecto', (proyecto) => {
        socket.join(proyecto)
        //socket.emit('respuesta', { nombre: "Elias" })

    })

    socket.on('nueva tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea agregada', tarea)
    })

    socket.on('eliminar tarea', tarea => {
        const proyecto = tarea.proyecto
        socket.to(proyecto).emit('tarea eliminada', tarea)
    })

    socket.on('actualizar tarea', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('tarea actualizada', tarea)
    })

    socket.on('cambiar estado', tarea => {
        const proyecto = tarea.proyecto._id
        socket.to(proyecto).emit('nuevo estado', tarea)
    })

})