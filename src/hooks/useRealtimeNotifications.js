import { useEffect, useRef, useState, useCallback } from 'react';
import { getToken } from '../services/api.js';
import { authApi } from '../services/authApi.js';
import { notificationApi } from '../services/contentApi.js';

const WS_URL = (import.meta.env.VITE_API_URL || '/api/v1').replace('/api/v1', '').replace(/^http/, 'ws') + '/realtime';

const POLL_INTERVAL = 15000;
const RECONNECT_DELAY = 3000;
const AUTH_RECONNECT_DELAY = 1000;

export const isNewAppointment = (n) => {
  const type = n?.type || n?.data?.type || '';
  return type === 'APPOINTMENT_NEW';
};

export const notifKey = (n) => {
  const meta = n?.meta || n?.data?.meta || null;
  if (meta?.appointmentId) return `apt:${meta.appointmentId}`;
  const m = /appointments\/(\d+)/.exec(n?.link || '');
  if (m) return `apt:${m[1]}`;
  return `n:${n?.id || `${n?.title || ''}|${n?.message || ''}|${n?.createdAt || ''}`}`;
};

export function useRealtimeNotifications() {
  const [connected, setConnected] = useState(false);
  const [lastNotification, setLastNotification] = useState(null);
  const [unread, setUnread] = useState(0);
  const [modalNotification, setModalNotification] = useState(null);
  const [modalQueue, setModalQueue] = useState([]);

  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);
  const retryTokenTimer = useRef(null);
  const audioRef = useRef(null);
  const seenRef = useRef(new Set());
  const sessionStartRef = useRef(Date.now());

  const playSound = useCallback(() => {
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio('data:audio/wav;base64,UklGRl4FAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YToFAACAgICAgICAgICA');
      }
      audioRef.current.currentTime = 0;
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(() => {});
    } catch {}
  }, []);

  const enqueueModal = useCallback((n) => {
    setModalQueue((q) => [...q, n]);
  }, []);

  const handleMessage = useCallback((e) => {
    try {
      const msg = JSON.parse(e.data);
      if (msg.type !== 'notification') return;
      const n = msg.data || {};
      setUnread((u) => u + 1);
      setLastNotification(n);
      if (isNewAppointment(n)) {
        const key = notifKey(n);
        if (!seenRef.current.has(key)) {
          seenRef.current.add(key);
          playSound();
          enqueueModal(n);
        }
      } else {
        playSound();
      }
    } catch {}
  }, [playSound, enqueueModal]);

  const connect = useCallback((needsAuthRefresh = false) => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (retryTokenTimer.current) {
      clearTimeout(retryTokenTimer.current);
      retryTokenTimer.current = null;
    }
    if (wsRef.current) return;

    const open = (token) => {
      const ws = new WebSocket(`${WS_URL}?token=${token}`);
      wsRef.current = ws;
      ws.onopen = () => setConnected(true);
      ws.onmessage = handleMessage;
      ws.onclose = (e) => {
        setConnected(false);
        wsRef.current = null;
        const needsAuth = e.code === 4001;
        const delay = needsAuth ? AUTH_RECONNECT_DELAY : RECONNECT_DELAY;
        reconnectTimer.current = setTimeout(() => connect(needsAuth), delay);
      };
      ws.onerror = () => {
        try { ws.close(); } catch {}
      };
    };

    const token = getToken();
    if (!token) {
      retryTokenTimer.current = setTimeout(() => connect(false), 1000);
      return;
    }

    if (needsAuthRefresh) {
      authApi.refresh().then(() => {
        const fresh = getToken();
        if (fresh) open(fresh);
        else retryTokenTimer.current = setTimeout(() => connect(true), 1000);
      }).catch(() => {
        retryTokenTimer.current = setTimeout(() => connect(true), AUTH_RECONNECT_DELAY);
      });
      return;
    }

    open(token);
  }, [handleMessage]);

  useEffect(() => {
    connect();
    return () => {
      clearTimeout(reconnectTimer.current);
      clearTimeout(retryTokenTimer.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [connect]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && !wsRef.current) {
        connect();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [connect]);

  useEffect(() => {
    let timer;
    const poll = async () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;
      try {
        const res = await notificationApi.list({ limit: 20 });
        const items = res.data?.items || [];
        for (const n of items) {
          if (!isNewAppointment(n)) continue;
          const createdAt = new Date(n.createdAt).getTime();
          if (!createdAt || createdAt < sessionStartRef.current) continue;
          const key = notifKey(n);
          if (seenRef.current.has(key)) continue;
          seenRef.current.add(key);
          setUnread((u) => u + 1);
          playSound();
          enqueueModal(n);
        }
      } catch {}
    };
    poll();
    timer = setInterval(poll, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [playSound, enqueueModal]);

  useEffect(() => {
    if (!modalNotification && modalQueue.length > 0) {
      setModalNotification(modalQueue[0]);
      setModalQueue((q) => q.slice(1));
    }
  }, [modalNotification, modalQueue]);

  const dismissModal = useCallback(() => setModalNotification(null), []);
  const clearUnread = useCallback(() => setUnread(0), []);

  return { connected, lastNotification, unread, setUnread, clearUnread, modalNotification, dismissModal };
}