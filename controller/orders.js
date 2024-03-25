/* eslint-disable */
const { getDataBase } = require("../connect");
const { ObjectId } = require("mongodb");

const createOrder = async (req, res) => {
    try {
       
    } catch (error) {
        console.log("ERROR!", error)
        res.status(500).json({
            message: "Algo salió mal"
        })
    }
};

const getOrders = async (req, res) => {
    try {
      
    } catch (error) {
        console.log("ERROR!", error)
        res.status(500).json({
            message: "Algo salió mal"
        })
    }
}

const getOrderById = async (req, res) => {
    try {

    } catch (error) {
        console.log("ERROR!", error)
        res.status(500).json({
            message: "Algo salió mal"
        })
    }
}

const updateOrder = async (req, res) => {
    try {
       
    } catch (error) {
        console.log("ERROR!", error)
        res.status(500).json({
            message: "Algo salió mal"
        })
    }
}

const deleteOrder = async (req, res) => {
    try {
       
    } catch (error) {
        console.log("ERROR!", error)
        res.status(500).json({
            message: "Algo salió mal"
        })
    }
}

module.exports = { createOrder, getOrders, getOrderById, updateOrder, deleteOrder };