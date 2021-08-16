const Mysqli = require("mysqli");

let conn = new Mysqli({
	host: "localhost",
	post: 3306, //port, default 3306
	user: "root", //user name
	passwd: "password", //password
	db: "mega_shop",
});

let db = conn.emit(false, "");

module.exports = {
	database: db,
};
