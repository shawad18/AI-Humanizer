import { useCallback, useState } from 'react';

export type BannerVariant = 'success' | 'error' | 'warning' | 'info';

export function useBanner() {
  const [open, setOpen] = useState(false);
  const [variant, setVariant] = useState<BannerVariant>('info');
  const [title, setTitle] = useState<string>('');
  const [message, setMessage] = useState<string | undefined>();
  const [progress, setProgress] = useState<number | undefined>();

  const showBanner = useCallback(
    (opts: { variant: BannerVariant; title: string; message?: string; progress?: number }) => {
      setVariant(opts.variant);
      setTitle(opts.title);
      setMessage(opts.message);
      setProgress(opts.progress);
      setOpen(true);
    },
    []
  );

  const closeBanner = useCallback(() => setOpen(false), []);

  return {
    open,
    variant,
    title,
    message,
    progress,
    showBanner,
    closeBanner,
  };
}