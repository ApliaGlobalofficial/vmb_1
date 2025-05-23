// src/razorpay/razorpay.service.ts
import { Injectable } from '@nestjs/common';
// Use require so we get the actual constructor
const Razorpay = require('razorpay');
import { getEnvVar } from '../utils/env';

@Injectable()
export class RazorpayService {
    private client: any;

    constructor() {
        this.client = new Razorpay({
            key_id: getEnvVar('RAZORPAY_KEY_ID'),
            key_secret: getEnvVar('RAZORPAY_KEY_SECRET'),
        });
    }

    /** Create a Razorpay Order; amountRupees is in ₹ */
    async createOrder(amountRupees: number, merchantOrderId: string):
        Promise<{ orderId: string; amount: number }> {
        const amountPaise = Math.round(amountRupees * 100);
        const opts = {
            amount: amountPaise,
            currency: 'INR',
            receipt: merchantOrderId,
            payment_capture: 1,
        };
        const order = await this.client.orders.create(opts);
        return { orderId: order.id, amount: order.amount };
    }

    /** (Optional) Fetch an existing order */
    async fetchOrder(orderId: string) {
        return this.client.orders.fetch(orderId);
    }
}
