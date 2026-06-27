const projectGrid = document.getElementById("projectGrid");
const newProjectButton = document.getElementById("newProjectButton");
const importButton = document.getElementById("importButton");
const videoInput = document.getElementById("videoInput");
const projectInput = document.getElementById("projectInput");

const newProjectModal = document.getElementById("newProjectModal");
const chooseFileButton = document.getElementById("chooseFileButton");
const closeModalButton = document.getElementById("closeModalButton");
const youtubeUrlInput = document.getElementById("youtubeUrlInput");
const createYoutubeButton = document.getElementById("createYoutubeButton");

const app = document.getElementById("app");
const editorScreen = document.getElementById("editorScreen");
const backHomeButton = document.getElementById("backHomeButton");
const editorTitle = document.getElementById("editorTitle");

const videoArea = document.getElementById("videoArea");
const playPauseButton = document.getElementById("playPauseButton");
const currentTimeLabel = document.getElementById("currentTimeLabel");
const subtitleText = document.getElementById("subtitleText");
const startTime = document.getElementById("startTime");
const endTime = document.getElementById("endTime");
const setStartButton = document.getElementById("setStartButton");
const setEndButton = document.getElementById("setEndButton");
const addSubtitleButton = document.getElementById("addSubtitleButton");
const deleteSubtitleButton = document.getElementById("deleteSubtitleButton");
const exportSrtButton = document.getElementById("exportSrtButton");
const exportVttButton = document.getElementById("exportVttButton");
const subtitleList = document.getElementById("subtitleList");
const timeline = document.getElementById("timeline");

const liveSubtitle = document.getElementById("liveSubtitle");

let currentProject = null;
let selectedSubtitleIndex = null;
let localVideoElement = null;

const projects = [
    {
        name: "Sample Project",
        date: "今日",
        duration: "00:01:28",
        subtitles: 12,
        thumb: null,
        type: "file",
        subtitleData: []
    }
];

function getYoutubeId(url) {
    try {
        const u = new URL(url);

        if (u.hostname.includes("youtu.be")) {
            return u.pathname.slice(1).split("?")[0];
        }

        if (u.hostname.includes("youtube.com")) {
            if (u.pathname === "/watch") {
                return u.searchParams.get("v");
            }

            if (u.pathname.startsWith("/shorts/")) {
                return u.pathname.split("/")[2];
            }

            if (u.pathname.startsWith("/embed/")) {
                return u.pathname.split("/")[2];
            }
        }

        return null;
    } catch (e) {
        return null;
    }
}

function parseTime(text) {
    const s = String(text).trim().replace(",", ".");
    if (!s) return 0;

    const parts = s.split(":").map(Number);

    if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
    }

    if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }

    return Number(s) || 0;
}

function formatTime(sec) {
    sec = Math.max(0, sec || 0);

    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec - Math.floor(sec)) * 1000);

    return String(m).padStart(2, "0") + ":" +
        String(s).padStart(2, "0") + "." +
        String(ms).padStart(3, "0");
}

function formatSrtTime(t) {
    return formatTime(t).replace(".", ",");
}

function getCurrentEditorTime() {
    if (localVideoElement) {
        return localVideoElement.currentTime || 0;
    }

    return parseTime(currentTimeLabel.textContent);
}

function renderSubtitles() {
    subtitleList.innerHTML = "";

    if (!currentProject) {
        return;
    }

    if (!currentProject.subtitleData) {
        currentProject.subtitleData = [];
    }

    currentProject.subtitleData.forEach((sub, index) => {
        const div = document.createElement("div");
        div.className = "subtitle-item" + (index === selectedSubtitleIndex ? " selected" : "");

        div.innerHTML = `
      <div class="subtitle-time">${formatTime(sub.start)} → ${formatTime(sub.end)}</div>
      <div class="subtitle-text">${sub.text}</div>
    `;

        div.addEventListener("click", () => {
            selectedSubtitleIndex = index;
            subtitleText.value = sub.text;
            startTime.value = formatTime(sub.start);
            endTime.value = formatTime(sub.end);
            renderSubtitles();
        });

        subtitleList.appendChild(div);
    });
}

function renderTimeline() {
    timeline.innerHTML = "";

    if (!currentProject || !currentProject.subtitleData) {
        return;
    }

    const maxEnd = Math.max(10, ...currentProject.subtitleData.map(s => s.end));

    currentProject.subtitleData.forEach((sub) => {
        const bar = document.createElement("div");
        bar.className = "timeline-sub";

        bar.style.left = (sub.start / maxEnd * 100) + "%";
        bar.style.width = Math.max((sub.end - sub.start) / maxEnd * 100, 4) + "%";
        bar.textContent = sub.text;

        timeline.appendChild(bar);
    });
}

addSubtitleButton.addEventListener("click", () => {
    if (!currentProject) return;

    const text = subtitleText.value.trim();
    const start = parseTime(startTime.value || "00:00.000");
    const end = parseTime(endTime.value || "00:02.000");

    if (!text) {
        alert("字幕テキストを入れてね！");
        return;
    }

    if (end <= start) {
        alert("終了時間は開始時間より後にしてね！");
        return;
    }

    if (!currentProject.subtitleData) {
        currentProject.subtitleData = [];
    }

    currentProject.subtitleData.push({
        text,
        start,
        end
    });

    currentProject.subtitleData.sort((a, b) => a.start - b.start);

    subtitleText.value = "";
    selectedSubtitleIndex = null;

    renderSubtitles();
    renderTimeline();
});

