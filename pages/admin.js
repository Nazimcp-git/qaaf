// ============================================================
// QAF – Admin Dashboard Logic
// ============================================================

let allTeams={},allStudents={},allPrograms={},allTopics={},allResults={};

function hideSplash() {
  const splash = document.getElementById('splash-screen');
  if (splash) {
    splash.classList.add('fade-out');
    setTimeout(() => splash.remove(), 400);
  }
}

// Auth guard - wait for DOM + Firebase
document.addEventListener('DOMContentLoaded', () => {
  if (typeof auth === 'undefined' || typeof db === 'undefined') {
    console.error('Firebase not loaded');
    document.querySelector('.dashboard-body').innerHTML = '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-title">Connection Error</div><div class="empty-state-text">Firebase not loaded. Refresh the page.</div></div>';
    hideSplash();
    return;
  }
  auth.onAuthStateChanged(async(user)=>{
    if(!user){location.href='admin-login';return;}
    try {
      const snap=await db.ref('users/'+user.uid).once('value');
      const ud=snap.val();
      if(!ud||ud.role!=='admin'){auth.signOut();location.href='admin-login';return;}
      await initAdmin();
    } catch(e) {
      console.error('Admin init error:', e);
    } finally {
      hideSplash();
    }
  });
});

function showTab(name,el){
  document.querySelectorAll('.tab-views>div').forEach(d=>d.classList.remove('active'));
  document.getElementById('tab-'+name)?.classList.add('active');
  document.querySelectorAll('.sidebar-link').forEach(l=>l.classList.remove('active'));
  if(el && el.classList?.contains('sidebar-link'))el.classList.add('active');
  // Update mobile bottom nav
  document.querySelectorAll('.mobile-nav-item').forEach(m=>m.classList.remove('active'));
  if(el && el.classList?.contains('mobile-nav-item'))el.classList.add('active');
  const titles={overview:'Admin Overview',teams:'Manage Teams',students:'All Students',programs:'Programs',topics:'Topic Submissions',results:'Result Management',announcements:'Announcements',settings:'Settings',logs:'Audit Logs'};
  document.getElementById('pageTitle').textContent=titles[name]||name;
  // Close sidebar on mobile
  document.querySelector('.sidebar')?.classList.remove('open');
  document.querySelector('.sidebar-overlay')?.classList.remove('active');
}

async function initAdmin(){
  allTeams=await DbService.teams.getAll();
  allStudents=await DbService.students.getAll();
  allPrograms=await DbService.programs.getAll();
  allTopics=await DbService.topics.getAll();
  allResults=await DbService.results.getAll();
  const settings=await DbService.settings.get();

  // Stats
  document.getElementById('aStatTeams').textContent=Object.keys(allTeams).length;
  document.getElementById('aStatStudents').textContent=Object.keys(allStudents).length;
  document.getElementById('aStatPrograms').textContent=Object.keys(allPrograms).length;
  document.getElementById('aStatTopics').textContent=Object.keys(allTopics).length;

  // Settings
  document.getElementById('setRegOpen').checked=settings.registrationOpen!==false;
  document.getElementById('setTopicOpen').checked=settings.topicSubmissionOpen!==false;
  document.getElementById('setResultsPub').checked=settings.resultsPublished===true;
  if(settings.eventName)document.getElementById('setEventName').value=settings.eventName;
  if(settings.eventDate)document.getElementById('setEventDate').value=settings.eventDate;

  loadTeams();
  loadAllStudents();
  loadAdminPrograms();
  loadAdminTopics();
  loadAnnouncements();
  loadLogs();
  loadResultPrograms();
  loadRecentTeams();
}

