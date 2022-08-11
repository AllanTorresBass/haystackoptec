export default class ScalableService {
	private readonly baseUrl: string = "https://www.optecanalytics.com/api";

	public async getTokenServiceFusion(): Promise<any> {
		// const token = await localStorage.getItemAsync('userToken');
		let json;
		try {
			const response = await fetch(
				"https://api.servicefusion.com/oauth/access_token",
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						grant_type: "client_credentials",
						client_id: "J0-fr2ywK5oczDQOne",
						client_secret: "wmO9_m2m9mAHA6_si2w3zXutfMiuBmJY",
					}),
				}
			);
			json = await response.json();
			// console.log(json.access_token);
		} catch (error) {
			console.log(
				"here, scalable.service.tsx line 28: without token or token old"
			);
			// console.error(error);
		}

		return json.access_token;
	}

	public async getJobsServiceFusion(customerName: any): Promise<any> {
		const tokenServiceFusion = await localStorage.getItemAsync(
			"tokenServiceFusion"
		);
		// console.log('Context tokenServiceFusion: ', tokenServiceFusion);
		let json;
		try {
			const response = await fetch(
				`https://api.servicefusion.com/v1/jobs?expand=equipment,techs_assigned&filters[customer_name]=${customerName}&page=1&per-page=50&fields=id,customer_id,customer_name,description, start_date, end_date,closed_at`,
				{
					method: "GET",
					headers: {
						Authorization: `Bearer ${tokenServiceFusion}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
				}
			);
			json = await response.json();
			// console.log('getJobsServiceFusion: ', json);
		} catch (error) {
			console.log(
				"here, scalable.service.tsx line 52: without token or token old"
			);
			// console.error(error);
		}

		return json.items;
	}

	public async getServiceFusionIdAndCustomerName(
		dropDown: string
	): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
		// console.log('dropDown: ', dropDown);
		let json;
		try {
			const response = await fetch(
				`https://www.optecanalytics.com/api/${dropDown}/eval`,
				{
					method: "POST",
					headers: {
						Authorization: `Bearer authToken=${token}`,
						"Content-Type": "application/json",
						Accept: "application/json",
					},
					body: JSON.stringify({
						_kind: "grid",
						meta: { ver: "3.0" },
						cols: [{ name: "expr" }],
						rows: [{ expr: `apiGetSites(["${dropDown}"])` }],
					}),
				}
			);

			json = await response.json();
			// console.log(json);
		} catch (error) {
			console.log("here, heystack.service.tsx line 87: getIssues");
		}

		return [json.rows[0].serviceFusionId, json.rows[0].dis];
	}
}
