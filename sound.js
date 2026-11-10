const toggle = document.querySelector("#music-toggle");
const status = document.querySelector("#music-status");

if (toggle && status) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;

  if (!AudioContextClass) {
    toggle.disabled = true;
    status.textContent = "Trình duyệt này không hỗ trợ phát nhạc nền.";
  } else {
    let audioContext;
    let noteTimer;
    let noteIndex = 0;
    const melody = [261.63, 329.63, 392, 329.63, 293.66, 349.23, 440, 349.23];

    const playNote = () => {
      const startTime = audioContext.currentTime;
      const oscillator = audioContext.createOscillator();
      const volume = audioContext.createGain();
      const frequency = melody[noteIndex % melody.length];
      noteIndex += 1;

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, startTime);
      volume.gain.setValueAtTime(0.0001, startTime);
      volume.gain.exponentialRampToValueAtTime(0.1, startTime + 0.06);
      volume.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.58);
      oscillator.connect(volume);
      volume.connect(audioContext.destination);
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.6);
    };

    toggle.addEventListener("click", async () => {
      toggle.disabled = true;

      try {
        if (!audioContext) {
          audioContext = new AudioContextClass();
        }

        if (toggle.getAttribute("aria-pressed") !== "true") {
          await audioContext.resume();
          if (audioContext.state !== "running") {
            throw new Error("Audio context did not start.");
          }

          playNote();
          noteTimer = window.setInterval(playNote, 650);
          toggle.setAttribute("aria-pressed", "true");
          toggle.textContent = "♫ Tắt nhạc nền";
          status.textContent = "Nhạc nền đang bật.";
        } else {
          window.clearInterval(noteTimer);
          await audioContext.suspend();
          toggle.setAttribute("aria-pressed", "false");
          toggle.textContent = "♫ Bật nhạc nền";
          status.textContent = "Nhạc nền đã tắt.";
        }
      } catch (error) {
        window.clearInterval(noteTimer);
        toggle.setAttribute("aria-pressed", "false");
        toggle.textContent = "♫ Bật nhạc nền";
        status.textContent = "Không thể phát nhạc. Hãy kiểm tra cài đặt âm thanh của trình duyệt.";
        console.error("Không thể bật hoặc tắt nhạc nền:", error);
      } finally {
        toggle.disabled = false;
      }
    });
  }
}