// ── Teams ──
function loadTeams(){
  const tbody=document.getElementById('teamsBody');
  const arr=Object.values(allTeams).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
  tbody.innerHTML=arr.map(t=>`<tr>
    <td><code style="font-size:var(--fs-xs)">${t.teamId||''}</code></td>
    <td><strong>${QAF.sanitize(t.collegeName||'')}</strong></td>
    <td>${t.district||'—'}</td>
    <td>${t.leaderName||'—'}</td>
    <td>${t.phone||'—'}</td>
    <td><span class="badge badge-${t.approved?'success':'warning'}">${t.approved?'Approved':'Pending'}</span></td>
    <td>
      <button class="btn btn-ghost btn-sm" onclick="approveTeam('${t.teamId}')" title="Approve">✅</button>
      <button class="btn btn-ghost btn-sm" onclick="deleteTeam('${t.teamId}')" title="Delete">🗑️</button>
    </td>
  </tr>`).join('')||'<tr><td colspan="7" class="text-center">No teams</td></tr>';
}

function loadRecentTeams(){
  const arr=Object.values(allTeams).sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)).slice(0,5);
  document.getElementById('recentTeams').innerHTML=arr.map(t=>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:var(--sp-2) 0;border-bottom:1px solid var(--clr-parchment);font-size:var(--fs-sm)"><span><strong>${QAF.sanitize(t.collegeName||'')}</strong> — ${t.district||''}</span><span class="badge badge-${t.approved?'success':'warning'}" style="font-size:10px">${t.approved?'Approved':'Pending'}</span></div>`
  ).join('')||'<p style="color:var(--clr-brown-light);font-size:var(--fs-sm)">No teams yet</p>';
}

async function approveTeam(id){
  await DbService.teams.update(id,{approved:true});
  allTeams[id].approved=true;
  loadTeams();loadRecentTeams();
  await DbService.notifications.send(id,{text:'Your team has been approved! You can now register students.',type:'success'});
  await DbService.logs.add('team_approved','Approved team '+id,auth.currentUser.uid);
  QAF.toast.success('Approved','Team approved successfully');
}

async function deleteTeam(id){
  if(!confirm('Delete this team? This cannot be undone.'))return;
  await DbService.teams.remove(id);
  delete allTeams[id];
  loadTeams();loadRecentTeams();
  document.getElementById('aStatTeams').textContent=Object.keys(allTeams).length;
  await DbService.logs.add('team_deleted','Deleted team '+id,auth.currentUser.uid);
  QAF.toast.success('Deleted','Team removed');
}

// ── Students ──
function loadAllStudents(){
  const tbody=document.getElementById('allStudentsBody');
  const arr=Object.values(allStudents);
  tbody.innerHTML=arr.map(s=>{
    const team=allTeams[s.teamId]||{};
    return`<tr><td><strong>${QAF.sanitize(s.name||'')}</strong></td><td>${QAF.sanitize(team.collegeName||s.teamId||'')}</td><td>${s.programName||'—'}</td><td>${s.age||'—'}</td><td>${s.gender||'—'}</td><td><button class="btn btn-ghost btn-sm" onclick="deleteStudent('${s.id}')">🗑️</button></td></tr>`;
  }).join('')||'<tr><td colspan="6" class="text-center">No students</td></tr>';

  // Team filter
  const sel=document.querySelector('#tab-students select');
  if(sel){
    const opts='<option value="">All Teams</option>'+Object.values(allTeams).map(t=>`<option value="${t.teamId}">${QAF.sanitize(t.collegeName||t.teamId)}</option>`).join('');
    sel.innerHTML=opts;
  }
}

async function deleteStudent(id){
  if(!confirm('Remove student?'))return;
  await DbService.students.remove(id);
  delete allStudents[id];
  loadAllStudents();
  document.getElementById('aStatStudents').textContent=Object.keys(allStudents).length;
  QAF.toast.success('Removed','Student deleted');
}

function filterStudentsByTeam(teamId){
  const rows=document.getElementById('allStudentsBody').querySelectorAll('tr');
  rows.forEach(r=>{
    if(!teamId){r.style.display='';return;}
    r.style.display=r.textContent.includes(teamId)?'':'none';
  });
}

