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

const projects = [
  {
    name: "Sample Project",
    date: "今日",
    duration: "00:01:28",
    subtitles: 12,
    thumb: null,
    type: "file"
  }
];

function getYoutubeId(url){
  try{
    const u = new URL(url);

    if(u.hostname.includes("youtu.be")){
      return u.pathname.slice(1).split("?")[0];
    }

    if(u.hostname.includes("youtube.com")){
      if(u.pathname === "/watch"){
        return u.searchParams.get("v");
      }

      if(u.pathname.startsWith("/shorts/")){
        return u.pathname.split("/")[2];
      }

      if(u.pathname.startsWith("/embed/")){
        return u.pathname.split("/")[2];
      }
    }

    return null;
  }catch(e){
    return null;
  }
}

function renderProjects(){
  projectGrid.innerHTML = "";

  projects.forEach((project) => {
    const card = document.createElement("article");
    card.className = "project-card";

    let thumbHTML = "";

    if(project.type === "youtube"){
     thumbHTML = `<img src="https://img.youtube.com/vi/${project.youtubeId}/mqdefault.jpg" alt="">`;
    }else if(project.thumb){
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
      if(project.type === "youtube"){
        alert(`YouTube動画を開く予定！\nID: ${project.youtubeId}`);
      }else{
        alert(`${project.name} を開く予定！`);
      }
    });

    projectGrid.appendChild(card);
  });
}

function createThumbnailFromVideo(file){
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
      duration: "読み込み中",
      subtitles: 0,
      thumb: canvas.toDataURL("image/png"),
      type: "file"
    });

    renderProjects();
    URL.revokeObjectURL(url);
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
  if(!file) return;
  createThumbnailFromVideo(file);
});

createYoutubeButton.addEventListener("click", () => {
  const url = youtubeUrlInput.value.trim();
  const youtubeId = getYoutubeId(url);

  if(!youtubeId){
    alert("YouTube URLが正しくないかも！");
    return;
  }

  projects.unshift({
    name: "YouTube Project",
    date: "今日",
    duration: "YouTube",
    subtitles: 0,
    type: "youtube",
    youtubeId: youtubeId
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
  if(!file) return;
  alert(`${file.name} をインポートする予定！`);
});

renderProjects();