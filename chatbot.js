(function () {
  if (document.getElementById('koa-chatbot-root')) return;

  const root = document.createElement('div');
  root.id = 'koa-chatbot-root';
  document.body.appendChild(root);

  const styleEl = document.createElement('style');
  styleEl.textContent = `
    #koa-chatbot-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }

    #koa-chat-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 66px; height: 66px;
      background: linear-gradient(135deg, #3BBDF5 0%, #2aa8e0 100%);
      border: none; border-radius: 50%; cursor: pointer; z-index: 9998;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 4px 24px rgba(59,189,245,0.45), 0 2px 8px rgba(0,0,0,0.35), 0 0 0 0 rgba(59,189,245,0.3);
      transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.2s ease;
    }
    #koa-chat-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 32px rgba(59,189,245,0.55), 0 3px 12px rgba(0,0,0,0.4);
    }
    #koa-chat-btn:active { transform: scale(0.94); }
    #koa-chat-btn svg { flex-shrink: 0; transition: transform 0.22s cubic-bezier(0.34,1.56,0.64,1); }

    #koa-chat-panel {
      position: fixed; bottom: 94px; right: 24px;
      width: 360px;
      background: #070e18;
      border: 1px solid rgba(59,189,245,0.14);
      border-radius: 18px;
      box-shadow: 0 32px 80px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.025);
      z-index: 9999; overflow: hidden;
      display: flex; flex-direction: column;
      transform: translateY(20px) scale(0.96);
      opacity: 0; pointer-events: none;
      transition: transform 0.28s cubic-bezier(0.34,1.56,0.64,1), opacity 0.2s ease;
      max-height: calc(100vh - 120px);
    }
    #koa-chat-panel.koa-open {
      transform: translateY(0) scale(1);
      opacity: 1; pointer-events: all;
    }
    @media (max-width: 420px) {
      #koa-chat-panel { right: 12px; left: 12px; width: auto; bottom: 88px; }
      #koa-chat-btn { bottom: 16px; right: 16px; }
    }

    #koa-chat-header {
      background: #0d1b2a;
      padding: 14px 16px;
      display: flex; align-items: center; gap: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.055);
      flex-shrink: 0;
    }
    #koa-chat-avatar {
      width: 40px; height: 40px;
      background: linear-gradient(135deg, #3BBDF5, #2aa8e0);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0; font-size: 19px;
      box-shadow: 0 2px 10px rgba(59,189,245,0.3);
    }
    #koa-chat-header-info { flex: 1; min-width: 0; }
    #koa-chat-header-name {
      font-size: 14px; font-weight: 700; color: #fff;
      letter-spacing: -0.015em; line-height: 1.2;
    }
    #koa-chat-header-sub {
      font-size: 11.5px; color: rgba(255,255,255,0.45);
      display: flex; align-items: center; gap: 5px; margin-top: 3px;
    }
    .koa-dot {
      width: 7px; height: 7px; background: #22c55e;
      border-radius: 50%; flex-shrink: 0;
      box-shadow: 0 0 6px rgba(34,197,94,0.6);
    }
    #koa-chat-close {
      background: none; border: none;
      color: rgba(255,255,255,0.35); cursor: pointer;
      width: 30px; height: 30px; border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      transition: color 0.15s, background 0.15s; flex-shrink: 0;
    }
    #koa-chat-close:hover { color: rgba(255,255,255,0.85); background: rgba(255,255,255,0.07); }

    #koa-chat-messages {
      flex: 1; overflow-x: hidden; overflow-y: auto;
      padding: 16px 20px 16px 16px;
      display: flex; flex-direction: column; gap: 10px;
      min-height: 200px; max-height: 340px; width: 100%;
      scrollbar-width: none;
    }
    #koa-chat-messages::-webkit-scrollbar { display: none; }

    .koa-msg { display: flex; flex-direction: row; width: 100%; }
    .koa-msg.koa-user { justify-content: flex-end; padding-right: 8px; }
    .koa-msg.koa-bot  { justify-content: flex-start; padding-left: 0; }

    .koa-bubble {
      max-width: 78%; padding: 10px 14px;
      font-size: 13.5px; line-height: 1.52; color: #fff;
      overflow-wrap: break-word; word-break: break-word;
    }
    .koa-msg.koa-user .koa-bubble {
      background: #3BBDF5;
      border-radius: 12px 12px 3px 12px;
      color: #042333; font-weight: 500;
    }
    .koa-msg.koa-bot .koa-bubble {
      background: #0d1b2a;
      border: 1px solid rgba(255,255,255,0.07);
      border-radius: 3px 12px 12px 12px;
    }

    .koa-typing {
      align-self: flex-start;
      display: flex; gap: 5px; align-items: center;
      background: #0d1b2a; border: 1px solid rgba(255,255,255,0.07);
      border-radius: 4px 16px 16px 16px;
      padding: 12px 16px;
    }
    .koa-typing span {
      width: 7px; height: 7px; background: rgba(255,255,255,0.28);
      border-radius: 50%;
      animation: koa-bounce 1.2s ease-in-out infinite;
    }
    .koa-typing span:nth-child(2) { animation-delay: 0.18s; }
    .koa-typing span:nth-child(3) { animation-delay: 0.36s; }
    @keyframes koa-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-5px); }
    }

    #koa-quick-replies {
      display: flex; flex-wrap: wrap; gap: 6px;
      padding: 4px 16px 12px;
    }
    .koa-qr {
      background: rgba(59,189,245,0.07);
      border: 1px solid rgba(59,189,245,0.22);
      color: #3BBDF5; font-size: 12px; font-weight: 500;
      padding: 7px 18px; border-radius: 8px; cursor: pointer;
      transition: background 0.15s, border-color 0.15s, transform 0.1s;
      font-family: inherit;
    }
    .koa-qr:hover { background: rgba(59,189,245,0.15); border-color: rgba(59,189,245,0.4); transform: translateY(-1px); }
    .koa-qr:active { transform: scale(0.96); }

    #koa-input-area {
      background: #0d1b2a;
      border-top: 1px solid rgba(255,255,255,0.055);
      padding: 12px; display: flex; gap: 8px; align-items: center;
      flex-shrink: 0;
    }
    #koa-input {
      flex: 1; background: #070e18;
      border: 1px solid rgba(255,255,255,0.09); border-radius: 10px;
      color: #fff; font-size: 13.5px; padding: 9px 13px;
      outline: none; font-family: inherit;
      transition: border-color 0.15s;
    }
    #koa-input::placeholder { color: rgba(255,255,255,0.28); }
    #koa-input:focus { border-color: rgba(59,189,245,0.38); }
    #koa-send {
      width: 36px; height: 36px; flex-shrink: 0;
      background: #3BBDF5; border: none; border-radius: 10px;
      cursor: pointer; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, transform 0.1s;
    }
    #koa-send:hover { background: #55c9f7; }
    #koa-send:active { transform: scale(0.9); }
    #koa-send:disabled { background: rgba(59,189,245,0.28); cursor: not-allowed; }
  `;
  document.head.appendChild(styleEl);

  root.innerHTML = `
    <button id="koa-chat-btn" aria-label="Chat with Koa Pro Detail">
      <img id="koa-btn-logo" src="/brand_assets/Updated Logo.png" alt="Koa" style="width:56px;height:56px;object-fit:contain;display:block;">
      <svg id="koa-btn-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" style="display:none;">
        <line x1="18" y1="6" x2="6" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        <line x1="6" y1="6" x2="18" y2="18" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    </button>

    <div id="koa-chat-panel" role="dialog" aria-label="Koa Pro Detail Chat">
      <div id="koa-chat-header">
        <div id="koa-chat-avatar"><img src="/brand_assets/Updated Logo.png" alt="Koa" style="width:32px;height:32px;object-fit:contain;display:block;"></div>
        <div id="koa-chat-header-info">
          <div id="koa-chat-header-name">Koa Pro Detail</div>
          <div id="koa-chat-header-sub">
            <span class="koa-dot"></span>AI assistant · replies instantly
          </div>
        </div>
        <button id="koa-chat-close" aria-label="Close chat">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <div id="koa-chat-messages"></div>
      <div id="koa-quick-replies"></div>

      <div id="koa-input-area">
        <input id="koa-input" type="text" placeholder="Ask about services, pricing…" maxlength="500" autocomplete="off">
        <button id="koa-send" aria-label="Send">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  `;

  const btn    = document.getElementById('koa-chat-btn');
  const panel  = document.getElementById('koa-chat-panel');
  const close  = document.getElementById('koa-chat-close');
  const msgs   = document.getElementById('koa-chat-messages');
  const qrEl   = document.getElementById('koa-quick-replies');
  const input  = document.getElementById('koa-input');
  const send   = document.getElementById('koa-send');
  const icon   = document.getElementById('koa-btn-icon');

  const logo = document.getElementById('koa-btn-logo');

  const QR = [
    'What services do you offer?',
    'How much does detailing cost?',
    'What areas do you cover?',
    'How do I book an appointment?',
  ];

  let isOpen    = false;
  let isLoading = false;
  let history   = []; // [{role, content}] for API calls
  let greeted   = false;

  function toggle() {
    isOpen = !isOpen;
    panel.classList.toggle('koa-open', isOpen);
    logo.style.display = isOpen ? 'none' : 'block';
    icon.style.display = isOpen ? 'block' : 'none';

    if (isOpen && !greeted) {
      greeted = true;
      showBot("Hi! I'm Koa's AI assistant. I can answer questions about our mobile detailing services, pricing, and booking. How can I help? 🚗✨");
      qrEl.innerHTML = QR.map(q =>
        `<button class="koa-qr">${escHtml(q)}</button>`
      ).join('');
    }
    if (isOpen) setTimeout(() => input.focus(), 280);
  }

  function escHtml(s) {
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function linkify(text) {
    return escHtml(text)
      .replace(/\n/g, '<br>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/https?:\/\/[^\s<>"]+/g, url =>
        `<a href="${url}" target="_blank" rel="noopener" style="color:#3BBDF5;text-underline-offset:2px;word-break:break-all;">${url}</a>`
      );
  }

  function showUser(text) {
    const d = document.createElement('div');
    d.className = 'koa-msg koa-user';
    d.innerHTML = `<div class="koa-bubble">${escHtml(text)}</div>`;
    msgs.appendChild(d);
    scrollBot();
  }

  function showBot(text) {
    const d = document.createElement('div');
    d.className = 'koa-msg koa-bot';
    d.innerHTML = `<div class="koa-bubble">${linkify(text)}</div>`;
    msgs.appendChild(d);
    scrollBot();
  }

  function showTyping() {
    const d = document.createElement('div');
    d.className = 'koa-typing';
    d.id = 'koa-typing';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    scrollBot();
  }

  function hideTyping() {
    const el = document.getElementById('koa-typing');
    if (el) el.remove();
  }

  function scrollBot() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  async function sendMsg(text) {
    text = text.trim();
    if (!text || isLoading) return;

    // Clear quick replies on first send
    qrEl.innerHTML = '';

    showUser(text);
    input.value = '';
    isLoading = true;
    send.disabled = true;

    // Build messages array: append new user turn to history
    const apiMessages = [...history, { role: 'user', content: text }];

    showTyping();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages.slice(-12) }),
      });
      const data = await res.json();
      hideTyping();

      const reply = data.content || data.error || 'Something went wrong. Please call (571) 850-2351.';
      showBot(reply);

      // Only persist to history on success (no error key)
      if (!data.error) {
        history.push({ role: 'user', content: text });
        history.push({ role: 'assistant', content: data.content });
      }
    } catch {
      hideTyping();
      showBot("Sorry, I couldn't connect. Please call us at (571) 850-2351 or email koaprodetail@gmail.com.");
    } finally {
      isLoading = false;
      send.disabled = false;
      input.focus();
    }
  }

  // Event listeners
  btn.addEventListener('click', toggle);
  close.addEventListener('click', toggle);
  send.addEventListener('click', () => sendMsg(input.value));
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMsg(input.value); }
  });
  qrEl.addEventListener('click', e => {
    const qr = e.target.closest('.koa-qr');
    if (qr) sendMsg(qr.textContent);
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (isOpen && !root.contains(e.target)) toggle();
  }, true);
})();