// ── Programs ──
function loadAdminPrograms(){
  const tbody=document.getElementById('programsBody');
  const arr=Object.values(allPrograms);
  tbody.innerHTML=arr.map(p=>`<tr>
    <td><strong>${QAF.sanitize(p.title||'')}</strong></td>
    <td>${p.category||'—'}</td>
    <td>${p.participantLimit||'∞'}</td>
    <td>${p.topicRequired?'<span class="badge badge-warning">Yes</span>':'<span class="badge badge-success">No</span>'}</td>
    <td><button class="btn btn-ghost btn-sm" onclick="deleteProgram('${p.id}')">🗑️</button></td>
  </tr>`).join('')||'<tr><td colspan="5" class="text-center">No programs</td></tr>';

  // Result program selector
  loadResultPrograms();
}

async function addProgram(){
  const title=document.getElementById('progTitle').value.trim();
  if(!title){QAF.toast.error('Error','Title required');return;}
  const data={
    title:QAF.sanitize(title),
    category:document.getElementById('progCategory').value.trim(),
    participantLimit:parseInt(document.getElementById('progLimit').value)||null,
    ageLimit:parseInt(document.getElementById('progAge').value)||null,
    description:document.getElementById('progDesc').value.trim(),
    topicRequired:document.getElementById('progTopicReq').checked
  };
  const id=await DbService.programs.create(data);
  allPrograms[id]={...data,id};
  QAF.modal.close('programModal');
  document.getElementById('programForm').reset();
  loadAdminPrograms();
  document.getElementById('aStatPrograms').textContent=Object.keys(allPrograms).length;
  await DbService.logs.add('program_created','Created program: '+title,auth.currentUser.uid);
  QAF.toast.success('Created','Program added');
}

async function deleteProgram(id){
  if(!confirm('Delete program?'))return;
  await DbService.programs.remove(id);
  delete allPrograms[id];
  loadAdminPrograms();
  QAF.toast.success('Deleted','Program removed');
}

// ── Topics ──
async function loadAdminTopics(){
  // Refresh topics data
  allTopics = await DbService.topics.getAll();
  const filter=document.getElementById('topicStatusFilter')?.value||'';
  let arr=Object.values(allTopics);
  if(filter)arr=arr.filter(t=>t.status===filter);
  const tbody=document.getElementById('topicsBody');
  document.getElementById('aStatTopics').textContent=Object.keys(allTopics).length;
  tbody.innerHTML=arr.map(t=>{
    const prog=allPrograms[t.programId]||{};
    const team=allTeams[t.teamId]||{};
    const student=allStudents[t.studentId]||{};
    const studentName = t.studentName || student.name || t.studentId || '—';
    return`<tr>
      <td><strong>${QAF.sanitize(t.title||'')}</strong>${t.description ? `<br><small style="color:var(--clr-brown-light)">${QAF.sanitize(t.description).substring(0,60)}${t.description.length>60?'...':''}</small>` : ''}</td>
      <td>${QAF.sanitize(prog.title||'—')}</td>
      <td>${QAF.sanitize(team.collegeName||'—')}</td>
      <td>${QAF.sanitize(studentName)}</td>
      <td><span class="badge badge-${t.status==='approved'?'success':t.status==='rejected'?'error':'warning'}">${t.status||'pending'}</span></td>
      <td>
        ${t.status!=='approved'?`<button class="btn btn-ghost btn-sm" onclick="updateTopicStatus('${t.id}','approved')" title="Approve">✅</button>`:''}
        ${t.status!=='rejected'?`<button class="btn btn-ghost btn-sm" onclick="updateTopicStatus('${t.id}','rejected')" title="Reject">❌</button>`:''}
      </td>
    </tr>`;
  }).join('')||'<tr><td colspan="6" class="text-center">No submissions</td></tr>';
}

