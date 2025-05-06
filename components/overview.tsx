import { motion } from 'framer-motion';
import Link from 'next/link';

import { MessageIcon } from './icons';

export const Overview = () => {
  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto md:mt-20"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed text-center max-w-xl">
        <p className="flex flex-row justify-center gap-4 items-center">
          <MessageIcon size={32} />
        </p>
        <p>
          Welcome to DyceGPT. A chatbot to answer all your questions about the Dyce Crypto Payment API. It uses
          next-gen Artificial intelligence to provide a seamless chat experience.
        </p>
        <p>
          You can learn more about AI by visiting the{' '}
          <Link
            className="font-medium underline underline-offset-4"
            href="https://en.wikipedia.org/wiki/Artificial_intelligence"
            target="_blank"
          >
            docs
          </Link>
          .
        </p>
      </div>
    </motion.div>
  );
};
