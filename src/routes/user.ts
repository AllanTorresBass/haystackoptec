import { Response, Request, Router, NextFunction } from "express";
import HaystackAuth from "../../services/haystack.auth";
import User from "../../services/user";
import Encryptor from "../../services/encryptor";

const router = Router();

router.get("/user", async (req: Request, res: Response, next: NextFunction) => {
	console.log("Entre a user");
	const user = new User("atorres", "WW86S-CYZMD-3MNUT");
	const authenticator = new HaystackAuth(
		"https://optecanalytics.com",
		new Encryptor()
	);
	const response = await authenticator.processSignIn(user);
	console.log(response);

	return res.json(response);
});

export default router;
