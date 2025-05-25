import { Injectable, InternalServerErrorException } from '@nestjs/common';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class WalletDebitService {
  private readonly RAZORPAY_BASE_URL = 'https://api.razorpay.com/v1';

  async sendMoney(data: {
    id: string;
    account_number: string;
    ifsc_code: string;
    amount: number;
  }) {
    const { id, account_number, ifsc_code, amount } = data;

    // Load and validate env variables
    const keyId = process.env.RAZORPAY_KEY_I;
    const keySecret = process.env.RAZORPAY_KEY_SECRE;
    const razorpayAccountNumber = process.env.RAZORPAY_ACCOUNT_NUMBE;

    if (!keyId || !keySecret) {
      throw new InternalServerErrorException(
        'Razorpay API credentials are not set in environment variables',
      );
    }
    if (!razorpayAccountNumber) {
      throw new InternalServerErrorException(
        'Razorpay virtual account number (RAZORPAY_ACCOUNT_NUMBER) is missing',
      );
    }

    const auth = {
      username: keyId,
      password: keySecret,
    };

    try {
      // Step 1: Create Contact
      const contactRes = await axios.post(
        `${this.RAZORPAY_BASE_URL}/contacts`,
        {
          name: `User_${id}`,
          type: 'employee',
          reference_id: `user_${id}`,
        },
        { auth },
      );

      const contactId = contactRes.data.id;

      // Step 2: Create Fund Account
      const fundRes = await axios.post(
        `${this.RAZORPAY_BASE_URL}/fund_accounts`,
        {
          contact_id: contactId,
          account_type: 'bank_account',
          bank_account: {
            name: `User_${id}`,
            ifsc: ifsc_code,
            account_number,
          },
        },
        { auth },
      );

      const fundAccountId = fundRes.data.id;

      // Step 3: Initiate Payout
      const payoutRes = await axios.post(
        `${this.RAZORPAY_BASE_URL}/payouts`,
        {
          account_number: razorpayAccountNumber,
          fund_account_id: fundAccountId,
          amount: amount * 100, // Amount in paise
          currency: 'INR',
          mode: 'IMPS',
          purpose: 'payout',
          queue_if_low_balance: true,
          reference_id: `payout_${id}_${Date.now()}`,
          narration: 'Distributor payout',
        },
        { auth },
      );

      return {
        success: true,
        payout_id: payoutRes.data.id,
        status: payoutRes.data.status,
      };
    } catch (error: any) {
      console.error('Razorpay payout error:', error.response?.data || error.message);
      throw new InternalServerErrorException(
        error.response?.data?.error?.description || 'Failed to send payout',
      );
    }
  }
}
