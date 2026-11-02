(function () {
  'use strict';
  const root = document.querySelector('[data-project-board]');
  if (!root) return;
  const statuses = ['Proposed', 'Under Review', 'Planned', 'In Progress', 'On Hold', 'Completed'];
  const categories = ['Hardware & Electronics', 'Cybersecurity & CTF', 'AI & Automation', '3D Printing & Makers', 'Infrastructure & Networking', 'Community & Education'];
  const grid = root.querySelector('[data-project-grid]');
  const message = root.querySelector('[data-project-message]');
  const search = root.querySelector('#project-search');
  const category = root.querySelector('#project-category');
  const status = root.querySelector('#project-status');
  const sort = root.querySelector('#project-sort');
  let projects = [];
  function element(tag, value, className) {
    const node = document.createElement(tag); node.textContent = value;
    if (className) node.className = className;
    return node;
  }
  function link(value, kind) {
    return typeof value === 'string' && new RegExp('^https://github\\.com/Security-BSides-Krakow/hacker-club-projects/' + kind + '/[1-9][0-9]*$').test(value) ? value : null;
  }
  function card(p) {
    const node = element('article', '', 'club-card project-card');
    const tags = element('div', '', 'project-tags');
    tags.append(element('span', p.status, 'project-status'), element('span', p.kind === 'project' ? 'Approved project' : 'Community idea'));
    node.append(tags, element('h3', p.title), element('p', p.description));
    const metadata = element('dl', '', 'project-meta');
    const pairs = [['Category',p.category],['Votes',p.votes === null ? 'Not available' : String(p.votes)],['Complexity',p.complexity],['Maintainer',p.maintainer]];
    pairs.forEach(([label,value]) => { if (value) metadata.append(element('dt',label),element('dd',value)); });
    node.append(metadata);
    const actions = element('div', '', 'project-links');
    const discussion = link(p.discussion_url, 'discussions'), issue = link(p.issue_url, 'issues');
    [['Vote & Discuss',discussion],['View Progress',issue],['Contribute',issue || discussion]].forEach(([label,url]) => {
      if (!url) return;
      const a = element('a', label + ' ↗'); a.href = url; a.setAttribute('aria-label',label+' on GitHub: '+p.title); actions.append(a);
    });
    node.append(actions); return node;
  }
  function render() {
    const term = search.value.trim().toLocaleLowerCase();
    const visible = projects.filter(p => (!term || (p.title+' '+p.description).toLocaleLowerCase().includes(term)) && (!category.value || p.category === category.value) && (!status.value || p.status === status.value));
    visible.sort((a,b) => sort.value === 'votes' ? (b.votes ?? -1)-(a.votes ?? -1) || a.title.localeCompare(b.title) : sort.value === 'title' ? a.title.localeCompare(b.title) : (Date.parse(b.updated_at)||0)-(Date.parse(a.updated_at)||0) || a.title.localeCompare(b.title));
    grid.replaceChildren(...visible.map(card));
    message.textContent = !projects.length ? 'No project ideas published yet. Share the first idea with the community.' : !visible.length ? 'No projects match these filters. Try another search or reset the filters.' : `${visible.length} of ${projects.length} projects · GitHub links open GitHub to participate.`;
  }
  [category,status,sort].forEach(control => control.addEventListener('change',render));
  search.addEventListener('input',render);
  root.querySelector('[data-project-reset]').addEventListener('click', () => { search.value=''; category.value=''; status.value=''; sort.value='votes'; render(); });
  function options(control, values) { values.forEach(value => { const option = element('option',value); option.value=value; control.append(option); }); }
  options(status,statuses);
  options(category,categories);
  fetch('/assets/data/hacker-club-projects.json').then(response => { if (!response.ok) throw Error(); return response.json(); }).then(data => {
    if (data.schema_version !== 1 || !Array.isArray(data.projects) || !Number.isFinite(Date.parse(data.generated_at))) throw Error();
    projects = data.projects.map(p => {
      if (!p || typeof p.title !== 'string' || typeof p.description !== 'string' || typeof p.category !== 'string') throw Error();
      return {...p, status:statuses.includes(p.status)?p.status:'Unknown', votes:Number.isInteger(p.votes)&&p.votes>=0?p.votes:null};
    });
    options(category,[...new Set(projects.map(p=>p.category))].filter(c=>!categories.includes(c)).sort());
    if (projects.some(p=>p.status==='Unknown')) options(status,['Unknown']);
    statuses.forEach(value => { const count=root.querySelector(`[data-count="${value}"]`); if(count) count.textContent=projects.filter(p=>p.status===value).length; });
    root.querySelector('[data-project-updated]').textContent = 'Last synchronized: '+new Date(data.generated_at).toLocaleString('en-GB')+'. Data is an hourly snapshot; GitHub shows live updates.';
    render();
  }).catch(() => { message.textContent='Project data is temporarily unavailable. Please browse ideas on GitHub or try again later.'; });
})();
