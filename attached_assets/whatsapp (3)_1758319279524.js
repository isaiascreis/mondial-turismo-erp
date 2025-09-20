// modules/whatsapp.js - Versão final com correção no payload de áudio (body com filename) + checkStatus via /healthz
const WhatsappModule = {
  render: () => {
    // O HTML não muda
    return `
      <div class="header"><div class="header-body"><h1>WhatsApp</h1></div></div>
      <div class="content-body">
        <div class="card">
          <div class="card-body">
            <div class="tabs-nav">
              <button type="button" class="tab-link active" data-tab="atendimento"><i class="fa-solid fa-comments"></i> Atendimento</button>
              <button type="button" class="tab-link" data-tab="config"><i class="fa-solid fa-qrcode"></i> Configurações</button>
              <button type="button" class="tab-link" data-tab="kanban"><i class="fa-solid fa-table-columns"></i> CRM - Kanban</button>
            </div>
            <div class="tabs-content">
              <div id="tab-atendimento" class="tab-pane active">
                <div class="chat-layout">
                  <div class="chat-sidebar">
                    <div id="connection-status-container" class="sidebar-header">
                      Status: <span id="connection-status">Verificando...</span>
                    </div>
                    <ul id="conversations-list" class="conversations-list">
                      <li class="no-conversations">Carregando...</li>
                    </ul>
                  </div>
                  <div class="chat-main">
                    <div id="chat-welcome" class="chat-welcome">
                      <i class="fa-brands fa-whatsapp"></i>
                      <h2>Bem-vindo ao Chat</h2>
                      <p>Selecione uma conversa para começar.</p>
                    </div>
                    <div id="chat-window" class="chat-window hidden">
                      <div id="chat-header" class="chat-header"></div>
                      <div id="chat-messages" class="chat-messages"></div>
                      <div class="chat-input-area">
                        <div class="attachment-wrapper">
                          <button id="emoji-btn" class="chat-tool-btn" title="Emojis"><i class="fa-solid fa-face-smile"></i></button>
                          <emoji-picker class="hidden"></emoji-picker>
                        </div>
                        <textarea id="chat-input" placeholder="Digite sua mensagem..." rows="1"></textarea>
                        <div class="attachment-wrapper">
                          <button id="attach-btn" class="chat-tool-btn" title="Anexar arquivo"><i class="fa-solid fa-paperclip"></i></button>
                          <input type="file" id="attach-input" class="hidden"/>
                        </div>
                        <button id="record-audio-btn" class="chat-tool-btn" title="Gravar áudio"><i class="fa-solid fa-microphone"></i></button>
                        <button id="send-message-btn" title="Enviar Mensagem"><i class="fa-solid fa-paper-plane"></i></button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div id="tab-config" class="tab-pane">
                <div id="whatsapp-connect-screen" style="text-align: center;">
                  <h2 id="whatsapp-status-config">Verificando status...</h2>
                  <div id="qrcode-container" class="hidden" style="margin-top: 1rem;">
                    <p>Para conectar ou reconectar, escaneie o QR Code abaixo.</p>
                    <img id="qr-code-img" src="" alt="QR Code do WhatsApp" style="max-width: 300px; width: 100%; border: 1px solid #e9ecef; border-radius: 0.375rem; padding: 10px;"/>
                  </div>
                </div>
              </div>
              <div id="tab-kanban" class="tab-pane">
                <h2>CRM - Kanban</h2>
                <p class="empty-state">Funcionalidade em desenvolvimento.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    const tabsNav = document.querySelector('.tabs-nav');
    const tabPanes = document.querySelectorAll('.tabs-content .tab-pane');
    tabsNav.addEventListener('click', (event) => {
      const tabLink = event.target.closest('.tab-link');
      if (!tabLink) return;
      tabsNav.querySelectorAll('.tab-link').forEach(link => link.classList.remove('active'));
      tabPanes.forEach(pane => pane.classList.remove('active'));
      tabLink.classList.add('active');
      const tabId = tabLink.dataset.tab;
      document.getElementById(`tab-${tabId}`).classList.add('active');
    });

    const statusEl = document.getElementById('connection-status');
    const statusElConfig = document.getElementById('whatsapp-status-config');
    const qrContainer = document.getElementById('qrcode-container');
    const qrImg = document.getElementById('qr-code-img');
    const chatWelcome = document.getElementById('chat-welcome');
    const chatWindow = document.getElementById('chat-window');
    const chatHeader = document.getElementById('chat-header');
    const chatMessages = document.getElementById('chat-messages');
    const conversationsList = document.getElementById('conversations-list');
    const chatInput = document.getElementById('chat-input');
    const sendMessageBtn = document.getElementById('send-message-btn');
    const emojiBtn = document.getElementById('emoji-btn');
    const emojiPicker = document.querySelector('emoji-picker');
    const attachBtn = document.getElementById('attach-btn');
    const attachInput = document.getElementById('attach-input');
    const recordAudioBtn = document.getElementById('record-audio-btn');

    const serverUrl = 'https://mondial-whatsapp-server.onrender.com';

    let chatInitialized = false;
    let currentChatId = null;
    let currentMessagesRef = null;
    let allClients = {};
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    const setComposeEnabled = (enabled) => {
      chatInput.disabled = !enabled;
      sendMessageBtn.disabled = !enabled;
      if (emojiBtn) emojiBtn.disabled = !enabled;
      if (attachBtn) attachBtn.disabled = !enabled;
      if (recordAudioBtn) recordAudioBtn.disabled = !enabled;
      chatInput.placeholder = enabled ? 'Digite sua mensagem...' : 'Conecte o WhatsApp para enviar mensagens...';
    };

    // --- Verificação de Status (Back-end) ---
    const checkStatus = async () => {
      try {
        const h = await fetch(`${serverUrl}/healthz`, { cache: 'no-store' });
        if (!h.ok) throw new Error('healthz not ok');
        const hdata = await h.json();

        const statusText = typeof hdata.status === 'string' ? hdata.status : 'Indisponível';
        statusEl.textContent = statusText;
        statusElConfig.textContent = `Status da Conexão: ${statusText}`;

        if (statusText.toLowerCase() === 'conectado') {
          qrContainer.classList.add('hidden');
          setComposeEnabled(true);
          if (!chatInitialized) initializeChat();
        } else {
          // servidor de pé, mas não conectado: tenta buscar QR
          setComposeEnabled(false);
          const r = await fetch(`${serverUrl}/qrcode`, { cache: 'no-store' });
          if (r.ok) {
            const data = await r.json();
            if (data.qrUrl) {
              qrImg.src = data.qrUrl;
              qrContainer.classList.remove('hidden');
            } else {
              qrContainer.classList.add('hidden');
            }
          }
        }
      } catch (err) {
        // se o container estiver fora do ar, evita flood de erros no console
        console.warn('checkStatus falhou:', err);
        statusEl.textContent = 'Offline';
        statusElConfig.textContent = 'Servidor indisponível';
        setComposeEnabled(false);
      }
    };

    const statusInterval = setInterval(checkStatus, 7000);
    checkStatus();

    const initializeChat = () => {
      if (chatInitialized) return;
      chatInitialized = true;

      // Carrega lista de clientes para nomear conversas
      if (typeof FirebaseService?.listarClientes === 'function') {
        FirebaseService.listarClientes(clients => { allClients = clients || {}; });
      }

      const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '');
      const formatDisplayPhone = (phone) => {
        const cleaned = normalizePhone(phone);
        const match = cleaned.match(/^(?:55)?(\d{2})(\d{1})(\d{4})(\d{4})$/);
        if (match) return `(${match[1]}) ${match[2]} ${match[3]}-${match[4]}`;
        return phone;
      };
      const getClientName = (whatsappId) => {
        const normalizedId = normalizePhone(whatsappId.split('@')[0]).slice(-11);
        for (const clientId in allClients) {
          const clientPhone = normalizePhone(allClients[clientId].telefone);
          if (clientPhone.endsWith(normalizedId)) return allClients[clientId].nome;
        }
        return null;
      };

      const autoResize = () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = `${Math.min(chatInput.scrollHeight, 180)}px`;
      };
      chatInput.addEventListener('input', autoResize);
      autoResize();

      const conversationsRef = firebase.database().ref('erp/whatsapp/conversas');

      conversationsRef.on('value', (snapshot) => {
        conversationsList.innerHTML = '';
        if (!snapshot.exists()) {
          conversationsList.innerHTML = '<li class="no-conversations">Nenhuma conversa encontrado.</li>';
          return;
        }
        snapshot.forEach((childSnapshot) => {
          const number = childSnapshot.key;
          const displayName = getClientName(number) || formatDisplayPhone(number.split('@')[0]);
          const li = document.createElement('li');
          li.textContent = displayName;
          li.dataset.chatId = number;
          if (number === currentChatId) li.classList.add('active');
          conversationsList.appendChild(li);
        });
      });

      conversationsList.addEventListener('click', (e) => {
        const li = e.target.closest('li');
        if (!li || !li.dataset.chatId) return;
        document.querySelectorAll('.conversations-list li.active').forEach(el => el.classList.remove('active'));
        li.classList.add('active');
        currentChatId = li.dataset.chatId;
        loadConversation(currentChatId);
      });

      const loadConversation = (chatId) => {
        const displayName = getClientName(chatId) || formatDisplayPhone(chatId.split('@')[0]);
        chatHeader.textContent = `Conversa com: ${displayName}`;
        chatWelcome.classList.add('hidden');
        chatWindow.classList.remove('hidden');

        if (currentMessagesRef) currentMessagesRef.off();
        currentMessagesRef = firebase.database().ref(`erp/whatsapp/conversas/${chatId}`).orderByChild('timestamp');

        currentMessagesRef.on('value', (snapshot) => {
          chatMessages.innerHTML = '';
          if (!snapshot.exists()) return;

          snapshot.forEach((child) => {
            const msg = child.val() || {};
            const msgDiv = document.createElement('div');
            msgDiv.classList.add('message-bubble', msg.fromMe ? 'sent' : 'received');

            if (msg.type === 'image') {
              msgDiv.innerHTML = `<img src="${msg.url}" alt="${(msg.filename || 'Imagem')}" class="chat-image">${msg.body ? `<p>${escapeHtml(msg.body)}</p>` : ''}`;
            
            // ===================================================================
            // INÍCIO DA CORREÇÃO DE ÁUDIO
            // ===================================================================
            } else if (msg.type === 'audio') {
              if (msg.url) { // Verifica se a URL existe
                const audioProxyUrl = `${serverUrl}/proxy-audio?url=${encodeURIComponent(msg.url)}`;
                msgDiv.innerHTML = `<audio controls src="${audioProxyUrl}"></audio>`;
              } else {
                // Se não houver URL, exibe uma mensagem de erro em vez de um player quebrado
                msgDiv.innerHTML = `<div class="audio-error" style="font-style: italic; color: #8898aa; font-size: 0.9em;"><i class="fa-solid fa-circle-exclamation"></i> Áudio indisponível</div>`;
              }
            // ===================================================================
            // FIM DA CORREÇÃO DE ÁUDIO
            // ===================================================================

            } else if (msg.type === 'video') {
              msgDiv.innerHTML = `<video controls src="${msg.url}" class="chat-video"></video>`;
            } else if (msg.type && msg.type !== 'text') {
              const label = msg.body || msg.filename || 'Anexo';
              msgDiv.innerHTML = `<a href="${msg.url}" target="_blank" class="chat-attachment"><i class="fa-solid fa-file"></i> ${escapeHtml(label)}</a>`;
            } else {
              msgDiv.textContent = msg.body || '';
            }

            chatMessages.appendChild(msgDiv);
          });

          chatMessages.scrollTop = chatMessages.scrollHeight;
        });
      };

      const sendMessage = async () => {
        const text = (chatInput.value || '').trim();
        if (!currentChatId || !text) return;

        const payload = { to: currentChatId, body: text };
        const original = chatInput.value;

        chatInput.value = 'Enviando...';
        setComposeEnabled(false);

        try {
          const resp = await fetch(`${serverUrl}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!resp.ok) throw new Error('Falha no servidor ao enviar mensagem.');
          chatInput.value = '';
          autoResize();
        } catch (err) {
          console.error('Erro ao enviar mensagem:', err);
          alert('Falha ao enviar mensagem. Tente novamente.');
          chatInput.value = original;
        } finally {
          setComposeEnabled(true);
          chatInput.focus();
        }
      };

      sendMessageBtn.addEventListener('click', sendMessage);
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });

      if (emojiBtn && emojiPicker) {
        emojiBtn.addEventListener('click', (e) => {
          e.preventDefault();
          emojiPicker.classList.toggle('hidden');
        });
        emojiPicker.addEventListener('emoji-click', (event) => {
          chatInput.value += event?.detail?.unicode || '';
          autoResize();
          chatInput.focus();
        });
        document.addEventListener('click', (e) => {
          if (!emojiPicker.classList.contains('hidden')) {
            const within = e.target.closest('emoji-picker') || e.target === emojiBtn;
            if (!within) emojiPicker.classList.add('hidden');
          }
        });
      }

      attachBtn.addEventListener('click', (e) => {
        e.preventDefault();
        attachInput.click();
      });

      attachInput.addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        if (!currentChatId || !file) return;

        try {
          setComposeEnabled(false);
          chatInput.placeholder = 'Enviando anexo...';

          const safeName = file.name.replace(/[^\w.\-]+/g, '_');
          const path = `erp/whatsapp/${currentChatId}/${Date.now()}_${safeName}`;
          const storageRef = firebase.storage().ref(path);
          const uploadSnap = await storageRef.put(file);
          const downloadURL = await uploadSnap.ref.getDownloadURL();

          const body = {
            to: currentChatId,
            body: file.name, // nome no body
            mediaUrl: downloadURL,
            mediaType: file.type,
            fileName: safeName
          };

          const resp = await fetch(`${serverUrl}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
          });
          if (!resp.ok) throw new Error('Falha no servidor ao enviar anexo.');
        } catch (err) {
          console.error('Erro ao enviar anexo:', err);
          alert('Falha ao enviar anexo. Tente novamente.');
        } finally {
          attachInput.value = '';
          setComposeEnabled(true);
          chatInput.focus();
        }
      });

      const sendAudioFile = async (audioBlob) => {
        if (!currentChatId) return;

        const audioFile = new File([audioBlob], `audio_${Date.now()}.webm`, { type: 'audio/webm' });

        try {
          chatInput.placeholder = 'Enviando áudio...';
          setComposeEnabled(false);

          let downloadURL;
          try {
            const path = `erp/whatsapp/${currentChatId}/${Date.now()}_${audioFile.name}`;
            const storageRef = firebase.storage().ref(path);
            const uploadSnap = await storageRef.put(audioFile);
            downloadURL = await uploadSnap.ref.getDownloadURL();
          } catch (storageError) {
            console.error('ERRO NO FIREBASE STORAGE:', storageError);
            throw new Error(`Falha no upload para o Storage. Detalhes: ${storageError.code}`);
          }

          try {
            const body = {
              to: currentChatId,
              body: audioFile.name,
              mediaUrl: downloadURL,
              mediaType: audioFile.type,
              fileName: audioFile.name
            };
            const resp = await fetch(`${serverUrl}/send-message`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            });
            if (!resp.ok) {
              const errorBody = await resp.text();
              throw new Error(`Seu servidor retornou um erro ${resp.status}. Resposta: ${errorBody}`);
            }
          } catch (serverError) {
            console.error('ERRO NO SERVIDOR BACKEND:', serverError);
            throw new Error(`Falha na comunicação com o servidor. Detalhes: ${serverError.message}`);
          }
        } catch (err) {
          console.error('Erro final ao enviar áudio:', err);
          alert(`Falha ao enviar áudio. Detalhes: ${err.message}`);
        } finally {
          setComposeEnabled(true);
          chatInput.focus();
          chatInput.placeholder = 'Digite sua mensagem...';
        }
      };

      recordAudioBtn.addEventListener('click', () => {
        if (isRecording) {
          mediaRecorder.stop();
        } else {
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
              isRecording = true;
              mediaRecorder = new MediaRecorder(stream);
              mediaRecorder.start();

              recordAudioBtn.innerHTML = '<i class="fa-solid fa-stop"></i>';
              recordAudioBtn.style.color = 'var(--danger-color)';
              setComposeEnabled(false);
              recordAudioBtn.disabled = false;
              chatInput.placeholder = 'Gravando áudio...';

              audioChunks = [];
              mediaRecorder.addEventListener('dataavailable', event => { audioChunks.push(event.data); });
              mediaRecorder.addEventListener('stop', () => {
                isRecording = false;
                recordAudioBtn.innerHTML = '<i class="fa-solid fa-microphone"></i>';
                recordAudioBtn.style.color = '';
                const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                sendAudioFile(audioBlob);
                stream.getTracks().forEach(track => track.stop());
              });
            })
            .catch(err => {
              console.error('Erro ao acessar microfone:', err);
              alert('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
            });
        }
      });

      window.addEventListener('beforeunload', () => {
        if (currentMessagesRef) currentMessagesRef.off();
        conversationsRef.off();
        clearInterval(statusInterval);
      });
    };

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      }[m]));
    }
  }
};