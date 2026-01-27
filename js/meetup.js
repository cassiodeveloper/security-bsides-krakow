const DATA_URL = "./meetups.json";

const el = (id) => document.getElementById(id);

const upcomingList = el("upcomingList");
const pastList = el("pastList");

const upcomingCount = el("upcomingCount");
const pastCount = el("pastCount");

const upcomingEmpty = el("upcomingEmpty");
const pastEmpty = el("pastEmpty");

el("src").textContent = DATA_URL;
el("yyyy").textContent = new Date().getFullYear();

let raw = [];

function parseDateISO(d, t){
  const time = (t && /^\d{2}:\d{2}$/.test(t)) ? t : "00:00";
  return new Date(`${d}T${time}:00`);
}

function fmtDate(d){
  return new Intl.DateTimeFormat("en-GB", { weekday:"short", day:"2-digit", month:"short", year:"numeric" }).format(d);
}

function safeText(s){ return (s ?? "").toString().trim(); }

function statusBadge(m, isUpcoming){
  if(m.status === "cancelled") return { cls:"cancelled", text:"CANCELLED" };
  if(m.status === "postponed") return { cls:"cancelled", text:"POSTPONED" };
  return isUpcoming ? { cls:"upcoming", text:"UPCOMING" } : { cls:"past", text:"PAST" };
}

