var express = require("express");
var router = express.Router();
const { database } = require("../config/helpers");

/* GET all products. */
router.get("/", function (req, res) {
	let page =
		req.query.page !== undefined && req.query.page !== 0 ? req.query.page : 1; // set current page number

	const limit =
		req.query.limit !== undefined && req.query.limit !== 0
			? req.query.limit
			: 10; // set the limit of items per page

	let startVal, endVal;
	if (page > 0) {
		startVal = page * limit - limit; // 0, 10, 20, 30
		endVal = page * limit;
	} else {
		startVal = 0;
		endVal = 10;
	}

	database
		.table("products as p")
		.join([
			{
				table: "categories as c",
				on: "c.id = p.cat_id",
			},
		])
		.withFields([
			"c.title as category",
			"p.title as name",
			"p.price",
			"p.quantity",
			"p.image",
			"p.id",
		])
		.slice(startVal, endVal)
		.sort({ id: 0.1 })
		.getAll()
		.then((prods) => {
			if (prods.length > 0) {
				res.status(200).json({
					count: prods.length,
					products: prods,
				});
			} else {
				res.json({ message: "No products found" });
			}
		})
		.catch((err) => console.log(err));
});

/* GET Single product */
router.get("/:prodId", (req, res) => {
	let prodId = req.params.prodId;
	console.log(prodId);

	database
		.table("products as p")
		.join([
			{
				table: "categories as c",
				on: "c.id = p.cat_id",
			},
		])
		.withFields([
			"c.title as category",
			"p.title as name",
			"p.price",
			"p.quantity",
			"p.image",
			"p.images",
			"p.id",
		])
		.filter({ "p.id": prodId })
		.get()
		.then((prod) => {
			if (prod) {
				res.status(200).json(prod);
			} else {
				res.json({
					message: `No product found with product id matching ${prodId}`,
				});
			}
		})
		.catch((err) => console.log(err));
});

/* GET All products from one particular category */
router.get(`/category/:catName`, (req, res) => {
	let page =
		req.query.page !== undefined && req.query.page !== 0 ? req.query.page : 1; // set current page number

	const limit =
		req.query.limit !== undefined && req.query.limit !== 0
			? req.query.limit
			: 10; // set the limit of items per page

	let startVal, endVal;
	if (page > 0) {
		startVal = page * limit - limit; // 0, 10, 20, 30
		endVal = page * limit;
	} else {
		startVal = 0;
		endVal = 10;
	}

	const catTitle = req.params.catName;

	database
		.table("products as p")
		.join([
			{
				table: "categories as c",
				on: `c.id = p.cat_id where c.title like '%${catTitle}%'`,
			},
		])
		.withFields([
			"c.title as category",
			"p.title as name",
			"p.price",
			"p.quantity",
			"p.image",
			"p.id",
		])
		.slice(startVal, endVal)
		.sort({ id: 0.1 })
		.getAll()
		.then((prods) => {
			if (prods.length > 0) {
				res.status(200).json({
					count: prods.length,
					products: prods,
				});
			} else {
				res.json({ message: `No products found from ${catTitle} category` });
			}
		})
		.catch((err) => console.log(err));
});

module.exports = router;
