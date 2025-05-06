'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { PayForm } from '@/components/pay-form';
import { SubmitButton } from '@/components/submit-button';
import Dyce from "dyce"
// import Dyce from 'dyce/index.js';

export default function Page() {
  const router = useRouter();

  const [apiKey, setApiKey] = useState('531195068840511842be81710acc031cbcdc27cc961fa0614f233ba334ead097');
  const [amount, setAmount] = useState(0);
  const [userId, setUserId] = useState('apple');
  const [loading, setLoading] = useState(false);
  const [isSuccessful, setIsSuccessful] = useState(false);

  const dyce = useMemo(() => new Dyce(apiKey), [apiKey]);

  const onApprove = async () => {
    setLoading(true);
    try {
      const ret = await dyce.approveSpending(userId, amount);
      if (!ret) {
        throw new Error('Approval failed!');
      }
      setIsSuccessful(true);
      setLoading(false);
      toast.success('Spending approved!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Approval failed!');
    } finally {
      setLoading(false);
    }
  };

  const onApprove2 = async () => {
    setLoading(true);
    try {
      const ret = await dyce.transferTokens(userId, amount);
      if (!ret) {
        throw new Error('Payment failed!');
      }
      setIsSuccessful(true);
      setLoading(false);
      toast.success('Payment approved!');
      router.push('/');
      router.refresh();
    } catch (error) {
      toast.error('Payment failed!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="payment-container p-6 sm:p-10 rounded-xl shadow-lg bg-white dark:bg-zinc-900">
        <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
          <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
            <h3 className="text-xl font-semibold dark:text-zinc-50">Payment Options</h3>
          </div>
          <PayForm action={onApprove} defaultWalletKey={"0"} setAmount={setAmount}>
            <SubmitButton isSuccessful={isSuccessful}>
              {loading ? 'Processing...' : 'Pay-as-you-go'}
            </SubmitButton>
          </PayForm>
          <PayForm action={onApprove2} defaultWalletKey={"0"} setAmount={setAmount}>
            <SubmitButton isSuccessful={isSuccessful}>
              {loading ? 'Processing...' : 'One-time transaction'}
            </SubmitButton>
            <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
              {'Already got money in the bank? '}
              <Link
                href="/"
                className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
              >
                Go back
              </Link>
            </p>
          </PayForm>
        </div>
      </div>
    </div>
  );
}