import Form from 'next/form';

import { Input } from './ui/input';
import { Label } from './ui/label';

export function PayForm({
  action,
  children,
  defaultWalletKey = '',
  setAmount,
}: {
  action: NonNullable<
    string | ((formData: FormData) => void | Promise<void>) | undefined
  >;
  children: React.ReactNode;
  defaultWalletKey?: string;
  setAmount: (amount: number) => void;
}) {
  return (
    <Form action={action} className="flex flex-col gap-4 px-4 sm:px-16">
      <div className="flex flex-col gap-2">
        <Label
          htmlFor="spendAmount"
          className="text-zinc-600 font-normal dark:text-zinc-400"
        >
          Cryptocoin
        </Label>

        <Input
          id="spendAmount"
          name="spendAmount"
          className="bg-muted text-md md:text-sm"
          type="spendAmount"
          defaultValue={defaultWalletKey}
          required
          onChange={(e) => setAmount(parseFloat(e.target.value))}
        />
      </div>

      {children}
    </Form>
  );
}