async function updateTopicStatus(id,status){
  const comment=status==='rejected'?prompt('Reason for rejection (optional):'):'';
  await DbService.topics.update(id,{status,adminComment:comment||''});
  allTopics[id].status=status;
  loadAdminTopics();
  const topic=allTopics[id];
  if(topic.teamId){
    await DbService.notifications.send(topic.teamId,{text:`Topic "${topic.title}" has been ${status}${comment?': '+comment:''}`,type:status==='approved'?'success':'error'});
  }
  QAF.toast.success('Updated','Topic '+status);
}

// ── Results ──
function loadResultPrograms(){
  const sel=document.getElementById('resultProgram');
  if(!sel)return;
  sel.innerHTML='<option value="">Select Program</option>'+Object.values(allPrograms).map(p=>`<option value="${p.id}">${QAF.sanitize(p.title)} ${p.resultsPublished?'✅':''}</option>`).join('');
  loadPublishedList();
}

async function loadResultEntries(programId){
  if(!programId){
    document.getElementById('resultPositions').style.display='none';
    document.getElementById('resultInfo').style.display='none';
    return;
  }
  const program=allPrograms[programId]||{};
  const students=Object.values(allStudents).filter(s=>s.programId===programId);
  const results=Object.values(allResults).filter(r=>r.programId===programId);
  const resultMap={};
  results.forEach(r=>{if(r.position)resultMap[r.position]=r;});

  // Show info
  document.getElementById('resultInfo').style.display='block';
  document.getElementById('resultInfoText').innerHTML=`<strong>${QAF.sanitize(program.title)}</strong> — ${students.length} participant(s) | ${program.resultsPublished?'<span style="color:var(--clr-success)">✅ Published</span>':'<span style="color:var(--clr-warning)">⏳ Not published</span>'}`;

  // Show position selectors
  document.getElementById('resultPositions').style.display='block';
  const studentOpts='<option value="">— Select —</option>'+students.map(s=>{
    const team=allTeams[s.teamId]||{};
    return`<option value="${s.id}" data-team="${s.teamId}">${QAF.sanitize(s.name)} (${QAF.sanitize(team.collegeName||'')})</option>`;
  }).join('');

  for(let i=1;i<=3;i++){
    document.getElementById('pos'+i+'Student').innerHTML=studentOpts;
    const existing=resultMap[i];
    if(existing){
      document.getElementById('pos'+i+'Student').value=existing.studentId||'';
      document.getElementById('pos'+i+'Points').value=existing.points||0;
    } else {
      document.getElementById('pos'+i+'Student').value='';
      document.getElementById('pos'+i+'Points').value=i===1?5:i===2?3:1;
    }
  }

  // Show participants table
  const tbody=document.getElementById('resultEntriesBody');
  tbody.innerHTML=students.map((s,i)=>{
    const team=allTeams[s.teamId]||{};
    const res=results.find(r=>r.studentId===s.id);
    const posLabel=res?.position===1?'🥇 First':res?.position===2?'🥈 Second':res?.position===3?'🥉 Third':'—';
    return`<tr>
      <td>${i+1}</td>
      <td><strong>${QAF.sanitize(s.name)}</strong></td>
      <td>${QAF.sanitize(team.collegeName||'')}</td>
      <td>${posLabel}</td>
      <td>${res?.points||'—'}</td>
    </tr>`;
  }).join('')||'<tr><td colspan="5" class="text-center">No participants for this program</td></tr>';
}

