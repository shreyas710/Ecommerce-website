var express = require("express");
var router = express.Router();
const { database } = require("../config/helpers");

/* GET all orders */
router.get(`/`, (req, res) => {
	database
		.table(`orders_details as od`)
		.join([
			{
				table: `orders as o`,
				on: `o.id = od.order_id`,
			},
			{
				table: `products as p`,
				on: `p.id = od.product_id`,
			},
			{
				table: `users as u`,
				on: `u.id = o.user_id`,
			},
		])
		.withFields([
			`o.id`,
			`p.title as name`,
			`p.description`,
			`p.price`,
			`u.username`,
		])
		.sort({ id: 1 })
		.getAll()
		.then((orders) => {
			if (orders.length > 0) {
				res.status(200).json(orders);
			} else {
				res.json({ message: `No orders found` });
			}
		})
		.catch((err) => console.log(err));
});

/* GET single order */
router.get(`/:orderId`, (req, res) => {
	const orderId = req.params.orderId;

	database
		.table(`orders_details as od`)
		.join([
			{
				table: `orders as o`,
				on: `o.id = od.order_id`,
			},
			{
				table: `products as p`,
				on: `p.id = od.product_id`,
			},
			{
				table: `users as u`,
				on: `u.id = o.user_id`,
			},
		])
		.withFields([
			`o.id`,
			`p.title as name`,
			`p.description`,
			`p.price`,
			`u.username`,
			`p.image`,
			`od.quantity as quantityOrdered`,
		])
		.filter({ "o.id": orderId })
		.getAll()
		.then((orders) => {
			if (orders.length > 0) {
				res.status(200).json(orders);
			} else {
				res.json({ message: `No order found with orderId ${orderId}` });
			}
		})
		.catch((err) => console.log(err));
});

/* POST new order */
router.post(`/new`, async (req, res) => {
	let { userId, products } = req.body;

	if (userId !== null && userId > 0 && !isNaN(userId)) {
		database
			.table("orders")
			.insert({
				user_id: userId,
			})
			.then((newOrderId) => {
				if (newOrderId.insertId > 0) {
					products.forEach(async (p) => {
						let data = await database
							.table("products")
							.filter({ id: p.id })
							.withFields(["quantity"])
							.get();

						let inCart = parseInt(p.incart);

						// Deduct the number of pieces ordered from the quantity in database

						if (data.quantity > 0) {
							data.quantity = data.quantity - inCart;

							if (data.quantity < 0) {
								data.quantity = 0;
							}
						} else {
							data.quantity = 0;
						}

						// Insert order details w.r.t the newly created order Id
						database
							.table("orders_details")
							.insert({
								order_id: newOrderId.insertId,
								product_id: p.id,
								quantity: inCart,
							})
							.then((newId) => {
								database
									.table("products")
									.filter({ id: p.id })
									.update({
										quantity: data.quantity,
									})
									.then((successNum) => {})
									.catch((err) => console.log(err));
							})
							.catch((err) => console.log(err));
					});
				} else {
					res.json({
						message: "New order failed while adding order details",
						success: false,
					});
				}
				res.json({
					message: `Order successfully placed with order id ${newOrderId.insertId}`,
					success: true,
					order_id: newOrderId.insertId,
					products: products,
				});
			})
			.catch((err) => console.log(err));
	} else {
		res.json({ message: "New order failed", success: false });
	}
});

/* Fake Payment */
router.post(`/payment`, (req, res) => {
	setTimeout(() => {
		res.status(200).json({ success: true });
	}, 3000);
});

module.exports = router;
