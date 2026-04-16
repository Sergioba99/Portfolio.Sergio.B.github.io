(function () {
  const STORAGE_KEY = 'portfolio-chatbot-state-v1';
  const OPEN_KEY = 'portfolio-chatbot-open-v1';
  const MAX_REQUEST_MESSAGES = 24;
  const API_BASE_URL = 'https://groq-portfolio-chatbot.sergio-berraco99.workers.dev';

  const SYSTEM_MESSAGE = {
    role: 'system',
    content: 'Eres el asistente del portfolio de Sergio. Responde solo sobre su CV, experiencia, proyectos, stack y contacto profesional. Si preguntan algo fuera de alcance, contesta de forma breve y redirige a ese contenido.',
  };

  const WELCOME_MESSAGE = {
    role: 'assistant',
    content: 'Hola. Puedo ayudarte con el CV, los proyectos y el stack de Sergio. Pregunta lo que necesites sobre su perfil profesional.',
  };

  const apiBaseUrl = normalizeBaseUrl(API_BASE_URL);

  const state = {
    messages: loadMessages(),
    open: loadOpenState(),
    loading: false,
    status: '',
    blockedUntil: 0,
  };

  let root;
  let launcher;
  let panel;
  let messagesEl;
  let statusEl;
  let inputEl;
  let sendButton;
  let resetButton;
  let closeButton;
  let disclaimerEl;
  let blockedTimer = null;

  function normalizeBaseUrl(value) {
    return String(value || '').trim().replace(/\/$/, '');
  }

  function safeStorageGet(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function safeStorageSet(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch (err) {
      /* noop */
    }
  }

  function loadMessages() {
    const raw = safeStorageGet(STORAGE_KEY);
    if (!raw) return [WELCOME_MESSAGE];

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed) || parsed.length === 0) return [WELCOME_MESSAGE];
      return parsed.filter((message) => message && typeof message.content === 'string' && typeof message.role === 'string');
    } catch (err) {
      return [WELCOME_MESSAGE];
    }
  }

  function loadOpenState() {
    return safeStorageGet(OPEN_KEY) === 'true';
  }

  function persistState() {
    safeStorageSet(STORAGE_KEY, JSON.stringify(state.messages));
    safeStorageSet(OPEN_KEY, state.open ? 'true' : 'false');
  }

  function canSubmit() {
    return !state.loading && !isRateLimited();
  }

  function isRateLimited() {
    return state.blockedUntil && Date.now() < state.blockedUntil;
  }

  function buildPayloadMessages() {
    const recentMessages = state.messages.slice(-MAX_REQUEST_MESSAGES);
    return [SYSTEM_MESSAGE, ...recentMessages];
  }

  function createEl(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (typeof text === 'string') el.textContent = text;
    return el;
  }

  function mount() {
    if (document.getElementById('portfolio-chatbot-root')) return;

    root = createEl('div', 'pf-chat');
    root.id = 'portfolio-chatbot-root';
    root.dataset.state = state.open ? 'open' : 'closed';

    panel = createEl('section', 'pf-chat-panel');
    panel.id = 'portfolio-chatbot-panel';
    panel.setAttribute('aria-hidden', state.open ? 'false' : 'true');
    panel.setAttribute('aria-label', 'Asistente del portfolio');

    const header = createEl('header', 'pf-chat-header');
    const title = createEl('h2', 'pf-chat-title', 'Asistente de Sergio');
    const headerControls = createEl('div', 'pf-chat-header-controls');

    resetButton = createEl('button', 'pf-chat-control pf-chat-reset', '⋯');
    resetButton.type = 'button';
    resetButton.setAttribute('aria-label', 'Reiniciar historial');
    resetButton.addEventListener('click', resetHistory);

    closeButton = createEl('button', 'pf-chat-control pf-chat-close', '✕');
    closeButton.type = 'button';
    closeButton.setAttribute('aria-label', 'Cerrar chat');
    closeButton.addEventListener('click', closePanel);

    headerControls.append(resetButton, closeButton);
    header.append(title, headerControls);

    messagesEl = createEl('div', 'pf-chat-messages');
    messagesEl.setAttribute('role', 'log');
    messagesEl.setAttribute('aria-live', 'polite');
    messagesEl.setAttribute('aria-relevant', 'additions');

    const footer = createEl('div', 'pf-chat-footer');

    statusEl = createEl('div', 'pf-chat-status');
    statusEl.setAttribute('aria-live', 'polite');

    const form = createEl('form', 'pf-chat-form');
    form.noValidate = true;

    const compose = createEl('div', 'pf-chat-compose');

    inputEl = document.createElement('textarea');
    inputEl.className = 'pf-chat-input';
    inputEl.rows = 1;
    inputEl.placeholder = 'Pregunta por Sergio, sus proyectos o su stack';
    inputEl.setAttribute('aria-label', 'Escribe tu pregunta');
    inputEl.addEventListener('input', autosizeInput);
    inputEl.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        submitFromInput();
      }
    });

    sendButton = createEl('button', 'pf-chat-send', 'Enviar');
    sendButton.type = 'submit';

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      submitFromInput();
    });

    compose.append(inputEl, sendButton);
    form.append(compose);

    disclaimerEl = createEl('p', 'pf-chat-disclaimer', 'Las respuestas se basan en documentación disponible y pueden contener errores.');

    footer.append(statusEl, form, disclaimerEl);

    panel.append(header, messagesEl, footer);

    launcher = createEl('button', 'pf-chat-launcher');
    launcher.type = 'button';
    launcher.setAttribute('aria-controls', 'portfolio-chatbot-panel');
    launcher.setAttribute('aria-expanded', state.open ? 'true' : 'false');

    const launcherIcon = createRobotIcon();
    launcher.append(launcherIcon);

    launcher.addEventListener('click', togglePanel);

    root.append(panel, launcher);
    document.body.appendChild(root);

    document.addEventListener('keydown', handleGlobalKeydown);
    document.addEventListener('click', handleOutsideClick, true);

    render();
    autosizeInput();

    if (inputEl) {
      inputEl.disabled = !apiBaseUrl;
    }
  }

  function handleGlobalKeydown(event) {
    if (event.key === 'Escape' && state.open) {
      closePanel();
    }
  }

  function handleOutsideClick(event) {
    if (!state.open || !root) return;
    if (root.contains(event.target)) return;
    closePanel();
  }

  function openPanel() {
    state.open = true;
    persistState();
    render();
    if (inputEl) {
      window.setTimeout(() => inputEl.focus(), 0);
    }
  }

  function closePanel() {
    state.open = false;
    persistState();
    render();
  }

  function resetHistory() {
    state.messages = [WELCOME_MESSAGE];
    state.status = '';
    state.loading = false;
    state.blockedUntil = 0;
    if (blockedTimer) {
      window.clearInterval(blockedTimer);
      blockedTimer = null;
    }
    safeStorageSet(STORAGE_KEY, JSON.stringify(state.messages));
    safeStorageSet(OPEN_KEY, state.open ? 'true' : 'false');
    render();
    autosizeInput();
    if (inputEl) {
      inputEl.value = '';
    }
  }

  function togglePanel() {
    if (state.open) {
      closePanel();
    } else {
      openPanel();
    }
  }

  function setStatus(text) {
    state.status = text || '';
    renderStatus();
  }

  function renderStatus() {
    if (!statusEl) return;

    if (!apiBaseUrl) {
      statusEl.textContent = 'Configura la URL del worker para activar el chat.';
      return;
    }

    if (state.loading) {
      statusEl.textContent = 'Pensando...';
      return;
    }

    if (isRateLimited()) {
      const seconds = Math.max(1, Math.ceil((state.blockedUntil - Date.now()) / 1000));
      statusEl.textContent = `Demasiadas peticiones. Prueba de nuevo en ${seconds} s.`;
      return;
    }

    statusEl.textContent = state.status || '';
  }

  function render() {
    if (!root) return;

    root.dataset.state = state.open ? 'open' : 'closed';
    panel.setAttribute('aria-hidden', state.open ? 'false' : 'true');
    launcher.setAttribute('aria-expanded', state.open ? 'true' : 'false');

    messagesEl.replaceChildren();

    state.messages.forEach((message) => {
      messagesEl.appendChild(renderMessage(message));
    });

    if (state.loading) {
      messagesEl.appendChild(renderTypingIndicator());
    }

    sendButton.disabled = !canSubmit() || !apiBaseUrl;
    inputEl.disabled = !apiBaseUrl;

    renderStatus();
    scrollMessagesToBottom();
  }

  function renderMessage(message) {
    const bubble = createEl('article', `pf-chat-message pf-chat-message-${message.role}`);
    bubble.dataset.role = message.role;

    const content = createEl('div', 'pf-chat-message-content');
    content.textContent = message.content;
    bubble.appendChild(content);

    if (message.role === 'assistant' || message.role === 'system') {
      const meta = createEl('span', 'pf-chat-message-meta', message.role === 'system' ? 'Sistema' : 'Asistente');
      bubble.appendChild(meta);
    } else {
      const meta = createEl('span', 'pf-chat-message-meta', 'Tú');
      bubble.appendChild(meta);
    }

    return bubble;
  }

  function createRobotIcon() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    svg.classList.add('pf-chat-launcher-icon');

    const head = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    head.setAttribute('x', '5');
    head.setAttribute('y', '6');
    head.setAttribute('width', '14');
    head.setAttribute('height', '11');
    head.setAttribute('rx', '4');

    const eyeLeft = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eyeLeft.setAttribute('cx', '10');
    eyeLeft.setAttribute('cy', '11');
    eyeLeft.setAttribute('r', '1');

    const eyeRight = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eyeRight.setAttribute('cx', '14');
    eyeRight.setAttribute('cy', '11');
    eyeRight.setAttribute('r', '1');

    const mouth = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    mouth.setAttribute('d', 'M9 14.5h6');

    const antenna = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    antenna.setAttribute('d', 'M12 6V4');

    svg.append(head, eyeLeft, eyeRight, mouth, antenna);
    return svg;
  }

  function renderTypingIndicator() {
    const typing = createEl('article', 'pf-chat-message pf-chat-message-assistant pf-chat-typing');
    typing.dataset.role = 'assistant';

    const dots = createEl('span', 'pf-chat-typing-dots');
    dots.append(createEl('span'), createEl('span'), createEl('span'));
    typing.appendChild(dots);

    const meta = createEl('span', 'pf-chat-message-meta', 'Escribiendo...');
    typing.appendChild(meta);

    return typing;
  }

  function scrollMessagesToBottom() {
    if (!messagesEl) return;
    window.requestAnimationFrame(() => {
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  function autosizeInput() {
    if (!inputEl) return;
    inputEl.style.height = 'auto';
    inputEl.style.height = `${Math.min(inputEl.scrollHeight, 120)}px`;
  }

  function submitFromInput() {
    const value = inputEl.value.trim();
    if (!value || !canSubmit()) return;
    sendMessage(value);
  }

  async function sendMessage(text) {
    if (!apiBaseUrl) {
      setStatus('Configura la URL del worker para activar el chat.');
      return;
    }

    if (state.loading || isRateLimited()) return;

    state.messages = [...state.messages, { role: 'user', content: text }];
    state.loading = true;
    state.status = '';
    inputEl.value = '';
    autosizeInput();
    persistState();
    render();

    try {
      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: buildPayloadMessages(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 429) {
          const retrySeconds = Number(data.retry_after_seconds || data.retryAfterSeconds || data.retryAfter || 30);
          state.blockedUntil = Date.now() + Math.max(1, retrySeconds) * 1000;
          startBlockedTicker();
          state.messages = [
            ...state.messages,
            {
              role: 'assistant',
              content: 'Ahora mismo hay demasiadas peticiones. Espera un momento y vuelve a intentarlo.',
            },
          ];
          persistState();
          render();
          return;
        }

        throw new Error(data.error || 'La petición al worker ha fallado.');
      }

      const reply = typeof data.reply === 'string' && data.reply.trim()
        ? data.reply.trim()
        : 'No he recibido una respuesta válida del worker.';

      state.messages = [...state.messages, { role: 'assistant', content: reply }];
      state.status = data.sources && Array.isArray(data.sources) && data.sources.length
        ? `Fuentes: ${data.sources.join(', ')}`
        : 'Respuesta recibida.';
      persistState();
      render();
    } catch (error) {
      const friendlyMessage = error && error.message
        ? error.message
        : 'No he podido conectar con el worker.';

      state.messages = [
        ...state.messages,
        {
          role: 'assistant',
          content: apiBaseUrl
            ? `No he podido completar la respuesta. ${friendlyMessage}`
            : 'Falta configurar la URL del worker para activar el chat.',
        },
      ];
      state.status = apiBaseUrl
        ? 'Error al conectar con el worker.'
        : 'Configura la URL del worker para activar el chat.';
      persistState();
      render();
    } finally {
      state.loading = false;
      render();
    }
  }

  function startBlockedTicker() {
    if (blockedTimer) return;
    blockedTimer = window.setInterval(() => {
      if (!isRateLimited()) {
        window.clearInterval(blockedTimer);
        blockedTimer = null;
      }
      renderStatus();
    }, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
})();
