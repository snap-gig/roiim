/* eslint-disable @typescript-eslint/no-var-requires */
import { Body, Controller, Post } from '@nestjs/common';
import { PaysafeService } from './paysafe.service';
import { v4 as uuidv4 } from 'uuid';
const axios = require('axios')

@Controller('paysafe')
export class PaysafeController {
	constructor(private paysafeService: PaysafeService) { }

	@Post('/login')
	async startPayment(@Body() userData: any) {
		let paymentRes;
		let singleUseCustomerToken;
		let user = await this.paysafeService.getUserByEmail(userData.email);
		if (!user) { user = await this.paysafeService.createUser(userData) };
		if (user.paysafeCustomerId) {
			const config = {
				method: 'post',
				url: `https://api.test.paysafe.com/paymenthub/v1/customers/${user.paysafeCustomerId}/singleusecustomertokens`,
				headers: {
					'Authorization': 'Basic cHJpdmF0ZS03NzUxOkItcWEyLTAtNWYwMzFjZGQtMC0zMDJkMDIxNDQ5NmJlODQ3MzJhMDFmNjkwMjY4ZDNiOGViNzJlNWI4Y2NmOTRlMjIwMjE1MDA4NTkxMzExN2YyZTFhODUzMTUwNWVlOGNjZmM4ZTk4ZGYzY2YxNzQ4',
					'Content-Type': 'application/json'
				},
				data: JSON.stringify({ "paymentTypes": ["CARD"] })
			};
			paymentRes = await axios(config);
			singleUseCustomerToken = paymentRes.data.singleUseCustomerToken;
		}

		const userD = {
			email: user.email,
			paysafeCustomerId: user.paysafeCustomerId
		};

		return `<html>
		<head>
			<script src="https://hosted.paysafe.com/checkout/v2/paysafe.checkout.min.js"></script>
		</head>
		<body>
			<button onclick="checkout()"> PaySafe Checkout </button>
		</body>
		
		<script>
			function checkout() {
				let user = ${JSON.stringify(userD)};
				console.log("-----user------",user);
				paysafe.checkout.setup("cHVibGljLTc3NTE6Qi1xYTItMC01ZjAzMWNiZS0wLTMwMmQwMjE1MDA4OTBlZjI2MjI5NjU2M2FjY2QxY2I0YWFiNzkwMzIzZDJmZDU3MGQzMDIxNDUxMGJjZGFjZGFhNGYwM2Y1OTQ3N2VlZjEzZjJhZjVhZDEzZTMwNDQ=", {
					"currency": "USD",
					"amount": 10000,
					"locale": "en_US",
					"singleUseCustomerToken": "${singleUseCustomerToken ? singleUseCustomerToken : ''}",
					"customer": {
						"firstName": "${user.firstName}",
						"lastName": "${user.lastName}",
						"email": "${user.email}",
						"phone": "${user.mobileNumber}",
						"dateOfBirth": {
							"day": 1,
							"month": 7,
							"year": 1990
						}
					},
					"billingAddress": {
						"nickName": "${user.firstName} ${user.lastName}",
						"street": "20735 Stevens Creek Blvd",
						"street2": "Montessori",
						"city": "Cupertino",
						"zip": "95014",
						"country": "US",
						"state": "CA"
					},
					"environment": "TEST",
					"merchantRefNum": "893491188900",
					"canEditAmount": false,
					"payout": false,
					"payoutConfig": {
						"maximumAmount": 100000
					},
					"displayPaymentMethods": ["card"],
					"paymentMethodDetails": {
						"sightline": {
							"consumerId": "123456"
						},
						"skrill": {
							"consumerId": "john.doe@email.com",
							"emailSubject": "Skrill Payout",
							"emailMessage": "Your Skrill Payout request has been processed"
						},
						"instantach": {
							"consumerId": "john.doe@email.com",
							"paymentId": "3aeb9c63-6386-46a3-9f8e-f452e722228a",
							"emailSubject": "Instant ACH Payout",
							"emailMessage": "Your Instant ACH Payout request has been processed"
						},
						"vippreferred": {
							"consumerId": "550726575"
						},
						"paypal": {
							"consumerId": "sb-cpfxo1472281@personal.example.com",
							"consumerMessage": "Paysafe note to payer",
							"recipientType": "PAYPAL_ID"
						}
					}
				}, function (instance, error, result) {
					console.log("-----result-----", result)
					if (result && result.paymentHandleToken) {
						if(result.customerOperation=="ADD"){
							result['merchantCustomerId']=user.email;
							if(user.paysafeCustomerId){
								result['customerId']=user.paysafeCustomerId;
							}
						}
						console.log("-----result------",result);
						var xhttp = new XMLHttpRequest();
						xhttp.open("POST", "${process.env.API_URL}/api/paysafe/process/payment", true);
						xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
						xhttp.send(JSON.stringify(result));
						
						instance.showSuccessScreen("Your payment is successful!");

						// make AJAX call to Payments API
					} else {
						console.error(error);
						// Handle the error
						instance.showFailureScreen("Payment was declined. Try again with the same or another payment method.");
					}
				}, function (stage, expired) {

					window.alert("Hello! I am an alert box!!");
					if (expired) {
						//case when  payment handle expires without user completing the payment
						// this.paymentResponse.status = "failed";
						// this.paymentResponse.message = "Session Expired";
						// this.promiseReject(this.paymentResponse);
						return "failed";
					  } else if (this.paymentResponse.status !== "success") {
						//case when user closes the iframe before completing the payment
						this.paymentResponse.status = "failed";
						this.paymentResponse.message = "Payment Closed Unexpectedly By The User!";
						this.promiseReject(this.paymentResponse);
					  }
					  this.promiseResolve();
					switch (stage) {
						case "PAYMENT_HANDLE_NOT_CREATED": // Handle the scenario
						case "PAYMENT_HANDLE_CREATED": // Handle the scenario
						case "PAYMENT_HANDLE_REDIRECT": // Handle the scenario
						case "PAYMENT_HANDLE_PAYABLE": // Handle the scenario
						default: // Handle the scenario
					}
				});
			}
		</script>
		
		</html>`
	}

	@Post('/process/payment')
	async processPayments(@Body() body: any) {
		// eslint-disable-next-line prefer-const
		let data = {
			paymentHandleToken: body.paymentHandleToken,
			amount: body.amount,
			merchantRefNum: uuidv4(),
			currencyCode: "USD",
			settleWithAuth: true
		}
		if (body.customerId) {
			data['customerId'] = body.customerId;
		}
		if (body.merchantCustomerId) {
			data['merchantCustomerId'] = body.merchantCustomerId;
		}
		const config = {
			method: 'post',
			url: `https://api.test.paysafe.com/paymenthub/v1/payments`,
			headers: {
				'Authorization': 'Basic cHJpdmF0ZS03NzUxOkItcWEyLTAtNWYwMzFjZGQtMC0zMDJkMDIxNDQ5NmJlODQ3MzJhMDFmNjkwMjY4ZDNiOGViNzJlNWI4Y2NmOTRlMjIwMjE1MDA4NTkxMzExN2YyZTFhODUzMTUwNWVlOGNjZmM4ZTk4ZGYzY2YxNzQ4',
				'Content-Type': 'application/json'
			},
			data: JSON.stringify(data)
		};

		const paymentRes = await axios(config)
		console.log("----paymentRes------", paymentRes.data)

		console.log("-------bosyin process payment------", body)


		if (body.customerOperation == "ADD") {
			this.paysafeService.updateUser(body.merchantCustomerId, paymentRes.data.customerId)
		}
		return "hello payment is successful";
	}

}