function card(m, now){
  const start = parseDateISO(m.date, m.startTime);
  const end = m.endTime ? parseDateISO(m.date, m.endTime) : null;
  const isUpcoming = start.getTime() >= now.getTime();

  const badge = statusBadge(m, isUpcoming);

  const timeRange = (() => {
    const st = safeText(m.startTime);
    const et = safeText(m.endTime);
    if(st && et) return `${st}–${et}`;
    if(st) return st;
    return "";
  })();

  const reg = safeText(m.registrationUrl);
  const map = safeText(m.mapUrl);

  const speakerChips = (Array.isArray(m.speakers) ? m.speakers : [])
    .filter(x => safeText(x.name))
    .map(x => {
      const name = safeText(x.name);
      const role = safeText(x.role);
      const link = safeText(x.link);
      const label = role ? `${name} (${role})` : name;
      if(link) return `<a class="sp" href="${link}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      return `<span class="sp">${label}</span>`;
    }).join("");

  const tags = (Array.isArray(m.tags) ? m.tags : []).slice(0,8).map(t => safeText(t)).filter(Boolean);
  const tagsLine = tags.length
    ? `<div class="line"><div class="k">Tags</div><div class="v">${tags.map(t => `<span class="sp">${t}</span>`).join(" ")}</div></div>`
    : "";

  const sponsors = Array.isArray(m.sponsors) ? m.sponsors : [];
  const sponsorStack = sponsors.length
    ? `
      <div class="sponsorStack">
        <div class="sponsorLabel">Sponsors</div>
        <div class="sponsorLogos">
          ${sponsors.slice(0, 10).map(s => {
            const name = safeText(s.name);
            const logo = safeText(s.logoUrl);
            const url = safeText(s.url);
            if(!logo) return "";
            const img = `<img src="${logo}" alt="${name || "Sponsor"}" loading="lazy" />`;
            if(url) return `<a class="sponsorLogo" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name || "Sponsor"}">${img}</a>`;
            return `<span class="sponsorLogo" aria-label="${name || "Sponsor"}">${img}</span>`;
          }).join("")}
        </div>
      </div>
    `
    : "";

  const regBtn = reg
    ? `<a class="btn primary" href="${reg}" target="_blank" rel="noopener noreferrer">Register now!</a>`
    : `<button class="btn primary" disabled>Register</button>`;

  const mapBtn = map
    ? `<a class="btn" href="${map}" target="_blank" rel="noopener noreferrer">How to get there</a>`
    : "";

  const icsBtn = `<button class="btn" onclick="copyICS('${safeText(m.id)}')">Add to calendar</button>`;

  return `
    <article class="card" data-id="${safeText(m.id)}">
      <div class="metaTop">
        <div>${fmtDate(start)}${timeRange ? " · " + timeRange : ""}</div>
        <div class="badge ${badge.cls}">${badge.text}</div>
      </div>

      <div class="cardMain">
        <div>
          <h3 class="title">${safeText(m.title) || "Untitled meetup"}</h3>
          <p class="theme">${safeText(m.theme) || ""}</p>

          <div class="details">
            <div class="line">
              <div class="k">Venue</div>
              <div class="v">${safeText(m.venueName) || "TBA"}</div>
            </div>

            <div class="line">
              <div class="k">Address</div>
              <div class="v">${safeText(m.address) || "TBA"}</div>
            </div>

            <div class="line">
              <div class="k">Speakers</div>
              <div class="v"><div class="speakers">${speakerChips || "<span class='sp'>TBA</span>"}</div></div>
            </div>

            ${tagsLine}
          </div>
        </div>

      <div>
        <div class="actions">
          ${regBtn}
          ${mapBtn}
          ${icsBtn}
        </div>
        ${sponsorStack}
      </div>
      </div>
    </article>
  `;
}

// Minimal ICS generator
window.copyICS = async function(meetupId){
  const m = raw.find(x => x.id === meetupId);
  if(!m) return;

  const start = parseDateISO(m.date, m.startTime);
  const end = m.endTime ? parseDateISO(m.date, m.endTime) : new Date(start.getTime() + 90*60*1000);

  const pad = (n) => String(n).padStart(2,"0");
  const toICSDate = (d) => `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const uid = `${meetupId}@bsideskrakow.pl`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BSides Krakow//Meetups//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toICSDate(new Date())}`,
    `DTSTART:${toICSDate(start)}`,
    `DTEND:${toICSDate(end)}`,
    `SUMMARY:${escapeICS(m.title || "BSides Kraków Meetup")}`,
    `LOCATION:${escapeICS([m.venueName, m.address].filter(Boolean).join(" - "))}`,
    `DESCRIPTION:${escapeICS(buildDescription(m))}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  try{
    await navigator.clipboard.writeText(lines);
    alert("ICS copied. Paste into a .ics file or import to your calendar.");
  }catch(e){
    window.prompt("Copy ICS content:", lines);
  }
}

function buildDescription(m){
  const speakers = (m.speakers || []).map(s => s.role ? `${s.name} (${s.role})` : s.name).join(", ");
  const parts = [
    m.theme ? `Theme: ${m.theme}` : "",
    speakers ? `Speakers: ${speakers}` : "",
    m.registrationUrl ? `Register: ${m.registrationUrl}` : "",
    m.mapUrl ? `Map: ${m.mapUrl}` : "",
    m.notes ? `Notes: ${m.notes}` : ""
  ].filter(Boolean);
  return parts.join("\\n");
}

function escapeICS(s){
  return String(s || "")
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

async function boot(){
  const res = await fetch(DATA_URL, { cache: "no-store" });
  const data = await res.json();
  const meta = data.meta || {};
  raw = Array.isArray(data.meetups) ? data.meetups : [];

  el("updated").textContent = meta.updatedAt || "unknown";

  const now = new Date();

  const withDates = raw.map(m => ({
    m,
    start: parseDateISO(m.date, m.startTime),
    isUpcoming: parseDateISO(m.date, m.startTime) >= now
  }));

  // Upcoming first (asc), past later (desc)
  const upcoming = withDates
    .filter(x => x.isUpcoming && x.m.status !== "cancelled")
    .sort((a,b) => a.start - b.start)
    .map(x => x.m);

  const past = withDates
    .filter(x => !x.isUpcoming || x.m.status === "cancelled")
    .sort((a,b) => b.start - a.start)
    .map(x => x.m);

  upcomingList.innerHTML = upcoming.map(m => card(m, now)).join("");
  pastList.innerHTML = past.map(m => card(m, now)).join("");

  upcomingCount.textContent = `${upcoming.length} events`;
  pastCount.textContent = `${past.length} events`;

  upcomingEmpty.style.display = upcoming.length ? "none" : "block";
  pastEmpty.style.display = past.length ? "none" : "block";
}

boot().catch(err => {
  console.error(err);
  upcomingList.innerHTML = "";
  pastList.innerHTML = "";
  upcomingEmpty.style.display = "block";
  pastEmpty.style.display = "block";
  upcomingEmpty.textContent = "Failed to load meetups.json. Check file path and JSON syntax.";
  pastEmpty.style.display = "none";
});