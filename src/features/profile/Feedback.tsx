import { useState } from 'react';
import { Button, Card } from '../../components/ui';
import { supabase } from '../../sync/supabase';
import { useSyncStore } from '../../sync/useSync';

/** Feedback senden (landet in der Supabase-Tabelle `feedback`) */
export function Feedback() {
  const { auth } = useSyncStore();
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [err, setErr] = useState('');

  const send = async () => {
    if (!supabase || !auth) return;
    setState('sending');
    const { error } = await supabase.from('feedback').insert({
      user_id: auth.user.id,
      email: auth.user.email,
      message: text.trim(),
      app_version: __APP_VERSION__,
      user_agent: navigator.userAgent,
    });
    if (error) {
      setErr(error.message);
      setState('error');
    } else {
      setText('');
      setState('sent');
    }
  };

  return (
    <Card className="space-y-2">
      <h2 className="font-semibold">Feedback senden</h2>
      {!auth ? (
        <p className="text-sm text-slate-500">Mit Konto kannst du hier Fehler melden oder Wünsche schicken.</p>
      ) : state === 'sent' ? (
        <p className="text-sm text-emerald-400">Danke! Dein Feedback ist angekommen.</p>
      ) : (
        <>
          <textarea
            className="input"
            rows={3}
            placeholder="Was fehlt dir, was nervt, was gefällt dir?"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={5000}
          />
          <Button className="w-full" disabled={!text.trim() || state === 'sending'} onClick={send}>
            {state === 'sending' ? 'Sende …' : 'Senden'}
          </Button>
          {state === 'error' && <p className="text-sm text-red-400">Fehler: {err}</p>}
        </>
      )}
    </Card>
  );
}
