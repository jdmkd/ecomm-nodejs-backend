const Order = require('../model/orderModel');
const Product = require('../model/productModel');

// Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
        .populate('couponCode', 'id couponCode discountType discountAmount')
        .populate('userID', 'id name').sort({ _id: -1 });
        res.json({ success: true, message: "Orders retrieved successfully.", data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get orders by user ID
const getOrdersByUserId = async (req, res) => {
    try {
        const userId = req.params.userId;
        const orders = await Order.find({ userID: userId })
            .populate('couponCode', 'id couponCode discountType discountAmount')
            .populate('userID', 'id name')
            .sort({ _id: -1 });
        res.json({ success: true, message: "Orders retrieved successfully.", data: orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get an order by ID
const getOrderById = async (req, res) => {
    try {
        const orderID = req.params.id;
        const order = await Order.findById(orderID)
            .populate('couponCode', 'id couponCode discountType discountAmount')
            .populate('userID', 'id name');
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        res.json({ success: true, message: "Order retrieved successfully.", data: order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create a new order
const createOrder = async (req, res) => {
    const { 
        userID, 
        orderStatus = "pending", 
        items, 
        totalPrice, 
        shippingAddress, 
        paymentMethod, 
        couponCode, 
        orderTotal, 
        trackingUrl 
    } = req.body;
    
    if (
        !userID ||
        !Array.isArray(items) || items.length === 0 || 
        // !items || 
        !totalPrice || 
        !shippingAddress || 
        !paymentMethod || 
        !orderTotal
    ) {
        return res.status(400).json({ 
            success: false, 
            message: "User ID, items, totalPrice, shippingAddress, paymentMethod, and orderTotal are required." 
        });
    }

    try {
        
        for (const item of items) {
            const { productID, quantity } = item;

            const product = await Product.findById(productID);
            if (!product) {
                return res.status(404).json({ success: false, message: `Product with ID ${productID} not found.` });
            }

            if (product.quantity < quantity) {
                return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${quantity}` });
            }

            product.quantity -= quantity;
            await product.save();
            // console.log("product.quantity ==>",product.quantity)
            // console.log("product.save() !!!!!!!!!!!!!")
            item.productName = product.name;
            item.price = product.offerPrice || product.price;
        }


        const order = new Order({ userID, 
            orderStatus, 
            items, 
            totalPrice, 
            shippingAddress, 
            paymentMethod, 
            couponCode, 
            orderTotal, 
            trackingUrl 
        });
        const newOrder = await order.save();
        console.log("Order Created successfully!!!!!!")
        res.json({ 
            success: true, 
            message: "Order created and product quantity updated successfully.", 
            data: null 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update an order
const updateOrder = async (req, res) => {
    try {
        const orderID = req.params.id;
        const { orderStatus, trackingUrl } = req.body;

        if (!orderStatus) {
            return res.status(400).json({ success: false, message: "Order Status required." });
        }

        const updatedOrder = await Order.findByIdAndUpdate(
            orderID,
            { orderStatus, trackingUrl },
            { new: true }
        );

        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }

        res.json({ success: true, message: "Order updated successfully.", data: null });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete an order
const deleteOrder = async (req, res) => {
    const orderID = req.params.id;

    try {
        const deletedOrder = await Order.findByIdAndDelete(orderID);
        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: "Order not found." });
        }
        res.json({ success: true, message: "Order deleted successfully." });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllOrders,
    getOrdersByUserId,
    getOrderById,
    createOrder,
    updateOrder,
    deleteOrder
};