async function saveResults(){
  const programId=document.getElementById('resultProgram').value;
  if(!programId){QAF.toast.error('Error','Select a program first');return;}

  const program=allPrograms[programId]||{};

  // Delete existing results for this program
  const existing=Object.values(allResults).filter(r=>r.programId===programId);
  for(const r of existing){
    await db.ref('results/'+r.id).remove();
    delete allResults[r.id];
  }

  // Save new positions
  for(let pos=1;pos<=3;pos++){
    const studentId=document.getElementById('pos'+pos+'Student').value;
    if(!studentId)continue;
    const points=parseInt(document.getElementById('pos'+pos+'Points').value)||0;
    const student=allStudents[studentId]||{};
    const team=allTeams[student.teamId]||{};
    const data={
      programId,
      programName:program.title||'',
      studentId,
      studentName:student.name||'',
      teamId:student.teamId||'',
      teamName:team.collegeName||'',
      position:pos,
      points,
      createdAt:Date.now()
    };
    const ref=await db.ref('results').push(data);
    allResults[ref.key]={...data,id:ref.key};
  }

  await DbService.logs.add('results_saved','Saved results for '+program.title,auth.currentUser?.uid);
  QAF.toast.success('Saved','Results saved — 1st, 2nd, 3rd assigned');
  loadResultEntries(programId);
}

async function publishProgramResult(){
  const programId=document.getElementById('resultProgram').value;
  if(!programId){QAF.toast.error('Error','Select a program first');return;}

  const results=Object.values(allResults).filter(r=>r.programId===programId);
  if(!results.length){QAF.toast.error('Error','Save results first before publishing');return;}

  await db.ref('programs/'+programId+'/resultsPublished').set(true);
  allPrograms[programId].resultsPublished=true;

  await recalcLeaderboard();
  await DbService.logs.add('results_published','Published results for '+allPrograms[programId].title,auth.currentUser?.uid);
  QAF.toast.success('Published','Results for this program are now public');
  loadResultPrograms();
  loadResultEntries(programId);
}

async function recalcLeaderboard(){
  const results=await DbService.results.getAll();
  allResults=results;
  const teamPoints={};
  Object.values(results).forEach(r=>{
    if(!teamPoints[r.teamId])teamPoints[r.teamId]={points:0,teamId:r.teamId};
    teamPoints[r.teamId].points+=(r.points||0);
  });
  for(const[tid,data]of Object.entries(teamPoints)){
    await db.ref('leaderboard/'+tid).set({teamId:tid,points:data.points});
    await DbService.teams.update(tid,{points:data.points});
    if(allTeams[tid])allTeams[tid].points=data.points;
  }
  QAF.toast.success('Done','Scoreboard recalculated');
}

function loadPublishedList(){
  const published=Object.values(allPrograms).filter(p=>p.resultsPublished);
  const container=document.getElementById('publishedProgramsList');
  if(!container)return;
  if(!published.length){container.innerHTML='<p style="color:var(--clr-brown-light);font-size:var(--fs-sm)">No results published yet</p>';return;}
  container.innerHTML=published.map(p=>{
    const results=Object.values(allResults).filter(r=>r.programId===p.id).sort((a,b)=>a.position-b.position);
    return`<div class="card" style="margin-bottom:var(--sp-3)"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:var(--sp-2)"><strong>${QAF.sanitize(p.title)}</strong><span class="badge badge-success">Published</span></div>${results.map(r=>`<div style="font-size:var(--fs-sm);padding:var(--sp-1) 0">${r.position===1?'🥇':r.position===2?'🥈':'🥉'} ${QAF.sanitize(r.studentName||'')} — <em>${QAF.sanitize(r.teamName||'')}</em> (${r.points} pts)</div>`).join('')}</div>`;
  }).join('');
}

// ── Announcements ──
async function loadAnnouncements(){
  const data=await DbService.announcements.getAll();
  document.getElementById('announceList').innerHTML=data.map(a=>
    `<div class="card" style="margin-bottom:var(--sp-3)"><div style="display:flex;justify-content:space-between;align-items:flex-start"><div><strong>${QAF.sanitize(a.title||'Announcement')}</strong><p style="font-size:var(--fs-sm);margin-top:var(--sp-1)">${QAF.sanitize(a.text)}</p><small style="color:var(--clr-brown-light)">${QAF.formatDate(a.createdAt)}</small></div><button class="btn btn-ghost btn-sm" onclick="deleteAnnouncement('${a.id}')">🗑️</button></div></div>`
  ).join('')||'<div class="empty-state"><div class="empty-state-icon">📢</div><div class="empty-state-title">No Announcements</div></div>';
}