deleteSubtitleButton.addEventListener("click", () => {
    if (!currentProject || selectedSubtitleIndex === null) return;

    currentProject.subtitleData.splice(selectedSubtitleIndex, 1);
    selectedSubtitleIndex = null;

    subtitleText.value = "";
    startTime.value = "";
    endTime.value = "";

    renderSubtitles();
    renderTimeline();
});

setStartButton.addEventListener("click", () => {
    startTime.value = formatTime(getCurrentEditorTime());
});

setEndButton.addEventListener("click", () => {
    endTime.value = formatTime(getCurrentEditorTime());
});

playPauseButton.addEventListener("click", () => {
    if (!localVideoElement) {
        alert("YouTubeはプレイヤー内の再生ボタンを使ってね！");
        return;
    }

    if (localVideoElement.paused) {
        localVideoElement.play();
    } else {
        localVideoElement.pause();
    }
});

setInterval(() => {
    const time = getCurrentEditorTime();
    currentTimeLabel.textContent = formatTime(time);

    if (!currentProject || !currentProject.subtitleData) {
        liveSubtitle.textContent = "";
        return;
    }

    const active = currentProject.subtitleData.find(sub => {
        return time >= sub.start && time <= sub.end;
    });

    liveSubtitle.textContent = active ? active.text : "";
}, 100);

exportVttButton.addEventListener("click", () => {
    if (!currentProject || !currentProject.subtitleData) return;

    let out = "WEBVTT\n\n";

    currentProject.subtitleData.forEach((sub, index) => {
        out += `${index + 1}\n`;
        out += `${formatTime(sub.start)} --> ${formatTime(sub.end)}\n`;
        out += `${sub.text}\n\n`;
    });

    navigator.clipboard.writeText(out);
    alert("VTTをコピーしたよ！");
});

function renderProjects() {
    projectGrid.innerHTML = "";

    projects.forEach((project) => {
        const card = document.createElement("article");
        card.className = "project-card";

        let thumbHTML = "";

        if (project.type === "youtube") {
            thumbHTML = `<img src="https://img.youtube.com/vi/${project.youtubeId}/mqdefault.jpg" alt="">`;
        } else if (project.thumb) {
            thumbHTML = `<img src="${project.thumb}" alt="">`;
        }

        card.innerHTML = `
      <div class="thumb">
        ${thumbHTML}
        <span class="date-badge">${project.date}</span>
      </div>
      <div class="project-info">
        <h2>${project.name}</h2>
        <p>${project.duration} ・ ${project.subtitles}字幕</p>
      </div>
    `;

        card.addEventListener("click", () => {
            openEditor(project);
        });

        projectGrid.appendChild(card);
    });
}

function createThumbnailFromVideo(file) {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const url = URL.createObjectURL(file);

    video.src = url;
    video.muted = true;

    video.addEventListener("loadeddata", () => {
        video.currentTime = Math.min(1, video.duration / 2);
    });

    video.addEventListener("seeked", () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        projects.unshift({
            name: file.name,
            date: "今日",
            duration: formatTime(video.duration),
            subtitles: 0,
            thumb: canvas.toDataURL("image/png"),
            type: "file",
            videoUrl: url,
            subtitleData: []
        });

        renderProjects();
    });
}

newProjectButton.addEventListener("click", () => {
    newProjectModal.classList.add("show");
});

closeModalButton.addEventListener("click", () => {
    newProjectModal.classList.remove("show");
});

chooseFileButton.addEventListener("click", () => {
    newProjectModal.classList.remove("show");
    videoInput.click();
});

videoInput.addEventListener("change", () => {
    const file = videoInput.files[0];
    if (!file) return;
    createThumbnailFromVideo(file);
});

createYoutubeButton.addEventListener("click", () => {
    const url = youtubeUrlInput.value.trim();
    const youtubeId = getYoutubeId(url);

    if (!youtubeId) {
        alert("YouTube URLが正しくないかも！");
        return;
    }

    projects.unshift({
        name: "YouTube Project",
        date: "今日",
        duration: "YouTube",
        subtitles: 0,
        type: "youtube",
        youtubeId: youtubeId,
        subtitleData: []
    });

    youtubeUrlInput.value = "";
    newProjectModal.classList.remove("show");
    renderProjects();
});

importButton.addEventListener("click", () => {
    projectInput.click();
});

projectInput.addEventListener("change", () => {
    const file = projectInput.files[0];
    if (!file) return;
    alert(`${file.name} をインポートする予定！`);
});

backHomeButton.addEventListener("click", () => {

    editorScreen.classList.add("hidden");

    app.classList.remove("hidden");

});


renderProjects();

function openEditor(project) {
    currentProject = project;
    selectedSubtitleIndex = null;

    app.classList.add("hidden");
    editorScreen.classList.remove("hidden");
    editorTitle.textContent = project.name;

    localVideoElement = null;

    if (project.type === "youtube") {
        videoArea.innerHTML = `
      <iframe
        src="https://www.youtube.com/embed/${project.youtubeId}"
        title="YouTube video"
        allowfullscreen>
      </iframe>
    `;
    } else if (project.videoUrl) {
        videoArea.innerHTML = `
          <video id="localVideo" controls playsinline>
            <source src="${project.videoUrl}" type="video/mp4">
          </video>
        `;
        localVideoElement = document.getElementById("localVideo");
    } else {
        videoArea.innerHTML = "ローカル動画プレビュー";
    }

    renderSubtitles();
    renderTimeline();
}
