import axios from "axios";

export default class HaystackService {
	private readonly baseUrl: string = "https://www.optecanalytics.com/api";

	public getNewDate = (numberDays: any) => {
		const today = new Date();

		const dateToday = JSON.stringify(today).split("T")[0].replace('"', "");
		const arrayDate = dateToday.split("-");
		const currentDay = parseInt(arrayDate[2]);
		let currentMonth: any = parseInt(arrayDate[1]);
		let currentYear = parseInt(arrayDate[0]);
		let newDay: any;
		let newMonth: any;

		// si es el primer día del mes
		if (currentDay === 1) {
			if (currentMonth === 1) {
				currentYear = currentYear - 1;
			}
			// si el mes es 2 tiene 28 dias
			if (currentMonth === 3) {
				const numberDay = numberDays - 1;
				newDay = 28 - numberDay;
				newMonth = currentMonth - 1;
				return `${currentYear}-${newMonth}-${newDay}`;
			}

			// si el mes es impar tiene 31 dias
			if (currentMonth % 2 === 0) {
				const numberDay = numberDays - 1;
				newDay = 31 - numberDay;
				newMonth = currentMonth > 1 ? currentMonth - 1 : 12;
				return `${currentYear}-${newMonth}-${newDay}`;
			}

			// si el mes par tiene 30 dias
			if (currentMonth % 2 === 1) {
				const numberDay = numberDays - 1;
				newDay = 30 - numberDay;
				newMonth = currentMonth > 1 ? currentMonth - 1 : 12;
				return `${currentYear}-${newMonth}-${newDay}`;
			}
		}

		if (currentDay === 2) {
			// si el mes es 2 tiene 28 dias

			if (currentMonth === 3) {
				const numberDay = numberDays - 1;
				newDay = 28 - numberDay;
				newMonth = currentMonth - 1;
				return `${currentYear}-${newMonth}-${newDay}`;
			}

			// si el mes es impar tiene 31 dias
			if (currentMonth % 2 === 0) {
				const numberDay = numberDays - 1;
				newDay = 31 - numberDay;
				newMonth = currentMonth > 1 ? currentMonth - 1 : 12;
				return `${currentYear}-${newMonth}-${newDay}`;
			}

			// si el mes par tiene 30 dias
			if (currentMonth % 2 === 1) {
				const numberDay = numberDays - 1;
				newDay = 30 - numberDay;
				newMonth = currentMonth > 1 ? currentMonth - 1 : 12;
				return `${currentYear}-${newMonth}-${newDay}`;
			}
		}
		if (currentDay > 2) {
			let daysMonth: number = 0;
			if (currentMonth === 1) {
				currentYear = currentYear - 1;
			}
			if (currentMonth === 2) {
				daysMonth = 28;
			}
			if (currentMonth % 2 === 0) {
				daysMonth = 31;
			}
			if (currentMonth % 2 === 1) {
				daysMonth = 30;
			}

			if (numberDays > 30) numberDays = 30;

			if (numberDays >= currentDay) {
				currentMonth = currentMonth - 1;
				newDay = currentDay - numberDays + daysMonth;
			} else {
				newDay = currentDay - numberDays;
			}

			if (currentMonth < 10) {
				currentMonth = `0${currentMonth}`;
			}
			if (newDay < 10) {
				newDay = `0${newDay}`;
			}

			if (numberDays > 0) return `${currentYear}-${currentMonth}-${newDay}`;
			else return "today";
		}
	};

