import { useEffect, useRef, useState } from 'react';
import { calculateBancadasQuoteFromForm } from '../../../../domains/engine/usecases/calculateBancadasQuote.usecase';

export function useBancadasQuote(formData: any, priceBook: any) {
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [diagnostics, setDiagnostics] = useState<any>({ errors: [], missingPrices: [], warnings: [] });
  const alive = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    alive.current = true;
    setLoading(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      let cancelled = false;
      (async () => {
        const result = await calculateBancadasQuoteFromForm(formData, priceBook);
        if (!alive.current || cancelled) return;
        setQuote(result.quote);
        setDiagnostics(result.diagnostics);
        setLoading(false);
      })();
      return () => { cancelled = true; };
    }, 300);
    return () => {
      alive.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(formData), priceBook]);

  return { loading, quote, diagnostics };
}
