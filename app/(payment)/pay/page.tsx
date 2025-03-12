'use client';

// import Link from 'next/link';
// import { useRouter } from 'next/navigation';
// import { useActionState, useEffect, useState } from 'react';
// import { toast } from 'sonner';

// import { PayForm } from '@/components/pay-form';
// import { SubmitButton } from '@/components/submit-button';

// import { login, type LoginActionState } from '../actions';

// export default function Page() {
//   const router = useRouter();

//   const [email, setEmail] = useState('');
//   const [isSuccessful, setIsSuccessful] = useState(false);

//   const [state, formAction] = useActionState<LoginActionState, FormData>(
//     login,
//     {
//       status: 'idle',
//     },
//   );

//   useEffect(() => {
//     if (state.status === 'failed') {
//       toast.error('Invalid credentials!');
//     } else if (state.status === 'invalid_data') {
//       toast.error('Failed validating your submission!');
//     } else if (state.status === 'success') {
//       setIsSuccessful(true);
//       router.refresh();
//     }
//   }, [state.status, router]);

//   const handleSubmit = (formData: FormData) => {
//     setEmail(formData.get('email') as string);
//     formAction(formData);
//   };
//   const mockAction = () => {
//     console.log('mockAction');
//   }

//   return (
//     <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
//       <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
//         <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
//           <h3 className="text-xl font-semibold dark:text-zinc-50">Set up Payment Info</h3>
//           <p className="text-sm text-gray-500 dark:text-zinc-400">
//             Enter some payment info
//           </p>
//         </div>
//         <PayForm action={handleSubmit} defaultWalletKey={"100.00"}>
//           <SubmitButton isSuccessful={isSuccessful}>Connect Wallet</SubmitButton>
//           <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
//             {'Already linked a wallet? '}
//             <Link
//               href="/"
//               className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
//             >
//               Go back
//             </Link>
//             {/* {' instead.'} */}
//           </p>
//         </PayForm>
//       </div>
//     </div>
//   );
// }

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { PayForm } from '@/components/pay-form';
import { SubmitButton } from '@/components/submit-button';
import Dyce from '../../../dyce';

export default function Page() {
  const router = useRouter();

  const [apiKey, setApiKey] = useState('7181cde45d0c9c426811b322a84d69cf9e87518339e51f3e01d82427a3bc302c');
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
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Approve Spending</h3>
          {/* <p className="text-sm text-gray-500 dark:text-zinc-400">
            Enter some payment info
          </p> */}
        </div>
        <PayForm action={onApprove} defaultWalletKey={"0"} setAmount={setAmount}>
          <SubmitButton isSuccessful={isSuccessful}>
            {loading ? 'Processing...' : 'Pay-as-you-go'}
          </SubmitButton>
          {/* <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {'Already got money in the bank? '}
            <Link
              href="/"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Go back
            </Link>
          </p> */}
        </PayForm>
        <PayForm action={onApprove2} defaultWalletKey={"0"} setAmount={setAmount}>
          <SubmitButton isSuccessful={isSuccessful}>
            {loading ? 'Processing...' : 'Payment'}
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
  );
}


// import React, { useMemo, useState } from 'react'
// import Dyce from '../../../dyce'

// export default function Page() {
//   const [apiKey, setApiKey] = useState("");
//   const [amount, setAmount] = useState(0);
//   const [userId, setUserId] = useState("");
//   const [loading, setLoading] = useState(false);

//   const dyce = useMemo(() => new Dyce(apiKey), [apiKey]);

//   const onApprove = async () => {
//     setLoading(true);
//     await dyce.approveSpending(userId, amount);
//     setLoading(false);
//   }

//   return (
//     <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
//       <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
//         <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16"></div>
//         <div className='manager fake-wrapper'>
//           <div className='row'>
//             <input type='text' placeholder='User ID' onChange={e => setUserId(e.target.value)}></input>
//             <input type='number' placeholder='Amount' onChange={e => setAmount(parseFloat(e.target.value))}></input>
//             <button onClick={onApprove} disabled={loading}>Approve Spending</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }