(() => {
  // --- CONFIGURAÇÕES GERAIS E INICIALIZAÇÃO ---
  const doc = document;
  const html = doc.documentElement;

  // Seta o ano no rodapé
  doc.getElementById("year").textContent = new Date().getFullYear();

  // --- LÓGICA DO MENU MOBILE ---
  const mobileMenuBtn = doc.getElementById("mobile-menu-btn");
  const mobileMenu = doc.getElementById("mobile-menu");
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // --- LÓGICA DO TEMA (CLARO/ESCURO) ---
  const themeToggleBtn = doc.getElementById("theme-toggle-btn");
  const skyboxClaro = "qwantani_sunset_puresky_4k.hdr";
  const skyboxEscuro = "moonless_golf_4k.hdr";
  const viewerInfografico = doc.querySelector("#totem-infografico");
  const viewerSimulacao = doc.querySelector("#totem-simulacao");

  const applyTheme = (theme) => {
    if (theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    const novoSkybox = theme === "dark" ? skyboxEscuro : skyboxClaro;

    if (viewerInfografico) {
      viewerInfografico.skyboxImage = novoSkybox;
    }
    if (viewerSimulacao) {
      viewerSimulacao.skyboxImage = novoSkybox;
    }
  };
  // Aplico o tema salvo no localStorage ou o padrão do sistema
  const savedTheme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");
  applyTheme(savedTheme);

  themeToggleBtn.addEventListener("click", () => {
    const newTheme = html.classList.contains("dark") ? "light" : "dark";
    applyTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  });

  // --- LÓGICA DE IDIOMA (PT/EN) ---
  const langToggleBtn = doc.getElementById("lang-toggle-btn");
  const translatableElements = doc.querySelectorAll("[data-lang-pt]");

  const setLanguage = (lang) => {
    translatableElements.forEach((el) => {
      el.innerHTML = el.dataset[lang === "en" ? "langEn" : "langPt"];
    });
    langToggleBtn.textContent = lang === "en" ? "PT" : "EN";
    html.lang = lang === "en" ? "en-US" : "pt-BR";
    localStorage.setItem("language", lang);
  };

  const savedLang = localStorage.getItem("language") || "pt";
  setLanguage(savedLang);

  langToggleBtn.addEventListener("click", () => {
    const newLang = localStorage.getItem("language") === "en" ? "pt" : "en";
    setLanguage(newLang);
  });

  // --- LÓGICA DO VISUALIZADOR INTERATIVO (#totem-infografico) ---
  const modelViewer = document.querySelector("#totem-infografico");
  if (modelViewer) {
    // Adicionado um 'if' para segurança, caso o elemento não exista
    const viewerContainer = document.querySelector("#viewer-container");

    const initialOrbit = modelViewer.cameraOrbit;
    const initialTarget = modelViewer.cameraTarget;
    const initialFov = modelViewer.fieldOfView;

    // Botões da UI
    const helpBtn = document.querySelector("#help-btn");
    const fullscreenBtn = document.querySelector("#fullscreen-btn");
    const helpOverlay = document.querySelector("#help-overlay");
    const closeHelpBtn = document.querySelector("#close-help-btn");
    const resetCameraBtn = document.querySelector("#reset-camera-btn");
    const annotationSelect = document.querySelector(
      "#annotation-selector select"
    );

    // Ferramenta para pegar a POSIÇÃO DO HOTSPOT (Alt + Clique Esquerdo)
    modelViewer.addEventListener("click", (event) => {
      if (!event.altKey) return;
      const posAndNorm = modelViewer.positionAndNormalFromPoint(
        event.clientX,
        event.clientY
      );
      if (posAndNorm) {
        console.clear();
        console.log(
          "%c Posição para Hotspot (data-position):",
          "color: #3498db; font-weight: bold;"
        );
        // Imprime os dois atributos necessários para o hotspot
        console.log(`data-position="${posAndNorm.position.toString()}"`);
        console.log(`data-normal="${posAndNorm.normal.toString()}"`);
      }
    });

    // ATUALIZADO: Ferramenta para pegar a VISÃO DA CÂMERA (Alt + Clique Direito)
    modelViewer.addEventListener("contextmenu", (event) => {
      // Funciona apenas com a tecla ALT pressionada
      if (!event.altKey) return;

      // Impede que o menu padrão do navegador apareça
      event.preventDefault();

      // CORREÇÃO: Usamos os métodos getCameraOrbit() e getCameraTarget() para pegar os valores ao vivo
      const orbit = modelViewer.getCameraOrbit();
      const target = modelViewer.getCameraTarget();

      // Os métodos retornam objetos, então formatamos a string manualmente
      // Convertemos os ângulos de radianos para graus
      const orbitString = `${orbit.theta * (180 / Math.PI)}deg ${
        orbit.phi * (180 / Math.PI)
      }deg ${orbit.radius}m`;
      const targetString = `${target.x}m ${target.y}m ${target.z}m`;

      console.clear();
      console.log(
        "%c Posição da Câmera para Zoom (copie para o hotspot):",
        "color: #2ecc71; font-weight: bold;"
      );
      // Imprime os dois atributos com o formato correto
      console.log(`data-target-orbit="${orbitString}"`);
      console.log(`data-target-point="${targetString}"`);

      alert(
        "Coordenadas de órbita e alvo (corrigidas) copiadas para o console!"
      );
    });

    // Lógica dos Hotspots
    const hotspots = document.querySelectorAll(".hotspot");

    hotspots.forEach((hotspot, index) => {
      const annotationTitle =
        hotspot.querySelector(".annotation strong").textContent;
      const option = document.createElement("option");

      // Usamos o 'hotspot.slot' como o valor da opção para criar o vínculo correto.
      option.value = hotspot.slot;
      option.textContent = `${index + 1}. ${annotationTitle}`;

      // Adiciona os data-attributes para a tradução funcionar também no seletor
      option.dataset.langPt = `${index + 1}. ${
        hotspot.querySelector("[data-lang-pt]").textContent
      }`;
      option.dataset.langEn = `${index + 1}. ${
        hotspot.querySelector("[data-lang-en]").textContent
      }`;

      annotationSelect.appendChild(option);

      //Funcionalidade do Hotspot
      hotspot.addEventListener("click", () => {
        const isVisible = hotspot.classList.contains("visible");
        // Esconde todos os outros hotspots
        hotspots.forEach((h) => h.classList.remove("visible"));

        // Se não estava visível, mostra e move a câmera
        if (!isVisible) {
          hotspot.classList.add("visible");

          const targetOrbit = hotspot.dataset.targetOrbit;
          const targetPoint = hotspot.dataset.targetPoint;
          const targetFov = hotspot.dataset.targetFov;

          modelViewer.cameraTarget = targetPoint;
          modelViewer.cameraOrbit = targetOrbit;
          modelViewer.fieldOfView = targetFov;

          annotationSelect.value = hotspot.slot;
        } else {
          // Se já estava visível, reseta a câmera para a posição inicial
          modelViewer.cameraOrbit = initialOrbit;
          modelViewer.cameraTarget = initialTarget;
          modelViewer.fieldOfView = initialFov;
          annotationSelect.value = "";
        }
      });
    });

    // Evento do seletor
    annotationSelect.addEventListener("change", (event) => {
      const selectedSlot = event.target.value;
      // Encontra o hotspot que tem o 'slot' correspondente ao valor selecionado
      const selectedHotspot = document.querySelector(
        `[slot="${selectedSlot}"]`
      );

      if (selectedHotspot) {
        // Simula um clique no hotspot encontrado
        selectedHotspot.click();
      } else {
        // Lógica de reset se nenhuma opção for selecionada
        hotspots.forEach((h) => h.classList.remove("visible"));
        modelViewer.cameraOrbit = initialOrbit;
        modelViewer.cameraTarget = initialTarget;
        modelViewer.fieldOfView = initialFov;
      }
    });

    // Lógica da UI
    helpBtn.addEventListener("click", () =>
      helpOverlay.classList.remove("hidden")
    );
    closeHelpBtn.addEventListener("click", () =>
      helpOverlay.classList.add("hidden")
    );
    resetCameraBtn.addEventListener("click", () => {
      modelViewer.cameraOrbit = initialOrbit;
      modelViewer.cameraTarget = initialTarget;
      modelViewer.fieldOfView = initialFov;
      helpOverlay.classList.add("hidden");
    });
    fullscreenBtn.addEventListener("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        viewerContainer.requestFullscreen();
      }
    });
  }
  // --- LÓGICA DA SIMULAÇÃO (#totem-simulacao) ---
  const modelSimulation = doc.querySelector("#totem-simulacao");
  if (modelSimulation) {
    modelSimulation.addEventListener("load", () => {
      const orbit = modelSimulation.getCameraOrbit();
      const radius = orbit.radius;
      const phi = orbit.phi * (180 / Math.PI); // Converto para graus
      const initialYaw = -30;
      const rotationRange = 60; // Rotação de 90 graus para cada lado

      const animateRotation = (time) => {
        // Uso seno para um movimento suave de pêndulo
        const yaw = initialYaw + rotationRange * Math.sin(time / 20000); // Divisor maior = mais lento
        modelSimulation.cameraOrbit = `${yaw}deg ${phi}deg ${radius}m`;
        requestAnimationFrame(animateRotation);
      };
      requestAnimationFrame(animateRotation);
    });
  }
})();