	public async get(): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
		let json;
		try {
			const response = await fetch(
				"https://www.optecanalytics.com/api/sys/eval",
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
						rows: [{ expr: "projs()" }],
					}),
				}
			);
			json = await response.json();
		} catch (error) {
			console.log(
				"here, heystack.service.tsx line 97: without token or token old"
			);
			// console.error(error);
		}

		return json;
	}

	public async getUser(): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");

		let json;
		try {
			const response = await fetch(
				"https://www.optecanalytics.com/api/sys/eval",
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
						rows: [{ expr: "context()" }],
					}),
				}
			);
			json = await response.json();
		} catch (error) {
			console.log("Error, here, heystack.service.tsx line 125:  getUser()");
			// console.error(error);
		}

		return json;
	}

	public async getSummary(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetSummary(today)" }],
					}),
				}
			);

			json = await response.json();

			if (json.rows.length === 0) {
				json = {
					_kind: "grid",
					cols: [
						{
							name: "name",
						},
						{
							name: "val",
						},
					],
					meta: {
						ver: "3.0",
					},
					rows: [
						{
							name: "No Found",
							val: 0,
						},
						{
							name: "No_Found",
							val: {
								_kind: 0,
								unit: "",
								val: 0,
							},
						},
						{
							name: "No_Found",
							val: 0,
						},
					],
				};
			}
		} catch (error) {
			console.log("here, heystack.service.tsx line 58: getSummary()");
		}

		return json;
	}

	public async getIssues(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetIssues(today)" }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log("here, heystack.service.tsx line 87: getIssues");
		}

		return json;
	}

	public async getSystems(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetSystems()" }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log("here, heystack.service.tsx line 114: apiSystems()");
		}

		return json;
	}

	public async getHvac(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: 'apiGetEquipments("hvac")' }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log(
				'here, heystack.service.tsx line 142: apiGetEquipments("hvac")'
			);
		}

		return json;
	}

	public async getEquipmentPoints(
		dropDown: string,
		EquipmentID: string
	): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: `apiGetHvacPoints(@${EquipmentID})` }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log(
				'here, heystack.service.tsx line 142: apiGetEquipments("hvac")'
			);
		}

		return json;
	}

	public async getEquipmentPointsByRows(
		dropDown: string,
		EquipmentID: string
	): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");

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
						rows: [
							{
								expr: `apiGetHvacPointsByRows(@${EquipmentID})`,
							},
						],
					}),
				}
			);

			json = await response.json();

			//   '<<<<<< line 409 haystack_service.tsx  getEquipmentPointsByCells>>>>>>>'
			// );
		} catch (error) {
			console.log(
				'here, heystack.service.tsx line 142: apiGetEquipments("hvac")'
			);
		}

		return json.rows;
	}

	public async apiGetWaterPointsByRows(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [
							{
								expr: `apiGetWaterPointsByRows()`,
							},
						],
					}),
				}
			);

			json = await response.json();
			// console.log(
			//   '<<<<<< line 409 haystack_service.tsx  getEquipmentPointsByCells>>>>>>>'
			// );
		} catch (error) {
			console.log(
				"here, heystack.service.tsx line 409: apiGetWaterPointsByRows()"
			);
		}

		return json.rows;
	}

	public async getWater(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetWaterPoints()" }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log("here, heystack.service.tsx line 236: getWater");
		}

		return json;
	}

	public async getWaterDetection(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetWaterDetectionPoints()" }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log("here, heystack.service.tsx line 236: getWaterDetection");
		}

		return json;
	}

	public async apiGetWaterDetectionPointsByRows(
		dropDown: string
	): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetWaterDetectionPointsByRows()" }],
					}),
				}
			);

			json = await response.json();
			// console.log('<<<<<< line 262 haystack_service.tsx getWaterDetection>>>>>>>')
			// console.log(json);
		} catch (error) {
			console.log(
				"here, heystack.service.tsx: apiGetWaterDetectionPointsByRows()"
			);
		}

		return json.rows;
	}

	public async apiGetRefrigerationPointsByRows(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetRefrigerationPointsByRows()" }],
					}),
				}
			);

			json = await response.json();
			// console.log('<<<<<< line 262 haystack_service.tsx getWaterDetection>>>>>>>')
			// console.log(json);
		} catch (error) {
			console.log(
				"here, heystack.service.tsx: apiGetRefrigerationPointsByRows()"
			);
		}

		return json.rows;
	}

	public async apiGetIaqPointsByRows(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetIaqPointsByRows()" }],
					}),
				}
			);

			json = await response.json();
			// console.log('<<<<<< line 262 haystack_service.tsx getWaterDetection>>>>>>>')
			// console.log("ROWS LLEGANDO DEL BACK", json);
		} catch (error) {
			console.log("here, heystack.service.tsx: apiGetIaqPointsByRows()");
		}

		return json.rows;
	}

	public async apiGetSecurityPointsByRows(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetSecurityPointsByRows()" }],
					}),
				}
			);

			json = await response.json();
			// console.log('<<<<<< line 262 haystack_service.tsx getWaterDetection>>>>>>>')
			// console.log('ROWS LLEGANDO DEL BACK', json);
		} catch (error) {
			console.log("here, heystack.service.tsx: apiGetSecurityPointsByRows()");
		}

		return json.rows;
	}

	public async getRefrigeration(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetRefrigerationPoints()" }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log("here, heystack.service.tsx line 236: Refrigeration");
		}

		return json;
	}

	public async getIaq(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetIaqPoints()" }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log("here, heystack.service.tsx line 236: Refrigeration");
		}

		return json;
	}

	public async getSecurity(dropDown: string): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
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
						rows: [{ expr: "apiGetSecurityPoints()" }],
					}),
				}
			);

			json = await response.json();
		} catch (error) {
			console.log("here, heystack.service.tsx line 236: Refrigeration");
		}

		return json;
	}

	public async getChart(
		dropDown: string,
		id: string | undefined,
		numberDays: any | undefined
	): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
		let json;

		let range: any;

		if (numberDays !== 0) range = `${numberDays}..${numberDays}`;
		if (numberDays === 0) range = "today";
		if (numberDays === undefined) range = "today";

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
						rows: [{ expr: `apiGetPointHistory(@${id},${range})` }],
					}),
				}
			);

			json = await response.json();
			// console.log(json);}
		} catch (error) {
			console.log("here, heystack.service.tsx line 236: getChart");
		}

		return json;
	}

	public async getChartMultipoint(
		dropDown: string,
		array: string[],
		numberDays: any | undefined
	): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");
		let json;
		let range: any;

		if (numberDays !== 0) range = `${numberDays}..${numberDays}`;
		if (numberDays === 0) range = "today";
		if (numberDays === undefined) range = "today";

		const atsignAdded = array.map((el) => {
			return "@" + el;
		});
		console.log("atsignAdded", `apiGetPointsHistory([${atsignAdded}],today)`);

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
						rows: [{ expr: `apiGetPointsHistory([${atsignAdded}],${range})` }],
					}),
				}
			);

			json = await response.json();
			// console.log('json', json);

			return json;
		} catch (error) {
			console.log("here, heystack.service.tsx : getChartMultipoint(${}, )");
		}
	}

	public async post(url: string, data: any): Promise<any> {
		const token = await localStorage.getItemAsync("userToken");

		const response = await axios.post(`${this.baseUrl}${url}`, data, {
			headers: {
				Authorization: `Bearer authToken=${token}`,
				"Content-Type": "application/json",
				Accept: "application/json",
			},
		});

		return response.data;
	}

	public getProjects(): Promise<any> {
		let response: Promise<any> = this.get().then((data) => {
			return (response = data);
		});

		return response;
	}
}
