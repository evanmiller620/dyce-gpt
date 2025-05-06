export class Dyce {
  constructor(apiKey: string);
  connected: boolean;
  baseURL: string;
  getWalletAddress(): string;
  approveSpending(userId: string, amount: number): boolean;
  requestPayment(userId: string, amount: number): boolean;
  transferTokens(amount: number): boolean;
}
