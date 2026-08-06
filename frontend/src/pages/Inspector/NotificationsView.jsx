import React, { useState, useEffect } from "react";

export default function NotificationsView({ setApiMessage, setApiError }) {
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    async function fetchNotes() {
      try {
        const res = await fetch("/api/notifications/get_notifications.php");
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const json = await res.json();
        if (!mounted) return;
        const list = (json && json.success && Array.isArray(json.data)) ? json.data : [];
        const normalized = list.map(n => ({ id: n.notification_id || n.id, title: n.title || n.subject || 'Notification', message: n.message || n.body || '', read: !!n.read, raw: n }));
        setNotes(normalized);
      } catch (e) {
        if (!mounted) return;
        setError(e.message);
        setApiError && setApiError(e.message);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    }
    fetchNotes();
    return () => { mounted = false; };
  }, [setApiError]);

  const markRead = async (n) => {
    try {
      const res = await fetch(`/api/notifications/mark_read.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: n.id }),
      });
      if (!res.ok) throw new Error('Mark failed');
      setNotes((prev) => prev.map(x => x.id === n.id ? {...x, read: true} : x));
      setApiMessage && setApiMessage("Notification marked read.");
    } catch (e) {
      setApiError && setApiError(e.message);
    }
  };

  return (
    <div>
      <h2>Notifications</h2>
      <p className="muted">System and inspection alerts. Technicians get notified on escalations.</p>

      {loading && <p>Loading notifications…</p>}
      {error && <div className="dashboard-alert error">{error}</div>}

      {!loading && !error && (
        <ul className="notification-list">
          {notes.length === 0 && <li>No notifications.</li>}
          {notes.map((n) => (
            <li key={n.id} className={n.read ? 'read' : 'unread'}>
              <strong>{n.title || 'Notification'}</strong>
              <div className="muted">{n.message}</div>
              <div className="note-actions">
                {!n.read && <button className="btn" onClick={() => markRead(n)}>Mark read</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