async function postAnnouncement(){
  const text=document.getElementById('announceText').value.trim();
  if(!text){QAF.toast.error('Error','Message required');return;}
  await DbService.announcements.create({title:document.getElementById('announceTitle').value.trim(),text:QAF.sanitize(text)});
  QAF.modal.close('announceModal');
  document.getElementById('announceTitle').value='';
  document.getElementById('announceText').value='';
  loadAnnouncements();
  QAF.toast.success('Posted','Announcement published');
}

async function deleteAnnouncement(id){
  if(!confirm('Delete announcement?'))return;
  await DbService.announcements.remove(id);
  loadAnnouncements();
  QAF.toast.success('Deleted','Announcement removed');
}

// ── Settings ──
async function updateSetting(key,val){
  await DbService.settings.update({[key]:val});
  await DbService.logs.add('setting_changed',`${key} = ${val}`,auth.currentUser.uid);
  QAF.toast.success('Updated','Setting saved');
}

async function saveEventSettings(){
  await DbService.settings.update({
    eventName:document.getElementById('setEventName').value.trim(),
    eventDate:document.getElementById('setEventDate').value
  });
  QAF.toast.success('Saved','Event settings updated');
}

// ── Logs ──
async function loadLogs(){
  const data=await DbService.logs.getAll(100);
  document.getElementById('logsBody').innerHTML=data.map(l=>
    `<tr><td style="white-space:nowrap;font-size:var(--fs-xs)">${QAF.formatDate(l.timestamp)}</td><td><strong>${QAF.sanitize(l.action||'')}</strong></td><td style="font-size:var(--fs-xs)">${QAF.sanitize(l.details||'')}</td><td style="font-size:var(--fs-xs)">${l.userId||'—'}</td></tr>`
  ).join('')||'<tr><td colspan="4" class="text-center">No logs yet</td></tr>';
}

// ── Exports ──
function exportTeams(){
  const headers=['Team ID','College','District','Leader','Phone','Approved'];
  const rows=Object.values(allTeams).map(t=>[t.teamId,t.collegeName,t.district,t.leaderName,t.phone,t.approved?'Yes':'No']);
  PdfService.exportTable(headers,rows,'QAF - Teams Report','qaf-teams.pdf');
}

function exportTeamsCSV(){
  const headers=['Team ID','College','District','Leader','Phone','Email','Approved'];
  const rows=Object.values(allTeams).map(t=>[t.teamId,t.collegeName,t.district,t.leaderName,t.phone,t.email,t.approved?'Yes':'No']);
  PdfService.exportCSV(headers,rows,'qaf-teams.csv');
}

function exportStudents(){
  const headers=['Name','Team','Program','Age','Gender'];
  const rows=Object.values(allStudents).map(s=>{
    const team=allTeams[s.teamId]||{};
    return[s.name,team.collegeName||s.teamId,s.programName||'',s.age,s.gender];
  });
  PdfService.exportTable(headers,rows,'QAF - Students Report','qaf-students.pdf');
}

function exportAllData(){
  const headers=['Type','Name','Team','Details'];
  const rows=[
    ...Object.values(allTeams).map(t=>['Team',t.collegeName,t.teamId,t.district]),
    ...Object.values(allStudents).map(s=>['Student',s.name,s.teamId,s.programName||''])
  ];
  PdfService.exportTable(headers,rows,'QAF - Complete Data Export','qaf-all-data.pdf');
}

// ── Table Filter ──
function filterTable(tbodyId,query){
  const q=query.toLowerCase();
  document.getElementById(tbodyId).querySelectorAll('tr').forEach(r=>{
    r.style.display=r.textContent.toLowerCase().includes(q)?'':'none';
  });
}
