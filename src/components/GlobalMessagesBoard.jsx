import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import { Loader2 } from 'lucide-react';

export default function GlobalMessagesBoard() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState('');
  const [flashColor, setFlashColor] = useState('');
  const messagesEndRef = useRef(null);

  const triggerFlash = (type) => {
    setFlashColor(type === 'success' ? 'bg-brand-success' : 'bg-brand-error');
    setTimeout(() => setFlashColor(''), 150);
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('global_messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      
      if (error) throw error;
      setMessages(data ? data.reverse() : []);
      scrollToBottom();
    } catch (err) {
      console.error('Error fetching global messages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    const channel = supabase.channel('global_messages_changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'global_messages' }, payload => {
        setMessages(prev => [...prev, payload.new]);
        scrollToBottom();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    try {
      setSaving(true);
      const author_name = user?.full_name ? user.full_name.split(' ')[0].toUpperCase() : 'USER';
      
      const { error } = await supabase
        .from('global_messages')
        .insert({
          author_name,
          content: content.trim()
        });

      if (error) throw error;
      setContent('');
      triggerFlash('success');
    } catch (err) {
      console.error('Error sending message:', err);
      triggerFlash('error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto mt-16 md:mt-24 mb-16 flex flex-col flex-1 animate-fade-in relative">
      {/* Interaction Flash Overlay */}
      {flashColor && <div className={`absolute inset-0 z-50 pointer-events-none opacity-10 transition-opacity duration-150 ${flashColor}`}></div>}

      {/* Header */}
      <div className="flex items-end justify-between py-2 border-b border-brand-border/30 shrink-0">
        <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-brand-muted/50">
          BITACORA DEL SISTEMA // ASYNC
        </h3>
        <span className="flex items-center gap-2 text-[8px] font-bold tracking-[0.3em] uppercase text-brand-success/70">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-success shadow-[0_0_6px_rgba(74,222,128,0.5)]" />
          SYNC
        </span>
      </div>

      {/* Message List (Terminal Aesthetic) */}
      <div className="flex-1 overflow-y-auto py-4 space-y-1 custom-scrollbar text-[11px] md:text-xs font-mono h-32 md:h-40 relative">
        {loading ? (
          <div className="text-brand-muted/50 flex items-center gap-2"><Loader2 size={12} className="animate-spin" /> CARGANDO_FLUJO</div>
        ) : messages.length === 0 ? (
          <div className="text-brand-muted/30 italic">Sin registros en el flujo.</div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex items-start gap-4 hover:bg-brand-surface/10 py-0.5 transition-colors group">
              <span className="text-brand-muted/30 w-10 shrink-0">{dayjs(msg.created_at).format('HH:mm')}</span>
              <span className="text-brand-text font-bold uppercase w-20 shrink-0 truncate" title={msg.author_name}>{msg.author_name}</span>
              <span className="text-brand-muted group-hover:text-brand-text/90 transition-colors">{msg.content}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="pt-3 border-t border-brand-border/30 flex items-center gap-3">
        <span className="text-brand-muted/50 font-mono text-sm">{'>'}</span>
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="TRANSMITIR MENSAJE..."
          className="flex-1 bg-transparent border-none text-xs text-brand-text font-mono focus:outline-none placeholder:text-brand-muted/30 uppercase tracking-widest"
          disabled={saving}
          autoComplete="off"
        />
        {saving && <Loader2 size={12} className="animate-spin text-brand-muted shrink-0" />}
      </form>
    </div>
  );
}
