const express = require("express");
const app = express();
const router = express.Router();
const pool = require("./../database");

// GET
router.get("/", (req, res) => {
	pool.query("SELECT * from meals", function(error, results, fields) {
		res.json(results);
	});
});

// POST
router.post("/", (req, res) => {
	let { title, maxNumberOfGuests, description, createdAt, price } = req.body;
	const meal = {
		title: title,
		maxNumberOfGuests: Number(maxNumberOfGuests),
		description: description,
		createdAt: "20200202",
		price: Number(price)
	};
	pool.query("INSERT INTO meals SET ?", meal, (error, results, fields) => {
		if (error) {
			res.status(500).send(error);
		} else {
			res.send("Saved");
		}
	});
});

// GET by id
router.get("/:id", (req, res) => {
	const { id } = req.params;
	pool.query(`SELECT * FROM meals WHERE id = ${id}`, function(
		error,
		results,
		fields
	) {
		if (error) {
			return res.status(500).send(error);
		}
		res.json(results);
	});
});

// PUT by id
router.put("/:id", (req, res) => {
	const idFromQuery = req.params.id;
	pool.query(
		"UPDATE meals SET title=?, description=?,price=? where id=?",
		[req.body.title, req.body.description, req.body.price, Number(idFromQuery)],
		function(error, results, fields) {
			if (error) {
				return res.send(error);
			}
			res.send(`Meal with id ${idFromQuery} is updated`);
		}
	);
});

// DELETE
router.put("/:id", (req, res) => {
	const idFromQuery = req.params.id;
	pool.query(`DELETE FROM meals WHERE id = ${id}`, function(
		error,
		results,
		fields
	) {
		if (error) {
			return res.send(error);
		}
		res.send(`Meal with id ${idFromQuery} is deleted`);
	});
});

// GET api/meals/ query parameters
router.get("/", (req, res) => {
	const { maxPrice } = req.query;
	const { availableReservations } = req.query;
	const { title } = req.query;
	const { createdAfter } = req.query;
	const { limit } = req.query;
	if (maxPrice) {
		pool.query(`SELECT * FROM meals WHERE price >= ${maxPrice}`, function(
			error,
			results,
			fields
		) {
			res.json(results);
		});
	}
	if (availableReservations) {
		pool.query(
			`SELECT meals.id AS id, meals.title AS title,  
    SUM(reservations.numberOfGuests), 
    meals.maxReservations 
    FROM meals 
    JOIN reservations ON reservations.meal_id = meals.id
    WHERE reservations.numberOfGuests < meals.maxReservations
    GROUP BY reservations.meal_id`,
			function(error, results, fields) {
				if (error) {
					return res.send(error);
				}
				res.json(results);
			}
		);
  }
  if (title) {
    const Title = title.trim().replace(/[^\w\s]/gi, "");
    pool.query (`SELECT * FROM meals WHERE title LIKE '%${Title}%'`, function (error,results,fields) {
      if (error) {
        return response.send(error);
      }
      response.json(results);
    });
  }
  if (createdAfter) {
    pool.query (`SELECT * FROM meals WHERE createdAt >= '${createdAfter}'`,function (error, results, fields) {
        if (error) {
          return response.send(error);
        }
        response.json(results);
      }
    );
  }
  if (limit) {
    pool.query (`SELECT * FROM meals LIMIT ${limit}`, function(error,results,fields ) {
      if (error) {
        return response.send(error);
      }
      response.json(results);
    });
  } else {
    pool.query ('SELECT * FROM meals', function(error, results, fields) {
      if (error) {
        return response.send(error);
      }
      response.json(results);
    });
  }
});

module.exports = router;
